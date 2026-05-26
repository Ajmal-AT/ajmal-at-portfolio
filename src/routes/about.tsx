import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSections,
  getIcon,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";
import { ArrowRight, Sparkles, MapPin, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => seoHead("about", "About - Ajmal AT"),
  component: About,
});

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-primary/8 ${className}`} />
  );
}

function AboutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 space-y-8">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <Skeleton className="h-5 w-4/5 max-w-xl" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function About() {
  const { data, isLoading } = useQuery({
    queryKey: ["about-content"],
    queryFn: async () => {
      const [sections, journey, principles, skills] = await Promise.all([
        fetchSections("about"),
        listContent("career_journey", { activeOnly: true }),
        listContent("engineering_principles", { activeOnly: true }),
        listContent("skills", { activeOnly: true }),
      ]);
      return { sections, journey, principles, skills };
    },
  });

  if (isLoading) return <AboutSkeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");
  const grouped = (data?.skills ?? []).reduce<Record<string, AnyRecord[]>>(
    (acc, skill) => {
      acc[skill.category] = [...(acc[skill.category] ?? []), skill];
      return acc;
    },
    {}
  );

  return (
    <div className="overflow-x-hidden">
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-16">
        <div className="max-w-4xl animate-fade-up">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {(hero.eyebrow ?? "About Me").replace(/^\/\/\s*/, "")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-7xl">
            {hero.heading ? (
              <>
                {hero.heading.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-brand">
                  {hero.heading.split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                Engineering{" "}
                <span className="gradient-brand">Thoughtful</span>{" "}
                Software
              </>
            )}
          </h1>

          {/* Body */}
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
            {hero.body}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03]"
            >
              Explore Projects
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/40 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
            >
              Let's Connect
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CAREER JOURNEY
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-20 lg:grid-cols-12">
          {/* Sticky sidebar heading */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                experience
              </span>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Career
                <br />
                <span className="gradient-text">Journey</span>
              </h2>
              <p className="mt-6 text-base leading-7 text-muted-foreground">
                Building scalable systems, fintech solutions, enterprise
                applications, and modern digital platforms through
                production-grade engineering.
              </p>

              {/* Decorative line */}
              <div className="mt-10 h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            </div>
          </div>

          {/* Timeline */}
          <div className="relative lg:col-span-8">
            {/* Vertical rail */}
            <div className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary/40 via-border/40 to-transparent lg:block" />

            <div className="space-y-6">
              {(data?.journey ?? []).map((item, i) => (
                <div
                  key={item.id}
                  className="group relative lg:pl-10"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[-5px] top-7 hidden h-[10px] w-[10px] items-center justify-center lg:flex">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15 transition-all duration-300 group-hover:ring-primary/30" />
                  </div>

                  <div className="glass rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                    {/* Year badge */}
                    <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                      {item.year_range}
                    </span>

                    {/* Role */}
                    <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
                      {item.role_title}
                    </h3>

                    {/* Company */}
                    {item.company_name && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                        {item.company_name}
                      </p>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="mt-5 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ENGINEERING PRINCIPLES
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-accent/8 blur-[100px]" />
        </div>

        {/* Section header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              mindset
            </span>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Engineering
              <br />
              <span className="gradient-text">Principles</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-muted-foreground md:text-right">
            Principles that guide how I design systems, write maintainable
            code, collaborate with teams, and build scalable applications.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(data?.principles ?? []).map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface/40 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow"
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.08),transparent_60%)]" />
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/30">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Number */}
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SKILLS & TECHNOLOGIES
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        {/* Section header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              stack
            </span>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Skills &
              <br />
              <span className="gradient-text">Technologies</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-muted-foreground md:text-right">
            Modern backend technologies, scalable cloud infrastructure,
            frontend tools, and production-ready engineering ecosystems.
          </p>
        </div>

        {/* Category cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(grouped).map(([category, skills]) => (
            <div
              key={category}
              className="group rounded-2xl border border-border/50 bg-surface/40 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow"
            >
              {/* Category label */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/8 px-3 py-1">
                <Zap className="h-3 w-3 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {category}
                </span>
              </div>

              {/* Skill pills */}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-lg border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/8 hover:text-foreground"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          PHILOSOPHY / CTA BANNER
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/60 p-10 shadow-card backdrop-blur-xl md:p-14">
          {/* Background gradient mesh */}
          <div className="absolute inset-0 bg-hero opacity-70" />
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-40" />
          {/* Decorative orbs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                Engineering Philosophy
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              Building software that stays{" "}
              <span className="gradient-brand">scalable</span>,{" "}
              maintainable, and future-ready.
            </h2>

            {/* Body */}
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              Great software is a long game — invest in clarity, automate
              the repetitive, and respect the next engineer reading your
              code (usually your future self). I collaborate deeply with
              teams, challenge assumptions early, and deliver systems in
              small, reliable, and scalable iterations.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03]"
              >
                Work with me
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
              >
                View Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}