import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useMsp } from "@/lib/msp/store";

export const Route = createFileRoute("/companies/")({
  component: CompaniesList,
});

function CompaniesList() {
  const data = useMsp((d) => d);
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    return data.companies
      .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.industry.toLowerCase().includes(q.toLowerCase()))
      .map((c) => ({
        c,
        contacts: data.contacts.filter((x) => x.companyId === c.id).length,
        configs: data.configurations.filter((x) => x.companyId === c.id).length,
        tickets: data.tickets.filter((x) => x.companyId === c.id).length,
        open: data.tickets.filter((x) => x.companyId === c.id && x.status !== "Closed" && x.status !== "Resolved").length,
      }));
  }, [data, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">{rows.length} of {data.companies.length}</p>
        </div>
        <Input placeholder="Search companies…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2 text-left">Industry</th>
            <th className="px-3 py-2 text-left">Location</th>
            <th className="px-3 py-2 text-left">Tier</th>
            <th className="px-3 py-2 text-right">Contacts</th>
            <th className="px-3 py-2 text-right">Configs</th>
            <th className="px-3 py-2 text-right">Tickets</th>
            <th className="px-3 py-2 text-right">Open</th>
          </tr></thead>
          <tbody>
            {rows.map(({ c, contacts, configs, tickets, open }) => (
              <tr key={c.id} className="border-t border-border hover:bg-accent/30">
                <td className="px-3 py-2">
                  <Link to="/companies/$id" params={{ id: c.id }} className="text-primary hover:underline font-medium">{c.name}</Link>
                </td>
                <td className="px-3 py-2">{c.industry}</td>
                <td className="px-3 py-2">{c.city}, {c.state}</td>
                <td className="px-3 py-2">{c.tier}</td>
                <td className="px-3 py-2 text-right">{contacts}</td>
                <td className="px-3 py-2 text-right">{configs}</td>
                <td className="px-3 py-2 text-right">{tickets}</td>
                <td className="px-3 py-2 text-right text-amber-400">{open}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}