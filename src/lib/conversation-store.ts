import { uniqueId } from "./unique-id";
import {
  fetchOutreachMessagesFromApi,
  saveOutreachMessageToApi,
} from "./opportunity-api";

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

export async function getConversationMessagesFromDb(
  leadId: string
): Promise<ConversationMessage[]> {
  try {
    const messages = await fetchOutreachMessagesFromApi(leadId);
    saveMessages(leadId, messages);
    return messages;
  } catch {
    return getConversationMessages(leadId);
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
): Promise<ConversationMessage> {
  const entry: ConversationMessage = {
    id: message.id ?? uniqueId("msg-"),
    timestamp: message.timestamp ?? new Date().toISOString(),
    direction: message.direction,
    subject: message.subject,
    body: message.body,
    author: message.author,
    messageId: message.messageId,
  };

  if (!isBrowser()) return Promise.resolve(entry);

  return saveOutreachMessageToApi(leadId, {
    direction: entry.direction,
    subject: entry.subject,
    body: entry.body,
    providerMessageId: entry.messageId,
    statusText: entry.direction === "outbound" ? "Sent" : "Received",
    sentAt: entry.timestamp,
  }).then(() => {
    const existing = getConversationMessages(leadId);
    saveMessages(leadId, [...existing, entry]);
    return entry;
  });
}

export function addOutboundSentMessage(
  leadId: string,
  payload: {
    subject: string;
    body: string;
    author: string;
    messageId?: string;
  }
): Promise<ConversationMessage> {
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
): Promise<ConversationMessage> {
  return addConversationMessage(leadId, {
    direction: "inbound",
    body: payload.body,
    author: `[Demo simulation] ${payload.author}`,
  });
}
