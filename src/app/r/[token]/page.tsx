import PublicRespondClient from "@/components/PublicRespondClient";

export default async function PublicResponsePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string; slot?: string }>;
}) {
  const { token } = await params;
  const { action, slot } = await searchParams;
  return <PublicRespondClient token={token} action={action} slotId={slot} />;
}
