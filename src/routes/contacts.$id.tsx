import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { useMsp } from "@/lib/msp/store";
import { StatusBadge, PriorityBadge } from "@/components/msp/Badges";

export const Route = createFileRoute("/contacts/$id")({ component: ContactDetail });

function ContactDetail() {
  const { id } = Route.useParams();
  const data = useMsp((d) => d);
  const c = data.contacts.find((x) => x.id === id);
  if (!c) return <p className="p-4 text-muted-foreground">Contact not found.</p>;
  const company = data.companies.find((x) => x.id === c.companyId);
  const tickets = data.tickets.filter((t) => t.contactId === c.id);
  const devices = data.configurations.filter((cf) => cf.contactId === c.id);
  const activities = data.activities.filter((a) => a.contactId === c.id);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <Link to="/contacts" className="hover:underline">Contacts</Link> / <span className="text-foreground">{c.firstName} {c.lastName}</span>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{c.firstName} {c.lastName}</h1>
        <p className="text-sm text-muted-foreground">
          {c.title} · <Link to="/companies/$id" params={{ id: c.companyId }} className="text-primary hover:underline">{company?.name}</Link>
        </p>
        <p className="text-sm text-muted-foreground">{c.email} · {c.phone}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-2">Tickets ({tickets.length})</h2>
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
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-2">Devices ({devices.length})</h2>
          <ul className="divide-y divide-border text-sm">
            {devices.map((d) => (
              <li key={d.id} className="py-2 flex items-center justify-between">
                <Link to="/configurations/$id" params={{ id: d.id }} className="text-primary hover:underline">{d.name}</Link>
                <span className="text-muted-foreground">{d.type} · {d.os}</span>
              </li>
            ))}
            {devices.length === 0 && <p className="text-muted-foreground">None.</p>}
          </ul>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-2">Activities ({activities.length})</h2>
          <ul className="divide-y divide-border text-sm">
            {activities.map((a) => (
              <li key={a.id} className="py-2 flex items-center justify-between">
                <span><span className="text-xs uppercase text-muted-foreground mr-2">{a.type}</span>{a.subject}</span>
                <span className={a.done ? "text-emerald-400 text-xs" : "text-amber-400 text-xs"}>{a.done ? "Done" : "Pending"}</span>
              </li>
            ))}
            {activities.length === 0 && <p className="text-muted-foreground">None.</p>}
          </ul>
        </CardContent></Card>
      </div>
    </div>
  );
}