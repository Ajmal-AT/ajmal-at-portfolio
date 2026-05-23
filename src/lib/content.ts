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
  { table: "profile_information", label: "Profile", order: "updated_at" },
  { table: "resumes", label: "Resumes", order: "updated_at" },
  { table: "skills", label: "Skills", order: "display_order" },
  { table: "software_services", label: "Software Services", order: "display_order" },
  { table: "resume_services", label: "Resume Services", order: "display_order" },
  { table: "portfolio_services", label: "Portfolio Services", order: "display_order" },
  { table: "projects", label: "Projects", order: "display_order" },
  { table: "testimonials", label: "Testimonials", order: "display_order" },
  { table: "professional_statistics", label: "Statistics", order: "updated_at" },
  { table: "technology_stack", label: "Technology Stack", order: "display_order" },
  { table: "seo_configurations", label: "SEO", order: "page_name" },
  { table: "terminal_showcase", label: "Terminal Hero", order: "updated_at" },
  { table: "featured_services", label: "Featured Cards", order: "display_order" },
  { table: "career_journey", label: "Career Journey", order: "display_order" },
  { table: "engineering_principles", label: "Principles", order: "display_order" },
  { table: "site_sections", label: "Page Sections", order: "display_order" },
  { table: "media_assets", label: "Media Library", order: "created_at" },
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
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) throw new Error("Cloudinary upload failed");
    const payload = await response.json();
    await db.from("media_assets").insert({
      provider: "cloudinary",
      asset_type: file.type || "application/octet-stream",
      file_name: file.name,
      public_url: payload.secure_url,
      metadata: payload,
      is_active: true,
    });
    return payload.secure_url as string;
  }

  const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await db.storage.from("portfolio-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = db.storage.from("portfolio-media").getPublicUrl(path);
  await db.from("media_assets").insert({
    provider: "supabase",
    asset_type: file.type || "application/octet-stream",
    file_name: file.name,
    public_url: data.publicUrl,
    storage_path: path,
    is_active: true,
  });
  return data.publicUrl as string;
}
