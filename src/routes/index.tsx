import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Clock, Inbox, TicketCheck, User, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/msp/Badges";
import { useMsp } from "@/lib/msp/store";
import { formatDistanceToNowStrict } from "date-fns";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const data = useMsp((d) => d);
  const me = data.engineers.find((e) => e.id === data.currentUserId)!;
  const myOpen = data.tickets.filter(
    (t) => t.assignedResourceId === me.id && t.status !== "Closed" && t.status !== "Resolved",
  );
  const unassigned = data.tickets.filter((t) => !t.assignedResourceId && t.status !== "Closed");
  const waiting = data.tickets.filter((t) => t.status === "Waiting on Customer");
  const todayActs = data.activities.filter((a) => {
    const d = new Date(a.dueAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const slaAlerts = data.tickets.filter((t) => {
    if (t.status === "Closed" || t.status === "Resolved") return false;
    return new Date(t.slaDue).getTime() - Date.now() < 4 * 3600_000;
  });
  const recent = data.recentlyViewed
    .map((id) => data.tickets.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good day, {me.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Here's what's on your plate today.</p>
        </div>
        <Link to="/tickets/new">
          <Button>Create Ticket</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<User className="h-4 w-4" />} label="My Open Tickets" value={myOpen.length} to="/service-board" />
        <StatCard icon={<Inbox className="h-4 w-4" />} label="Unassigned Queue" value={unassigned.length} to="/service-board" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Waiting on Customer" value={waiting.length} to="/service-board" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="SLA Alerts" value={slaAlerts.length} tone="danger" to="/service-board" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">My Open Tickets</CardTitle>
            <Link to="/service-board" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <TicketMiniList tickets={myOpen.slice(0, 8)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Link to="/tickets/new"><Button variant="secondary" className="w-full justify-start">New Ticket</Button></Link>
            <Link to="/service-board"><Button variant="secondary" className="w-full justify-start">Open Service Board</Button></Link>
            <Link to="/companies"><Button variant="secondary" className="w-full justify-start">Browse Companies</Button></Link>
            <Link to="/knowledge-base"><Button variant="secondary" className="w-full justify-start">Knowledge Base</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Unassigned Queue</CardTitle></CardHeader>
          <CardContent><TicketMiniList tickets={unassigned.slice(0, 6)} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Today's Activities</CardTitle></CardHeader>
          <CardContent>
            {todayActs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities scheduled for today.</p>
            ) : (
              <ul className="space-y-2">
                {todayActs.slice(0, 6).map((a) => (
                  <li key={a.id} className="text-sm flex items-center justify-between">
                    <span>
                      <span className="text-xs uppercase text-muted-foreground mr-2">{a.type}</span>
                      {a.subject}
                    </span>
                    <span className={a.done ? "text-emerald-400 text-xs" : "text-amber-400 text-xs"}>
                      {a.done ? "Done" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recently Viewed</CardTitle></CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Open a ticket to populate this list.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {recent.map((t) => t && (
                  <li key={t.id}>
                    <Link to="/tickets/$id" params={{ id: t.id }} className="hover:underline">
                      <span className="text-muted-foreground mr-2">{t.number}</span>{t.summary}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "danger";
  to?: string;
}) {
  const body = (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="uppercase tracking-wide">{label}</span>
          {icon}
        </div>
        <div className={"mt-2 text-3xl font-semibold " + (tone === "danger" ? "text-red-400" : "text-foreground")}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to as never}>{body}</Link> : body;
}

import type { Ticket } from "@/lib/msp/types";

function TicketMiniList({ tickets }: { tickets: Ticket[] }) {
  if (!tickets.length) return <p className="text-sm text-muted-foreground">Nothing here.</p>;
  return (
    <ul className="divide-y divide-border">
      {tickets.map((t) => (
        <li key={t.id} className="py-2">
          <Link to="/tickets/$id" params={{ id: t.id }} className="block hover:bg-accent/40 -mx-2 px-2 rounded">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-16">{t.number}</span>
              <span className="truncate flex-1">{t.summary}</span>
              <PriorityBadge priority={t.priority} />
              <StatusBadge status={t.status} />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 ml-16">
              Updated {formatDistanceToNowStrict(new Date(t.updatedAt))} ago
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
