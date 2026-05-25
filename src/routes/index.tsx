import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Code2, Cpu, Database, Download, Github, Linkedin, Terminal } from "lucide-react";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { firstActive, getIcon, listContent, sectionByKey, seoHead, type AnyRecord } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => seoHead("home", "Ajmal AT - Software Engineer"),
  component: Home,
});

function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-content"],
    queryFn: async () => {
      const [profile, stats, terminal, featuredServices, stack, sections] = await Promise.all([
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

  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading portfolio...</div>;

  const profile = data?.profile ?? {};
  const stats = data?.stats ?? {};
  const terminal = data?.terminal ?? {};
  const hero = sectionByKey(data?.sections ?? [], "hero");
  const services = sectionByKey(data?.sections ?? [], "services");
  const stackSection = sectionByKey(data?.sections ?? [], "stack");
  const cta = sectionByKey(data?.sections ?? [], "cta");
  const statCards = [
    { n: stats.years_of_experience, suffix: "+", v: "Years of experience" },
    { n: stats.projects_delivered, suffix: "+", v: "Projects delivered" },
    { n: stats.happy_clients, suffix: "+", v: "Happy clients" },
    { n: stats.technologies_mastered, suffix: "+", v: "Technologies mastered" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
                {profile.availability_status}
              </div>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">{hero.heading}</h1>

              <p className="mt-3 font-mono text-sm text-muted-foreground md:text-base">
                <span className="text-primary">{">"}</span>{" "}
                {(stats.roles ?? []).map((role: string, index: number) => (
                  <span key={role}>{role}{index < stats.roles.length - 1 && <span className="mx-2 text-muted-foreground/60">·</span>}</span>
                ))}
              </p>

              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">{profile.bio ?? hero.body}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={(hero.cta_url ?? "/contact") as any} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">{hero.cta_label}<ArrowRight className="h-4 w-4" /></Link>
                <Link to={(hero.secondary_cta_url ?? "/projects") as any} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium"> {hero.secondary_cta_label}</Link>
                <Link to="/resume" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium"><Download className="h-4 w-4" /> Resume</Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium">Book Consultation</Link>
              </div>

              <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    {profile.github_url.split("github.com/")[1]}
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    {profile.linkedin_url
                      .replace("https://", "")
                      .replace("www.", "")
                      .split("linkedin.com/in/")[1]
                      ?.replace("/", "")}
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 animate-fade-up">
              <div className="glass-strong relative rounded-2xl p-1 shadow-card">
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" /><span className="h-3 w-3 rounded-full bg-yellow-400/80" /><span className="h-3 w-3 rounded-full bg-green-400/80" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">{terminal.terminal_title}</span>
                </div>
                <div className="rounded-xl bg-background/80 p-5 font-mono text-[13px] leading-7">
                  <p><span className="text-primary">-&gt;</span> <span className="text-accent">whoami</span></p>
                  <p className="text-muted-foreground">{terminal.username} - {terminal.designation}</p>
                  <p className="mt-2"><span className="text-primary">-&gt;</span> <span className="text-accent">cat</span> stack.json</p>
                  <p className="text-muted-foreground">{"{"}</p>
                  <p className="pl-4 text-muted-foreground">"backend": <span className="text-foreground">"{terminal.backend_stack}"</span>,</p>
                  <p className="pl-4 text-muted-foreground">"frontend": <span className="text-foreground">"{terminal.frontend_stack}"</span>,</p>
                  <p className="pl-4 text-muted-foreground">"cloud": <span className="text-foreground">"{terminal.cloud_stack}"</span>,</p>
                  <p className="pl-4 text-muted-foreground">"focus": <span className="text-foreground">"{terminal.focus_area}"</span></p>
                  <p className="text-muted-foreground">{"}"}</p>
                  <p className="mt-2"><span className="text-primary">-&gt;</span> <span className="text-accent">deploy</span> --prod <span className="text-foreground">ok</span></p>
                  <p className="text-muted-foreground">shipped in <span className="text-primary">{terminal.deploy_speed}</span> <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary align-middle" /></p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">{[Code2, Cpu, Database].map((I, i) => <div key={i} className="glass animate-float rounded-xl p-4 text-center"><I className="mx-auto h-5 w-5 text-primary" /></div>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <Reveal className="grid divide-border rounded-2xl border border-border bg-surface/60 backdrop-blur md:grid-cols-4 md:divide-x">
          {statCards.map((s) => <div key={s.v} className="p-6 text-center md:py-8"><div className="font-display text-3xl font-semibold gradient-text md:text-4xl"><Counter to={Number(s.n ?? 0)} suffix={s.suffix} /></div><div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</div></div>)}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div><p className="font-mono text-xs uppercase tracking-widest text-primary">{services.eyebrow}</p><h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">{services.heading}</h2></div>
          <Link to="/services" className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex">{services.cta_label}</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(data?.featuredServices ?? []).map((item: AnyRecord) => {
            const Icon = getIcon(item.icon);
            return <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-glow"><div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary/20 text-primary"><Icon className="h-5 w-5" /></div><h3 className="mt-5 font-display text-xl">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.description}</p><p className="mt-4 font-mono text-xs text-primary">{item.pricing_text}</p></div>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-surface/60 p-8 md:p-12">
          <div className="flex items-center gap-2"><Terminal className="h-4 w-4 text-primary" /><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{stackSection.eyebrow}</p></div>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-4xl">{stackSection.heading}</h2>
          <div className="mt-8 flex flex-wrap gap-2">{(data?.stack ?? []).map((t: AnyRecord) => <span key={t.id} className="rounded-md border border-border bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">{t.technology_name}</span>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface to-background p-10 text-center md:p-16">
          <div className="relative"><h2 className="font-display text-3xl font-semibold md:text-5xl">{cta.heading}</h2><p className="mx-auto mt-4 max-w-xl text-muted-foreground">{cta.body}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to={(cta.cta_url ?? "/contact") as any} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow">{cta.cta_label}<ArrowRight className="h-4 w-4" /></Link><Link to={(cta.secondary_cta_url ?? "/services") as any} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium">{cta.secondary_cta_label}</Link></div><div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">{["NDA on request", "Async-friendly", "Global clients", "Production focused"].map((x) => <span key={x} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {x}</span>)}</div></div>
        </div>
      </section>
    </>
  );
}