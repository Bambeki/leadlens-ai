export type MeetingType =
  | "consultation-15"
  | "discovery-30"
  | "onsite-audit";

export const MEETING_OPTIONS: {
  id: MeetingType;
  label: string;
  shortLabel: string;
  snippet: string;
}[] = [
  {
    id: "consultation-15",
    label: "Suggest 15-minute consultation",
    shortLabel: "15-min consultation",
    snippet:
      "\n\nI'd love to schedule a brief 15-minute call to discuss your fleet branding goals and share wrap ideas for your service vehicles. Would any of these times work?\n• Tuesday 10:00 or 14:00\n• Wednesday 11:00 or 15:30\n• Thursday 09:30 or 16:00\n",
  },
  {
    id: "discovery-30",
    label: "Suggest 30-minute discovery call",
    shortLabel: "30-min discovery call",
    snippet:
      "\n\nWould you be open to a 30-minute discovery call next week? We can review your current fleet branding, walk through wrap options for your vehicles, and provide a ballpark estimate — no obligation.\n\nI'm available:\n• Monday 14:00–17:00\n• Wednesday 10:00–12:00\n• Friday 09:00–11:30\n",
  },
  {
    id: "onsite-audit",
    label: "Suggest on-site fleet audit",
    shortLabel: "On-site fleet audit",
    snippet:
      "\n\nWe offer a complimentary on-site Vehicle Branding Audit where our team inspects your fleet, assesses wrap opportunities, and prepares a custom recommendation report within 48 hours.\n\nThe audit takes about 45 minutes and includes:\n• Fleet visibility assessment\n• Competitor vehicle branding comparison\n• Budget estimate for recommended wraps\n\nShall I schedule a visit for next week?\n",
  },
];

function insertSnippetBeforeSignature(content: string, snippet: string): string {
  const signatureMarker = "Best regards,";
  if (content.includes(signatureMarker)) {
    return content.replace(signatureMarker, `${snippet}\n${signatureMarker}`);
  }
  return content + snippet;
}

export function insertMeetingSuggestionIntoBody(
  body: string,
  meetingType: MeetingType
): string {
  const option = MEETING_OPTIONS.find((m) => m.id === meetingType);
  if (!option) return body;
  return insertSnippetBeforeSignature(body, option.snippet);
}

export function insertMeetingSuggestion(
  email: string,
  meetingType: MeetingType
): string {
  const option = MEETING_OPTIONS.find((m) => m.id === meetingType);
  if (!option) return email;
  return insertSnippetBeforeSignature(email, option.snippet);
}
