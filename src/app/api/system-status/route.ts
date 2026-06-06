import { NextResponse } from "next/server";
import { getSystemStatus, logEnvDetection } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export async function GET() {
  logEnvDetection();
  return NextResponse.json(getSystemStatus());
}
