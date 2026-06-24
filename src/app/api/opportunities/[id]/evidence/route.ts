import { NextResponse } from "next/server";
import type { EvidenceSource } from "@/lib/types";
import { createEvidenceSource, listEvidenceSources } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

function isEvidencePayload(value: unknown): value is EvidenceSource {
  if (typeof value !== "object" || value == null) return false;
  const payload = value as Partial<EvidenceSource>;
  return (
    typeof payload.sourceName === "string" &&
    typeof payload.sourceType === "string" &&
    typeof payload.evidenceSummary === "string" &&
    typeof payload.dateCollected === "string" &&
    typeof payload.confidenceScore === "string"
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const evidenceSources = await listEvidenceSources(id);
  return NextResponse.json({ evidenceSources });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!isEvidencePayload(body)) {
    return NextResponse.json({ error: "Invalid evidence source payload" }, { status: 400 });
  }

  const evidenceSource = await createEvidenceSource(id, body);
  return NextResponse.json({ evidenceSource }, { status: 201 });
}
