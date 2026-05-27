import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  Inbox,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

const db = supabase as any;

function AdminHome() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [projects, software, resumeSvc, portfolioSvc, inquiries, open, media] =
        await Promise.all([
          db.from("projects").select("id", { count: "exact", head: true }),
          db
            .from("software_services")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          db
            .from("resume_services")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          db
            .from("portfolio_services")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          db.from("inquiries").select("id", { count: "exact", head: true }),
          db
            .from("inquiries")
            .select("id", { count: "exact", head: true })
            .eq("handled", false),
          db.from("media_assets").select("id", { count: "exact", head: true }),
        ]);

      const totalServices =
        (software.count ?? 0) + (resumeSvc.count ?? 0) + (portfolioSvc.count ?? 0);

      return {
        projects: projects.count ?? 0,
        services: totalServices,
        inquiries: inquiries.count ?? 0,
        open: open.count ?? 0,
        media: media.count ?? 0,
      };
    },
  });

  const statCards = [
    {
      Icon: BriefcaseBusiness,
      label: "Total Projects",
      value: data?.projects ?? "—",
      sub: "Active case studies",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      Icon: Database,
      label: "Active Services",
      value: data?.services ?? "—",
      sub: "Across all service types",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      Icon: MessageSquare,
      label: "Total Inquiries",
      value: data?.inquiries ?? "—",
      sub: "All time leads",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      Icon: Inbox,
      label: "Open Inquiries",
      value: data?.open ?? "—",
      sub: "Awaiting response",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      Icon: CheckCircle2,
      label: "Media Assets",
      value: data?.media ?? "—",
      sub: "Uploaded files",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
  ];

  const quickLinks = [
    {
      to: "/admin/content",
      label: "Content Studio",
      desc: "Edit portfolio content, SEO, sections",
      Icon: Database,
    },
    {
      to: "/admin/inquiries",
      label: "View Inquiries",
      desc: "Review and manage project leads",
      Icon: Inbox,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-primary">overview</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform health and content pipeline at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">live</span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((c) => (
          <div
            key={c.label}
            className={`group relative overflow-hidden rounded-2xl border ${c.border} bg-surface/60 p-5 backdrop-blur transition-all hover:bg-surface/80`}
          >
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${c.bg} blur-2xl transition-all group-hover:scale-150`} />
            <div className="relative">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
                <c.Icon className="h-4 w-4" />
              </div>
              <div className="mt-4">
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded-md bg-white/8" />
                ) : (
                  <p className="font-display text-3xl font-semibold tabular-nums">{c.value}</p>
                )}
                <p className="mt-0.5 text-sm font-medium text-foreground/80">{c.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Quick actions</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ to, label, desc, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-surface/40 p-4 transition-all hover:border-primary/30 hover:bg-surface/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}