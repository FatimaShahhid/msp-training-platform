import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMsp } from "@/lib/msp/store";
import { toggleActivityDone } from "@/lib/msp/actions";
import type { ActivityType } from "@/lib/msp/types";
import { format } from "date-fns";

const TYPES: (ActivityType | "all")[] = ["all","Call","Email","Task","Meeting","Follow-up"];

export const Route = createFileRoute("/activities")({ component: Activities });

function Activities() {
  const data = useMsp((d) => d);
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [showDone, setShowDone] = useState(true);

  const rows = useMemo(() => {
    return data.activities.filter((a) => {
      if (!showDone && a.done) return false;
      if (type !== "all" && a.type !== type) return false;
      if (q) return `${a.subject} ${a.type}`.toLowerCase().includes(q.toLowerCase());
      return true;
    }).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [data.activities, q, type, showDone]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
        <p className="text-sm text-muted-foreground">{rows.length} of {data.activities.length}</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All types" : t}</SelectItem>)}</SelectContent>
        </Select>
        <label className="text-sm flex items-center gap-2">
          <Checkbox checked={showDone} onCheckedChange={(v) => setShowDone(!!v)} /> Show completed
        </label>
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
            <th className="px-3 py-2 w-8"></th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Subject</th>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2 text-left">Engineer</th>
            <th className="px-3 py-2 text-left">Due</th>
          </tr></thead>
          <tbody>
            {rows.map((a) => {
              const co = data.companies.find((c) => c.id === a.companyId);
              const eng = data.engineers.find((e) => e.id === a.engineerId);
              return (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-3 py-2"><Checkbox checked={a.done} onCheckedChange={() => toggleActivityDone(a.id)} /></td>
                  <td className="px-3 py-2">{a.type}</td>
                  <td className={"px-3 py-2 " + (a.done ? "line-through text-muted-foreground" : "")}>{a.subject}</td>
                  <td className="px-3 py-2">{co?.name}</td>
                  <td className="px-3 py-2">{eng?.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{format(new Date(a.dueAt), "PP p")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}