"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OwnedCounter } from "@/components/OwnedCounter";
import { Button } from "@/components/ui/button";

export default function OwnedCounterDetailPage() {
  const params = useParams();
  const counterId = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Back Navigation */}
        <div>
          <Link href="/owned-counter">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Owned Counters
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Owned Counter Detail</h1>
          <p className="text-muted-foreground">Manage your personal counter</p>
        </div>

        {/* Counter Component */}
        <OwnedCounter id={counterId} />
      </div>
    </div>
  );
}
