import { uniqueId } from "./unique-id";

export type NotificationType =
  | "email_sent"
  | "email_opened"
  | "email_replied"
  | "meeting_requested"
  | "meeting_scheduled"
  | "crm_updated";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const TYPE_META: Record<
  NotificationType,
  { icon: string; color: string }
> = {
  email_sent: { icon: "send", color: "text-blue-400 bg-blue-500/15" },
  email_opened: { icon: "open", color: "text-violet-400 bg-violet-500/15" },
  email_replied: { icon: "reply", color: "text-emerald-400 bg-emerald-500/15" },
  meeting_requested: { icon: "calendar", color: "text-amber-400 bg-amber-500/15" },
  meeting_scheduled: { icon: "calendar", color: "text-amber-400 bg-amber-500/15" },
  crm_updated: { icon: "crm", color: "text-violet-400 bg-violet-500/15" },
};

export function getNotificationMeta(type: NotificationType) {
  return TYPE_META[type];
}

export function createNotification(
  type: NotificationType,
  message: string,
  options?: { simulated?: boolean }
): AppNotification {
  const titles: Record<NotificationType, string> = {
    email_sent: "Email sent",
    email_opened: "Customer opened email",
    email_replied: "Customer replied",
    meeting_requested: "Meeting requested",
    meeting_scheduled: "Meeting scheduled",
    crm_updated: "Opportunity status updated",
  };
  const title = options?.simulated
    ? `Demo simulation: ${titles[type]}`
    : titles[type];
  return {
    id: uniqueId("n-"),
    type,
    title,
    message,
    timestamp: "Just now",
    read: false,
  };
}
