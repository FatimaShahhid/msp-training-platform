import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { PriorityBadge, StatusBadge } from "@/components/msp/Badges";
import { useMsp } from "@/lib/msp/store";
import {
  addDiscussion,
  addInternalNote,
  addTimeEntry,
  assignToMe,
  closeTicket,
  markViewed,
  resolveTicket,
  updateTicket,
} from "@/lib/msp/actions";
import type { Board, TicketPriority, TicketStatus } from "@/lib/msp/types";
import { toast } from "sonner";

export const Route = createFileRoute("/tickets/$id")({
  component: TicketDetail,
});

const STATUSES: TicketStatus[] = ["New","Assigned","In Progress","Waiting on Customer","Waiting on Vendor","Resolved","Closed"];
const PRIORITIES: TicketPriority[] = ["Low","Medium","High","Critical"];
const BOARDS: Board[] = ["Service Desk","Network","Server","Projects"];

function TicketDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const data = useMsp((d) => d);
  const ticket = data.tickets.find((t) => t.id === id);

  useEffect(() => {
    if (ticket) markViewed(ticket.id);
  }, [ticket?.id]);

  const [draft, setDraft] = useState(() => ticket);
  useEffect(() => { setDraft(ticket); }, [ticket?.id]);

  if (!ticket || !draft) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Link to="/service-board" className="text-primary hover:underline text-sm">Back to Service Board</Link>
      </div>
    );
  }

  const company = data.companies.find((c) => c.id === ticket.companyId);
  const contact = data.contacts.find((c) => c.id === ticket.contactId);
  const configuration = data.configurations.find((c) => c.id === ticket.configurationId);
  const assignee = data.engineers.find((e) => e.id === ticket.assignedResourceId);
  const owner = data.engineers.find((e) => e.id === ticket.ownerId);
  const contacts = data.contacts.filter((c) => c.companyId === ticket.companyId);
  const configs = data.configurations.filter((c) => c.companyId === ticket.companyId);

  const save = () => {
    updateTicket(ticket.id, {
      summary: draft.summary,
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      board: draft.board,
      type: draft.type,
      subtype: draft.subtype,
      item: draft.item,
      contactId: draft.contactId,
      configurationId: draft.configurationId,
      assignedResourceId: draft.assignedResourceId,
    });
    toast.success("Ticket saved");
  };

  const saveAndClose = () => {
    save();
    router.navigate({ to: "/service-board" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link to="/service-board" className="hover:underline">Service Board</Link>
        <span>/</span>
        <span className="text-foreground">{ticket.number}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">{ticket.number}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{ticket.summary}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {company?.name} · Opened {format(new Date(ticket.createdAt), "PP p")} · Updated {formatDistanceToNowStrict(new Date(ticket.updatedAt))} ago
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="outline" onClick={saveAndClose}>Save &amp; Close</Button>
          <Button variant="secondary" onClick={() => assignToMe(ticket.id)}>Assign to Me</Button>
          <Button variant="secondary" onClick={() => resolveTicket(ticket.id)}>Resolve</Button>
          <Button variant="destructive" onClick={() => closeTicket(ticket.id)}>Close</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Summary" className="md:col-span-2">
              <Input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
            </Field>
            <Field label="Company">
              <Input value={company?.name ?? ""} readOnly />
            </Field>
            <Field label="Contact">
              <Select value={draft.contactId} onValueChange={(v) => setDraft({ ...draft, contactId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Configuration">
              <Select
                value={draft.configurationId ?? "__none__"}
                onValueChange={(v) => setDraft({ ...draft, configurationId: v === "__none__" ? undefined : v })}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {configs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Board">
              <Select value={draft.board} onValueChange={(v) => setDraft({ ...draft, board: v as Board })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BOARDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Type">
              <Input value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} />
            </Field>
            <Field label="Subtype">
              <Input value={draft.subtype} onChange={(e) => setDraft({ ...draft, subtype: e.target.value })} />
            </Field>
            <Field label="Item">
              <Input value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as TicketStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as TicketPriority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Assigned Resource">
              <Select
                value={draft.assignedResourceId ?? "__none__"}
                onValueChange={(v) => setDraft({ ...draft, assignedResourceId: v === "__none__" ? undefined : v })}
              >
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {data.engineers.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Owner">
              <Input value={owner?.name ?? ""} readOnly />
            </Field>
            <Field label="SLA">
              <Input value={ticket.sla} readOnly />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Related</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <div className="text-xs text-muted-foreground uppercase">Company</div>
              <Link to="/companies/$id" params={{ id: ticket.companyId }} className="text-primary hover:underline">{company?.name}</Link>
              <div className="text-xs text-muted-foreground">{company?.industry} · {company?.city}, {company?.state}</div>
            </div>
            <Separator />
            <div>
              <div className="text-xs text-muted-foreground uppercase">Contact</div>
              {contact && (
                <Link to="/contacts/$id" params={{ id: contact.id }} className="text-primary hover:underline">
                  {contact.firstName} {contact.lastName}
                </Link>
              )}
              <div className="text-xs text-muted-foreground">{contact?.email}</div>
            </div>
            {configuration && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Configuration</div>
                  <Link to="/configurations/$id" params={{ id: configuration.id }} className="text-primary hover:underline">
                    {configuration.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{configuration.type} · {configuration.os}</div>
                </div>
              </>
            )}
            <Separator />
            <div>
              <div className="text-xs text-muted-foreground uppercase">Assignment</div>
              <div>{assignee?.name ?? <span className="text-amber-400">Unassigned</span>}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="discussion">Discussion ({ticket.discussion.length})</TabsTrigger>
          <TabsTrigger value="notes">Internal Notes ({ticket.internalNotes.length})</TabsTrigger>
          <TabsTrigger value="time">Time Entries ({ticket.timeEntries.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail ({ticket.audit.length})</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card><CardContent className="p-4">
            <Label>Description</Label>
            <Textarea
              className="mt-2 min-h-40"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="discussion">
          <DiscussionTab ticketId={ticket.id} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab ticketId={ticket.id} />
        </TabsContent>
        <TabsContent value="time">
          <TimeTab ticketId={ticket.id} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTab ticketId={ticket.id} />
        </TabsContent>
        <TabsContent value="attachments">
          <Card><CardContent className="p-4 text-sm text-muted-foreground">
            Attachments are simulated only. In a real PSA, drag-and-drop files would upload here.
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function DiscussionTab({ ticketId }: { ticketId: string }) {
  const ticket = useMsp((d) => d.tickets.find((t) => t.id === ticketId)!);
  const [text, setText] = useState("");
  return (
    <Card><CardContent className="p-4 space-y-4">
      <ul className="space-y-3">
        {ticket.discussion.map((m) => (
          <li key={m.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {m.authorName} <span className="text-muted-foreground">({m.authorKind === "engineer" ? "Tech" : "Customer"})</span>
              </span>
              <span>{format(new Date(m.createdAt), "PP p")}</span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
        {ticket.discussion.length === 0 && <p className="text-sm text-muted-foreground">No discussion yet.</p>}
      </ul>
      <div className="space-y-2">
        <Label>Reply to customer</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a customer-visible reply…" />
        <div className="flex justify-end">
          <Button onClick={() => { addDiscussion(ticketId, text); setText(""); }} disabled={!text.trim()}>Post reply</Button>
        </div>
      </div>
    </CardContent></Card>
  );
}

function NotesTab({ ticketId }: { ticketId: string }) {
  const ticket = useMsp((d) => d.tickets.find((t) => t.id === ticketId)!);
  const [text, setText] = useState("");
  return (
    <Card><CardContent className="p-4 space-y-4">
      <ul className="space-y-3">
        {ticket.internalNotes.map((n) => (
          <li key={n.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{n.authorName}</span>
              <span>{format(new Date(n.createdAt), "PP p")}</span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{n.body}</p>
          </li>
        ))}
        {ticket.internalNotes.length === 0 && <p className="text-sm text-muted-foreground">No internal notes yet.</p>}
      </ul>
      <div className="space-y-2">
        <Label>Internal note (not visible to customer)</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={() => { addInternalNote(ticketId, text); setText(""); }} disabled={!text.trim()}>Add note</Button>
        </div>
      </div>
    </CardContent></Card>
  );
}

function TimeTab({ ticketId }: { ticketId: string }) {
  const ticket = useMsp((d) => d.tickets.find((t) => t.id === ticketId)!);
  const [start, setStart] = useState<string>(new Date().toISOString().slice(0, 16));
  const [end, setEnd] = useState<string>(new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16));
  const [workRole, setWorkRole] = useState("Tier 1 Support");
  const [workType, setWorkType] = useState("Remote Support");
  const [notes, setNotes] = useState("");

  const totalMinutes = ticket.timeEntries.reduce((a, b) => a + b.minutes, 0);

  const submit = () => {
    const s = new Date(start).toISOString();
    const e = new Date(end).toISOString();
    const mins = Math.max(0, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000));
    if (mins === 0) { toast.error("Duration must be greater than zero"); return; }
    addTimeEntry(ticketId, { start: s, end: e, minutes: mins, workRole, workType, notes });
    setNotes("");
  };

  return (
    <Card><CardContent className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Total logged</div>
        <div className="text-lg font-semibold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
            <th className="px-3 py-2 text-left">Engineer</th>
            <th className="px-3 py-2 text-left">Start</th>
            <th className="px-3 py-2 text-left">End</th>
            <th className="px-3 py-2 text-left">Duration</th>
            <th className="px-3 py-2 text-left">Work Role</th>
            <th className="px-3 py-2 text-left">Work Type</th>
            <th className="px-3 py-2 text-left">Notes</th>
          </tr></thead>
          <tbody>
            {ticket.timeEntries.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-3 py-2">{t.engineerName}</td>
                <td className="px-3 py-2 text-xs">{format(new Date(t.start), "PP p")}</td>
                <td className="px-3 py-2 text-xs">{format(new Date(t.end), "PP p")}</td>
                <td className="px-3 py-2">{Math.floor(t.minutes / 60)}h {t.minutes % 60}m</td>
                <td className="px-3 py-2">{t.workRole}</td>
                <td className="px-3 py-2">{t.workType}</td>
                <td className="px-3 py-2 text-muted-foreground">{t.notes}</td>
              </tr>
            ))}
            {ticket.timeEntries.length === 0 && (
              <tr><td colSpan={7} className="text-center py-6 text-muted-foreground">No time entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Start"><Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="End"><Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
        <div />
        <Field label="Work Role">
          <Select value={workRole} onValueChange={setWorkRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Tier 1 Support","Tier 2 Support","Tier 3 Support","Project Engineer"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Work Type">
          <Select value={workType} onValueChange={setWorkType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Remote Support","Onsite","Phone Support","Project Work","After Hours"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Notes"><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      </div>
      <div className="flex justify-end"><Button onClick={submit}>Add Time Entry</Button></div>
    </CardContent></Card>
  );
}

function AuditTab({ ticketId }: { ticketId: string }) {
  const ticket = useMsp((d) => d.tickets.find((t) => t.id === ticketId)!);
  return (
    <Card><CardContent className="p-0">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
          <th className="px-3 py-2 text-left">When</th>
          <th className="px-3 py-2 text-left">User</th>
          <th className="px-3 py-2 text-left">Action</th>
          <th className="px-3 py-2 text-left">Field</th>
          <th className="px-3 py-2 text-left">Previous</th>
          <th className="px-3 py-2 text-left">New</th>
        </tr></thead>
        <tbody>
          {[...ticket.audit].reverse().map((a) => (
            <tr key={a.id} className="border-t border-border">
              <td className="px-3 py-2 whitespace-nowrap text-xs">{format(new Date(a.at), "PP p")}</td>
              <td className="px-3 py-2 whitespace-nowrap">{a.userName}</td>
              <td className="px-3 py-2">{a.action}</td>
              <td className="px-3 py-2 text-muted-foreground">{a.field ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{a.previous ?? "—"}</td>
              <td className="px-3 py-2">{a.next ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
}
