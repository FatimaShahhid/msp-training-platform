import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/lib/msp/types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  New: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Assigned: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "In Progress": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Waiting on Customer": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Waiting on Vendor": "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Resolved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Closed: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Low: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  Medium: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  High: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Critical: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        PRIORITY_STYLES[priority],
      )}
    >
      {priority}
    </span>
  );
}
