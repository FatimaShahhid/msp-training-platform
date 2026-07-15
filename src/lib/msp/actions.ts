import { toast } from "sonner";
import { getData, update } from "./store";
import type {
  Activity,
  ActivityType,
  AuditEntry,
  Board,
  Company,
  Configuration,
  ConfigurationType,
  Contact,
  DiscussionMessage,
  InternalNote,
  Ticket,
  TicketPriority,
  TicketStatus,
  TimeEntry,
} from "./types";

function now() {
  return new Date().toISOString();
}

function rid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function addAudit(ticket: Ticket, entry: Omit<AuditEntry, "id" | "at" | "userId" | "userName">) {
  const cur = getData().engineers.find((e) => e.id === getData().currentUserId);
  ticket.audit.push({
    id: rid("au"),
    at: now(),
    userId: cur?.id ?? "system",
    userName: cur?.name ?? "System",
    ...entry,
  });
}

export function assignToMe(ticketId: string) {
  update((d) => {
    const t = d.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    const me = d.engineers.find((e) => e.id === d.currentUserId)!;
    const prev = t.assignedResourceId ? d.engineers.find((e) => e.id === t.assignedResourceId)?.name : undefined;
    t.assignedResourceId = me.id;
    const prevStatus = t.status;
    if (t.status === "New") t.status = "Assigned";
    t.updatedAt = now();
    addAudit(t, { action: "Assigned to me", field: "assignedResourceId", previous: prev, next: me.name });
    if (prevStatus !== t.status) addAudit(t, { action: "Status changed", field: "status", previous: prevStatus, next: t.status });
  });
  toast.success("Ticket assigned to you");
}

export function updateTicket(ticketId: string, patch: Partial<Ticket>) {
  update((d) => {
    const t = d.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    (Object.keys(patch) as (keyof Ticket)[]).forEach((k) => {
      const prev = t[k];
      const next = patch[k];
      if (prev === next) return;
      if (typeof prev !== "object" || prev == null) {
        addAudit(t, {
          action: "Field changed",
          field: String(k),
          previous: prev == null ? "" : String(prev),
          next: next == null ? "" : String(next),
        });
      }
      // @ts-expect-error dynamic patch
      t[k] = next;
    });
    t.updatedAt = now();
  });
}

export function setTicketStatus(ticketId: string, status: TicketStatus) {
  update((d) => {
    const t = d.tickets.find((x) => x.id === ticketId);
    if (!t || t.status === status) return;
    const prev = t.status;
    t.status = status;
    t.updatedAt = now();
    addAudit(t, { action: "Status changed", field: "status", previous: prev, next: status });
  });
}

export function resolveTicket(ticketId: string) {
  setTicketStatus(ticketId, "Resolved");
  toast.success("Ticket resolved");
}

export function closeTicket(ticketId: string) {
  setTicketStatus(ticketId, "Closed");
  toast.success("Ticket closed");
}

export function addDiscussion(ticketId: string, body: string) {
  if (!body.trim()) return;
  update((d) => {
    const t = d.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    const me = d.engineers.find((e) => e.id === d.currentUserId)!;
    const msg: DiscussionMessage = {
      id: rid("dm"),
      authorId: me.id,
      authorName: me.name,
      authorKind: "engineer",
      body: body.trim(),
      createdAt: now(),
    };
    t.discussion.push(msg);
    t.updatedAt = now();
    addAudit(t, { action: "Discussion reply added" });
  });
}

export function addInternalNote(ticketId: string, body: string) {
  if (!body.trim()) return;
  update((d) => {
    const t = d.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    const me = d.engineers.find((e) => e.id === d.currentUserId)!;
    const note: InternalNote = {
      id: rid("in"),
      authorId: me.id,
      authorName: me.name,
      body: body.trim(),
      createdAt: now(),
    };
    t.internalNotes.push(note);
    t.updatedAt = now();
    addAudit(t, { action: "Internal note added" });
  });
}

export function addTimeEntry(ticketId: string, entry: Omit<TimeEntry, "id" | "engineerId" | "engineerName">) {
  update((d) => {
    const t = d.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    const me = d.engineers.find((e) => e.id === d.currentUserId)!;
    const te: TimeEntry = {
      id: rid("te"),
      engineerId: me.id,
      engineerName: me.name,
      ...entry,
    };
    t.timeEntries.push(te);
    t.updatedAt = now();
    addAudit(t, { action: "Time entry added", next: `${entry.minutes} min` });
  });
  toast.success("Time entry added");
}

export function createTicket(input: {
  summary: string;
  description: string;
  companyId: string;
  contactId: string;
  configurationId?: string;
  board: Board;
  type: string;
  subtype: string;
  item: string;
  status: TicketStatus;
  priority: TicketPriority;
  sla?: string;
}): string {
  const id = rid("tk");
  update((d) => {
    const num = 1000 + d.tickets.length + 1;
    const t: Ticket = {
      id,
      number: `T-${String(num).padStart(4, "0")}`,
      summary: input.summary,
      description: input.description,
      companyId: input.companyId,
      contactId: input.contactId,
      configurationId: input.configurationId,
      board: input.board,
      type: input.type,
      subtype: input.subtype,
      item: input.item,
      status: input.status,
      priority: input.priority,
      assignedResourceId: input.status === "New" ? undefined : d.currentUserId,
      ownerId: d.currentUserId,
      sla: input.sla ?? "4h Response / 8h Resolution",
      slaDue: new Date(Date.now() + 8 * 3600_000).toISOString(),
      createdAt: now(),
      updatedAt: now(),
      discussion: input.description
        ? [
            {
              id: rid("dm"),
              authorId: d.currentUserId,
              authorName: d.engineers.find((e) => e.id === d.currentUserId)!.name,
              authorKind: "engineer",
              body: input.description,
              createdAt: now(),
            },
          ]
        : [],
      internalNotes: [],
      timeEntries: [],
      audit: [
        {
          id: rid("au"),
          at: now(),
          userId: d.currentUserId,
          userName: d.engineers.find((e) => e.id === d.currentUserId)!.name,
          action: "Ticket created",
        },
      ],
      attachments: [],
    };
    d.tickets.unshift(t);
  });
  return id;
}

export function markViewed(id: string) {
  update((d) => {
    d.recentlyViewed = [id, ...d.recentlyViewed.filter((x) => x !== id)].slice(0, 8);
  });
}

export function toggleActivityDone(id: string) {
  update((d) => {
    const a = d.activities.find((x) => x.id === id);
    if (a) a.done = !a.done;
  });
}

export function addActivity(a: Omit<Activity, "id">) {
  update((d) => {
    d.activities.unshift({ ...a, id: rid("ac") });
  });
}

export function addCompanyNote(companyId: string, text: string) {
  update((d) => {
    const c = d.companies.find((x) => x.id === companyId);
    if (c) c.notes = (c.notes ? c.notes + "\n" : "") + `[${new Date().toLocaleString()}] ${text}`;
  });
}

export function createCompany(input: Omit<Company, "id">) {
  const id = rid("co");
  update((d) => d.companies.push({ ...input, id }));
  return id;
}

export function createContact(input: Omit<Contact, "id">) {
  const id = rid("ct");
  update((d) => d.contacts.push({ ...input, id }));
  return id;
}

export function createConfiguration(input: Omit<Configuration, "id">) {
  const id = rid("cf");
  update((d) => d.configurations.push({ ...input, id }));
  return id;
}

export type { ActivityType, ConfigurationType };
