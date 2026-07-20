import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/training-modules")({
  component: TrainingModules,
});

const modules = [
  {
    id: "connectwise-simulator",
    title: "ConnectWise Service Desk Simulator",
    description:
      "Practice Tier 1 help desk workflows in a realistic PSA-inspired environment: tickets, dispatch, SLAs, time entries, and audit trails.",
    status: "Available",
    to: "/service-board",
  },
];

function TrainingModules() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Training Modules</h1>
        <p className="text-sm text-muted-foreground">
          Hands-on learning experiences that build core MSP skills.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="h-10 w-10 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <Badge variant="secondary">{m.status}</Badge>
              </div>
              <CardTitle className="mt-3 text-base">{m.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <Link
                to={m.to as never}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Open module <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}