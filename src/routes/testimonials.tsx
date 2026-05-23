import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { fetchSections, listContent, sectionByKey, seoHead } from "@/lib/content";

export const Route = createFileRoute("/testimonials")({
  head: () => seoHead("testimonials", "Testimonials - Ajmal AT"),
  component: Testimonials,
});

function Testimonials() {
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials-content"],
    queryFn: async () => {
      const [sections, testimonials] = await Promise.all([fetchSections("testimonials"), listContent("testimonials", { activeOnly: true })]);
      return { sections, testimonials };
    },
  });
  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading testimonials...</div>;
  const hero = sectionByKey(data?.sections ?? [], "hero");
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20"><p className="font-mono text-xs uppercase tracking-widest text-primary">{hero.eyebrow}</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">{hero.heading}</h1><p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{hero.body}</p></section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(data?.testimonials ?? []).map((item) => <figure key={item.id} className="glass relative flex flex-col rounded-2xl p-6"><Quote className="absolute right-5 top-5 h-6 w-6 text-primary/40" /><div className="flex items-center gap-1 text-primary">{Array.from({ length: item.rating ?? 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div><blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">"{item.review}"</blockquote><figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">{item.client_image ? <img src={item.client_image} alt={item.client_name} className="h-10 w-10 rounded-full object-cover" /> : <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">{item.client_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}</div>}<div className="min-w-0"><p className="flex items-center gap-1.5 truncate text-sm font-medium">{item.client_name}<BadgeCheck className="h-3.5 w-3.5 text-primary" /></p><p className="truncate text-xs text-muted-foreground">{item.company_name}</p></div></figcaption></figure>)}
        </div>
      </section>
    </>
  );
}
