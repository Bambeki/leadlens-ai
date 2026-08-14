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
  OpportunityListScope,
  OptOutReason,
  Priority,
} from "./types";
import type { ScheduledMeeting } from "./meetings";
import type { ActivityEvent, ActivityType } from "./crm-store";
import { prisma } from "./prisma";
import { getPilotOrganization } from "./pilot-context";
import {
  generatePublicResponseToken,
  isValidPublicResponseToken,
  OutreachBlockedError,
  type PublicCustomerAction,
} from "./opportunity-lifecycle";
import { getMeetingSlotOptions } from "./customer-response";

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

function opportunityBusinessKey(lead: Pick<Lead, "businessName" | "city">): string {
  return `${lead.businessName.trim().toLowerCase()}::${lead.city.trim().toLowerCase()}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error != null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function meetingToScheduledMeeting(
  meeting: Prisma.MeetingGetPayload<{ include: { opportunity: true } }>
): ScheduledMeeting {
  return {
    id: meeting.id,
    leadId: meeting.opportunityId,
    businessName: meeting.opportunity.businessName,
    contactName: meeting.contactName,
    contactRole: meeting.contactRole,
    scheduledAt: meeting.scheduledAt.toISOString(),
    displayTime: meeting.displayTime,
    meetingType: meeting.meetingType,
    crmStatus: statusFromDb[meeting.opportunity.status],
    leadScore: meeting.opportunity.score,
    autoScheduled: meeting.autoScheduled,
    scheduledBy:
      meeting.scheduledBy === "customer" || meeting.scheduledBy === "simulator"
        ? meeting.scheduledBy
        : undefined,
  };
}

function statusHistoryToActivity(
  history: Prisma.PipelineStatusHistoryGetPayload<Record<string, never>>
): ActivityEvent {
  const label =
    history.note ??
    `Opportunity status moved to ${statusFromDb[history.toStatus]}`;
  return {
    id: history.id,
    type: "crm_manual_update",
    label,
    timestamp: history.createdAt.toISOString(),
  };
}

function outreachToActivity(
  message: Prisma.OutreachMessageGetPayload<Record<string, never>>
): ActivityEvent | null {
  if (!message.statusText) return null;
  if (message.statusText.startsWith("activity:")) {
    const type = message.statusText.replace("activity:", "") as ActivityType;
    return {
      id: message.id,
      type,
      label: message.body,
      timestamp: message.createdAt.toISOString(),
    };
  }

  return {
    id: message.id,
    type: message.direction === OutreachDirection.INBOUND ? "email_replied" : "email_sent",
    label: message.statusText,
    timestamp: (message.sentAt ?? message.createdAt).toISOString(),
  };
}

function toLead(
  opportunity: OpportunityWithRelations,
  options: { includeToken?: boolean } = {}
): Lead {
  return toLeadWithOptions(opportunity, Boolean(options.includeToken));
}

function toLeadWithOptions(
  opportunity: OpportunityWithRelations,
  includeToken: boolean
): Lead {
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
    archivedAt: opportunity.archivedAt?.toISOString() ?? null,
    doNotContact: opportunity.doNotContact,
    optOutReason:
      opportunity.optOutReason === "unsubscribe" ||
      opportunity.optOutReason === "not_interested"
        ? opportunity.optOutReason
        : null,
    optOutAt: opportunity.optOutAt?.toISOString() ?? null,
    optOutSource: opportunity.optOutSource ?? null,
    publicResponseToken: includeToken
      ? opportunity.publicResponseToken ?? undefined
      : undefined,
  };
}

function listScopeWhere(scope: OpportunityListScope): Prisma.OpportunityWhereInput {
  if (scope === "archived") {
    return {
      OR: [{ archivedAt: { not: null } }, { doNotContact: true }],
    };
  }
  if (scope === "all") return {};
  return { archivedAt: null, doNotContact: false };
}

function isLifecycleSuppressed(record: {
  archivedAt: Date | null;
  doNotContact: boolean;
}): boolean {
  return record.archivedAt != null || record.doNotContact;
}

async function ensureTokenOnRecord(
  opportunity: OpportunityWithRelations
): Promise<OpportunityWithRelations> {
  if (opportunity.publicResponseToken) return opportunity;
  try {
    return await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { publicResponseToken: generatePublicResponseToken() },
      include: opportunityInclude,
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    const retried = await prisma.opportunity.findFirst({
      where: { id: opportunity.id },
      include: opportunityInclude,
    });
    if (!retried) throw error;
    return retried;
  }
}

export async function listOpportunities(
  scope: OpportunityListScope = "active"
): Promise<Lead[]> {
  const organization = await getPilotOrganization();
  const opportunities = await prisma.opportunity.findMany({
    where: { organizationId: organization.id, ...listScopeWhere(scope) },
    include: opportunityInclude,
    orderBy: [{ createdAt: "desc" }],
  });
  return opportunities.map((opportunity) => toLead(opportunity));
}

export async function getOpportunity(id: string): Promise<Lead | null> {
  const organization = await getPilotOrganization();
  const found = await prisma.opportunity.findFirst({
    where: { id, organizationId: organization.id },
    include: opportunityInclude,
  });
  if (!found) return null;
  const opportunity = await ensureTokenOnRecord(found);
  return toLead(opportunity, { includeToken: true });
}

export async function saveOpportunity(lead: Lead): Promise<Lead> {
  const organization = await getPilotOrganization();
  const businessName = lead.businessName.trim();
  const city = lead.city.trim();
  const data = {
    organizationId: organization.id,
    businessName,
    industry: lead.industry,
    location: lead.location,
    city,
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

  const createData = {
      id: lead.id,
      ...data,
      publicResponseToken: generatePublicResponseToken(),
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
  } satisfies Prisma.OpportunityCreateInput | Prisma.OpportunityUncheckedCreateInput;

  const findExisting = () =>
    prisma.opportunity.findFirst({
      where: {
        organizationId: organization.id,
        OR: [
          { id: lead.id },
          {
            businessName,
            city,
          },
        ],
      },
      include: opportunityInclude,
    });

  const existing = await findExisting();
  if (existing) {
    if (isLifecycleSuppressed(existing)) {
      return {
        ...toLead(existing, { includeToken: true }),
        importSuppressed: true,
      };
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: existing.id },
      data,
      include: opportunityInclude,
    });
    return toLead(opportunity, { includeToken: true });
  }

  try {
    const opportunity = await prisma.opportunity.create({
      data: createData,
      include: opportunityInclude,
    });
    return toLead(opportunity, { includeToken: true });
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    const raced = await findExisting();
    if (!raced) throw error;

    if (isLifecycleSuppressed(raced)) {
      return {
        ...toLead(raced, { includeToken: true }),
        importSuppressed: true,
      };
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: raced.id },
      data,
      include: opportunityInclude,
    });
    return toLead(opportunity, { includeToken: true });
  }
}

export async function saveOpportunities(leads: Lead[]): Promise<Lead[]> {
  const saved: Lead[] = [];
  const seenIds = new Set<string>();
  const seenBusinesses = new Set<string>();

  for (const lead of leads) {
    const id = lead.id.trim();
    const businessKey = opportunityBusinessKey(lead);
    if (seenIds.has(id) || seenBusinesses.has(businessKey)) continue;
    seenIds.add(id);
    seenBusinesses.add(businessKey);
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

export { OutreachBlockedError };

const RESPONSE_LINK_UNAVAILABLE =
  "A secure customer response link could not be loaded. Refresh this opportunity from the database and try again.";

export async function assertOpportunityAllowsOutreach(
  opportunityId: string
): Promise<string> {
  const organization = await getPilotOrganization();
  const current = await prisma.opportunity.findFirst({
    where: { id: opportunityId, organizationId: organization.id },
    select: {
      id: true,
      doNotContact: true,
      archivedAt: true,
      publicResponseToken: true,
    },
  });
  if (!current) {
    throw new OutreachBlockedError("Opportunity not found.");
  }
  if (current.doNotContact) {
    throw new OutreachBlockedError(
      "This opportunity is marked Do Not Contact. Restore it before sending outreach."
    );
  }
  if (current.archivedAt) {
    throw new OutreachBlockedError(
      "This opportunity is archived. Restore it before sending outreach."
    );
  }

  let token = current.publicResponseToken;
  if (!token || !isValidPublicResponseToken(token)) {
    try {
      const updated = await prisma.opportunity.update({
        where: { id: current.id },
        data: { publicResponseToken: generatePublicResponseToken() },
        select: { publicResponseToken: true },
      });
      token = updated.publicResponseToken;
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const retried = await prisma.opportunity.findFirst({
        where: { id: current.id },
        select: { publicResponseToken: true },
      });
      token = retried?.publicResponseToken ?? null;
    }
  }

  if (!token || !isValidPublicResponseToken(token)) {
    throw new OutreachBlockedError(RESPONSE_LINK_UNAVAILABLE);
  }

  return token;
}

function isCustomerOutreachSend(message: {
  direction?: "outbound" | "inbound";
  statusText?: string;
  sentAt?: string;
  provider?: string;
  providerMessageId?: string;
}): boolean {
  const status = message.statusText ?? "";
  if (status.startsWith("activity:")) return false;
  if (["Drafted", "Approved", "Follow-up Draft"].includes(status)) return false;
  if (message.direction === "inbound") return false;
  return (
    Boolean(message.sentAt) ||
    Boolean(message.providerMessageId) ||
    Boolean(message.provider) ||
    status === "Sent"
  );
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
  if (isCustomerOutreachSend(message)) {
    await assertOpportunityAllowsOutreach(opportunityId);
  }

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

export async function listMeetings(opportunityId?: string): Promise<ScheduledMeeting[]> {
  const meetings = await prisma.meeting.findMany({
    where: opportunityId ? { opportunityId } : undefined,
    include: { opportunity: true },
    orderBy: { scheduledAt: "asc" },
  });
  return meetings
    .filter((meeting) => !meeting.opportunity.archivedAt && !meeting.opportunity.doNotContact)
    .map(meetingToScheduledMeeting);
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
  const organization = await getPilotOrganization();
  const current = await prisma.opportunity.findFirst({
    where: { id: opportunityId, organizationId: organization.id },
  });

  if (!current) return null;
  if (current.doNotContact || current.archivedAt) {
    throw new OutreachBlockedError(
      current.doNotContact
        ? "This opportunity is marked Do Not Contact. Restore it before sending outreach."
        : "This opportunity is archived. Restore it before sending outreach."
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    await tx.opportunity.update({
      where: { id: opportunityId },
      data: {
        status: OpportunityStatus.MEETING_SCHEDULED,
        statusHistory: {
          create: {
            organizationId: organization.id,
            fromStatus: current.status,
            toStatus: OpportunityStatus.MEETING_SCHEDULED,
            note: "Meeting scheduled",
          },
        },
      },
    });

    return tx.meeting.create({
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
      include: { opportunity: true },
    });
  });

  return meetingToScheduledMeeting(created);
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
  if (current.doNotContact) {
    throw new OutreachBlockedError(
      "This opportunity is marked Do Not Contact. Restore it before changing status."
    );
  }

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

export async function listStatusHistory(opportunityId: string): Promise<ActivityEvent[]> {
  const organization = await getPilotOrganization();
  const history = await prisma.pipelineStatusHistory.findMany({
    where: { opportunityId, organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });
  return history.map(statusHistoryToActivity);
}

export async function listOpportunityActivity(opportunityId: string): Promise<ActivityEvent[]> {
  const [history, outreachMessages] = await Promise.all([
    listStatusHistory(opportunityId),
    prisma.outreachMessage.findMany({
      where: { opportunityId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const outreachActivity = outreachMessages
    .map(outreachToActivity)
    .filter((event): event is ActivityEvent => Boolean(event));

  return [...history, ...outreachActivity].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

async function recordLifecycleEvent(
  opportunityId: string,
  organizationId: string,
  type: ActivityType,
  label: string,
  fromStatus: OpportunityStatus | null,
  toStatus: OpportunityStatus
) {
  await prisma.$transaction([
    prisma.pipelineStatusHistory.create({
      data: {
        organizationId,
        opportunityId,
        fromStatus,
        toStatus,
        note: label,
      },
    }),
    prisma.outreachMessage.create({
      data: {
        opportunityId,
        body: label,
        statusText: `activity:${type}`,
      },
    }),
  ]);
}

export async function archiveOpportunity(id: string): Promise<Lead | null> {
  const organization = await getPilotOrganization();
  const current = await prisma.opportunity.findFirst({
    where: { id, organizationId: organization.id },
    include: opportunityInclude,
  });
  if (!current) return null;

  if (current.archivedAt) {
    return toLead(current, { includeToken: true });
  }

  const updated = await prisma.opportunity.update({
    where: { id: current.id },
    data: { archivedAt: new Date() },
    include: opportunityInclude,
  });
  await recordLifecycleEvent(
    current.id,
    organization.id,
    "opportunity_archived",
    "Opportunity archived",
    current.status,
    current.status
  );
  return toLead(updated, { includeToken: true });
}

export async function restoreOpportunity(id: string): Promise<Lead | null> {
  const organization = await getPilotOrganization();
  const current = await prisma.opportunity.findFirst({
    where: { id, organizationId: organization.id },
    include: opportunityInclude,
  });
  if (!current) return null;

  const updated = await prisma.opportunity.update({
    where: { id: current.id },
    data: {
      archivedAt: null,
      doNotContact: false,
      optOutReason: null,
      optOutAt: null,
      optOutSource: null,
    },
    include: opportunityInclude,
  });
  await recordLifecycleEvent(
    current.id,
    organization.id,
    "opportunity_restored",
    current.doNotContact
      ? "Opportunity restored; Do Not Contact cleared"
      : "Opportunity restored from archive",
    current.status,
    current.status
  );
  return toLead(updated, { includeToken: true });
}

export async function deleteOpportunityPermanently(
  id: string,
  confirmName: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const organization = await getPilotOrganization();
  const current = await prisma.opportunity.findFirst({
    where: { id, organizationId: organization.id },
  });
  if (!current) return { ok: false, reason: "Opportunity not found" };

  if (current.businessName.trim().toLowerCase() !== confirmName.trim().toLowerCase()) {
    return {
      ok: false,
      reason: "Business name does not match. Permanent delete was not performed.",
    };
  }

  await prisma.opportunity.delete({ where: { id: current.id } });
  return { ok: true };
}

export interface PublicResponseContext {
  businessName: string;
  contactName: string;
  alreadyOptedOut: boolean;
  allowedActions: PublicCustomerAction[];
}

function toPublicContext(opportunity: OpportunityWithRelations): PublicResponseContext {
  const contactName = opportunity.contacts[0]?.name?.split(" ")[0] ?? "there";
  const alreadyOptedOut = opportunity.doNotContact;
  return {
    businessName: opportunity.businessName,
    contactName,
    alreadyOptedOut,
    allowedActions: alreadyOptedOut
      ? []
      : ["interested", "schedule", "not_interested"],
  };
}

export async function getPublicResponseContext(
  token: string
): Promise<PublicResponseContext | null> {
  if (!isValidPublicResponseToken(token)) return null;
  const opportunity = await prisma.opportunity.findFirst({
    where: { publicResponseToken: token },
    include: opportunityInclude,
  });
  if (!opportunity) return null;
  return toPublicContext(opportunity);
}

export async function applyPublicCustomerAction(
  token: string,
  action: PublicCustomerAction,
  slotId?: string
): Promise<
  | { ok: true; context: PublicResponseContext; confirmedSlot?: string }
  | { ok: false; reason: "invalid" | "blocked" | "unknown_slot" }
> {
  if (!isValidPublicResponseToken(token)) return { ok: false, reason: "invalid" };

  const current = await prisma.opportunity.findFirst({
    where: { publicResponseToken: token },
    include: opportunityInclude,
  });
  if (!current) return { ok: false, reason: "invalid" };

  if (action === "not_interested") {
    const now = new Date();
    const reason: OptOutReason = "not_interested";
    const updated = await prisma.opportunity.update({
      where: { id: current.id },
      data: {
        status: OpportunityStatus.LOST,
        doNotContact: true,
        optOutReason: reason,
        optOutAt: now,
        optOutSource: "customer_response_link",
        statusHistory: {
          create: {
            organizationId: current.organizationId,
            fromStatus: current.status,
            toStatus: OpportunityStatus.LOST,
            note: "Customer opted out via response link (not_interested)",
          },
        },
      },
      include: opportunityInclude,
    });
    await prisma.outreachMessage.create({
      data: {
        opportunityId: current.id,
        body: "Customer opted out via response link (not_interested)",
        statusText: "activity:opportunity_opted_out",
      },
    });
    return { ok: true, context: toPublicContext(updated) };
  }

  if (current.doNotContact || current.archivedAt) {
    return { ok: false, reason: "blocked" };
  }

  if (action === "interested") {
    const updated = await prisma.opportunity.update({
      where: { id: current.id },
      data: {
        status: OpportunityStatus.RESPONDED,
        statusHistory: {
          create: {
            organizationId: current.organizationId,
            fromStatus: current.status,
            toStatus: OpportunityStatus.RESPONDED,
            note: "Customer clicked Request a Call via response link",
          },
        },
      },
      include: opportunityInclude,
    });
    await prisma.outreachMessage.create({
      data: {
        opportunityId: current.id,
        direction: OutreachDirection.INBOUND,
        body: "Customer clicked Request a Call via response link",
        statusText: "Replied",
      },
    });
    return { ok: true, context: toPublicContext(updated) };
  }

  const slot = getMeetingSlotOptions().find((item) => item.id === slotId);
  if (!slot) return { ok: false, reason: "unknown_slot" };

  const created = await createMeeting(current.id, {
    contactName: current.contacts[0]?.name ?? "Customer",
    contactRole: current.contacts[0]?.role ?? "Decision maker",
    scheduledAt: slot.scheduledAt,
    displayTime: slot.label,
    meetingType: "Discovery Call",
    autoScheduled: true,
    scheduledBy: "customer",
  });
  if (!created) return { ok: false, reason: "invalid" };

  const refreshed = await prisma.opportunity.findFirst({
    where: { id: current.id },
    include: opportunityInclude,
  });
  return {
    ok: true,
    context: toPublicContext(refreshed ?? current),
    confirmedSlot: slot.label,
  };
}
