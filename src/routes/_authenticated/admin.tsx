import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Database,
  Inbox,
  LogOut,
  Loader2,
  Shield,
  ChevronRight,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ajmal AT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { to: "/admin/content", label: "Content Studio", Icon: Database, exact: false },
  { to: "/admin/inquiries", label: "Inquiries", Icon: Inbox, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { isAdmin: false, email: null };
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      return {
        isAdmin: !!roles?.some((r) =>
          ["admin", "SUPER_ADMIN", "ADMIN", "EDITOR"].includes(String(r.role))
        ),
        email: u.user.email ?? null,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          </div>
          <p className="font-mono text-xs text-muted-foreground">authenticating...</p>
        </div>
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Access Restricted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs text-primary">{data?.email}</span> does not have
              staff privileges. Insert a row in{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">user_roles</code>{" "}
              with role{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">ADMIN</code>.
            </p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-surface/40 backdrop-blur lg:flex">
        {/* Logo area */}
        <div className="border-b border-border/60 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Admin Panel</p>
              <p className="font-mono text-[10px] text-muted-foreground">Ajmal AT</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
          {nav.map(({ to, label, Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: !!exact }}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
              activeProps={{
                className:
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground bg-white/8 border border-white/8 shadow-sm",
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-40 group-[.active]:opacity-60" />
            </Link>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-border/60 p-3">
          <div className="rounded-lg bg-white/4 px-3 py-2.5">
            <p className="truncate font-mono text-[11px] text-muted-foreground">{data.email}</p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-destructive"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-16 z-40 flex items-center gap-2 overflow-x-auto border-b border-border/60 bg-background/80 px-4 py-2 backdrop-blur lg:hidden">
        {nav.map(({ to, label, Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: !!exact }}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-foreground bg-white/8 border border-white/8" }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 lg:px-8 lg:pt-8 mt-14 lg:mt-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}