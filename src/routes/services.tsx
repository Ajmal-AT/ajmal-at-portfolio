import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { fetchSections, getIcon, listContent, sectionByKey, seoHead, type AnyRecord } from "@/lib/content";

export const Route = createFileRoute("/services")({
  head: () => seoHead("services", "Services & Pricing - Ajmal AT"),
  component: Services,
});

function Tier({ service, kind }: { service: AnyRecord; kind: string }) {
  const Icon = getIcon(service.icon);
  const features = service.features ?? service.technologies ?? [];
  return (
    <div className="relative flex h-full flex-col rounded-3xl border border-border bg-surface p-8 transition-all hover:border-primary/40 hover:shadow-glow">
      <div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary/20 text-primary"><Icon className="h-5 w-5" /></span><span className="font-mono text-[11px] uppercase tracking-widest text-primary">{kind}</span></div>
      <h3 className="mt-5 font-display text-2xl">{service.title}</h3>
      <div className="mt-4 flex items-baseline gap-2"><span className="font-display text-3xl font-semibold gradient-text">INR {Number(service.starting_price ?? 0).toLocaleString("en-IN")}</span><span className="text-xs text-muted-foreground">{service.pricing_type ?? "starting"}</span></div>
      <p className="mt-3 text-sm text-muted-foreground">{service.short_description}</p>
      <ul className="mt-6 space-y-2.5">{features.map((item: string) => <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" /> {item}</li>)}</ul>
      {(service.ownership_note || service.full_description) && <p className="mt-6 rounded-lg border border-border bg-background/50 p-3 text-[11px] leading-relaxed text-muted-foreground">{service.ownership_note ?? service.full_description}</p>}
      <Link to="/contact" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">Request quote <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}

function Services() {
  const { data, isLoading } = useQuery({
    queryKey: ["services-content"],
    queryFn: async () => {
      const [sections, software, resumes, portfolios] = await Promise.all([
        fetchSections("services"),
        listContent("software_services", { activeOnly: true }),
        listContent("resume_services", { activeOnly: true }),
        listContent("portfolio_services", { activeOnly: true }),
      ]);
      return { sections, services: [...software.map((s) => ({ ...s, kind: "Software" })), ...portfolios.map((s) => ({ ...s, kind: "Portfolio" })), ...resumes.map((s) => ({ ...s, kind: "Resume" }))] };
    },
  });
  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading services...</div>;
  const hero = sectionByKey(data?.sections ?? [], "hero");
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">{hero.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">{hero.heading}</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{hero.body}</p>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">{(data?.services ?? []).map((service) => <Tier key={`${service.kind}-${service.id}`} service={service} kind={service.kind} />)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-surface/60 p-8 md:p-12">
          <h2 className="font-display text-2xl md:text-3xl">Dynamic pricing policy</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">Pricing is managed from the admin dashboard. Final pricing depends on project complexity, timelines, integrations, scalability requirements and advanced customization.</p>
        </div>
      </section>
    </>
  );
}
