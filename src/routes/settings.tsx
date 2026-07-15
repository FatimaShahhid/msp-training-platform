import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { resetDemoData } from "@/lib/msp/store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
  };

  const reset = () => {
    if (!confirm("Reset all demo data? Your changes will be discarded.")) return;
    resetDemoData();
    toast.success("Demo data reset");
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Local preferences and demo controls</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <Label>Dark theme</Label>
            <p className="text-xs text-muted-foreground">Toggle between light and dark UI</p>
          </div>
          <Switch checked={dark} onCheckedChange={toggleTheme} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Demo Data</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <Label>Reset demo data</Label>
            <p className="text-xs text-muted-foreground">Regenerate the seed dataset and clear local changes.</p>
          </div>
          <Button variant="destructive" onClick={reset}>Reset</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          MSP Academy v2.2 — a standalone Tier 1 service desk training simulator. All data is stored in your browser's local storage. No network calls are made.
        </CardContent>
      </Card>
    </div>
  );
}