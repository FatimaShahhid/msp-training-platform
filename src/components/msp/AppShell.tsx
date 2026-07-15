import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  Building2,
  Users,
  Server,
  Activity,
  BookOpen,
  BarChart3,
  Settings,
  Search,
  Plus,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { hydrateFromStorage, useMsp } from "@/lib/msp/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/service-board", label: "Service Board", icon: TicketIcon },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/configurations", label: "Configurations", icon: Server },
  { to: "/activities", label: "Activities", icon: Activity },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateFromStorage();
    // Force dark theme by default for the training UI
    document.documentElement.classList.add("dark");
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const me = useMsp((d) => d.engineers.find((e) => e.id === d.currentUserId));
  const [q, setQ] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-sidebar md:min-h-screen md:sticky md:top-0">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              M
            </div>
            <div>
              <div className="text-sm font-semibold text-sidebar-foreground">MSP Academy</div>
              <div className="text-xs text-muted-foreground">Training Simulator</div>
            </div>
          </div>
          <nav className="flex-1 py-2">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground">
            v2.2 · Local mock data
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tickets, companies, contacts…"
                className="pl-8 h-9"
              />
            </div>
            <Link to="/tickets/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> New Ticket
              </Button>
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                {me?.initials ?? "?"}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-medium">{me?.name}</div>
                <div className="text-xs text-muted-foreground">{me?.role}</div>
              </div>
              <Button variant="ghost" size="icon" title="Sign out (demo only)">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
