import { getCustomerResponseUrls } from "./customer-response";

export type EmailCtaId = "consultation" | "audit" | "discovery";

export interface EmailCtaConfig {
  consultation: boolean;
  audit: boolean;
  discovery: boolean;
}

export const DEFAULT_EMAIL_CTA_CONFIG: EmailCtaConfig = {
  consultation: true,
  audit: true,
  discovery: true,
};

export const EMAIL_CTA_DEFINITIONS: {
  id: EmailCtaId;
  label: string;
  variant: "primary" | "secondary" | "tertiary";
}[] = [
  { id: "consultation", label: "Book 15-Min Consultation", variant: "primary" },
  { id: "audit", label: "Request Vehicle Branding Audit", variant: "secondary" },
  { id: "discovery", label: "Schedule Discovery Call", variant: "tertiary" },
];

const BRAND = {
  indigo: "#4f46e5",
  indigoDark: "#4338ca",
  indigoLight: "#eef2ff",
  indigoBorder: "#c7d2fe",
  slate: "#64748b",
  slateDark: "#334155",
  white: "#ffffff",
  bg: "#f8fafc",
};

export interface HtmlEmailOptions {
  headline: string;
  body: string;
  leadId: string;
  baseUrl?: string;
  ctaConfig?: EmailCtaConfig;
  companyName?: string;
}

function getCtaUrl(
  id: EmailCtaId,
  leadId: string,
  baseUrl?: string
): string {
  const urls = getCustomerResponseUrls(leadId, baseUrl);
  switch (id) {
    case "consultation":
      return `${urls.schedule}${urls.schedule.includes("?") ? "&" : "?"}intent=consultation`;
    case "audit":
      return `${urls.interested}${urls.interested.includes("?") ? "&" : "?"}intent=audit`;
    case "discovery":
      return `${urls.schedule}${urls.schedule.includes("?") ? "&" : "?"}intent=discovery`;
  }
}

/** Remove legacy plain-text CTA block appended to outreach drafts */
export function stripPlainTextCtaBlock(body: string): string {
  const marker = "──────────────────────────────";
  const idx = body.indexOf(marker);
  if (idx === -1) return body.trim();
  return body.slice(0, idx).trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bodyTextToHtml(body: string): string {
  const cleaned = stripPlainTextCtaBlock(body);
  const blocks = cleaned.split(/\n\n+/);

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const isList = lines.every((l) => /^[•\-*]\s/.test(l.trim()) || l.trim() === "");

      if (isList && lines.some((l) => /^[•\-*]\s/.test(l.trim()))) {
        const items = lines
          .filter((l) => /^[•\-*]\s/.test(l.trim()))
          .map(
            (l) =>
              `<li style="margin:0 0 8px 0;color:${BRAND.slateDark};font-size:15px;line-height:1.6;">${escapeHtml(l.replace(/^[•\-*]\s*/, ""))}</li>`
          )
          .join("");
        return `<ul style="margin:0 0 16px 0;padding-left:20px;">${items}</ul>`;
      }

      const html = lines.map((l) => escapeHtml(l)).join("<br />");
      return `<p style="margin:0 0 16px 0;color:${BRAND.slateDark};font-size:15px;line-height:1.65;">${html}</p>`;
    })
    .join("");
}

function buttonStyles(variant: "primary" | "secondary" | "tertiary"): {
  bg: string;
  color: string;
  border: string;
} {
  switch (variant) {
    case "primary":
      return { bg: BRAND.indigo, color: BRAND.white, border: BRAND.indigo };
    case "secondary":
      return { bg: BRAND.indigoLight, color: BRAND.indigo, border: BRAND.indigo };
    case "tertiary":
      return { bg: BRAND.white, color: BRAND.indigo, border: BRAND.indigoBorder };
  }
}

function renderBulletproofButton(
  href: string,
  label: string,
  variant: "primary" | "secondary" | "tertiary"
): string {
  const { bg, color, border } = buttonStyles(variant);
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 12px 0;">
  <tr>
    <td align="center" style="border-radius:8px;background-color:${bg};">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:44px;v-text-anchor:middle;width:280px;" arcsize="18%" strokecolor="${border}" fillcolor="${bg}">
        <w:anchorlock/>
        <center style="color:${color};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${safeLabel}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${safeHref}" target="_blank" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;line-height:1.2;color:${color};text-decoration:none;border-radius:8px;background-color:${bg};border:2px solid ${border};mso-hide:all;">
        ${safeLabel}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

function renderCtaButtons(
  leadId: string,
  baseUrl: string | undefined,
  ctaConfig: EmailCtaConfig
): string {
  const enabled = EMAIL_CTA_DEFINITIONS.filter((cta) => ctaConfig[cta.id]);
  if (enabled.length === 0) return "";

  const buttons = enabled
    .map((cta) =>
      renderBulletproofButton(
        getCtaUrl(cta.id, leadId, baseUrl),
        cta.label,
        cta.variant
      )
    )
    .join("");

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px 0;">
  <tr>
    <td style="padding:20px 0 8px 0;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:${BRAND.slate};text-transform:uppercase;letter-spacing:0.05em;">
        Ready to get started?
      </p>
      ${buttons}
    </td>
  </tr>
</table>`;
}

export function buildPlainTextEmail(options: HtmlEmailOptions): string {
  const {
    body,
    leadId,
    baseUrl,
    ctaConfig = DEFAULT_EMAIL_CTA_CONFIG,
  } = options;
  const cleaned = stripPlainTextCtaBlock(body);
  const enabled = EMAIL_CTA_DEFINITIONS.filter((cta) => ctaConfig[cta.id]);

  if (enabled.length === 0) return cleaned;

  const ctaLines = enabled
    .map((cta) => `${cta.label}\n${getCtaUrl(cta.id, leadId, baseUrl)}`)
    .join("\n\n");

  return `${cleaned}

──────────────────────────────
${ctaLines}

Not interested? ${getCustomerResponseUrls(leadId, baseUrl).declined}
──────────────────────────────`;
}

export function buildHtmlEmail(options: HtmlEmailOptions): string {
  const {
    headline,
    body,
    leadId,
    baseUrl,
    ctaConfig = DEFAULT_EMAIL_CTA_CONFIG,
    companyName = "FleetBrand Pro",
  } = options;

  const bodyHtml = bodyTextToHtml(body);
  const ctaHtml = renderCtaButtons(leadId, baseUrl, ctaConfig);
  const safeHeadline = escapeHtml(headline);
  const safeCompany = escapeHtml(companyName);
  const declinedUrl = escapeHtml(
    getCustomerResponseUrls(leadId, baseUrl).declined
  );

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${safeHeadline}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${safeHeadline} — ${safeCompany}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <!-- Logo -->
          <tr>
            <td style="padding:28px 32px 20px 32px;background:linear-gradient(135deg,${BRAND.indigo} 0%,${BRAND.indigoDark} 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-block;width:40px;height:40px;background-color:rgba(255,255,255,0.2);border-radius:10px;text-align:center;line-height:40px;font-size:20px;margin-bottom:12px;">
                      🚐
                    </div>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:${BRAND.white};letter-spacing:-0.02em;">
                      ${safeCompany}
                    </p>
                    <p style="margin:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.85);">
                      Vehicle Branding &amp; Fleet Wraps
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Headline -->
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;line-height:1.35;color:#0f172a;">
                ${safeHeadline}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- CTAs -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              ${ctaHtml}
              <p style="margin:8px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.slate};">
                <a href="${declinedUrl}" style="color:${BRAND.slate};text-decoration:underline;">Not interested</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px 32px;background-color:#f1f5f9;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.slate};text-align:center;">
                Powered by LeadLens AI Vehicle Branding Intelligence
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} ${safeCompany}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function prepareEmailPayload(options: {
  subject: string;
  body: string;
  leadId: string;
  baseUrl?: string;
  ctaConfig?: EmailCtaConfig;
}): { subject: string; body: string; html: string } {
  const ctaConfig = options.ctaConfig ?? DEFAULT_EMAIL_CTA_CONFIG;
  const headline = options.subject.trim();

  return {
    subject: options.subject.trim(),
    body: buildPlainTextEmail({
      headline,
      body: options.body,
      leadId: options.leadId,
      baseUrl: options.baseUrl,
      ctaConfig,
    }),
    html: buildHtmlEmail({
      headline,
      body: options.body,
      leadId: options.leadId,
      baseUrl: options.baseUrl,
      ctaConfig,
    }),
  };
}
