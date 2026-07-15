import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useMsp } from "@/lib/msp/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/msp/Badges";
import { formatDistanceToNowStrict } from "date-fns";
import type { Board, TicketPriority, TicketStatus } from "@/lib/msp/types";

const STATUS_OPTIONS: (TicketStatus | "all")[] = [
  "all","New","Assigned","In Progress","Waiting on Customer","Waiting on Vendor","Resolved","Closed",
];
const PRIORITY_OPTIONS: (TicketPriority | "all")[] = ["all","Low","Medium","High","Critical"];
const BOARD_OPTIONS: (Board | "all")[] = ["all","Service Desk","Network","Server","Projects"];

type Filters = {
  q: string;
  status: TicketStatus | "all";
  priority: TicketPriority | "all";
  board: Board | "all";
  assignee: "all" | "me" | "unassigned";
};

const initialFilters: Filters = { q: "", status: "all", priority: "all", board: "all", assignee: "all" };

// Preserve filters across navigation within the session
let cachedFilters: Filters = initialFilters;
let cachedSort: SortKey = "updatedAt";
let cachedDir: "asc" | "desc" = "desc";

type SortKey = "number" | "summary" | "priority" | "status" | "updatedAt";

export const Route = createFileRoute("/service-board")({
  component: ServiceBoard,
});

function ServiceBoard() {
  const data = useMsp((d) => d);
  const [filters, setFilters] = useState<Filters>(cachedFilters);
  const [sort, setSort] = useState<SortKey>(cachedSort);
  const [dir, setDir] = useState<"asc" | "desc">(cachedDir);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    const nf = { ...filters, [k]: v };
    cachedFilters = nf;
    setFilters(nf);
  };

  const rows = useMemo(() => {
    const q = filters.q.toLowerCase();
    return data.tickets
      .filter((t) => {
        if (filters.status !== "all" && t.status !== filters.status) return false;
        if (filters.priority !== "all" && t.priority !== filters.priority) return false;
        if (filters.board !== "all" && t.board !== filters.board) return false;
        if (filters.assignee === "me" && t.assignedResourceId !== data.currentUserId) return false;
        if (filters.assignee === "unassigned" && t.assignedResourceId) return false;
        if (q) {
          const co = data.companies.find((c) => c.id === t.companyId)?.name.toLowerCase() ?? "";
          const hay = `${t.number} ${t.summary} ${co} ${t.type} ${t.subtype}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .map((t) => ({
        ticket: t,
        company: data.companies.find((c) => c.id === t.companyId),
        contact: data.contacts.find((c) => c.id === t.contactId),
        configuration: data.configurations.find((c) => c.id === t.configurationId),
        assignee: data.engineers.find((e) => e.id === t.assignedResourceId),
        owner: data.engineers.find((e) => e.id === t.ownerId),
      }));
  }, [data, filters]);

  const sorted = useMemo(() => {
    const priOrder: Record<TicketPriority, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    const arr = [...rows];
    arr.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sort) {
        case "number": av = a.ticket.number; bv = b.ticket.number; break;
        case "summary": av = a.ticket.summary; bv = b.ticket.summary; break;
        case "priority": av = priOrder[a.ticket.priority]; bv = priOrder[b.ticket.priority]; break;
        case "status": av = a.ticket.status; bv = b.ticket.status; break;
        case "updatedAt": av = a.ticket.updatedAt; bv = b.ticket.updatedAt; break;
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, sort, dir]);

  const toggleSort = (k: SortKey) => {
    if (sort === k) {
      const nd = dir === "asc" ? "desc" : "asc";
      cachedDir = nd; setDir(nd);
    } else {
      cachedSort = k; setSort(k); cachedDir = "desc"; setDir("desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service Board</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} of {data.tickets.length} tickets</p>
        </div>
        <Link to="/tickets/new"><Button>New Ticket</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <Input
          className="md:col-span-2"
          placeholder="Search ticket #, summary, company…"
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
        />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => set("status", v as any)} options={STATUS_OPTIONS} />
        <FilterSelect label="Priority" value={filters.priority} onChange={(v) => set("priority", v as any)} options={PRIORITY_OPTIONS} />
        <FilterSelect label="Board" value={filters.board} onChange={(v) => set("board", v as any)} options={BOARD_OPTIONS} />
        <FilterSelect
          label="Assignee"
          value={filters.assignee}
          onChange={(v) => set("assignee", v as any)}
          options={["all", "me", "unassigned"]}
          labels={{ all: "All assignees", me: "Assigned to me", unassigned: "Unassigned" }}
        />
        {(filters.q || filters.status !== "all" || filters.priority !== "all" || filters.board !== "all" || filters.assignee !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { cachedFilters = initialFilters; setFilters(initialFilters); }}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <Th onClick={() => toggleSort("number")} active={sort === "number"} dir={dir}>Ticket #</Th>
              <Th onClick={() => toggleSort("summary")} active={sort === "summary"} dir={dir}>Summary</Th>
              <th className="px-3 py-2 text-left font-medium">Company</th>
              <th className="px-3 py-2 text-left font-medium">Contact</th>
              <th className="px-3 py-2 text-left font-medium">Configuration</th>
              <th className="px-3 py-2 text-left font-medium">Board</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Subtype</th>
              <Th onClick={() => toggleSort("status")} active={sort === "status"} dir={dir}>Status</Th>
              <Th onClick={() => toggleSort("priority")} active={sort === "priority"} dir={dir}>Priority</Th>
              <th className="px-3 py-2 text-left font-medium">Assigned</th>
              <th className="px-3 py-2 text-left font-medium">Owner</th>
              <th className="px-3 py-2 text-left font-medium">SLA</th>
              <Th onClick={() => toggleSort("updatedAt")} active={sort === "updatedAt"} dir={dir}>Last Updated</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ ticket, company, contact, configuration, assignee, owner }) => (
              <tr key={ticket.id} className="border-t border-border hover:bg-accent/30">
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link to="/tickets/$id" params={{ id: ticket.id }} className="text-primary hover:underline font-medium">
                    {ticket.number}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link to="/tickets/$id" params={{ id: ticket.id }} className="hover:underline">
                    {ticket.summary}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{company?.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{contact ? `${contact.firstName} ${contact.lastName}` : "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{configuration?.name ?? "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{ticket.board}</td>
                <td className="px-3 py-2 whitespace-nowrap">{ticket.type}</td>
                <td className="px-3 py-2 whitespace-nowrap">{ticket.subtype}</td>
                <td className="px-3 py-2"><StatusBadge status={ticket.status} /></td>
                <td className="px-3 py-2"><PriorityBadge priority={ticket.priority} /></td>
                <td className="px-3 py-2 whitespace-nowrap">{assignee?.name ?? <span className="text-amber-400">Unassigned</span>}</td>
                <td className="px-3 py-2 whitespace-nowrap">{owner?.name ?? "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{ticket.sla}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(ticket.updatedAt))} ago
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={14} className="text-center py-10 text-muted-foreground">No tickets match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, onClick, active, dir }: { children: React.ReactNode; onClick: () => void; active: boolean; dir: "asc" | "desc" }) {
  return (
    <th className="px-3 py-2 text-left font-medium cursor-pointer select-none" onClick={onClick}>
      <span className={active ? "text-foreground" : ""}>
        {children}{active ? (dir === "asc" ? " ▲" : " ▼") : ""}
      </span>
    </th>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  labels?: Record<string, string>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {labels?.[o] ?? (o === "all" ? `All ${label.toLowerCase()}` : o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
