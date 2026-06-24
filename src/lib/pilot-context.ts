import { prisma } from "./prisma";

const DEFAULT_ORG_NAME = "Weimar Beschriftung Pilot";
const DEFAULT_USER_EMAIL = "pilot@leadlens.local";

export async function getPilotOrganization() {
  const existing = await prisma.organization.findFirst({
    where: { name: DEFAULT_ORG_NAME },
  });

  if (existing) return existing;

  return prisma.organization.create({
    data: {
      name: DEFAULT_ORG_NAME,
      users: {
        create: {
          name: "Pilot User",
          email: DEFAULT_USER_EMAIL,
          password_hash: "development-placeholder-change-before-production",
          role_text: "pilot",
        },
      },
      companyProfiles: {
        create: {
          name: "Weimar Beschriftung",
          description: "We provide vehicle branding and fleet graphics.",
          industryFocus: "Vehicle Branding and Fleet Graphics",
          targetRegion: "Mittelhessen",
          targetCustomer: "Regional businesses with visible vehicle fleets",
        },
      },
    },
  });
}
