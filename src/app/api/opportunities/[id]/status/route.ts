import { NextResponse } from "next/server";
import type { CRMStatus } from "@/lib/types";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import { listOpportunityActivity, updateOpportunityStatus } from "@/lib/opportunity-db";

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

  try {
    const opportunity = await updateOpportunityStatus(id, status, body?.note);
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json({ opportunity, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("update opportunity status", error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const activity = await listOpportunityActivity(id);
    return NextResponse.json({ activity, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("list opportunity activity", error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
