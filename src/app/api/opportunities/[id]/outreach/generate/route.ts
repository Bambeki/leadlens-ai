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

function buildPrompt(lead: Lead, profile: OutreachCompanyProfile | null) {
  const evidence = lead.evidenceSources
    .map((source) => `${source.sourceName} (${source.sourceType}): ${source.evidenceSummary}`)
    .slice(0, 4);

  return `Create a concise B2B outreach email for a vehicle branding opportunity.

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
- Mention vehicle branding or fleet graphics.
- Use a professional, direct tone.
- Do not use generic sales hype.
- Keep the body under 180 words.

Customer opportunity:
- Company: ${lead.businessName}
- Industry: ${lead.industry}
- Location: ${lead.location}, ${lead.city}
- Recommended contact: ${lead.contact.name || "Unknown"} (${lead.contact.role || "Decision maker"})
- Opportunity score: ${lead.scoreBreakdown.total}/100
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
  profile: OutreachCompanyProfile | null
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
          content: buildPrompt(lead, profile),
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

export async function POST(
  _request: Request,
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

  const draft =
    (await generateWithOpenAi(lead, companyProfile)) ??
    generateOutreachDraft(lead, companyProfile);

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
