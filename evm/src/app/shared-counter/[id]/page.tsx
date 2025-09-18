import { SharedCounter } from "@/components/SharedCounter";

export default async function SharedCounterObject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return <div>Invalid counter ID</div>;
  }

  return <SharedCounter id={BigInt(id)} />;
}
