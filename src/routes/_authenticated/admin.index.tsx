import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BriefcaseBusiness, CheckCircle2, Database, Inbox } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [projects, services, inquiries, open, media] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("software_services").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("handled", false),
        supabase.from("media_assets").select("id", { count: "exact", head: true }),
      ]);
      return {
        projects: projects.count ?? 0,
        services: services.count ?? 0,
        inquiries: inquiries.count ?? 0,
        open: open.count ?? 0,
        media: media.count ?? 0,
      };
    },
  });

  const cards = [
    { Icon: BriefcaseBusiness, label: "Projects", value: data?.projects ?? "-" },
    { Icon: Database, label: "Active services", value: data?.services ?? "-" },
    { Icon: Inbox, label: "Inquiries", value: data?.inquiries ?? "-" },
    { Icon: CheckCircle2, label: "Open inquiries", value: data?.open ?? "-" },
    { Icon: Database, label: "Media assets", value: data?.media ?? "-" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">A quick snapshot of your portfolio platform, content and lead pipeline.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-surface p-5">
            <c.Icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
