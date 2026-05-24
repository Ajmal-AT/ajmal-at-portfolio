import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { contentTables, type AnyRecord, type ContentTable, uploadMedia } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentStudio,
});

const db = supabase as any;

// Fields hidden from the edit form (managed by database)
const HIDDEN_FIELDS = new Set([
  "created_at",
  "updated_at",
  "uploaded_at",
  "id",
]);

// Tables that don't use user_id (most content tables)
// The old code was injecting user_id which caused PGRST204 errors
const TABLES_WITH_USER_ID = new Set(["media_assets"]);

// Default empty record templates per table
function emptyRecord(table: ContentTable): AnyRecord {
  const common = { is_active: true, display_order: 0 };
  const templates: Record<string, AnyRecord> = {
    profile_information: {
      full_name: "",
      designation: "",
      professional_title: "",
      bio: "",
      short_intro: "",
      availability_status: "",
      email: "",
      phone: "",
      location: "",
      github_url: "",
      linkedin_url: "",
      instagram_url: "",
      whatsapp_url: "",
      linktree_url: "",
      years_of_experience: 0,
      projects_delivered: 0,
      happy_clients: 0,
      technologies_mastered: 0,
      is_visible: true,
      is_active: true,
    },
    resumes: { title: "", type: "INDIAN", resume_url: "", version: 1, is_active: true },
    skills: { skill_name: "", category: "", proficiency_level: 80, ...common },
    software_services: {
      title: "",
      slug: "",
      starting_price: 0,
      pricing_type: "",
      features: [],
      ...common,
    },
    resume_services: { title: "", starting_price: 0, features: [], delivery_time: "", ...common },
    portfolio_services: {
      title: "",
      starting_price: 0,
      features: [],
      technologies: [],
      ...common,
    },
    projects: {
      title: "",
      slug: "",
      tech_stack: [],
      gallery_images: [],
      featured: false,
      vip_project: false,
      status: "published",
      ...common,
    },
    testimonials: {
      client_name: "",
      review: "",
      rating: 5,
      moderation_status: "approved",
      ...common,
    },
    professional_statistics: {
      roles: [],
      years_of_experience: 0,
      projects_delivered: 0,
      happy_clients: 0,
      technologies_mastered: 0,
      is_active: true,
    },
    technology_stack: { technology_name: "", category: "", proficiency: 80, years_of_usage: 1, ...common },
    seo_configurations: { page_name: "", title: "", keywords: [], structured_data: {}, is_active: true },
    terminal_showcase: { terminal_title: "", commands: [], animation_values: {}, is_active: true },
    featured_services: { icon: "Code2", title: "", pricing_text: "", ...common },
    career_journey: { year_range: "", role_title: "", ...common },
    engineering_principles: { title: "", icon: "Code2", ...common },
    site_sections: { page_name: "", section_key: "", metadata: {}, ...common },
    media_assets: { provider: "supabase", public_url: "", metadata: {}, is_active: true },
  };
  return templates[table] ?? common;
}

/**
 * Cleans the record before sending to Supabase:
 * - Removes hidden fields (id, timestamps)
 * - Removes empty strings / nulls (let DB use defaults)
 * - Does NOT inject user_id unless the table actually has that column
 */
function normalizeRecord(record: AnyRecord): AnyRecord {
  const payload: AnyRecord = {};

  for (const [key, value] of Object.entries(record)) {
    // Never send managed fields
    if (HIDDEN_FIELDS.has(key)) continue;

    // Skip nullish / empty string — let the DB default handle it
    if (value === "" || value === null || value === undefined) continue;

    payload[key] = value;
  }

  return payload;
}

// ─── Field display helpers ────────────────────────────────────────────────────

function isBooleanField(field: string, value: unknown): boolean {
  return (
    typeof value === "boolean" ||
    field.startsWith("is_") ||
    field === "featured" ||
    field === "vip_project"
  );
}

function isLongTextField(field: string): boolean {
  return (
    field.includes("description") ||
    field.includes("intro") ||
    field.includes("bio") ||
    field === "review" ||
    field === "body" ||
    field === "ownership_note"
  );
}

function isMediaField(field: string): boolean {
  return (
    field.includes("image") ||
    field.includes("thumbnail") ||
    field.includes("video_url") ||
    field.includes("public_url") ||
    field.includes("resume_url") ||
    field.includes("logo_url") ||
    field.includes("og_image") ||
    field.includes("media_url")
  );
}

// ─── Editable field component ─────────────────────────────────────────────────

function EditableField({
  field,
  value,
  onChange,
}: {
  field: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const baseInput =
    "w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20";

  // Boolean / toggle
  if (isBooleanField(field, value)) {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
        <div
          onClick={() => onChange(!value)}
          className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-primary" : "bg-white/10"
            }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"
              }`}
          />
        </div>
        <span className="text-sm text-muted-foreground">{value ? "Enabled" : "Disabled"}</span>
      </label>
    );
  }

  // Arrays and objects → JSON textarea
  if (Array.isArray(value) || (value !== null && typeof value === "object")) {
    return (
      <textarea
        value={JSON.stringify(value ?? (Array.isArray(value) ? [] : {}), null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            // keep as string while editing
          }
        }}
        rows={5}
        className={`${baseInput} font-mono text-xs`}
        placeholder="JSON value"
      />
    );
  }

  // Long text
  if (isLongTextField(field)) {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={baseInput}
      />
    );
  }

  // Media / URL with upload button
  return (
    <div className="flex gap-2">
      <input
        value={String(value ?? "")}
        type={typeof value === "number" ? "number" : "text"}
        onChange={(e) =>
          onChange(typeof value === "number" ? Number(e.target.value) : e.target.value)
        }
        className={`${baseInput} min-w-0 flex-1`}
        placeholder={field}
      />
      {isMediaField(field) && (
        <label className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/60 bg-surface/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          <input
            type="file"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                onChange(await uploadMedia(file));
              } catch (err) {
                console.error("Upload failed:", err);
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

// ─── Row display helpers ──────────────────────────────────────────────────────

function rowTitle(row: AnyRecord): string {
  return (
    row.title ??
    row.full_name ??
    row.skill_name ??
    row.technology_name ??
    row.client_name ??
    row.page_name ??
    row.action ??
    String(row.id).slice(0, 8)
  );
}

function rowSubtitle(row: AnyRecord): string {
  return (
    row.short_description ??
    row.meta_description ??
    row.description ??
    row.review ??
    row.slug ??
    row.table_name ??
    row.section_key ??
    row.designation ??
    ""
  );
}

// ─── Toast notification ───────────────────────────────────────────────────────

function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur ${type === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : "border-destructive/30 bg-destructive/10 text-red-300"
        }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <p className="max-w-xs text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function ContentStudio() {
  const qc = useQueryClient();
  const [table, setTable] = useState<ContentTable>("profile_information");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const config = contentTables.find((item) => item.table === table)!;

  const query = useQuery({
    queryKey: ["content-studio", table],
    queryFn: async () => {
      const { data, error } = await db
        .from(table)
        .select("*")
        .order(config.order, { ascending: true });
      if (error) throw error;
      return (data ?? []) as AnyRecord[];
    },
  });

  // ── Save mutation (INSERT or UPDATE) ───────────────────────────────────────
  const save = useMutation({
    mutationFn: async (record: AnyRecord) => {
      const payload = normalizeRecord(record);

      if (record.id) {
        // UPDATE existing row
        const { data, error } = await db
          .from(table)
          .update(payload)
          .eq("id", record.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }

      // INSERT new row
      // Only add user_id for tables that actually have that column
      let enrichedPayload = { ...payload };

      if (TABLES_WITH_USER_ID.has(table)) {
        const {
          data: { session },
          error: sessionError,
        } = await db.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);
        if (!session) throw new Error("You must be logged in.");
        enrichedPayload = { ...enrichedPayload, user_id: session.user.id };
      }

      const { data, error } = await db
        .from(table)
        .insert([enrichedPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    onSuccess: async () => {
      // Close the form and refresh the list
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["content-studio", table] });
      setToast({ type: "success", message: "Record saved successfully." });
      setTimeout(() => setToast(null), 3500);
    },

    onError: (error: Error) => {
      setToast({ type: "error", message: error.message });
      setTimeout(() => setToast(null), 5000);
    },
  });

  // ── Delete mutation ────────────────────────────────────────────────────────
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["content-studio", table] });
      setToast({ type: "success", message: "Record deleted." });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: Error) => {
      setToast({ type: "error", message: error.message });
    },
  });

  // ── Reorder ────────────────────────────────────────────────────────────────
  const move = async (record: AnyRecord, delta: number) => {
    if (typeof record.display_order !== "number") return;
    await db
      .from(table)
      .update({ display_order: record.display_order + delta })
      .eq("id", record.id);
    await qc.invalidateQueries({ queryKey: ["content-studio", table] });
  };

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return query.data ?? [];
    return (query.data ?? []).filter((row) =>
      JSON.stringify(row).toLowerCase().includes(term)
    );
  }, [query.data, search]);

  const fields = editing
    ? Object.keys(editing).filter((f) => !HIDDEN_FIELDS.has(f))
    : [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              // content studio
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Content Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all portfolio data, SEO, ordering and visibility.
          </p>
        </div>

        <button
          onClick={() => setEditing(emptyRecord(table))}
          disabled={config.readonly}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          New Record
        </button>
      </div>

      {/* ── Table selector ── */}
      {/* Desktop: scrollable pill row */}
      <div className="hidden gap-2 overflow-x-auto pb-1 lg:flex">
        {contentTables.map((item) => (
          <button
            key={item.table}
            onClick={() => {
              setTable(item.table);
              setEditing(null);
              setSearch("");
            }}
            className={`shrink-0 rounded-lg border px-3.5 py-2 font-mono text-xs transition-all ${table === item.table
              ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
              : "border-border/50 bg-surface/40 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
          >
            {item.label}
            {table === item.table && (
              <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                {query.data?.length ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile: dropdown */}
      <div className="relative lg:hidden">
        <button
          onClick={() => setTableMenuOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface/60 px-4 py-3 text-sm"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="font-medium">{config.label}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${tableMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {tableMenuOpen && (
          <div className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border/60 bg-surface/95 shadow-xl backdrop-blur">
            {contentTables.map((item) => (
              <button
                key={item.table}
                onClick={() => {
                  setTable(item.table);
                  setEditing(null);
                  setSearch("");
                  setTableMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${table === item.table
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                {item.label}
                {table === item.table && (
                  <span className="font-mono text-xs">{query.data?.length ?? 0} rows</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/40 px-4 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-surface/60">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${config.label.toLowerCase()}…`}
          className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground/40 outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-muted-foreground/40 hover:text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {query.isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 font-mono text-xs text-muted-foreground">loading {config.label.toLowerCase()}…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 py-16 text-center">
          <Database className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {search ? "No matching records" : `No ${config.label.toLowerCase()} yet`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {search
              ? "Try a different search term"
              : `Click "New Record" to add the first entry`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface/60">
                  <th className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    Record
                  </th>
                  <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    Status
                  </th>
                  <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    Order
                  </th>
                  <th className="px-4 py-3.5 text-right font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-white/3"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground/90">{rowTitle(row)}</p>
                      {rowSubtitle(row) && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/60">
                          {rowSubtitle(row)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ${row.is_active === false
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-emerald-500/10 text-emerald-400"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${row.is_active === false ? "bg-rose-400" : "bg-emerald-400"
                            }`}
                        />
                        {row.is_active === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {"display_order" in row ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => move(row, -1)}
                            className="rounded-md border border-border/50 p-1 text-muted-foreground/60 transition-colors hover:border-border hover:text-foreground"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs text-muted-foreground">
                            {row.display_order}
                          </span>
                          <button
                            onClick={() => move(row, 1)}
                            className="rounded-md border border-border/50 p-1 text-muted-foreground/60 transition-colors hover:border-border hover:text-foreground"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(row)}
                          className="rounded-lg border border-border/50 p-2 text-muted-foreground/60 transition-all hover:border-primary/40 hover:text-primary"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={config.readonly}
                          onClick={() => {
                            if (confirm(`Delete "${rowTitle(row)}"?`)) remove.mutate(row.id);
                          }}
                          className="rounded-lg border border-border/50 p-2 text-muted-foreground/60 transition-all hover:border-destructive/40 hover:text-destructive disabled:opacity-30"
                          title="Delete"
                        >
                          {remove.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="divide-y divide-border/40 md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{rowTitle(row)}</p>
                  {rowSubtitle(row) && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground/60">
                      {rowSubtitle(row)}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${row.is_active === false
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-emerald-500/10 text-emerald-400"
                        }`}
                    >
                      {row.is_active === false ? "Inactive" : "Active"}
                    </span>
                    {"display_order" in row && (
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        #{row.display_order}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => setEditing(row)}
                    className="rounded-lg border border-border/50 p-2 text-muted-foreground/60 hover:text-primary"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={config.readonly}
                    onClick={() => {
                      if (confirm(`Delete "${rowTitle(row)}"?`)) remove.mutate(row.id);
                    }}
                    className="rounded-lg border border-border/50 p-2 text-muted-foreground/60 hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit / Create modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[95dvh] w-full max-w-3xl flex-col rounded-t-3xl border border-border/60 bg-background shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  {editing.id ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {editing.id ? "Edit" : "Create"} {config.label}
                  </h2>
                  <p className="font-mono text-[11px] text-muted-foreground/60">
                    {editing.id ? `id: ${String(editing.id).slice(0, 12)}…` : "new record"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-2 text-muted-foreground/60 transition-colors hover:bg-white/6 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {fields.map((field) => {
                  const isWide =
                    isLongTextField(field) ||
                    Array.isArray(editing[field]) ||
                    (editing[field] !== null && typeof editing[field] === "object");

                  return (
                    <label
                      key={field}
                      className={isWide ? "sm:col-span-2" : ""}
                    >
                      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                        {field.replace(/_/g, " ")}
                      </span>
                      <EditableField
                        field={field}
                        value={editing[field]}
                        onChange={(next) =>
                          setEditing((curr) => ({ ...curr, [field]: next }))
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border/60 px-5 py-4">
              <p className="hidden text-xs text-muted-foreground/50 sm:block">
                Arrays / objects → JSON syntax &nbsp;·&nbsp; Empty fields use database defaults
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-border/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => save.mutate(editing)}
                  disabled={save.isPending || config.readonly}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {save.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}