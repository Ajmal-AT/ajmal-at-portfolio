import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText } from "lucide-react";
import { fetchSections, listContent, sectionByKey, seoHead } from "@/lib/content";

export const Route = createFileRoute("/resume")({
  head: () => seoHead("resume", "Resume - Ajmal AT"),
  component: Resume,
});

function Resume() {
  const { data, isLoading } = useQuery({
    queryKey: ["resume-content"],
    queryFn: async () => {
      const [sections, resumes] = await Promise.all([fetchSections("resume"), listContent("resumes", { activeOnly: true })]);
      return { sections, resumes };
    },
  });
  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading resumes...</div>;
  const hero = sectionByKey(data?.sections ?? [], "hero");
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20"><p className="font-mono text-xs uppercase tracking-widest text-primary">{hero.eyebrow}</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">{hero.heading}</h1><p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{hero.body}</p></section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {(data?.resumes ?? []).map((resume) => <div key={resume.id} className="rounded-3xl border border-border bg-surface p-8"><div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary/20 text-primary"><FileText className="h-5 w-5" /></div><h2 className="mt-5 font-display text-2xl">{resume.title}</h2><p className="mt-2 text-sm text-muted-foreground">{resume.type} format / version {resume.version}</p><div className="mt-6 rounded-xl border border-border bg-background/40 p-4"><div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-background">{resume.thumbnail ? <img src={resume.thumbnail} alt={resume.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center p-6 text-center"><div><FileText className="mx-auto h-10 w-10 text-primary/60" /><p className="mt-3 font-display text-lg">Ajmal AT</p><p className="text-xs text-muted-foreground">{resume.title}</p></div></div>}</div></div><div className="mt-6 flex flex-wrap gap-3"><a href={resume.resume_url} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"><Download className="h-4 w-4" /> Download</a><a href={resume.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium"><Eye className="h-4 w-4" /> View online</a></div></div>)}
        </div>
      </section>
    </>
  );
}
