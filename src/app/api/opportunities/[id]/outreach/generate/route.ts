import { NextResponse } from "next/server";
import { getCompanyProfile } from "@/lib/company-profile-db";
import {
  createOutreachMessage,
  getOpportunity,
} from "@/lib/opportunity-db";
import {
  generateOutreachDraft,
  type GeneratedOutreachDraft,
  type OutreachCompanyProfile,
} from "@/lib/outreach";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type AssistAction =
  | "generate"
  | "improve"
  | "professional"
  | "shorter"
  | "rewrite"
  | "personalize";

type AssistRequest = {
  action?: AssistAction;
  subject?: string;
  body?: string;
};

const ACTION_INSTRUCTIONS: Record<AssistAction, string> = {
  generate:
    "Create a new outreach draft if no current draft is provided. If a current draft is provided, improve it without discarding the user's intent.",
  improve:
    "Improve clarity, structure, and usefulness while preserving the user's core message.",
  professional:
    "Make the message more professional, polished, and direct without adding unsupported claims.",
  shorter:
    "Make the message shorter and easier to scan while keeping the core ask and evidence.",
  rewrite:
    "Rewrite the message in a fresh way while preserving the factual basis and desired outcome.",
  personalize:
    "Personalize the message more strongly using the available lead, evidence, score, CRM, and sender context.",
};

function isAssistAction(value: unknown): value is AssistAction {
  return (
    value === "generate" ||
    value === "improve" ||
    value === "professional" ||
    value === "shorter" ||
    value === "rewrite" ||
    value === "personalize"
  );
}

function getAssistRequest(value: unknown): AssistRequest {
  if (typeof value !== "object" || value == null) return {};
  const payload = value as {
    action?: unknown;
    subject?: unknown;
    body?: unknown;
  };
  return {
    action: isAssistAction(payload.action) ? payload.action : "generate",
    subject: typeof payload.subject === "string" ? payload.subject : "",
    body: typeof payload.body === "string" ? payload.body : "",
  };
}

function buildPrompt(
  lead: Lead,
  profile: OutreachCompanyProfile | null,
  request: Required<AssistRequest>
) {
  const evidence = lead.evidenceSources
    .map((source) => `${source.sourceName} (${source.sourceType}): ${source.evidenceSummary}`)
    .slice(0, 4);
  const currentDraft = request.subject.trim() || request.body.trim()
    ? `Current editor draft:
- Subject: ${request.subject.trim() || "(empty)"}
- Body:
${request.body.trim() || "(empty)"}`
    : "Current editor draft: empty";

  return `Create or edit a concise B2B outreach email for a lead intelligence workflow.

Return only valid JSON with this exact shape:
{
  "subject": "string",
  "body": "string",
  "followUp": "string"
}

Rules:
- Do not invent facts.
- Mention the specific customer/company name.
- Mention the specific reason this customer was recommended.
- Mention evidence/source context.
- Mention vehicle branding or fleet graphics only because it is the current prototype use case.
- Use a professional, direct tone.
- Do not use generic sales hype.
- Keep the body under 180 words.
- Preserve the user's current draft intent when a current draft exists.

Requested action:
- ${ACTION_INSTRUCTIONS[request.action]}

${currentDraft}

Customer opportunity:
- Company: ${lead.businessName}
- Industry: ${lead.industry}
- Location: ${lead.location}, ${lead.city}
- Recommended contact: ${lead.contact.name || "Unknown"} (${lead.contact.role || "Decision maker"})
- Opportunity score: ${lead.scoreBreakdown.total}/100
- CRM status: ${lead.crmStatus}
- Recommended services: ${lead.recommendedServices.join(", ") || "Vehicle branding consultation"}
- Opportunity reasons: ${lead.valuableReasons.join("; ") || "Relevant regional business for vehicle branding review"}
- Insights: ${lead.opportunityInsights.map((item) => `${item.finding} Evidence: ${item.evidence}`).join("; ") || "No extra insights"}
- Evidence sources: ${evidence.join("; ") || "Database opportunity record"}

Sender/company profile:
- Company: ${profile?.name || "LeadLens AI"}
- Description: ${profile?.description || "Vehicle branding and fleet graphics support"}
- Industry focus: ${profile?.industryFocus || "Vehicle Branding and Fleet Graphics"}
- Target region: ${profile?.targetRegion || lead.city}
- Target customer: ${profile?.targetCustomer || "Regional businesses with visible vehicle fleets"}`;
}

function parseOpenAiDraft(content: string): Omit<GeneratedOutreachDraft, "source"> | null {
  try {
    const parsed = JSON.parse(content) as Partial<GeneratedOutreachDraft>;
    if (
      typeof parsed.subject === "string" &&
      typeof parsed.body === "string" &&
      typeof parsed.followUp === "string" &&
      parsed.subject.trim() &&
      parsed.body.trim()
    ) {
      return {
        subject: parsed.subject.trim(),
        body: parsed.body.trim(),
        followUp: parsed.followUp.trim(),
      };
    }
  } catch {
    return null;
  }
  return null;
}

async function generateWithOpenAi(
  lead: Lead,
  profile: OutreachCompanyProfile | null,
  request: Required<AssistRequest>
): Promise<GeneratedOutreachDraft | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write concise, evidence-backed B2B outreach for vehicle branding and fleet graphics.",
        },
        {
          role: "user",
          content: buildPrompt(lead, profile, request),
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as OpenAiResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const draft = parseOpenAiDraft(content);
  return draft ? { ...draft, source: "openai" } : null;
}

function generateFallbackDraft(
  lead: Lead,
  profile: OutreachCompanyProfile | null,
  request: Required<AssistRequest>
): GeneratedOutreachDraft {
  const hasCurrentDraft = Boolean(request.subject.trim() || request.body.trim());

  if (hasCurrentDraft) {
    return {
      subject: request.subject.trim() || `Outreach for ${lead.businessName}`,
      body: request.body.trim(),
      followUp: "",
      source: "fallback",
      warning:
        "AI assistance is unavailable right now, so your current draft was kept unchanged.",
    };
  }

  return {
    ...generateOutreachDraft(lead, profile),
    warning:
      "AI assistance is unavailable right now, so LeadLens used the local draft generator.",
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [lead, profile] = await Promise.all([
    getOpportunity(id),
    getCompanyProfile(),
  ]);

  if (!lead) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  const companyProfile = profile
    ? {
        name: profile.name,
        description: profile.description,
        industryFocus: profile.industryFocus,
        targetRegion: profile.targetRegion,
        targetCustomer: profile.targetCustomer,
      }
    : null;
  const body = await request.json().catch(() => null);
  const assist = getAssistRequest(body);
  const assistRequest: Required<AssistRequest> = {
    action: assist.action ?? "generate",
    subject: assist.subject ?? "",
    body: assist.body ?? "",
  };

  const draft =
    (await generateWithOpenAi(lead, companyProfile, assistRequest)) ??
    generateFallbackDraft(lead, companyProfile, assistRequest);

  const outreachMessage = await createOutreachMessage(id, {
    direction: "outbound",
    subject: draft.subject,
    body: draft.body,
    statusText: "Drafted",
  });

  if (draft.followUp) {
    await createOutreachMessage(id, {
      direction: "outbound",
      subject: `Follow-up: ${draft.subject}`,
      body: draft.followUp,
      statusText: "Follow-up Draft",
    });
  }

  return NextResponse.json({ draft, outreachMessage }, { status: 201 });
}
