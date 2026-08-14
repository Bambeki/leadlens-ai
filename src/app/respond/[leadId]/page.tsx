import { redirect } from "next/navigation";

export default async function LegacyRespondPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ action?: string; slot?: string }>;
}) {
  const { leadId } = await params;
  const { action, slot } = await searchParams;
  const mappedAction = action === "declined" ? "not_interested" : action;
  const query = new URLSearchParams();
  if (mappedAction) query.set("action", mappedAction);
  if (slot) query.set("slot", slot);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/r/${leadId}${suffix}`);
}
