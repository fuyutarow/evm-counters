import { SharedCounterCreate } from "@/components/SharedCounterCreate";

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

        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Shared Counters</h2>
          <div className="text-center text-muted-foreground">
            <p>Create a new shared counter to get started!</p>
            <p className="text-sm">
              Anyone can increment shared counters, but only the creator can set values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
