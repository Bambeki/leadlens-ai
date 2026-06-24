import { NextResponse } from "next/server";
import { listMeetings } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const meetings = await listMeetings();
  return NextResponse.json({ meetings });
}
