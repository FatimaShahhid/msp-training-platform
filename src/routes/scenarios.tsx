import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/scenarios")({
  component: Scenarios,
});

function Scenarios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scenarios</h1>
        <p className="text-sm text-muted-foreground">
          Guided practice scenarios that reinforce the skills learned in each module.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium">No scenarios yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Scenarios will appear here as they are added to the platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}