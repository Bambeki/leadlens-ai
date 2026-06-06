import type { SystemStatus } from "./system-status";

export type { SystemStatus };

const DEFAULT_STATUS: SystemStatus = {
  resendApiKeyDetected: false,
  resendFromEmailDetected: false,
  apifyTokenDetected: false,
  apifyActorDetected: false,
  resendReady: false,
  apifyReady: false,
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
