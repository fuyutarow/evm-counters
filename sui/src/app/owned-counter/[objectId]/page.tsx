import { OwnedCounter } from "@/components/OwnedCounter";

export default async function OwnedCounterObject({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = await params;

  if (!objectId) {
    return <div>Invalid counter ID</div>;
  }

  return <OwnedCounter id={objectId} />;
}
