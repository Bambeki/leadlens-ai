import { NextResponse } from "next/server";
import { getEnvValue, getReplyToEmail, getSystemStatus } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getSystemStatus();
  const fromEmail = getEnvValue("RESEND_FROM_EMAIL") ?? null;

  const replyToEmail = getReplyToEmail();

  return NextResponse.json({
    configured: status.resendReady,
    fromEmail: status.resendFromEmailDetected ? fromEmail : null,
    replyToEmail: replyToEmail ?? null,
    provider: "resend",
  });
}
