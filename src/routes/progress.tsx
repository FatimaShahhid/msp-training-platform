import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">
          Track completion, scores, and skill growth across modules and scenarios.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium">Nothing to report yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Once you start completing training modules, your progress will show up here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}