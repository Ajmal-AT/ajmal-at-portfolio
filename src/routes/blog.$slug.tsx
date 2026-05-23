import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Article — Ajmal AT` },
      { property: "og:url", content: `/blog/${params.slug}` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  component: PostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-sm text-primary">← Back to blog</Link>
    </div>
  ),
});

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; cover_url: string | null; tags: string[]; published_at: string | null;
};

function PostPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Post;
    },
  });

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (error || !data) return null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <Link to="/blog" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> All posts
      </Link>
      <h1 className="mt-6 font-display text-4xl font-semibold md:text-5xl">{data.title}</h1>
      <p className="mt-3 text-xs text-muted-foreground">
        {data.published_at ? new Date(data.published_at).toLocaleDateString(undefined, { dateStyle: "long" }) : ""}
        {data.tags.length ? ` · ${data.tags.join(" · ")}` : ""}
      </p>
      {data.cover_url && (
        <img src={data.cover_url} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl border border-border object-cover" />
      )}
      {data.excerpt && <p className="mt-8 text-lg text-muted-foreground">{data.excerpt}</p>}
      <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-base leading-7 text-foreground/90">
        {data.content}
      </div>
    </article>
  );
}
