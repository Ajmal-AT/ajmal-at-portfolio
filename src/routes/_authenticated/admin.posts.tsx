import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  component: AdminPosts,
});

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; cover_url: string | null; tags: string[];
  published: boolean; published_at: string | null;
};

function emptyPost(): Partial<Post> {
  return { slug: "", title: "", excerpt: "", content: "", cover_url: "", tags: [], published: false };
}

function AdminPosts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Post> | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<Post>) => {
      const { data: u } = await supabase.auth.getUser();
      const payload = {
        slug: (p.slug || "").trim().toLowerCase(),
        title: (p.title || "").trim(),
        excerpt: p.excerpt || null,
        content: p.content || "",
        cover_url: p.cover_url || null,
        tags: p.tags ?? [],
        published: !!p.published,
        published_at: p.published ? (p.published_at ?? new Date().toISOString()) : null,
        author_id: u.user?.id ?? null,
      };
      if (p.id) {
        const { error } = await supabase.from("posts").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-posts"] }); setEditing(null); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Blog posts</h1>
          <p className="mt-2 text-sm text-muted-foreground">Write, edit and publish articles.</p>
        </div>
        <button onClick={() => setEditing(emptyPost())}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : !posts?.length ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs ${p.published ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(p)} className="mr-2 rounded-md px-2 py-1 text-xs hover:bg-secondary">Edit</button>
                    <button onClick={() => confirm("Delete this post?") && remove.mutate(p.id)} className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-background/80 p-4 backdrop-blur">
          <div className="my-10 w-full max-w-3xl rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{editing.id ? "Edit post" : "New post"}</h2>
              <button onClick={() => setEditing(null)} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <Input label="Title" value={editing.title || ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Input label="Slug (url)" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
              <Input label="Cover image URL (optional)" value={editing.cover_url || ""} onChange={(v) => setEditing({ ...editing, cover_url: v })} />
              <Input label="Excerpt" value={editing.excerpt || ""} onChange={(v) => setEditing({ ...editing, excerpt: v })} />
              <Input label="Tags (comma separated)" value={(editing.tags || []).join(", ")}
                onChange={(v) => setEditing({ ...editing, tags: v.split(",").map((t) => t.trim()).filter(Boolean) })} />
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Content (markdown supported, basic)</label>
                <textarea rows={14} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 font-mono text-sm outline-none focus:border-primary/60" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published
              </label>
              {save.isError && <p className="text-xs text-destructive">{(save.error as Error).message}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
                <button disabled={save.isPending} onClick={() => save.mutate(editing)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60">
                  {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60" />
    </div>
  );
}
