import type { SystemStatus } from "./system-status";

export type { SystemStatus };

const DEFAULT_STATUS: SystemStatus = {
  databaseUrlDetected: false,
  directUrlDetected: false,
  databaseConnected: null,
  databaseError: null,
  openAiApiKeyDetected: false,
  openAiModel: "gpt-4o-mini",
  openAiReady: false,
  resendApiKeyDetected: false,
  resendFromEmailDetected: false,
  apifyTokenDetected: false,
  apifyActorDetected: false,
  resendReady: false,
  apifyReady: false,
  emailOpenTrackingConfigured: false,
  inboundReplyIntegrationConfigured: false,
  meetingProvider: "none",
  meetingProviderConfigured: false,
  demoSimulationToolsAvailable: false,
};

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch("/api/system-status", { cache: "no-store" });
    if (!res.ok) return DEFAULT_STATUS;
    return res.json();
  } catch {
    return DEFAULT_STATUS;
  }
}
