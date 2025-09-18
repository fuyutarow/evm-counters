import { SharedCounter } from "@/components/SharedCounter";

export default async function SharedCounterObject({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = await params;

  if (!objectId) {
    return <div>Invalid counter ID</div>;
  }

  return <SharedCounter id={objectId} />;
}
