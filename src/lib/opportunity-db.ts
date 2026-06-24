import {
  ConfidenceScore,
  EvidenceSourceType,
  OpportunityStatus,
  OutreachDirection,
  Priority as DbPriority,
  type Prisma,
} from "@prisma/client";
import type {
  Contact as LeadContact,
  CRMStatus,
  EvidenceSource as LeadEvidenceSource,
  Lead,
  Priority,
} from "./types";
import { prisma } from "./prisma";
import { getPilotOrganization } from "./pilot-context";

const opportunityInclude = {
  evidenceSources: true,
  contacts: true,
  outreachMessages: true,
  meetings: true,
  statusHistory: true,
} satisfies Prisma.OpportunityInclude;

type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;

const statusToDb: Record<CRMStatus, OpportunityStatus> = {
  "Not Contacted": OpportunityStatus.NOT_CONTACTED,
  Contacted: OpportunityStatus.CONTACTED,
  Responded: OpportunityStatus.RESPONDED,
  "Meeting Scheduled": OpportunityStatus.MEETING_SCHEDULED,
  Won: OpportunityStatus.WON,
  Lost: OpportunityStatus.LOST,
};

const statusFromDb: Record<OpportunityStatus, CRMStatus> = {
  NOT_CONTACTED: "Not Contacted",
  CONTACTED: "Contacted",
  RESPONDED: "Responded",
  MEETING_SCHEDULED: "Meeting Scheduled",
  WON: "Won",
  LOST: "Lost",
};

const priorityToDb: Record<Priority, DbPriority> = {
  High: DbPriority.HIGH,
  Medium: DbPriority.MEDIUM,
  Low: DbPriority.LOW,
};

const priorityFromDb: Record<DbPriority, Priority> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const confidenceToDb = {
  High: ConfidenceScore.HIGH,
  Medium: ConfidenceScore.MEDIUM,
  Low: ConfidenceScore.LOW,
  high: ConfidenceScore.HIGH,
  medium: ConfidenceScore.MEDIUM,
  low: ConfidenceScore.LOW,
} as const;

const confidenceFromDb: Record<ConfidenceScore, "High" | "Medium" | "Low"> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const evidenceTypeToDb: Record<LeadEvidenceSource["sourceType"], EvidenceSourceType> = {
  "Business Profile": EvidenceSourceType.BUSINESS_PROFILE,
  Website: EvidenceSourceType.WEBSITE,
  "Social Profile": EvidenceSourceType.SOCIAL_PROFILE,
  "Image Analysis": EvidenceSourceType.IMAGE_ANALYSIS,
  "Contact Enrichment": EvidenceSourceType.CONTACT_ENRICHMENT,
  Import: EvidenceSourceType.IMPORT,
};

const evidenceTypeFromDb: Record<EvidenceSourceType, LeadEvidenceSource["sourceType"]> = {
  BUSINESS_PROFILE: "Business Profile",
  WEBSITE: "Website",
  SOCIAL_PROFILE: "Social Profile",
  IMAGE_ANALYSIS: "Image Analysis",
  CONTACT_ENRICHMENT: "Contact Enrichment",
  IMPORT: "Import",
};

function jsonValue<T>(value: Prisma.JsonValue, fallback: T): T {
  return value == null ? fallback : (value as T);
}

function dateOrNow(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toLead(opportunity: OpportunityWithRelations): Lead {
  const primaryContact = opportunity.contacts[0];
  const fallbackContact: LeadContact = {
    name: "Contact pending",
    email: "",
    role: "Decision maker",
    confidence: "medium",
  };

  return {
    id: opportunity.id,
    businessName: opportunity.businessName,
    industry: opportunity.industry,
    location: opportunity.location,
    city: opportunity.city,
    scoreBreakdown: jsonValue(opportunity.scoreBreakdown, {
      recentlyOpened: 0,
      activeSocialMedia: 0,
      multipleLocations: 0,
      brandingOpportunity: 0,
      regionalProximity: 0,
      total: opportunity.score,
    }),
    priority: priorityFromDb[opportunity.priority],
    valuableReasons: opportunity.valuableReasons,
    opportunityInsights: jsonValue(opportunity.opportunityInsights, []),
    discovery: jsonValue(opportunity.discovery, {
      platform: "Google Maps",
      collectedAt: opportunity.createdAt.toISOString(),
      placeId: opportunity.id,
      rating: 0,
      reviewCount: 0,
      categories: [opportunity.industry],
      method: "Database record",
    }),
    evidenceSources: opportunity.evidenceSources.map((source) => ({
      sourceName: source.sourceName,
      sourceType: evidenceTypeFromDb[source.sourceType],
      sourceUrl: source.sourceUrl ?? undefined,
      evidenceSummary: source.evidenceSummary,
      dateCollected: source.dateCollected.toISOString(),
      confidenceScore: confidenceFromDb[source.confidenceScore],
    })),
    signageAudit: jsonValue(opportunity.signageAudit, {
      visibilityScore: 0,
      brandingAssessment: {
        signQuality: 0,
        visibility: 0,
        brandingConsistency: 0,
        vehicleBranding: 0,
      },
      weaknesses: [],
      recommendations: [],
      estimatedValue: {
        min: opportunity.estimatedValueMin ?? 0,
        max: opportunity.estimatedValueMax ?? 0,
      },
      confidenceScore: 0,
      verdict: "Analysis pending",
    }),
    contact: primaryContact
      ? {
          name: primaryContact.name,
          email: primaryContact.email,
          role: primaryContact.role,
          linkedIn: primaryContact.linkedIn ?? undefined,
          confidence: confidenceFromDb[primaryContact.confidence].toLowerCase() as "high" | "medium",
        }
      : fallbackContact,
    crmStatus: statusFromDb[opportunity.status],
    recommendedServices: opportunity.recommendedServices,
    estimatedValue: {
      min: opportunity.estimatedValueMin ?? 0,
      max: opportunity.estimatedValueMax ?? 0,
    },
    factors: jsonValue(opportunity.scoringFactors, {
      recentlyOpened: false,
      activeSocialMedia: false,
      multipleLocations: false,
      brandingOpportunity: false,
      regionalProximity: false,
    }),
    imported: opportunity.imported,
    phone: opportunity.phone ?? undefined,
    website: opportunity.website ?? undefined,
  };
}

export async function listOpportunities(): Promise<Lead[]> {
  const organization = await getPilotOrganization();
  const opportunities = await prisma.opportunity.findMany({
    where: { organizationId: organization.id },
    include: opportunityInclude,
    orderBy: [{ createdAt: "desc" }],
  });
  return opportunities.map(toLead);
}

export async function getOpportunity(id: string): Promise<Lead | null> {
  const organization = await getPilotOrganization();
  const opportunity = await prisma.opportunity.findFirst({
    where: { id, organizationId: organization.id },
    include: opportunityInclude,
  });
  return opportunity ? toLead(opportunity) : null;
}

export async function saveOpportunity(lead: Lead): Promise<Lead> {
  const organization = await getPilotOrganization();
  const data = {
    organizationId: organization.id,
    businessName: lead.businessName,
    industry: lead.industry,
    location: lead.location,
    city: lead.city,
    score: lead.scoreBreakdown.total,
    priority: priorityToDb[lead.priority],
    status: statusToDb[lead.crmStatus],
    phone: lead.phone,
    website: lead.website,
    recommendedServices: lead.recommendedServices,
    valuableReasons: lead.valuableReasons,
    scoringFactors: toJsonInput(lead.factors),
    scoreBreakdown: toJsonInput(lead.scoreBreakdown),
    opportunityInsights: toJsonInput(lead.opportunityInsights),
    discovery: toJsonInput(lead.discovery),
    signageAudit: toJsonInput(lead.signageAudit),
    estimatedValueMin: lead.estimatedValue.min,
    estimatedValueMax: lead.estimatedValue.max,
    imported: Boolean(lead.imported),
  } satisfies Prisma.OpportunityUncheckedCreateInput;

  const opportunity = await prisma.opportunity.upsert({
    where: { id: lead.id },
    create: {
      id: lead.id,
      ...data,
      evidenceSources: {
        create: lead.evidenceSources.map((source) => ({
          sourceName: source.sourceName,
          sourceType: evidenceTypeToDb[source.sourceType],
          sourceUrl: source.sourceUrl,
          evidenceSummary: source.evidenceSummary,
          dateCollected: dateOrNow(source.dateCollected),
          confidenceScore: confidenceToDb[source.confidenceScore],
        })),
      },
      contacts: {
        create: {
          name: lead.contact.name,
          email: lead.contact.email,
          role: lead.contact.role,
          linkedIn: lead.contact.linkedIn,
          confidence: confidenceToDb[lead.contact.confidence],
          selectionReason: "Initial recommendation from vehicle branding workflow",
        },
      },
      statusHistory: {
        create: {
          organizationId: organization.id,
          toStatus: statusToDb[lead.crmStatus],
          note: "Opportunity created",
        },
      },
    },
    update: data,
    include: opportunityInclude,
  });

  return toLead(opportunity);
}

export async function saveOpportunities(leads: Lead[]): Promise<Lead[]> {
  const saved: Lead[] = [];
  for (const lead of leads) {
    saved.push(await saveOpportunity(lead));
  }
  return saved;
}

export async function listEvidenceSources(opportunityId: string) {
  return prisma.evidenceSource.findMany({
    where: { opportunityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEvidenceSource(
  opportunityId: string,
  source: LeadEvidenceSource
) {
  return prisma.evidenceSource.create({
    data: {
      opportunityId,
      sourceName: source.sourceName,
      sourceType: evidenceTypeToDb[source.sourceType],
      sourceUrl: source.sourceUrl,
      evidenceSummary: source.evidenceSummary,
      dateCollected: dateOrNow(source.dateCollected),
      confidenceScore: confidenceToDb[source.confidenceScore],
    },
  });
}

export async function listContacts(opportunityId: string) {
  return prisma.contact.findMany({
    where: { opportunityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createContact(opportunityId: string, contact: LeadContact) {
  return prisma.contact.create({
    data: {
      opportunityId,
      name: contact.name,
      email: contact.email,
      role: contact.role,
      linkedIn: contact.linkedIn,
      confidence: confidenceToDb[contact.confidence],
    },
  });
}

export async function listOutreachMessages(opportunityId: string) {
  return prisma.outreachMessage.findMany({
    where: { opportunityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOutreachMessage(
  opportunityId: string,
  message: {
    direction?: "outbound" | "inbound";
    subject?: string;
    body: string;
    html?: string;
    recipientEmail?: string;
    provider?: string;
    providerMessageId?: string;
    statusText?: string;
    sentAt?: string;
  }
) {
  return prisma.outreachMessage.create({
    data: {
      opportunityId,
      direction:
        message.direction === "inbound"
          ? OutreachDirection.INBOUND
          : OutreachDirection.OUTBOUND,
      subject: message.subject,
      body: message.body,
      html: message.html,
      recipientEmail: message.recipientEmail,
      provider: message.provider,
      providerMessageId: message.providerMessageId,
      statusText: message.statusText,
      sentAt: message.sentAt ? dateOrNow(message.sentAt) : undefined,
    },
  });
}

export async function listMeetings(opportunityId?: string) {
  return prisma.meeting.findMany({
    where: opportunityId ? { opportunityId } : undefined,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createMeeting(
  opportunityId: string,
  meeting: {
    contactName: string;
    contactRole: string;
    scheduledAt: string;
    displayTime: string;
    meetingType: string;
    autoScheduled?: boolean;
    scheduledBy?: string;
  }
) {
  return prisma.meeting.create({
    data: {
      opportunityId,
      contactName: meeting.contactName,
      contactRole: meeting.contactRole,
      scheduledAt: dateOrNow(meeting.scheduledAt),
      displayTime: meeting.displayTime,
      meetingType: meeting.meetingType,
      autoScheduled: Boolean(meeting.autoScheduled),
      scheduledBy: meeting.scheduledBy,
    },
  });
}

export async function updateOpportunityStatus(
  opportunityId: string,
  nextStatus: CRMStatus,
  note?: string
) {
  const organization = await getPilotOrganization();
  const current = await prisma.opportunity.findFirst({
    where: { id: opportunityId, organizationId: organization.id },
  });

  if (!current) return null;

  const updated = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      status: statusToDb[nextStatus],
      statusHistory: {
        create: {
          organizationId: organization.id,
          fromStatus: current.status,
          toStatus: statusToDb[nextStatus],
          note,
        },
      },
    },
    include: opportunityInclude,
  });

  return toLead(updated);
}
