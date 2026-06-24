import { prisma } from "./prisma";
import { getPilotOrganization } from "./pilot-context";

export interface CompanyProfilePayload {
  name: string;
  description: string;
  industryFocus?: string;
  targetRegion?: string;
  targetCustomer?: string;
}

export async function getCompanyProfile() {
  const organization = await getPilotOrganization();
  return prisma.companyProfile.findFirst({
    where: { organizationId: organization.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertCompanyProfile(payload: CompanyProfilePayload) {
  const organization = await getPilotOrganization();
  const existing = await getCompanyProfile();

  const data = {
    organizationId: organization.id,
    name: payload.name,
    description: payload.description,
    industryFocus: payload.industryFocus ?? "Vehicle Branding and Fleet Graphics",
    targetRegion: payload.targetRegion,
    targetCustomer: payload.targetCustomer,
  };

  if (!existing) {
    return prisma.companyProfile.create({ data });
  }

  return prisma.companyProfile.update({
    where: { id: existing.id },
    data,
  });
}
