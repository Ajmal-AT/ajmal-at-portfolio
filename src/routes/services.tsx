// services.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Code2,
  FileText,
  Layers,
} from "lucide-react";
import {
  fetchSections,
  getIcon,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/services")({
  head: () => seoHead("services", "Services & Pricing - Ajmal AT"),
  component: Services,
});

// ─── USD → INR conversion ─────────────────────────────────────────────────────
const USD_TO_INR = Number(import.meta.env.VITE_USD_TO_INR_RATE || 100.41);

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(amount * USD_TO_INR));
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function ServicesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 animate-pulse space-y-6">
      <div className="h-3 w-24 rounded-full bg-primary/10" />
      <div className="h-14 w-2/3 rounded-xl bg-primary/8" />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-96 rounded-3xl bg-primary/5" />
        ))}
      </div>
    </div>
  );
}

// ─── Kind config ──────────────────────────────────────────────────────────────
const kindConfig: Record<
  string,
  { Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  Software: {
    Icon: Code2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Portfolio: {
    Icon: Layers,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  Resume: {
    Icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
};

// ─── Price display ────────────────────────────────────────────────────────────
function PriceDisplay({
  usd,
  pricingType,
}: {
  usd: number;
  pricingType?: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {/* Primary: USD */}
      <span className="font-display text-3xl font-semibold gradient-text">
        {formatUSD(usd)}
      </span>
      <span className="text-xs text-muted-foreground">
        {pricingType ?? "starting"}
      </span>
      {/* Secondary: INR conversion */}
      <span className="w-full font-mono text-[11px] text-muted-foreground/50">
        ≈ {formatINR(usd)} INR
      </span>
    </div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────
function Tier({
  service,
  kind,
  index,
}: {
  service: AnyRecord;
  kind: string;
  index: number;
}) {
  const Icon = getIcon(service.icon);
  const features: string[] = service.features ?? service.technologies ?? [];
  const cfg = kindConfig[kind] ?? kindConfig.Software;
  const KindIcon = cfg.Icon;
  const usdPrice = Number(service.starting_price ?? 0);

  return (
    <Reveal delay={index * 0.07}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Hover shimmer */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.06),transparent_55%)]" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color} ring-1 ${cfg.border} transition-all duration-300 group-hover:scale-105`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} px-2.5 py-1`}>
                <KindIcon className={`h-3 w-3 ${cfg.color}`} />
                <span className={`font-mono text-[10px] uppercase tracking-widest ${cfg.color}`}>
                  {kind}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-5 font-display text-2xl font-semibold leading-tight">
            {service.title}
          </h3>

          {/* Pricing — USD primary, INR secondary */}
          <PriceDisplay usd={usdPrice} pricingType={service.pricing_type} />

          {/* Description */}
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {service.short_description}
          </p>

          {/* Features */}
          {features.length > 0 && (
            <ul className="mt-6 flex-1 space-y-2.5">
              {features.map((item: string) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-2.5 w-2.5 text-primary" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Note */}
          {(service.ownership_note || service.full_description) && (
            <div className="mt-6 rounded-xl border border-border/40 bg-background/40 px-4 py-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                {service.ownership_note ?? service.full_description}
              </p>
            </div>
          )}

          {/* CTA */}
          <Link
            to="/contact"
            className="group/btn mt-7 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.02]"
          >
            Request quote
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
function Services() {
  const { data, isLoading } = useQuery({
    queryKey: ["services-content"],
    queryFn: async () => {
      const [sections, software, resumes, portfolios] = await Promise.all([
        fetchSections("services"),
        listContent<AnyRecord>("software_services", { activeOnly: true }),
        listContent<AnyRecord>("resume_services", { activeOnly: true }),
        listContent<AnyRecord>("portfolio_services", { activeOnly: true }),
      ]);

      const combined: AnyRecord[] = [
        ...software.map((s): AnyRecord => ({ ...s, kind: "Software" })),
        ...portfolios.map((s): AnyRecord => ({ ...s, kind: "Portfolio" })),
        ...resumes.map((s): AnyRecord => ({ ...s, kind: "Resume" })),
      ].sort(
        (a: AnyRecord, b: AnyRecord) =>
          Number(a.starting_price ?? 0) - Number(b.starting_price ?? 0)
      );

      return { sections, services: combined };
    },
  });

  if (isLoading) return <ServicesSkeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");

  // Group by kind for section labels
  const grouped = (data?.services ?? []).reduce<Record<string, AnyRecord[]>>(
    (acc, s) => {
      acc[s.kind] = [...(acc[s.kind] ?? []), s];
      return acc;
    },
    {}
  );

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {(hero.eyebrow ?? "Services").replace(/^\/\/\s*/, "")}
            </span>
          </div>

          <h1 className="mt-8 max-w-3xl font-display text-5xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
            {hero.heading ? (
              <>
                {String(hero.heading).split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-brand">
                  {String(hero.heading).split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                Services &{" "}
                <span className="gradient-brand">pricing</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {hero.body}
          </p>

          {/* Currency note */}
          <p className="mt-3 font-mono text-xs text-muted-foreground/40">
            All prices in USD · INR equivalent shown at ≈ ₹{USD_TO_INR}/$ for reference
          </p>
        </Reveal>
      </section>

      {/* ── Service tiers ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        {Object.entries(grouped).map(([kind, items]) => {
          const cfg = kindConfig[kind] ?? kindConfig.Software;
          const KindIcon = cfg.Icon;
          return (
            <div key={kind} className="mb-16 last:mb-0">
              {/* Kind header */}
              <Reveal className="mb-8 flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`}>
                  <KindIcon className="h-4 w-4" />
                </div>
                <h2 className="font-display text-2xl font-semibold">
                  {kind} Services
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-border/40 to-transparent" />
              </Reveal>

              <div className="grid gap-6 lg:grid-cols-3">
                {items.map((service, i) => (
                  <Tier
                    key={`${kind}-${service.id}`}
                    service={service}
                    kind={kind}
                    index={i}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Pricing policy banner ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-8 backdrop-blur md:p-12">
            {/* Decorative top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-primary/6 blur-3xl" />

            <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60">
                    Pricing policy
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold md:text-3xl">
                  Dynamic, transparent pricing
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Pricing is managed live from the admin dashboard. Final pricing
                  depends on project complexity, timelines, integrations,
                  scalability requirements, and advanced customization. Every
                  engagement starts with a free scoping call.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
                >
                  Get a custom quote
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}