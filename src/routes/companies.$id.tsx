import { createFileRoute, Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMsp } from "@/lib/msp/store";
import { StatusBadge, PriorityBadge } from "@/components/msp/Badges";

export const Route = createFileRoute("/companies/$id")({
  component: CompanyDetail,
});

function CompanyDetail() {
  const { id } = Route.useParams();
  const data = useMsp((d) => d);
  const c = data.companies.find((x) => x.id === id);
  if (!c) return <p className="p-4 text-muted-foreground">Company not found.</p>;

  const contacts = data.contacts.filter((x) => x.companyId === id);
  const configs = data.configurations.filter((x) => x.companyId === id);
  const tickets = data.tickets.filter((x) => x.companyId === id);
  const activities = data.activities.filter((x) => x.companyId === id);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <Link to="/companies" className="hover:underline">Companies</Link> / <span className="text-foreground">{c.name}</span>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
        <p className="text-sm text-muted-foreground">{c.industry} · {c.city}, {c.state} · {c.tier} tier · {c.size} employees</p>
        <p className="text-sm text-muted-foreground">{c.phone} · <a href={c.website} className="text-primary hover:underline">{c.website}</a></p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="configurations">Configurations ({configs.length})</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Contacts" value={contacts.length} />
            <StatCard label="Configurations" value={configs.length} />
            <StatCard label="Open Tickets" value={tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved").length} />
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
                <th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Phone</th>
              </tr></thead>
              <tbody>{contacts.map((ct) => (
                <tr key={ct.id} className="border-t border-border">
                  <td className="px-3 py-2"><Link to="/contacts/$id" params={{ id: ct.id }} className="text-primary hover:underline">{ct.firstName} {ct.lastName}</Link></td>
                  <td className="px-3 py-2">{ct.title}</td>
                  <td className="px-3 py-2">{ct.email}</td>
                  <td className="px-3 py-2">{ct.phone}</td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="configurations">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
                <th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">OS</th><th className="px-3 py-2 text-left">IP</th><th className="px-3 py-2 text-left">Serial</th>
              </tr></thead>
              <tbody>{configs.map((cf) => (
                <tr key={cf.id} className="border-t border-border">
                  <td className="px-3 py-2"><Link to="/configurations/$id" params={{ id: cf.id }} className="text-primary hover:underline">{cf.name}</Link></td>
                  <td className="px-3 py-2">{cf.type}</td>
                  <td className="px-3 py-2">{cf.os}</td>
                  <td className="px-3 py-2">{cf.ip}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{cf.serial}</td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
                <th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Summary</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Priority</th>
              </tr></thead>
              <tbody>{tickets.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-3 py-2"><Link to="/tickets/$id" params={{ id: t.id }} className="text-primary hover:underline">{t.number}</Link></td>
                  <td className="px-3 py-2">{t.summary}</td>
                  <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                  <td className="px-3 py-2"><PriorityBadge priority={t.priority} /></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card><CardContent className="p-4">
            <ul className="divide-y divide-border">
              {activities.map((a) => (
                <li key={a.id} className="py-2 flex items-center justify-between text-sm">
                  <span><span className="text-xs uppercase text-muted-foreground mr-2">{a.type}</span>{a.subject}</span>
                  <span className={a.done ? "text-emerald-400 text-xs" : "text-amber-400 text-xs"}>{a.done ? "Done" : "Pending"}</span>
                </li>
              ))}
              {activities.length === 0 && <p className="text-sm text-muted-foreground">No activities.</p>}
            </ul>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card><CardContent className="p-4">
            <pre className="text-sm whitespace-pre-wrap font-sans">{c.notes || "No notes."}</pre>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
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