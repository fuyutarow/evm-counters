"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SharedCounter } from "@/components/SharedCounter";
import { Button } from "@/components/ui/button";

export default function SharedCounterDetailPage() {
  const params = useParams();
  const counterId = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Back Navigation */}
        <div>
          <Link href="/shared-counter">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shared Counters
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Shared Counter Detail</h1>
          <p className="text-muted-foreground">Collaborate with others on this counter</p>
        </div>

        {/* Counter Component */}
        <SharedCounter id={counterId} />
      </div>
    </div>
  );
}
