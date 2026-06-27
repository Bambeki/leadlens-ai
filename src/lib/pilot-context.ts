import { prisma } from "./prisma";

const DEFAULT_ORG_NAME = "Weimar Beschriftung Pilot";
const DEFAULT_USER_EMAIL = "pilot@leadlens.local";
const DEFAULT_USER_NAME = "Pilot User";
const DEFAULT_PASSWORD_HASH = "development-placeholder-change-before-production";
const DEFAULT_COMPANY_PROFILE = {
  name: "Weimar Beschriftung",
  description: "We provide vehicle branding and fleet graphics.",
  industryFocus: "Vehicle Branding and Fleet Graphics",
  targetRegion: "Mittelhessen",
  targetCustomer: "Regional businesses with visible vehicle fleets",
};

let pilotOrganizationPromise: ReturnType<typeof ensurePilotOrganization> | null = null;

export async function getPilotOrganization() {
  if (!pilotOrganizationPromise) {
    pilotOrganizationPromise = ensurePilotOrganization().catch((error) => {
      pilotOrganizationPromise = null;
      throw error;
    });
  }

  return pilotOrganizationPromise;
}

async function ensurePilotOrganization() {
  const existingUser = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
    include: { organization: true },
  });

  if (existingUser) {
    await ensureDefaultCompanyProfile(existingUser.organizationId);
    return existingUser.organization;
  }

  const existingOrganization = await prisma.organization.findFirst({
    where: { name: DEFAULT_ORG_NAME },
  });

  if (existingOrganization) {
    const user = await prisma.user.upsert({
      where: { email: DEFAULT_USER_EMAIL },
      create: {
        name: DEFAULT_USER_NAME,
        email: DEFAULT_USER_EMAIL,
        password_hash: DEFAULT_PASSWORD_HASH,
        role_text: "pilot",
        organizationId: existingOrganization.id,
      },
      update: {
        name: DEFAULT_USER_NAME,
        role_text: "pilot",
        organizationId: existingOrganization.id,
      },
      include: { organization: true },
    });

    await ensureDefaultCompanyProfile(existingOrganization.id);
    return user.organization;
  }

  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    create: {
      name: DEFAULT_USER_NAME,
      email: DEFAULT_USER_EMAIL,
      password_hash: DEFAULT_PASSWORD_HASH,
      role_text: "pilot",
      organization: {
        create: {
          name: DEFAULT_ORG_NAME,
          companyProfiles: {
            create: DEFAULT_COMPANY_PROFILE,
          },
        },
      },
    },
    update: {
      name: DEFAULT_USER_NAME,
      role_text: "pilot",
    },
    include: { organization: true },
  });

  await ensureDefaultCompanyProfile(user.organizationId);
  return user.organization;
}

async function ensureDefaultCompanyProfile(organizationId: string) {
  const existingProfile = await prisma.companyProfile.findFirst({
    where: {
      organizationId,
      name: DEFAULT_COMPANY_PROFILE.name,
    },
  });

  if (existingProfile) return existingProfile;

  return prisma.companyProfile.create({
    data: {
      organizationId,
      ...DEFAULT_COMPANY_PROFILE,
    },
  });
}
