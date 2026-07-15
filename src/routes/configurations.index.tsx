import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMsp } from "@/lib/msp/store";
import type { ConfigurationType } from "@/lib/msp/types";

const TYPES: (ConfigurationType | "all")[] = ["all","Workstation","Server","Printer","Firewall","Switch","Network Device"];

export const Route = createFileRoute("/configurations/")({ component: ConfigList });

function ConfigList() {
  const data = useMsp((d) => d);
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("all");

  const rows = useMemo(() => {
    return data.configurations.filter((cf) => {
      if (type !== "all" && cf.type !== type) return false;
      if (q) {
        const co = data.companies.find((c) => c.id === cf.companyId)?.name ?? "";
        return `${cf.name} ${cf.hostname} ${cf.serial} ${cf.os} ${cf.ip} ${co}`.toLowerCase().includes(q.toLowerCase());
      }
      return true;
    });
  }, [data, q, type]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurations</h1>
          <p className="text-sm text-muted-foreground">{rows.length} of {data.configurations.length}</p>
        </div>
        <div className="flex gap-2">
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All types" : t}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2 text-left">OS</th>
            <th className="px-3 py-2 text-left">IP</th>
            <th className="px-3 py-2 text-left">Serial</th>
          </tr></thead>
          <tbody>
            {rows.map((cf) => {
              const co = data.companies.find((c) => c.id === cf.companyId);
              return (
                <tr key={cf.id} className="border-t border-border hover:bg-accent/30">
                  <td className="px-3 py-2"><Link to="/configurations/$id" params={{ id: cf.id }} className="text-primary hover:underline">{cf.name}</Link></td>
                  <td className="px-3 py-2">{cf.type}</td>
                  <td className="px-3 py-2">{co?.name}</td>
                  <td className="px-3 py-2">{cf.os}</td>
                  <td className="px-3 py-2">{cf.ip}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{cf.serial}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}