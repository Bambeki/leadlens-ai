import RespondClient from "@/components/RespondClient";

export default async function RespondPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ action?: string; slot?: string }>;
}) {
  const { leadId } = await params;
  const { action, slot } = await searchParams;

  return (
    <RespondClient leadId={leadId} action={action} slotId={slot} />
  );
}
