import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMsp } from "@/lib/msp/store";

export const Route = createFileRoute("/knowledge-base")({ component: KB });

function KB() {
  const data = useMsp((d) => d);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(data.kb[0]?.id ?? null);
  const filtered = data.kb.filter((a) => !q || (a.title + a.body + a.category).toLowerCase().includes(q.toLowerCase()));
  const cur = data.kb.find((a) => a.id === active) ?? filtered[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">Reference articles for common issues</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Card><CardContent className="p-0">
            <ul className="divide-y divide-border">
              {filtered.map((a) => (
                <li key={a.id}>
                  <button
                    className={"w-full text-left px-3 py-2 hover:bg-accent/40 " + (cur?.id === a.id ? "bg-accent/40" : "")}
                    onClick={() => setActive(a.id)}
                  >
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.category}</div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent></Card>
        </div>
        <div className="lg:col-span-2">
          <Card><CardContent className="p-6">
            {cur ? (
              <>
                <div className="text-xs text-muted-foreground uppercase">{cur.category}</div>
                <h2 className="text-xl font-semibold mt-1">{cur.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">Updated {new Date(cur.updatedAt).toLocaleDateString()}</p>
                <div className="mt-4 text-sm whitespace-pre-wrap">{cur.body}</div>
              </>
            ) : <p className="text-sm text-muted-foreground">Select an article.</p>}
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}