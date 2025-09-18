import { OwnedCounterCreate } from "@/components/OwnedCounterCreate";

export default function OwnedCounterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Owned Counters</h1>
          <p className="text-muted-foreground">Create and manage your personal counters</p>
        </div>

        <OwnedCounterCreate />

        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Your Owned Counters</h2>
          <div className="text-center text-muted-foreground">
            <p>Create a new counter to get started!</p>
            <p className="text-sm">Each counter you create will only be manageable by you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
