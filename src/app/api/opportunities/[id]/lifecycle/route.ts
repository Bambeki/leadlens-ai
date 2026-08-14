import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import {
  archiveOpportunity,
  restoreOpportunity,
  deleteOpportunityPermanently,
} from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action as string | undefined;

  try {
    if (action === "archive") {
      const opportunity = await archiveOpportunity(id);
      if (!opportunity) {
        return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      }
      return NextResponse.json({ opportunity, persistence: "database" });
    }

    if (action === "restore") {
      const opportunity = await restoreOpportunity(id);
      if (!opportunity) {
        return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      }
      return NextResponse.json({ opportunity, persistence: "database" });
    }

    return NextResponse.json({ error: "Unsupported lifecycle action" }, { status: 400 });
  } catch (error) {
    return databaseUnavailableResponse("update opportunity lifecycle", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const confirmed = body?.confirm === true;
  const confirmName = typeof body?.confirmName === "string" ? body.confirmName : "";

  if (!confirmed || !confirmName.trim()) {
    return NextResponse.json(
      {
        error:
          "Permanent delete requires explicit confirmation and the matching business name.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await deleteOpportunityPermanently(id, confirmName);
    if (!result.ok) {
      const status = result.reason === "Opportunity not found" ? 404 : 400;
      return NextResponse.json({ error: result.reason }, { status });
    }
    return NextResponse.json({ deleted: true, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("delete opportunity", error);
  }
}
