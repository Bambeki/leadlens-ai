import { NextResponse } from "next/server";
import { createOutreachMessage, listOutreachMessages } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

function isOutreachPayload(value: unknown): value is Parameters<typeof createOutreachMessage>[1] {
  if (typeof value !== "object" || value == null) return false;
  const payload = value as { body?: unknown };
  return typeof payload.body === "string";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const outreachMessages = await listOutreachMessages(id);
  return NextResponse.json({ outreachMessages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!isOutreachPayload(body)) {
    return NextResponse.json({ error: "Invalid outreach message payload" }, { status: 400 });
  }

  const outreachMessage = await createOutreachMessage(id, body);
  return NextResponse.json({ outreachMessage }, { status: 201 });
}
