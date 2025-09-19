import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Owned Counters</h1>
          <p className="text-muted-foreground">Create and manage your personal counters</p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Owned Counter</CardTitle>
              <CardDescription>
                Create a personal counter that only you can access and modify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Your Owned Counters</h2>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
