import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Edit3, Loader2, Plus, Save, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { contentTables, type AnyRecord, type ContentTable, uploadMedia } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentStudio,
});

const db = supabase as any;
const hiddenFields = new Set(["created_at", "updated_at", "uploaded_at", "id"]);

function emptyRecord(table: ContentTable): AnyRecord {
  const common = { is_active: true, display_order: 0 };
  const templates: Record<string, AnyRecord> = {
    profile_information: { full_name: "", designation: "", professional_title: "", bio: "", is_visible: true, is_active: true },
    resumes: { title: "", type: "INDIAN", resume_url: "", version: 1, is_active: true },
    skills: { skill_name: "", category: "", proficiency_level: 80, ...common },
    software_services: { title: "", slug: "", starting_price: 0, pricing_type: "", features: [], ...common },
    resume_services: { title: "", starting_price: 0, features: [], delivery_time: "", ...common },
    portfolio_services: { title: "", starting_price: 0, features: [], technologies: [], ...common },
    projects: { title: "", slug: "", tech_stack: [], gallery_images: [], featured: false, vip_project: false, status: "published", ...common },
    testimonials: { client_name: "", review: "", rating: 5, moderation_status: "approved", ...common },
    professional_statistics: { roles: [], years_of_experience: 0, projects_delivered: 0, happy_clients: 0, technologies_mastered: 0, is_active: true },
    technology_stack: { technology_name: "", category: "", proficiency: 80, years_of_usage: 1, ...common },
    seo_configurations: { page_name: "", title: "", keywords: [], structured_data: {}, is_active: true },
    terminal_showcase: { terminal_title: "", commands: [], animation_values: {}, is_active: true },
    featured_services: { icon: "Code2", title: "", pricing_text: "", ...common },
    career_journey: { year_range: "", role_title: "", ...common },
    engineering_principles: { title: "", icon: "Code2", ...common },
    site_sections: { page_name: "", section_key: "", metadata: {}, ...common },
    media_assets: { provider: "cloudinary", public_url: "", metadata: {}, is_active: true },
  };
  return templates[table] ?? common;
}

function normalizeRecord(record: AnyRecord) {
  const payload = { ...record };
  for (const key of Object.keys(payload)) {
    if (hiddenFields.has(key)) delete payload[key];
    if (payload[key] === "") payload[key] = null;
  }
  return payload;
}

function EditableField({
  field,
  value,
  onChange,
}: {
  field: string;
  value: any;
  onChange: (next: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const isLong = field.includes("description") || field.includes("intro") || field.includes("bio") || field === "review" || field === "body";
  const isMedia = field.includes("image") || field.includes("thumbnail") || field.includes("video") || field.includes("url") || field.includes("resume");

  if (typeof value === "boolean" || field.startsWith("is_") || field === "featured" || field === "vip_project") {
    return (
      <label className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(event) => onChange(event.target.checked)} />
        Enabled
      </label>
    );
  }

  if (Array.isArray(value) || (value && typeof value === "object")) {
    return (
      <textarea
        value={JSON.stringify(value ?? (Array.isArray(value) ? [] : {}), null, 2)}
        onChange={(event) => {
          try {
            onChange(JSON.parse(event.target.value));
          } catch {
            onChange(event.target.value);
          }
        }}
        className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs"
      />
    );
  }

  return (
    <div className="flex gap-2">
      {isLong ? (
        <textarea
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value ?? ""}
          type={typeof value === "number" ? "number" : "text"}
          onChange={(event) => onChange(typeof value === "number" ? Number(event.target.value) : event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      )}
      {isMedia && (
        <label className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          <input
            type="file"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                onChange(await uploadMedia(file));
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}

function ContentStudio() {
  const qc = useQueryClient();
  const [table, setTable] = useState<ContentTable>("profile_information");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const config = contentTables.find((item) => item.table === table)!;

  const query = useQuery({
    queryKey: ["content-studio", table],
    queryFn: async () => {
      const { data, error } = await db.from(table).select("*").order(config.order, { ascending: true });
      if (error) throw error;
      return (data ?? []) as AnyRecord[];
    },
  });

  const save = useMutation({
    mutationFn: async (record: AnyRecord) => {
      const payload = normalizeRecord(record);
      if (record.id) {
        const { error } = await db.from(table).update(payload).eq("id", record.id);
        if (error) throw error;
      } else {
        const { error } = await db.from(table).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["content-studio", table] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["content-studio", table] }),
  });

  const move = async (record: AnyRecord, delta: number) => {
    if (typeof record.display_order !== "number") return;
    await db.from(table).update({ display_order: record.display_order + delta }).eq("id", record.id);
    await qc.invalidateQueries({ queryKey: ["content-studio", table] });
  };

  const rows = useMemo(() => {
    const term = search.toLowerCase();
    return (query.data ?? []).filter((row) => JSON.stringify(row).toLowerCase().includes(term));
  }, [query.data, search]);

  const fields = editing ? Object.keys(editing).filter((field) => !hiddenFields.has(field)) : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">// content studio</p>
          <h1 className="mt-1 font-display text-3xl">Enterprise Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage portfolio content, SEO, media, ordering and publication state from the database.</p>
        </div>
        <button
          onClick={() => setEditing(emptyRecord(table))}
          disabled={config.readonly}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> New record
        </button>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {contentTables.map((item) => (
          <button
            key={item.table}
            onClick={() => {
              setTable(item.table);
              setEditing(null);
            }}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs ${table === item.table ? "border-primary bg-primary/10 text-foreground" : "border-border bg-surface text-muted-foreground"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="flex-1 bg-transparent text-sm outline-none" />
      </div>

      {query.isLoading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Record</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.title ?? row.full_name ?? row.skill_name ?? row.technology_name ?? row.client_name ?? row.page_name ?? row.action ?? row.id}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{row.short_description ?? row.meta_description ?? row.description ?? row.review ?? row.slug ?? row.table_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${row.is_active === false ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                        {row.is_active === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {"display_order" in row ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => move(row, -1)} className="rounded-md border border-border p-1"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center font-mono text-xs">{row.display_order}</span>
                          <button onClick={() => move(row, 1)} className="rounded-md border border-border p-1"><ArrowDown className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(row)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"><Edit3 className="h-4 w-4" /></button>
                        <button disabled={config.readonly} onClick={() => remove.mutate(row.id)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-destructive disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 p-4 backdrop-blur">
          <div className="mx-auto flex max-h-[92vh] max-w-4xl flex-col rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-display text-xl">{editing.id ? "Edit" : "Create"} {config.label}</h2>
                <p className="text-xs text-muted-foreground">Arrays and objects use JSON syntax.</p>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-md p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 overflow-y-auto p-5 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field} className={field.includes("description") || field.includes("intro") || field === "review" ? "md:col-span-2" : ""}>
                  <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{field}</span>
                  <EditableField field={field} value={editing[field]} onChange={(next) => setEditing((current) => ({ ...current, [field]: next }))} />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => save.mutate(editing)} disabled={save.isPending || config.readonly} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
