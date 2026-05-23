import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import { fetchSections, listContent, sectionByKey, seoHead, type AnyRecord } from "@/lib/content";

export const Route = createFileRoute("/projects")({
  head: () => seoHead("projects", "Projects - Ajmal AT"),
  component: Projects,
});

function Card({ project }: { project: AnyRecord }) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-primary/40 hover:shadow-glow ${project.featured ? "md:col-span-2" : ""}`}>
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cyan-500/20 via-primary/10 to-violet-500/20">
        {project.thumbnail && <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-widest text-foreground/80">{project.category}</span>{project.vip_project && <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">VIP</span>}</div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl">{project.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{project.short_description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">{(project.tech_stack ?? []).map((item: string) => <span key={item} className="rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{item}</span>)}</div>
        <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
          {project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /> Live demo</a>}
          {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground"><Github className="h-3.5 w-3.5" /> Source</a>}
          <Link to="/contact" className="ml-auto inline-flex items-center gap-1.5 text-primary hover:underline">Case study</Link>
        </div>
      </div>
    </article>
  );
}

function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects-content"],
    queryFn: async () => {
      const [sections, projects] = await Promise.all([fetchSections("projects"), listContent("projects", { activeOnly: true, limit: 10 })]);
      return { sections, projects };
    },
  });
  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading projects...</div>;
  const hero = sectionByKey(data?.sections ?? [], "hero");
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20"><p className="font-mono text-xs uppercase tracking-widest text-primary">{hero.eyebrow}</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">{hero.heading}</h1><p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{hero.body}</p></section>
      <section className="mx-auto max-w-7xl px-6 py-16"><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{(data?.projects ?? []).map((project) => <Card key={project.id} project={project} />)}</div></section>
    </>
  );
}
