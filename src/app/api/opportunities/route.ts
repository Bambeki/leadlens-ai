import { NextResponse } from "next/server";
import type { Lead } from "@/lib/types";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import { listOpportunities, saveOpportunities, saveOpportunity } from "@/lib/opportunity-db";
import { parseOpportunityListScope } from "@/lib/opportunity-lifecycle";

export const dynamic = "force-dynamic";

function isLeadPayload(value: unknown): value is Lead {
  if (typeof value !== "object" || value == null) return false;
  const payload = value as Partial<Lead>;
  return (
    typeof payload.id === "string" &&
    typeof payload.businessName === "string" &&
    typeof payload.industry === "string" &&
    typeof payload.city === "string"
  );
}

export async function GET(request: Request) {
  const scope = parseOpportunityListScope(
    new URL(request.url).searchParams.get("scope")
  );
  try {
    const opportunities = await listOpportunities(scope);
    return NextResponse.json({ opportunities, scope, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("list opportunities", error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (Array.isArray(body?.opportunities)) {
    const opportunities = body.opportunities;
    if (!opportunities.every(isLeadPayload)) {
      return NextResponse.json({ error: "Invalid opportunities payload" }, { status: 400 });
    }
    try {
      const saved = await saveOpportunities(opportunities);
      const suppressed = saved.filter((item) => item.importSuppressed);
      const active = saved.filter((item) => !item.importSuppressed);
      return NextResponse.json(
        {
          opportunities: saved,
          imported: active,
          suppressed,
          persistence: "database",
        },
        { status: 201 }
      );
    } catch (error) {
      return databaseUnavailableResponse("save opportunities", error);
    }
  }

  const opportunity = body?.opportunity ?? body;
  if (!isLeadPayload(opportunity)) {
    return NextResponse.json({ error: "Invalid opportunity payload" }, { status: 400 });
  }

  try {
    const saved = await saveOpportunity(opportunity);
    return NextResponse.json(
      { opportunity: saved, persistence: "database" },
      { status: 201 }
    );
  } catch (error) {
    return databaseUnavailableResponse("save opportunity", error);
  }
}
