import { OwnedCounter } from "@/components/OwnedCounter";

export default async function OwnedCounterObject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return <div>Invalid counter ID</div>;
  }

  return <OwnedCounter id={BigInt(id)} />;
}
