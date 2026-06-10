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

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://ajmalat.com").replace(
  /\/$/,
  "",
);

const defaultOgImage = `${SITE_URL}/og-image.jpg`;

const seoPages = {
  home: {
    path: "/",
    title: "Ajmal AT | Full Stack Developer",
    description:
      "Full Stack Developer specializing in React, Node.js, scalable SaaS platforms, backend APIs, and modern web applications for growing businesses.",
    keywords: "Full Stack Developer, React Developer, Node.js Developer, SaaS Developer",
    schemaType: "Person",
  },
  about: {
    path: "/about",
    title: "About Ajmal AT | Full Stack Developer",
    description:
      "Learn about Ajmal AT, a full stack developer building scalable web applications, backend systems, cloud integrations, and polished digital products.",
    keywords: "About Ajmal AT, Full Stack Developer India, Software Engineer",
    schemaType: "AboutPage",
  },
  services: {
    path: "/services",
    title: "Web Development Services | Ajmal AT",
    description:
      "Explore web development services for custom websites, SaaS products, backend APIs, portfolios, resumes, and production-ready business applications.",
    keywords: "Web Development Services, React Development Services, SaaS Development",
    schemaType: "Service",
  },
  projects: {
    path: "/projects",
    title: "React Projects Portfolio | Ajmal AT",
    description:
      "Browse selected React, full stack, SaaS, backend, and web application projects designed and engineered by Ajmal AT.",
    keywords: "React Projects Portfolio, Full Stack Projects, Web App Portfolio",
    schemaType: "CollectionPage",
  },
  testimonials: {
    path: "/testimonials",
    title: "Client Testimonials | Ajmal AT",
    description:
      "Read client testimonials and project feedback from people who worked with Ajmal AT on websites, apps, portfolios, resumes, and software products.",
    keywords: "Ajmal AT Testimonials, Developer Reviews, Client Feedback",
    schemaType: "Review",
  },
  resume: {
    path: "/resume",
    title: "Resume | Ajmal AT Full Stack Developer",
    description:
      "View and download Ajmal AT's full stack developer resume, including experience with React, Node.js, backend APIs, cloud, and modern web platforms.",
    keywords: "Ajmal AT Resume, Full Stack Developer Resume, React Developer Resume",
    schemaType: "ProfilePage",
  },
  contact: {
    path: "/contact",
    title: "Hire React Developer | Contact Ajmal AT",
    description:
      "Contact Ajmal AT to hire a React and full stack developer for websites, SaaS products, backend systems, portfolios, resumes, and custom software.",
    keywords: "Hire React Developer, Hire Full Stack Developer, Contact Ajmal AT",
    schemaType: "ContactPage",
  },
} as const;

export const publicRoutes = Object.values(seoPages).map(({ path }) => path);

function absoluteUrl(path: string) {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

function jsonLdForPage(pageName: keyof typeof seoPages) {
  const page = seoPages[pageName];
  const url = absoluteUrl(page.path);
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Ajmal AT",
    url: SITE_URL,
    jobTitle: "Full Stack Developer",
    knowsAbout: ["React", "Node.js", "SaaS development", "Backend APIs", "Web applications"],
  };
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Ajmal AT Portfolio",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#person` },
  };
  const webPage = {
    "@type": page.schemaType,
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
  };

  if (pageName === "services") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        person,
        website,
        webPage,
        {
          "@type": "Service",
          "@id": `${url}#service`,
          name: "Web Development Services",
          provider: { "@id": `${SITE_URL}/#person` },
          areaServed: "Worldwide",
          serviceType: "Full stack web development",
          url,
        },
      ],
    };
  }

  if (pageName === "projects") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        person,
        website,
        webPage,
        {
          "@type": "CreativeWork",
          "@id": `${url}#portfolio`,
          name: "Ajmal AT Project Portfolio",
          creator: { "@id": `${SITE_URL}/#person` },
          url,
        },
      ],
    };
  }

  return { "@context": "https://schema.org", "@graph": [person, website, webPage] };
}

export function seoHead(pageName: keyof typeof seoPages, fallbackTitle?: string) {
  const page = seoPages[pageName];
  const url = absoluteUrl(page.path);
  const title = page.title ?? fallbackTitle;

  return {
    meta: [
      { title },
      { name: "description", content: page.description },
      { name: "keywords", content: page.keywords },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: defaultOgImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Ajmal AT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: defaultOgImage },
      { "script:ld+json": jsonLdForPage(pageName) },
    ],
    links: [{ rel: "canonical", href: url }],
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
