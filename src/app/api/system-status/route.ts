import { NextResponse } from "next/server";
import { getSystemStatusWithChecks, logEnvDetection } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export async function GET() {
  logEnvDetection();
  return NextResponse.json(await getSystemStatusWithChecks());
}
