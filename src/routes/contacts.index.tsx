import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useMsp } from "@/lib/msp/store";

export const Route = createFileRoute("/contacts/")({
  component: ContactsList,
});

function ContactsList() {
  const data = useMsp((d) => d);
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return data.contacts
      .filter((c) => {
        if (!s) return true;
        const co = data.companies.find((x) => x.id === c.companyId)?.name ?? "";
        return `${c.firstName} ${c.lastName} ${c.email} ${co}`.toLowerCase().includes(s);
      })
      .map((c) => ({ c, company: data.companies.find((x) => x.id === c.companyId) }));
  }, [data, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">{rows.length} of {data.contacts.length}</p>
        </div>
        <Input placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Title</th>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Phone</th>
          </tr></thead>
          <tbody>
            {rows.map(({ c, company }) => (
              <tr key={c.id} className="border-t border-border hover:bg-accent/30">
                <td className="px-3 py-2"><Link to="/contacts/$id" params={{ id: c.id }} className="text-primary hover:underline">{c.firstName} {c.lastName}</Link></td>
                <td className="px-3 py-2">{c.title}</td>
                <td className="px-3 py-2">{company?.name}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}