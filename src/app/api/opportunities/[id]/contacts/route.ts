import { NextResponse } from "next/server";
import type { Contact } from "@/lib/types";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import { createContact, listContacts } from "@/lib/opportunity-db";

export const dynamic = "force-dynamic";

function isContactPayload(value: unknown): value is Contact {
  if (typeof value !== "object" || value == null) return false;
  const payload = value as Partial<Contact>;
  return (
    typeof payload.name === "string" &&
    typeof payload.email === "string" &&
    typeof payload.role === "string" &&
    typeof payload.confidence === "string"
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const contacts = await listContacts(id);
    return NextResponse.json({ contacts, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("list contacts", error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!isContactPayload(body)) {
    return NextResponse.json({ error: "Invalid contact payload" }, { status: 400 });
  }

  try {
    const contact = await createContact(id, body);
    return NextResponse.json({ contact, persistence: "database" }, { status: 201 });
  } catch (error) {
    return databaseUnavailableResponse("save contact", error);
  }
}
