import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchSections, getIcon, listContent, sectionByKey, seoHead, type AnyRecord } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => seoHead("about", "About - Ajmal AT"),
  component: About,
});

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
  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading about...</div>;
  const hero = sectionByKey(data?.sections ?? [], "hero");
  const grouped = (data?.skills ?? []).reduce<Record<string, AnyRecord[]>>((acc, skill) => {
    acc[skill.category] = [...(acc[skill.category] ?? []), skill];
    return acc;
  }, {});

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-6 pt-24">

        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="max-w-4xl">

          {/* Eyebrow */}
          <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-400">
              {hero.eyebrow}
            </p>
          </div>

          {/* Heading */}
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            {hero.heading}
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground md:text-xl">
            {hero.body}
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/projects"
              className="group inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30"
            >
              Explore Projects
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center rounded-xl border border-border/60 bg-background/50 px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/5"
            >
              Let’s Connect
            </Link>
          </div>
        </div>
      </section>

      {/* CAREER JOURNEY */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-12">

          {/* Left Heading */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
                Experience
              </div>

              <h2 className="mt-6 font-display text-4xl font-bold leading-tight md:text-5xl">
                Career Journey
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Building scalable systems, fintech solutions, enterprise applications,
                and modern digital platforms through production-grade engineering.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative lg:col-span-8">
            <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-blue-500/40 via-border to-transparent" />

            <div className="space-y-10">
              {(data?.journey ?? []).map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-3xl border border-border/60 bg-surface/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[39px] top-10 flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/30 bg-background shadow-lg">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  </div>

                  {/* Year */}
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
                    {item.year_range}
                  </p>

                  {/* Role */}
                  <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
                    {item.role_title}
                  </h3>

                  {/* Company */}
                  {item.company_name && (
                    <p className="mt-2 text-sm font-medium text-primary">
                      {item.company_name}
                    </p>
                  )}

                  {/* Description */}
                  <p className="mt-5 leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ENGINEERING PRINCIPLES */}
      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              Mindset
            </div>

            <h2 className="mt-5 font-display text-4xl font-bold md:text-5xl">
              Engineering Principles
            </h2>
          </div>

          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Principles that guide how I design systems, write maintainable code,
            collaborate with teams, and build scalable applications.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(data?.principles ?? []).map((item) => {
            const Icon = getIcon(item.icon);

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-background p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-2xl"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 font-display text-2xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SKILLS */}
      <section className="mx-auto max-w-7xl px-6 pb-28">

        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              Technology Stack
            </div>

            <h2 className="mt-5 font-display text-4xl font-bold md:text-5xl">
              Skills & Technologies
            </h2>
          </div>

          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Modern backend technologies, scalable cloud infrastructure, frontend tools,
            and production-ready engineering ecosystems.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(grouped).map(([category, skills]) => (
            <div
              key={category}
              className="group rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-background p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-2xl"
            >
              {/* Category */}
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-primary">
                {category}
              </div>

              {/* Skills */}
              <div className="mt-6 flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-foreground"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface via-surface/80 to-background p-8 md:p-12 shadow-2xl backdrop-blur-xl">

          {/* Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_35%)]" />

          {/* Decorative Blur */}
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10 max-w-4xl">

            {/* Small Badge */}
            <div className="mb-5 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-400">
              Engineering Philosophy
            </div>

            {/* Heading */}
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Building software that stays{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                scalable
              </span>
              , maintainable, and future-ready.
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              Great software is a long game — invest in clarity, automate the repetitive,
              and respect the next engineer reading your code (usually your future self).
              I collaborate deeply with teams, challenge assumptions early, and deliver
              systems in small, reliable, and scalable iterations.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30"
              >
                Work with me
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to="/projects"
                className="inline-flex items-center rounded-xl border border-border/60 bg-background/50 px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/5"
              >
                View Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
