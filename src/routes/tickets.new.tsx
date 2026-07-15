import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { useMsp } from "@/lib/msp/store";
import { createTicket } from "@/lib/msp/actions";
import type { Board, TicketPriority, TicketStatus } from "@/lib/msp/types";

export const Route = createFileRoute("/tickets/new")({
  component: NewTicket,
});

const STATUSES: TicketStatus[] = ["New","Assigned","In Progress"];
const PRIORITIES: TicketPriority[] = ["Low","Medium","High","Critical"];
const BOARDS: Board[] = ["Service Desk","Network","Server","Projects"];
const TYPES = ["Application","Hardware","Network","Account","Security","Server","Project"];
const SUBTYPES = ["Email","Password","MFA","Printer","VPN","Wireless","Firewall","Backup","File Sync","Permissions","Workstation","Monitoring","Onboarding","Phishing","Deployment"];

function NewTicket() {
  const router = useRouter();
  const data = useMsp((d) => d);
  const [companyId, setCompanyId] = useState<string>("");
  const [contactId, setContactId] = useState<string>("");
  const [configurationId, setConfigurationId] = useState<string>("__none__");
  const [board, setBoard] = useState<Board>("Service Desk");
  const [type, setType] = useState<string>("Application");
  const [subtype, setSubtype] = useState<string>("Email");
  const [item, setItem] = useState<string>("");
  const [status, setStatus] = useState<TicketStatus>("New");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  const contacts = useMemo(() => data.contacts.filter((c) => c.companyId === companyId), [data.contacts, companyId]);
  const configs = useMemo(() => data.configurations.filter((c) => c.companyId === companyId), [data.configurations, companyId]);

  const submit = () => {
    if (!summary.trim()) return toast.error("Summary is required");
    if (!companyId) return toast.error("Company is required");
    if (!contactId) return toast.error("Contact is required");
    const id = createTicket({
      summary: summary.trim(),
      description: description.trim(),
      companyId, contactId,
      configurationId: configurationId === "__none__" ? undefined : configurationId,
      board, type, subtype, item, status, priority,
    });
    toast.success("Ticket created");
    router.navigate({ to: "/tickets/$id", params: { id } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Ticket</h1>
        <p className="text-sm text-muted-foreground">
          Workflow: Company → Contact → Configuration → Board → Type → Subtype → Item
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Ticket details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldBlock label="Company *">
            <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setContactId(""); setConfigurationId("__none__"); }}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {data.companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Contact *">
            <Select value={contactId} onValueChange={setContactId} disabled={!companyId}>
              <SelectTrigger><SelectValue placeholder={companyId ? "Select contact" : "Select company first"} /></SelectTrigger>
              <SelectContent>
                {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Configuration">
            <Select value={configurationId} onValueChange={setConfigurationId} disabled={!companyId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {configs.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Board *">
            <Select value={board} onValueChange={(v) => setBoard(v as Board)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BOARDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Type *">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Subtype">
            <Select value={subtype} onValueChange={setSubtype}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SUBTYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Item"><Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Outlook" /></FieldBlock>
          <FieldBlock label="Status *">
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Priority *">
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label="Summary *" className="md:col-span-2">
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short description of the issue" />
          </FieldBlock>
          <FieldBlock label="Description" className="md:col-span-2">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Full description that will start the customer discussion thread." />
          </FieldBlock>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.history.back()}>Cancel</Button>
        <Button onClick={submit}>Create Ticket</Button>
      </div>
    </div>
  );
}

function FieldBlock({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
