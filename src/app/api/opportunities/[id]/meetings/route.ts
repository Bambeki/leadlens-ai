import { NextResponse } from "next/server";
import { createMeeting, listMeetings } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

function isMeetingPayload(value: unknown): value is Parameters<typeof createMeeting>[1] {
  if (typeof value !== "object" || value == null) return false;
  const payload = value as {
    contactName?: unknown;
    contactRole?: unknown;
    scheduledAt?: unknown;
    displayTime?: unknown;
    meetingType?: unknown;
  };
  return (
    typeof payload.contactName === "string" &&
    typeof payload.contactRole === "string" &&
    typeof payload.scheduledAt === "string" &&
    typeof payload.displayTime === "string" &&
    typeof payload.meetingType === "string"
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetings = await listMeetings(id);
  return NextResponse.json({ meetings });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!isMeetingPayload(body)) {
    return NextResponse.json({ error: "Invalid meeting payload" }, { status: 400 });
  }

  const meeting = await createMeeting(id, body);
  return NextResponse.json({ meeting }, { status: 201 });
}
