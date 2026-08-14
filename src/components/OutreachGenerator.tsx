"use client";

import type { Lead } from "@/lib/types";
import ConversationCenter from "./ConversationCenter";

export default function OutreachGenerator({ lead }: { lead: Lead }) {
  return <ConversationCenter lead={lead} />;
}
