import { SharedCounterCreate } from "@/components/SharedCounterCreate";
import { SharedCountersList } from "@/components/SharedCountersList";

export default function SharedCounterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Shared Counters</h1>
          <p className="text-muted-foreground">Create and interact with collaborative counters</p>
        </div>

        <SharedCounterCreate />

        <SharedCountersList />
      </div>
    </div>
  );
}
