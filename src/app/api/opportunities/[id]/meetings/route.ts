import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
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
  try {
    const meetings = await listMeetings(id);
    return NextResponse.json({ meetings, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("list opportunity meetings", error);
  }
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

  try {
    const meeting = await createMeeting(id, body);
    if (!meeting) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    return NextResponse.json(
      { meeting, persistence: "database" },
      { status: 201 }
    );
  } catch (error) {
    return databaseUnavailableResponse("save meeting", error);
  }
}
