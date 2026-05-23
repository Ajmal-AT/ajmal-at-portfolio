import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Database, Inbox, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Ajmal AT" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { isAdmin: false, email: null };
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id);
      return {
        isAdmin: !!roles?.some((r) => ["admin", "SUPER_ADMIN", "ADMIN", "EDITOR"].includes(String(r.role))),
        email: u.user.email ?? null,
      };
    },
  });

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!data?.isAdmin) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account ({data?.email}) doesn't have staff access yet. Open the backend, find your user id, and insert a row in <code className="font-mono">user_roles</code> with role <code className="font-mono">ADMIN</code>.
        </p>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </section>
    );
  }

  const nav: { to: string; label: string; Icon: typeof LayoutDashboard; exact?: boolean }[] = [
    { to: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
    { to: "/admin/content", label: "Content Studio", Icon: Database },
    { to: "/admin/inquiries", label: "Inquiries", Icon: Inbox },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">// admin</p>
          <h2 className="mt-1 font-display text-xl">Dashboard</h2>
          <p className="mt-1 text-xs text-muted-foreground">{data.email}</p>
          <nav className="mt-6 flex flex-col gap-1">
            {nav.map(({ to, label, Icon, exact }) => (
              <Link key={to} to={to as string} activeOptions={{ exact: !!exact }}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground bg-secondary" }}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </section>
  );
}
