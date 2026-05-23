import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Ajmal AT" },
      { name: "description", content: "Notes on software engineering, scalable backends, SaaS architecture and developer craft." },
      { property: "og:title", content: "Blog — Ajmal AT" },
      { property: "og:description", content: "Engineering essays and field notes." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

type Post = { id: string; slug: string; title: string; excerpt: string | null; cover_url: string | null; tags: string[]; published_at: string | null };

function BlogIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, cover_url, tags, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">// writing</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">
          Field notes on <span className="gradient-brand">building software</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">
          Essays, tutorials and lessons from shipping scalable systems.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !data?.length ? (
          <div className="rounded-3xl border border-border bg-surface p-16 text-center">
            <p className="font-display text-2xl">First post coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">Stay tuned — articles will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-primary/40 hover:shadow-glow">
                {p.cover_url && (
                  <div className="aspect-[16/9] overflow-hidden bg-background">
                    <img src={p.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <h2 className="mt-3 font-display text-xl">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}</span>
                    <span className="inline-flex items-center gap-1 text-primary">Read <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
