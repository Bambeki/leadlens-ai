import { NextResponse } from "next/server";
import type { Lead } from "@/lib/types";
import { listOpportunities, saveOpportunities, saveOpportunity } from "@/lib/opportunity-db";

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

export async function GET() {
  const opportunities = await listOpportunities();
  return NextResponse.json({ opportunities });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (Array.isArray(body?.opportunities)) {
    const opportunities = body.opportunities;
    if (!opportunities.every(isLeadPayload)) {
      return NextResponse.json({ error: "Invalid opportunities payload" }, { status: 400 });
    }
    const saved = await saveOpportunities(opportunities);
    return NextResponse.json({ opportunities: saved }, { status: 201 });
  }

  const opportunity = body?.opportunity ?? body;
  if (!isLeadPayload(opportunity)) {
    return NextResponse.json({ error: "Invalid opportunity payload" }, { status: 400 });
  }

  const saved = await saveOpportunity(opportunity);
  return NextResponse.json({ opportunity: saved }, { status: 201 });
}
