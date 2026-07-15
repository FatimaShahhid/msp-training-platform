import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/msp/Badges";
import { useMsp } from "@/lib/msp/store";

export const Route = createFileRoute("/configurations/$id")({ component: ConfigDetail });

function ConfigDetail() {
  const { id } = Route.useParams();
  const data = useMsp((d) => d);
  const cf = data.configurations.find((x) => x.id === id);
  if (!cf) return <p className="p-4 text-muted-foreground">Configuration not found.</p>;
  const co = data.companies.find((x) => x.id === cf.companyId);
  const user = cf.contactId ? data.contacts.find((x) => x.id === cf.contactId) : undefined;
  const tickets = data.tickets.filter((t) => t.configurationId === cf.id);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <Link to="/configurations" className="hover:underline">Configurations</Link> / <span className="text-foreground">{cf.name}</span>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{cf.name}</h1>
        <p className="text-sm text-muted-foreground">{cf.type} · {cf.os} · {cf.ip}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="p-4 text-sm space-y-2">
          <Row label="Hostname" value={cf.hostname} />
          <Row label="Serial" value={cf.serial} />
          <Row label="Company" value={co ? <Link to="/companies/$id" params={{ id: co.id }} className="text-primary hover:underline">{co.name}</Link> : "—"} />
          <Row label="Assigned User" value={user ? <Link to="/contacts/$id" params={{ id: user.id }} className="text-primary hover:underline">{user.firstName} {user.lastName}</Link> : "—"} />
          <Row label="IP Address" value={cf.ip} />
          <Row label="Operating System" value={cf.os} />
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-2">Related Tickets ({tickets.length})</h2>
          <ul className="divide-y divide-border text-sm">
            {tickets.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <Link to="/tickets/$id" params={{ id: t.id }} className="text-primary hover:underline">{t.number} — {t.summary}</Link>
                <span className="flex gap-2"><PriorityBadge priority={t.priority} /><StatusBadge status={t.status} /></span>
              </li>
            ))}
            {tickets.length === 0 && <p className="text-muted-foreground">None.</p>}
          </ul>
        </CardContent></Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}