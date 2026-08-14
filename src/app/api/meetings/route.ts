import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import { listMeetings } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const meetings = await listMeetings();
    return NextResponse.json({ meetings, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("list meetings", error);
  }
}
