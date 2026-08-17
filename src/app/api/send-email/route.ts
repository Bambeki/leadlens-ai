import { Resend } from "resend";
import { NextResponse } from "next/server";
import { outreachBlockedResponse } from "@/lib/api-diagnostics";
import {
  assertOpportunityAllowsOutreach,
} from "@/lib/opportunity-db";
import { emailIncludesPublicResponseLink } from "@/lib/opportunity-lifecycle";
import {
  canonicalizeCustomerFacingContent,
  containsProtectedVercelDeploymentUrl,
  getPublicAppBaseUrl,
} from "@/lib/public-app-url";
import { getEnvValue, getReplyToEmail, getSystemStatus } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    to?: string;
    subject?: string;
    body?: string;
    html?: string;
    leadName?: string;
    opportunityId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { to, subject, body: text, html, opportunityId } = body;

  if (!opportunityId || typeof opportunityId !== "string") {
    return NextResponse.json(
      { error: "opportunityId is required to send outreach." },
      { status: 400 }
    );
  }

  let responseToken: string;
  try {
    responseToken = await assertOpportunityAllowsOutreach(opportunityId);
  } catch (error) {
    return (
      outreachBlockedResponse(error) ??
      NextResponse.json(
        {
          error:
            "A secure customer response link could not be loaded. Refresh this opportunity from the database and try again.",
        },
        { status: 503 }
      )
    );
  }

  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, body" },
      { status: 400 }
    );
  }

  if (!emailIncludesPublicResponseLink(responseToken, text, html)) {
    return NextResponse.json(
      {
        error:
          "Outreach must include the secure customer response link before sending. Refresh this opportunity from the database and try again.",
      },
      { status: 409 }
    );
  }

  const canonicalBase = getPublicAppBaseUrl();
  const canonicalText = canonicalizeCustomerFacingContent(text, responseToken);
  const canonicalHtml = html
    ? canonicalizeCustomerFacingContent(html, responseToken)
    : html;

  if (
    containsProtectedVercelDeploymentUrl(canonicalText) ||
    containsProtectedVercelDeploymentUrl(canonicalHtml ?? "")
  ) {
    return NextResponse.json(
      {
        error:
          "Customer response links must use the public application URL. Set NEXT_PUBLIC_APP_URL to the production domain and try again.",
      },
      { status: 409 }
    );
  }

  if (
    process.env.VERCEL_ENV === "production" &&
    !canonicalBase
  ) {
    return NextResponse.json(
      {
        error:
          "Customer response links must use the public application URL. Set NEXT_PUBLIC_APP_URL to the production domain and try again.",
      },
      { status: 409 }
    );
  }

  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    !canonicalBase
  ) {
    return NextResponse.json(
      {
        error:
          "Customer response links must use the public application URL. Set NEXT_PUBLIC_APP_URL to the production domain and try again.",
      },
      { status: 409 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

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

  const resend = new Resend(apiKey);

  const replyTo = getReplyToEmail();

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    text: canonicalText,
    ...(canonicalHtml ? { html: canonicalHtml } : {}),
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
