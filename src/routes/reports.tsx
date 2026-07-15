import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMsp } from "@/lib/msp/store";

export const Route = createFileRoute("/reports")({ component: Reports });

function Reports() {
  const data = useMsp((d) => d);
  const open = data.tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved");
  const closed = data.tickets.filter((t) => t.status === "Closed" || t.status === "Resolved");
  const slaAtRisk = open.filter((t) => new Date(t.slaDue).getTime() - Date.now() < 4 * 3600_000);
  const workload = data.engineers.map((e) => ({
    engineer: e,
    open: data.tickets.filter((t) => t.assignedResourceId === e.id && t.status !== "Closed" && t.status !== "Resolved").length,
    closed: data.tickets.filter((t) => t.assignedResourceId === e.id && (t.status === "Closed" || t.status === "Resolved")).length,
  })).sort((a, b) => b.open - a.open);
  const byStatus: Record<string, number> = {};
  data.tickets.forEach((t) => { byStatus[t.status] = (byStatus[t.status] ?? 0) + 1; });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Snapshot of demo dataset</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Tickets" value={open.length} />
        <StatCard label="Closed Tickets" value={closed.length} />
        <StatCard label="SLA At Risk (<4h)" value={slaAtRisk.length} />
        <StatCard label="Engineers" value={data.engineers.length} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets by Status</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {Object.entries(byStatus).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="w-40 text-muted-foreground">{k}</span>
                  <div className="flex-1 h-2 bg-muted rounded">
                    <div className="h-2 bg-primary rounded" style={{ width: `${(v / data.tickets.length) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right">{v}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Engineer Workload</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground"><tr>
                <th className="text-left py-2">Engineer</th>
                <th className="text-right py-2">Open</th>
                <th className="text-right py-2">Closed</th>
              </tr></thead>
              <tbody>
                {workload.map(({ engineer, open, closed }) => (
                  <tr key={engineer.id} className="border-t border-border">
                    <td className="py-2">{engineer.name}<span className="text-xs text-muted-foreground ml-2">{engineer.role}</span></td>
                    <td className="py-2 text-right">{open}</td>
                    <td className="py-2 text-right">{closed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-xs uppercase text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-semibold">{value}</div></CardContent>
    </Card>
  );
}