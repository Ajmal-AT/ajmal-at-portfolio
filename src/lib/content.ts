import {
  BadgeCheck,
  BriefcaseBusiness,
  Code2,
  Cpu,
  Database,
  FileText,
  GitBranch,
  Layers,
  Layout,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type AnyRecord = Record<string, any>;

export const iconMap = {
  BadgeCheck,
  BriefcaseBusiness,
  Code2,
  Cpu,
  Database,
  FileText,
  GitBranch,
  Layers,
  Layout,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
} as const;

export const getIcon = (name?: string | null) =>
  iconMap[(name ?? "Code2") as keyof typeof iconMap] ?? Code2;

export const contentTables = [
  { table: "profile_information", label: "Profile", order: "updated_at", readonly: false },
  { table: "resumes", label: "Resumes", order: "updated_at", readonly: false },
  { table: "skills", label: "Skills", order: "display_order", readonly: false },
  { table: "software_services", label: "Software Services", order: "display_order", readonly: false },
  { table: "resume_services", label: "Resume Services", order: "display_order", readonly: false },
  { table: "portfolio_services", label: "Portfolio Services", order: "display_order", readonly: false },
  { table: "projects", label: "Projects", order: "display_order", readonly: false },
  { table: "testimonials", label: "Testimonials", order: "display_order", readonly: false },
  { table: "professional_statistics", label: "Statistics", order: "updated_at", readonly: false },
  { table: "technology_stack", label: "Technology Stack", order: "display_order", readonly: false },
  { table: "seo_configurations", label: "SEO", order: "page_name", readonly: false },
  { table: "terminal_showcase", label: "Terminal Hero", order: "updated_at", readonly: false },
  { table: "featured_services", label: "Featured Cards", order: "display_order", readonly: false },
  { table: "career_journey", label: "Career Journey", order: "display_order", readonly: false },
  { table: "engineering_principles", label: "Principles", order: "display_order", readonly: false },
  { table: "site_sections", label: "Page Sections", order: "display_order", readonly: false },
  { table: "media_assets", label: "Media Library", order: "created_at", readonly: false },
  { table: "audit_logs", label: "Audit Logs", order: "created_at", readonly: true },
] as const;

export type ContentTable = (typeof contentTables)[number]["table"];

const db = supabase as any;

export async function listContent<T = AnyRecord>(
  table: ContentTable,
  options: { activeOnly?: boolean; limit?: number; order?: string; ascending?: boolean } = {},
) {
  const config = contentTables.find((item) => item.table === table);
  let query = db.from(table).select("*");
  if (options.activeOnly) query = query.eq("is_active", true);
  query = query.order(options.order ?? config?.order ?? "created_at", {
    ascending: options.ascending ?? true,
  });
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function firstActive<T = AnyRecord>(table: ContentTable) {
  const rows = await listContent<T>(table, { activeOnly: true, limit: 1 });
  return rows[0] ?? null;
}

export async function fetchPageSeo(pageName: string) {
  const { data, error } = await db
    .from("seo_configurations")
    .select("*")
    .eq("page_name", pageName)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as AnyRecord | null;
}

export async function fetchSections(pageName: string) {
  const { data, error } = await db
    .from("site_sections")
    .select("*")
    .eq("page_name", pageName)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AnyRecord[];
}

export function sectionByKey(sections: AnyRecord[], key: string) {
  return sections.find((section) => section.section_key === key) ?? {};
}

export function seoHead(pageName: string, fallbackTitle: string) {
  return {
    meta: [
      { title: fallbackTitle },
      { name: "description", content: `Database-managed ${pageName} page for Ajmal AT.` },
      { property: "og:title", content: fallbackTitle },
      { property: "og:url", content: pageName === "home" ? "/" : `/${pageName}` },
    ],
    links: [{ rel: "canonical", href: pageName === "home" ? "/" : `/${pageName}` }],
  };
}

export async function uploadMedia(file: File, folder = "portfolio") {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("User must be logged in to upload media.");

  const key = `${folder}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await (supabase as any)
    .storage
    .from("portfolio-media")   // your bucket name
    .upload(key, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = (supabase as any)
    .storage
    .from("portfolio-media")
    .getPublicUrl(key);

  const publicUrl = data.publicUrl as string;

  await (supabase as any).from("media_assets").insert({
    user_id: session.user.id,
    provider: "supabase",
    asset_type: file.type || "application/octet-stream",
    file_name: file.name,
    public_url: publicUrl,
    storage_path: key,
    is_active: true,
  });

  return publicUrl;
}
