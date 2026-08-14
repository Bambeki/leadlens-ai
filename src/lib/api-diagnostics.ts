import { NextResponse } from "next/server";
import { toSafeDiagnosticMessage } from "./system-status";

export function databaseUnavailableResponse(operation: string, error: unknown) {
  const diagnostic = toSafeDiagnosticMessage(error);
  console.warn(`[database] ${operation} failed: ${diagnostic}`);

  return NextResponse.json(
    {
      error: "Database unavailable",
      operation,
      diagnostic,
      persistence: "failed",
    },
    { status: 503 }
  );
}
