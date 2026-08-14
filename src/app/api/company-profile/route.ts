import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import {
  getCompanyProfile,
  upsertCompanyProfile,
  type CompanyProfilePayload,
} from "@/lib/company-profile-db";

export const dynamic = "force-dynamic";

function isValidProfilePayload(value: unknown): value is CompanyProfilePayload {
  if (typeof value !== "object" || value == null) return false;
  const payload = value as Partial<CompanyProfilePayload>;
  return typeof payload.name === "string" && typeof payload.description === "string";
}

export async function GET() {
  try {
    const profile = await getCompanyProfile();
    return NextResponse.json({ profile, persistence: "database" });
  } catch (error) {
    return databaseUnavailableResponse("get company profile", error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isValidProfilePayload(body)) {
    return NextResponse.json(
      { error: "Missing required fields: name, description" },
      { status: 400 }
    );
  }

  try {
    const profile = await upsertCompanyProfile(body);
    return NextResponse.json({ profile, persistence: "database" }, { status: 201 });
  } catch (error) {
    return databaseUnavailableResponse("save company profile", error);
  }
}

export async function PATCH(request: Request) {
  return POST(request);
}
