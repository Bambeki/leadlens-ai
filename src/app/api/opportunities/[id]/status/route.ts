import { NextResponse } from "next/server";
import type { CRMStatus } from "@/lib/types";
import { updateOpportunityStatus } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

const VALID_STATUSES: CRMStatus[] = [
  "Not Contacted",
  "Contacted",
  "Responded",
  "Meeting Scheduled",
  "Won",
  "Lost",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as CRMStatus | undefined;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid opportunity status" }, { status: 400 });
  }

  const opportunity = await updateOpportunityStatus(id, status, body?.note);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  return NextResponse.json({ opportunity });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
