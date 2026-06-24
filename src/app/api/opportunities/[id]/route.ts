import { NextResponse } from "next/server";
import { getOpportunity } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  return NextResponse.json({ opportunity });
}
