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
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">{hero.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">{hero.heading}</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{hero.body}</p>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5"><h2 className="font-display text-2xl md:text-3xl">Career journey</h2></div>
          <ol className="relative space-y-6 border-l border-border pl-6 lg:col-span-7">
            {(data?.journey ?? []).map((item) => <li key={item.id} className="relative"><span className="absolute -left-[31px] mt-1 inline-flex h-3 w-3 rounded-full bg-gradient-primary ring-4 ring-background" /><p className="font-mono text-xs text-primary">{item.year_range}</p><h3 className="mt-1 font-display text-lg">{item.role_title}</h3>{item.company_name && <p className="text-xs text-muted-foreground">{item.company_name}</p>}<p className="text-sm text-muted-foreground">{item.description}</p></li>)}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-display text-2xl md:text-3xl">Engineering principles</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(data?.principles ?? []).map((item) => {
            const Icon = getIcon(item.icon);
            return <div key={item.id} className="glass rounded-2xl p-6"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-4 font-display text-lg">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>;
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-display text-2xl md:text-3xl">Skills & technologies</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([category, skills]) => <div key={category} className="rounded-2xl border border-border bg-surface p-6"><h3 className="font-mono text-xs uppercase tracking-widest text-primary">{category}</h3><div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill.id} className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">{skill.skill_name}</span>)}</div></div>)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-surface/60 p-8 md:p-12">
          <h2 className="font-display text-2xl md:text-3xl">Work with Ajmal AT</h2>
          <Link to="/contact" className="mt-6 inline-flex rounded-lg bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">Start a project</Link>
        </div>
      </section>
    </>
  );
}
