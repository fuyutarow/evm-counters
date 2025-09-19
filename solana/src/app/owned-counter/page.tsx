import { OwnedCounterCreate } from "@/components/OwnedCounterCreate";
import { OwnedCountersList } from "@/components/OwnedCountersList";

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

        <OwnedCountersList />
      </div>
    </div>
  );
}
