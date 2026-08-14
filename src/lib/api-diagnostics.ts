import { NextResponse } from "next/server";
import { OutreachBlockedError } from "./opportunity-lifecycle";
import { toSafeDiagnosticMessage } from "./system-status";

export function outreachBlockedResponse(error: unknown) {
  if (!(error instanceof OutreachBlockedError)) return null;
  const notFound = error.message === "Opportunity not found.";
  return NextResponse.json(
    { error: error.message },
    { status: notFound ? 404 : 409 }
  );
}

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
