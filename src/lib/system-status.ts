import { prisma } from "./prisma";

export interface SystemStatus {
  databaseUrlDetected: boolean;
  directUrlDetected: boolean;
  databaseConnected: boolean | null;
  databaseError: string | null;
  openAiApiKeyDetected: boolean;
  openAiModel: string;
  openAiReady: boolean;
  resendApiKeyDetected: boolean;
  resendFromEmailDetected: boolean;
  apifyTokenDetected: boolean;
  apifyActorDetected: boolean;
  resendReady: boolean;
  apifyReady: boolean;
  meetingProvider: "none";
  meetingProviderConfigured: boolean;
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

export function toSafeDiagnosticMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/postgresql:\/\/\S+/gi, "[redacted-database-url]")
    .replace(/postgres:\/\/\S+/gi, "[redacted-database-url]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 240);
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
  const databaseUrlDetected = Boolean(readEnv("DATABASE_URL"));
  const directUrlDetected = Boolean(readEnv("DIRECT_URL"));
  const openAiApiKeyDetected = Boolean(readEnv("OPENAI_API_KEY"));
  const openAiModel = readEnv("OPENAI_MODEL") ?? "gpt-4o-mini";
  const resendApiKeyDetected = Boolean(readEnv("RESEND_API_KEY"));
  const resendFromEmailDetected = Boolean(readEnv("RESEND_FROM_EMAIL"));
  const apifyTokenDetected = Boolean(readEnv("APIFY_TOKEN"));
  const apifyActorDetected = Boolean(readEnv("APIFY_GOOGLE_MAPS_ACTOR"));

  const resendReady = resendApiKeyDetected && resendFromEmailDetected;
  const openAiReady = openAiApiKeyDetected;
  const apifyReady = apifyTokenDetected && apifyActorDetected;

  return {
    databaseUrlDetected,
    directUrlDetected,
    databaseConnected: null,
    databaseError: null,
    openAiApiKeyDetected,
    openAiModel,
    openAiReady,
    resendApiKeyDetected,
    resendFromEmailDetected,
    apifyTokenDetected,
    apifyActorDetected,
    resendReady,
    apifyReady,
    meetingProvider: "none",
    meetingProviderConfigured: false,
  };
}

export async function getSystemStatusWithChecks(): Promise<SystemStatus> {
  const status = getSystemStatus();

  if (!status.databaseUrlDetected) {
    return {
      ...status,
      databaseConnected: false,
      databaseError: "DATABASE_URL is not configured.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ...status, databaseConnected: true, databaseError: null };
  } catch (error) {
    const safeError = toSafeDiagnosticMessage(error);
    console.warn(`[system-status] Database connectivity check failed: ${safeError}`);
    return {
      ...status,
      databaseConnected: false,
      databaseError: safeError,
    };
  }
}

let envLogged = false;

export function logEnvDetection(): void {
  if (envLogged) return;
  envLogged = true;

  const status = getSystemStatus();
  console.log(`DATABASE_URL detected: ${status.databaseUrlDetected}`);
  console.log(`OPENAI detected: ${status.openAiReady}`);
  console.log(`RESEND detected: ${status.resendReady}`);
  console.log(`APIFY detected: ${status.apifyReady}`);
}
