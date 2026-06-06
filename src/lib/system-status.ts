export interface SystemStatus {
  resendApiKeyDetected: boolean;
  resendFromEmailDetected: boolean;
  apifyTokenDetected: boolean;
  apifyActorDetected: boolean;
  resendReady: boolean;
  apifyReady: boolean;
}

function readEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null || raw === "") return undefined;

  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value.length > 0 ? value : undefined;
}

export function getEnvValue(key: string): string | undefined {
  return readEnv(key);
}

/** Plain email for Reply-To — RESEND_REPLY_TO_EMAIL or address from RESEND_FROM_EMAIL. */
export function getReplyToEmail(): string | undefined {
  const explicit = readEnv("RESEND_REPLY_TO_EMAIL");
  if (explicit) return explicit;

  const from = readEnv("RESEND_FROM_EMAIL");
  if (!from) return undefined;

  const bracketMatch = from.match(/<([^>]+)>/);
  if (bracketMatch) return bracketMatch[1].trim();

  if (from.includes("@")) return from;

  return undefined;
}

export function getSystemStatus(): SystemStatus {
  const resendApiKeyDetected = Boolean(readEnv("RESEND_API_KEY"));
  const resendFromEmailDetected = Boolean(readEnv("RESEND_FROM_EMAIL"));
  const apifyTokenDetected = Boolean(readEnv("APIFY_TOKEN"));
  const apifyActorDetected = Boolean(readEnv("APIFY_GOOGLE_MAPS_ACTOR"));

  const resendReady = resendApiKeyDetected && resendFromEmailDetected;
  const apifyReady = apifyTokenDetected && apifyActorDetected;

  return {
    resendApiKeyDetected,
    resendFromEmailDetected,
    apifyTokenDetected,
    apifyActorDetected,
    resendReady,
    apifyReady,
  };
}

let envLogged = false;

export function logEnvDetection(): void {
  if (envLogged) return;
  envLogged = true;

  const status = getSystemStatus();
  console.log(`RESEND detected: ${status.resendReady}`);
  console.log(`APIFY detected: ${status.apifyReady}`);
}
