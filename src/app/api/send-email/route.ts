import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getEnvValue, getReplyToEmail, getSystemStatus } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const status = getSystemStatus();
  const apiKey = getEnvValue("RESEND_API_KEY");
  const fromEmail =
    getEnvValue("RESEND_FROM_EMAIL") ?? "LeadLens AI <onboarding@resend.dev>";

  if (!status.resendReady || !apiKey) {
    return NextResponse.json(
      {
        error:
          "Email delivery is not connected. Please configure your email provider in Email Center.",
        configured: false,
      },
      { status: 503 }
    );
  }

  let body: {
    to?: string;
    subject?: string;
    body?: string;
    html?: string;
    leadName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { to, subject, body: text, html } = body;

  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, body" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const replyTo = getReplyToEmail();

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    text,
    ...(html ? { html } : {}),
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    return NextResponse.json(
      { error: error.message, configured: true },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    messageId: data?.id,
    configured: true,
  });
}
