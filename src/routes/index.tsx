import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Download,
  Github,
  Linkedin,
  Terminal,
  Sparkles,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import {
  firstActive,
  getIcon,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => seoHead("home", "Ajmal AT - Software Engineer"),
  component: Home,
});

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-32 space-y-6 animate-pulse">
      <div className="h-3 w-28 rounded-full bg-primary/10" />
      <div className="h-16 w-3/4 rounded-xl bg-primary/8" />
      <div className="h-5 w-1/2 rounded-lg bg-primary/6" />
      <div className="flex gap-3 pt-2">
        <div className="h-11 w-36 rounded-xl bg-primary/10" />
        <div className="h-11 w-32 rounded-xl bg-primary/6" />
      </div>
    </div>
  );
}

function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-content"],
    queryFn: async () => {
      const [profile, stats, terminal, featuredServices, stack, sections] =
        await Promise.all([
          firstActive("profile_information"),
          firstActive("professional_statistics"),
          firstActive("terminal_showcase"),
          listContent("featured_services", { activeOnly: true }),
          listContent("technology_stack", { activeOnly: true, limit: 18 }),
          import("@/lib/content").then((m) => m.fetchSections("home")),
        ]);
      return { profile, stats, terminal, featuredServices, stack, sections };
    },
  });

  if (isLoading) return <HomeSkeleton />;

  const profile = data?.profile ?? {};
  const stats = data?.stats ?? {};
  const terminal = data?.terminal ?? {};
  const hero = sectionByKey(data?.sections ?? [], "hero");
  const services = sectionByKey(data?.sections ?? [], "services");
  const stackSection = sectionByKey(data?.sections ?? [], "stack");
  const cta = sectionByKey(data?.sections ?? [], "cta");

  const statCards = [
    { n: stats.years_of_experience, suffix: "+", v: "Years experience" },
    { n: stats.projects_delivered, suffix: "+", v: "Projects delivered" },
    { n: stats.happy_clients, suffix: "+", v: "Happy clients" },
    { n: stats.technologies_mastered, suffix: "+", v: "Technologies" },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-hero">
        {/* Background atmosphere */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute -right-20 top-40 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 md:pt-32">
          <div className="grid items-center gap-16 lg:grid-cols-12">
            {/* ── Left column ── */}
            <div className="lg:col-span-7 animate-fade-up">
              {/* Availability badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-surface/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {profile.availability_status ?? "Available for projects"}
              </div>

              {/* Heading */}
              <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.04] tracking-tight md:text-[4.5rem]">
                {hero.heading ? (
                  <>
                    {String(hero.heading)
                      .split(" ")
                      .slice(0, -2)
                      .join(" ")}{" "}
                    <span className="gradient-brand">
                      {String(hero.heading).split(" ").slice(-2).join(" ")}
                    </span>
                  </>
                ) : (
                  <>
                    Building{" "}
                    <span className="gradient-brand">scalable</span> software
                  </>
                )}
              </h1>

              {/* Roles */}
              {(stats.roles ?? []).length > 0 && (
                <p className="mt-4 font-mono text-sm text-muted-foreground md:text-base">
                  <span className="text-primary/70">{">"}</span>{" "}
                  {(stats.roles ?? []).map((role: string, i: number) => (
                    <span key={role}>
                      {role}
                      {i < (stats.roles ?? []).length - 1 && (
                        <span className="mx-2 text-border">·</span>
                      )}
                    </span>
                  ))}
                </p>
              )}

              {/* Bio */}
              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
                {profile.bio ?? hero.body}
              </p>

              {/* CTA row */}
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to={(hero.cta_url ?? "/contact") as any}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_oklch(0.72_0.18_245/0.45)]"
                >
                  {hero.cta_label ?? "Start a project"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to={(hero.secondary_cta_url ?? "/projects") as any}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-6 py-3 text-sm font-medium backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                >
                  {hero.secondary_cta_label ?? "View projects"}
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-5 py-3 text-sm font-medium backdrop-blur transition-all duration-300 hover:border-border hover:bg-surface/70"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-5 py-3 text-sm font-medium backdrop-blur transition-all duration-300 hover:border-border hover:bg-surface/70"
                >
                  Book call
                </Link>
              </div>

              {/* Social links */}
              <div className="mt-8 flex items-center gap-5 text-xs text-muted-foreground/60">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    <Github className="h-3.5 w-3.5" />
                    {profile.github_url.split("github.com/")[1]}
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    {profile.linkedin_url
                      .replace("https://", "")
                      .replace("www.", "")
                      .split("linkedin.com/in/")[1]
                      ?.replace("/", "")}
                  </a>
                )}
              </div>
            </div>

            {/* ── Right column — terminal ── */}
            <div className="lg:col-span-5 animate-fade-up" style={{ animationDelay: "120ms" }}>
              {/* Terminal window */}
              <div className="glass-strong relative rounded-2xl shadow-card">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-green-400/80" />
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground/50">
                    {terminal.terminal_title ?? "~/portfolio"}
                  </span>
                </div>
                {/* Terminal body */}
                <div className="rounded-b-2xl bg-background/70 p-6 font-mono text-[13px] leading-[1.9]">
                  <p>
                    <span className="text-primary/70">{"→"}</span>{" "}
                    <span className="text-accent">whoami</span>
                  </p>
                  <p className="text-muted-foreground">
                    {terminal.username} —{" "}
                    <span className="text-foreground/80">{terminal.designation}</span>
                  </p>
                  <p className="mt-3">
                    <span className="text-primary/70">{"→"}</span>{" "}
                    <span className="text-accent">cat</span>{" "}
                    <span className="text-foreground/60">stack.json</span>
                  </p>
                  <div className="mt-1 rounded-lg border border-border/30 bg-surface/40 p-3 text-[12px]">
                    <p className="text-muted-foreground/50">{"{"}</p>
                    {[
                      ["backend", terminal.backend_stack],
                      ["frontend", terminal.frontend_stack],
                      ["cloud", terminal.cloud_stack],
                      ["focus", terminal.focus_area],
                    ].map(([k, v]) => (
                      <p key={k} className="pl-4 text-muted-foreground">
                        <span className="text-muted-foreground/60">"{k}"</span>
                        {": "}
                        <span className="text-foreground/90">"{v}"</span>
                        {k !== "focus" ? "," : ""}
                      </p>
                    ))}
                    <p className="text-muted-foreground/50">{"}"}</p>
                  </div>
                  <p className="mt-3">
                    <span className="text-primary/70">{"→"}</span>{" "}
                    <span className="text-accent">deploy</span>{" "}
                    <span className="text-muted-foreground/60">--prod</span>{" "}
                    <span className="text-emerald-400">✓ ok</span>
                  </p>
                  <p className="text-muted-foreground/70">
                    shipped in{" "}
                    <span className="text-primary">{terminal.deploy_speed}</span>
                    <span className="ml-1 inline-block h-3.5 w-[7px] animate-pulse rounded-[1px] bg-primary align-middle" />
                  </p>
                </div>
              </div>

              {/* Floating icon cards */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { Icon: Code2, label: "Code" },
                  { Icon: Cpu, label: "Systems" },
                  { Icon: Database, label: "Data" },
                ].map(({ Icon, label }, i) => (
                  <div
                    key={label}
                    className="glass animate-float rounded-xl p-4 text-center"
                    style={{ animationDelay: `${i * 0.8}s` }}
                  >
                    <Icon className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/50">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 -mt-6 relative z-10">
        <Reveal>
          <div className="grid overflow-hidden rounded-2xl border border-border/60 bg-surface/60 backdrop-blur md:grid-cols-4 md:divide-x md:divide-border/40">
            {statCards.map((s, i) => (
              <div
                key={s.v}
                className="relative p-6 text-center md:py-8"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Subtle top accent on first */}
                {i === 0 && (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                )}
                <div className="font-display text-3xl font-semibold gradient-text md:text-4xl">
                  <Counter to={Number(s.n ?? 0)} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED SERVICES
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        {/* Section header */}
        <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {services.eyebrow ?? "// services"}
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {services.heading ?? "What I build"}
            </h2>
          </div>
          <Link
            to="/services"
            className="group hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            {services.cta_label ?? "All services"}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(data?.featuredServices ?? []).map((item: AnyRecord, i: number) => {
            const Icon = getIcon(item.icon);

            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <Link
                  to="/services"
                  className="group relative block h-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface/90 to-background/70 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl"
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute -left-full top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-1000 group-hover:left-[150%]" />
                  </div>

                  <div className="relative z-10 flex h-full flex-col">

                    {/* Icon */}
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <h3 className="mt-7 font-display text-2xl font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">
                      {item.description}
                    </p>

                    {/* Bottom */}
                    <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-5">

                      {/* Pricing */}
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
                          Starting From
                        </p>

                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {item.pricing_text}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/60 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10">
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            View all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-8 backdrop-blur md:p-12">
            {/* Decorative top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/6 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
                  {stackSection.eyebrow ?? "// tech stack"}
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold md:text-4xl">
                {stackSection.heading ?? "My technology stack"}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-7">
                {stackSection.body}
              </p>

              {/* Tag cloud */}
              <div className="mt-8 flex flex-wrap gap-2">
                {(data?.stack ?? []).map((t: AnyRecord) => (
                  <span
                    key={t.id}
                    className="rounded-lg border border-border/50 bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                  >
                    {t.technology_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/60 p-10 backdrop-blur-xl md:p-16">
            {/* Layered backgrounds */}
            <div className="absolute inset-0 bg-hero opacity-60" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            {/* Orbs */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            {/* Top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                  Let's build together
                </span>
              </div>

              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
                {cta.heading ?? "Ready to start your next project?"}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                {cta.body}
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link
                  to={(cta.cta_url ?? "/contact") as any}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03]"
                >
                  {cta.cta_label ?? "Start a project"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to={(cta.secondary_cta_url ?? "/services") as any}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                >
                  {cta.secondary_cta_label ?? "View services"}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground/60">
                {[
                  { Icon: Lock, text: "NDA on request" },
                  { Icon: Globe, text: "Global clients" },
                  { Icon: Zap, text: "Async-friendly" },
                  { Icon: CheckCircle2, text: "Production focused" },
                ].map(({ Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary/70" />
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}