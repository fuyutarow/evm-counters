import { SharedCounterCreate } from "@/components/SharedCounterCreate";
import { SharedCounterList } from "@/components/SharedCounterList";

export default function SharedCounterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Shared Counters</h1>
          <p className="text-muted-foreground">Create and manage your shared counters</p>
        </div>

        <SharedCounterCreate />

        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Your Shared Counters</h2>
          <SharedCounterList />
        </div>
      </div>
    </div>
  );
}
