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

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "email_replied",
    title: "Customer replied",
    message: "Bella Vista Trattoria responded to your outreach email.",
    timestamp: "12 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "email_opened",
    title: "Customer opened email",
    message: "TrendMart Fashion opened your email 3 times.",
    timestamp: "1 hr ago",
    read: false,
  },
  {
    id: "n3",
    type: "meeting_requested",
    title: "Meeting requested",
    message: "FitZone Premium Gym requested a 30-min discovery call.",
    timestamp: "2 hrs ago",
    read: true,
  },
  {
    id: "n4",
    type: "email_sent",
    title: "Email sent",
    message: "Outreach sent to Grand Hotel Meridian.",
    timestamp: "3 hrs ago",
    read: true,
  },
  {
    id: "n5",
    type: "crm_updated",
    title: "CRM status updated",
    message: "Hausarztpraxis am See moved to Meeting Scheduled.",
    timestamp: "5 hrs ago",
    read: true,
  },
];

export function createNotification(
  type: NotificationType,
  message: string
): AppNotification {
  const titles: Record<NotificationType, string> = {
    email_sent: "Email sent",
    email_opened: "Customer opened email",
    email_replied: "Customer replied",
    meeting_requested: "Meeting requested",
    meeting_scheduled: "Meeting scheduled",
    crm_updated: "CRM status updated",
  };
  return {
    id: uniqueId("n-"),
    type,
    title: titles[type],
    message,
    timestamp: "Just now",
    read: false,
  };
}
