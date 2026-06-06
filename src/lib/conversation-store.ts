import { uniqueId } from "./unique-id";

export type ConversationMessageDirection = "outbound" | "inbound";

export interface ConversationMessage {
  id: string;
  direction: ConversationMessageDirection;
  subject?: string;
  body: string;
  author: string;
  timestamp: string;
  messageId?: string;
}

const CONVERSATION_KEY = (leadId: string) => `leadlens-conversation-${leadId}`;
export const CONVERSATION_UPDATED_EVENT = "leadlens-conversation-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getConversationMessages(leadId: string): ConversationMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CONVERSATION_KEY(leadId));
    return raw ? (JSON.parse(raw) as ConversationMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(leadId: string, messages: ConversationMessage[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(CONVERSATION_KEY(leadId), JSON.stringify(messages));
  window.dispatchEvent(
    new CustomEvent(CONVERSATION_UPDATED_EVENT, { detail: { leadId } })
  );
}

export function addConversationMessage(
  leadId: string,
  message: Omit<ConversationMessage, "id" | "timestamp"> & {
    id?: string;
    timestamp?: string;
  }
): ConversationMessage {
  const entry: ConversationMessage = {
    id: message.id ?? uniqueId("msg-"),
    timestamp: message.timestamp ?? new Date().toISOString(),
    direction: message.direction,
    subject: message.subject,
    body: message.body,
    author: message.author,
    messageId: message.messageId,
  };

  if (!isBrowser()) return entry;

  const existing = getConversationMessages(leadId);
  saveMessages(leadId, [...existing, entry]);
  return entry;
}

export function addOutboundSentMessage(
  leadId: string,
  payload: {
    subject: string;
    body: string;
    author: string;
    messageId?: string;
  }
): ConversationMessage {
  return addConversationMessage(leadId, {
    direction: "outbound",
    subject: payload.subject,
    body: payload.body,
    author: payload.author,
    messageId: payload.messageId,
  });
}

export function addSimulatedCustomerReply(
  leadId: string,
  payload: { author: string; body: string }
): ConversationMessage {
  return addConversationMessage(leadId, {
    direction: "inbound",
    body: payload.body,
    author: payload.author,
  });
}
