import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Github,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import {
  fetchSections,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/projects")({
  head: () => seoHead("projects", "Projects - Ajmal AT"),
  component: Projects,
});

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function ProjectsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 space-y-6 animate-pulse">
      <div className="h-3 w-24 rounded-full bg-primary/10" />
      <div className="h-14 w-2/3 rounded-xl bg-primary/8" />
      <div className="h-5 w-1/2 rounded-lg bg-primary/6" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-primary/5" />
        ))}
      </div>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function Card({ project, index }: { project: AnyRecord; index: number }) {
  const isFeatured = !!project.featured;
  const isVip = !!project.vip_project;

  return (
    <Reveal delay={index * 0.06}>
      <article
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow ${isFeatured ? "md:col-span-2" : ""
          }`}
      >
        {/* Hover shimmer */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.06),transparent_60%)]" />
        </div>

        {/* Thumbnail */}
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-cyan-500/15 via-primary/8 to-violet-500/15 ${isFeatured ? "h-56 md:h-64" : "h-44"
            }`}
        >
          {project.thumbnail && (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-30" />
          {/* Gradient fade at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/80 to-transparent" />

          {/* Badges row */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="rounded-full border border-border/40 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/70 backdrop-blur">
              {project.category}
            </span>
            <div className="flex items-center gap-1.5">
              {isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 font-mono text-[10px] text-primary backdrop-blur">
                  <Sparkles className="h-2.5 w-2.5" />
                  Featured
                </span>
              )}
              {isVip && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-400 backdrop-blur">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  VIP
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-semibold leading-tight">
            {project.title}
          </h3>
          <p className="mt-2.5 flex-1 text-sm leading-7 text-muted-foreground">
            {project.short_description}
          </p>

          {/* Tech stack */}
          {(project.tech_stack ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(project.tech_stack ?? []).slice(0, 5).map((item: string) => (
                <span
                  key={item}
                  className="rounded-md border border-border/40 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground/80"
                >
                  {item}
                </span>
              ))}
              {(project.tech_stack ?? []).length > 5 && (
                <span className="rounded-md border border-border/40 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground/50">
                  +{(project.tech_stack ?? []).length - 5}
                </span>
              )}
            </div>
          )}

          {/* Links */}
          <div className="mt-5 flex items-center gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground">
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            )}
            <Link
              to="/contact"
              className="ml-auto inline-flex items-center gap-1 text-primary transition-all duration-200 hover:gap-1.5"
            >
              Case study
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects-content"],
    queryFn: async () => {
      const [sections, projects] = await Promise.all([
        fetchSections("projects"),
        listContent("projects", { activeOnly: true, limit: 10 }),
      ]);
      return { sections, projects };
    },
  });

  if (isLoading) return <ProjectsSkeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
        <Reveal>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {hero.eyebrow ?? "Projects"}
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
                Selected <span className="gradient-brand">works</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {hero.body}
          </p>

          {/* Stats row */}
          {(data?.projects ?? []).length > 0 && (
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground/60">
              <span className="font-mono">
                {(data?.projects ?? []).length} projects
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="font-mono">
                {
                  (data?.projects ?? []).filter((p: AnyRecord) => p.featured)
                    .length
                }{" "}
                featured
              </span>
            </div>
          )}
        </Reveal>
      </section>

      {/* ── Projects grid ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        {(data?.projects ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-24 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No projects yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Projects will appear here once added.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(data?.projects ?? []).map((project: AnyRecord, i: number) => (
              <Card key={project.id} project={project} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Interested in working together?
          </p>
          <Link
            to="/contact"
            className="group mt-4 inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03]"
          >
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}