// projects.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  ExternalLink,
  FolderOpen,
  Github,
  Image as ImageIcon,
  Linkedin,
  MapPin,
  Play,
  Sparkles,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Code2,
  Clock,
  Zap,
  CheckCircle2,
  Monitor,
} from "lucide-react";
import {
  fetchSections,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/projects")({
  head: () => seoHead("projects", "Projects - Ajmal AT"),
  component: Projects,
});

// ─── Hero copy fallback ───────────────────────────────────────────────────────
const STATIC_HERO = {
  eyebrow: "// Projects",
  heading: "Selected creative works",
  body: "A curated collection of products I've designed, engineered, and shipped — from hyperlocal delivery platforms to developer tooling. Each project reflects a commitment to clean architecture and thoughtful UX.",
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function ProjectsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 space-y-6 animate-pulse">
      <div className="h-3 w-24 rounded-full bg-primary/10" />
      <div className="h-14 w-2/3 rounded-xl bg-primary/8" />
      <div className="h-5 w-1/2 rounded-lg bg-primary/6" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-primary/5" />
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <Reveal>
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-24 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Projects will appear here once added.
        </p>
      </div>
    </Reveal>
  );
}

// ─── Gallery lightbox ─────────────────────────────────────────────────────────
function GalleryLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`Gallery image ${current + 1}`}
          loading="lazy"
          decoding="async"
          className="w-full max-h-[80vh] object-contain rounded-2xl ring-1 ring-border/40 shadow-2xl"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur ring-1 ring-border/40 hover:ring-primary/40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur ring-1 ring-border/40 hover:ring-primary/40 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === current ? "w-5 bg-primary" : "w-1.5 bg-border/60"
                    }`}
                />
              ))}
            </div>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur ring-1 ring-border/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Video modal ──────────────────────────────────────────────────────────────
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full mx-4 rounded-2xl overflow-hidden ring-1 ring-border/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video src={src} controls autoPlay className="w-full" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function Card({ project, index }: { project: AnyRecord; index: number }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const isFeatured = !!project.featured;
  const isVip = !!project.vip_project;
  const techStack: string[] = project.tech_stack ?? [];
  const galleryImages: string[] = project.gallery_images ?? [];
  const hasGallery = galleryImages.length > 0;
  const hasVideo = !!project.demo_video;

  // Primary display image: thumbnail OR first gallery image
  const heroImage = project.thumbnail || galleryImages[0] || null;

  return (
    <>
      <Reveal delay={index * 0.06}>
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow h-full">

          {/* Hover shimmer */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.06),transparent_60%)]" />
          </div>

          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Thumbnail */}
          <div className="relative h-44 flex-shrink-0 overflow-hidden bg-gradient-to-br from-cyan-500/15 via-primary/8 to-violet-500/15">
            {heroImage ? (
              <img
                src={heroImage}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : null}

            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-30" />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/80 to-transparent" />

            {/* Video play button */}
            {hasVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 text-primary backdrop-blur ring-1 ring-primary/30 shadow-glow hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
              </button>
            )}

            {/* Badges */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="rounded-full border border-border/40 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/70 backdrop-blur">
                {project.category ?? "Project"}
              </span>
              <div className="flex items-center gap-1.5">
                {isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 font-mono text-[10px] text-primary backdrop-blur">
                    <Sparkles className="h-2.5 w-2.5" />
                    Featured
                  </span>
                )}
                {isVip && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-400 backdrop-blur">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gallery strip (if images exist) */}
          {hasGallery && (
            <div className="flex gap-1 px-4 pt-3">
              {galleryImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-border/40 hover:ring-primary/40 transition-all"
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {i === 3 && galleryImages.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm font-mono text-[9px] font-semibold text-foreground">
                      +{galleryImages.length - 4}
                    </div>
                  )}
                </button>
              ))}
              <button
                onClick={() => setLightboxIndex(0)}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border/40 bg-background/40 px-2 py-1 font-mono text-[10px] text-muted-foreground/60 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <ImageIcon className="h-3 w-3" />
                View all
              </button>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col p-6">
            <h3 className="font-display text-xl font-semibold leading-tight line-clamp-2">
              {project.title}
            </h3>

            <p className="mt-2.5 flex-1 text-sm leading-7 text-muted-foreground line-clamp-3">
              {project.short_description}
            </p>

            {/* Client info */}
            {project.client_name && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Briefcase className="h-3 w-3" />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground/60 truncate">
                    {project.client_name}
                  </span>
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                </div>
                {/* ── Client location geo-badge ── */}
                {project.client_location && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-2.5 py-1 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary/70" />
                    </span>
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-primary/60" />
                    <span className="font-mono text-[10px] tracking-wide text-muted-foreground/65">
                      {project.client_location}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Client feedback quote */}
            {project.client_feedback && (
              <div className="mt-3 rounded-xl border border-border/40 bg-background/30 px-4 py-3">
                <p className="font-mono text-[11px] leading-5 text-muted-foreground/70 italic line-clamp-2">
                  "{project.client_feedback}"
                </p>
              </div>
            )}

            {/* Tech stack */}
            {techStack.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {techStack.slice(0, 5).map((item: string) => (
                  <span
                    key={item}
                    className="rounded-md border border-border/40 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground/80"
                  >
                    {item}
                  </span>
                ))}
                {techStack.length > 5 && (
                  <span className="rounded-md border border-border/40 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground/50">
                    +{techStack.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Media action buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {hasVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/8 px-3 py-1.5 font-mono text-[11px] text-primary transition-all hover:bg-primary/15"
                >
                  <Play className="h-3 w-3" />
                  Demo video
                </button>
              )}
              {hasGallery && (
                <button
                  onClick={() => setLightboxIndex(0)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/40 bg-background/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground/70 transition-all hover:border-primary/30 hover:text-primary"
                >
                  <ImageIcon className="h-3 w-3" />
                  {galleryImages.length} screenshot{galleryImages.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>

            {/* Links */}
            <div className="mt-5 flex items-center gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground">
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live demo
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Github className="h-3.5 w-3.5" />
                  Source
                </a>
              )}
              {project.linkedin_url && (
                <a
                  href={project.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              <Link
                to="/contact"
                className="ml-auto inline-flex items-center gap-1 text-primary transition-all duration-200 hover:gap-1.5"
              >
                Case study
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </article>
      </Reveal>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={galleryImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Video modal */}
      {showVideo && project.demo_video && (
        <VideoModal src={project.demo_video} onClose={() => setShowVideo(false)} />
      )}
    </>
  );
}

// ─── Avatar strip ─────────────────────────────────────────────────────────────
function CategoryDot({ label }: { label: string }) {
  const initials = label.slice(0, 2).toUpperCase();
  return (
    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-mono text-[10px] font-semibold text-primary-foreground ring-2 ring-primary/20">
      {initials}
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects-content"],
    queryFn: async () => {
      const [sections, projects] = await Promise.all([
        fetchSections("projects"),
        listContent("projects", { activeOnly: true, limit: 20 }),
      ]);
      return { sections, projects: projects ?? [] };
    },
  });

  if (isLoading) return <ProjectsSkeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");

  const eyebrow = (hero?.eyebrow ?? STATIC_HERO.eyebrow).replace(/^\/\/\s*/, "");
  const heading = hero?.heading ?? STATIC_HERO.heading;
  const body = hero?.body ?? STATIC_HERO.body;

  const projects: AnyRecord[] = data?.projects ?? [];
  const featuredCount = projects.filter((p) => p.featured).length;
  const vipCount = projects.filter((p) => p.vip_project).length;
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <div className="overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-8 max-w-3xl font-display text-5xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
            {(() => {
              const words = String(heading).split(" ");
              const lead = words.slice(0, -2).join(" ");
              const accent = words.slice(-2).join(" ");
              return (
                <>
                  {lead} <span className="gradient-brand">{accent}</span>
                </>
              );
            })()}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {body}
          </p>

          {/* Info pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { Icon: Code2, text: "Clean architecture" },
              { Icon: Zap, text: "Production-grade" },
              { Icon: CheckCircle2, text: "Shipped & live" },
            ].map(({ Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/40 px-4 py-1.5 font-mono text-xs text-muted-foreground"
              >
                <Icon className="h-3 w-3 text-primary" />
                {text}
              </span>
            ))}
          </div>

          {/* Stats strip */}
          {projects.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {/* Category avatars */}
              <div className="flex items-center">
                {categories.slice(0, 5).map((cat, i) => (
                  <div
                    key={cat}
                    className="relative"
                    style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: 5 - i }}
                  >
                    <CategoryDot label={cat} />
                  </div>
                ))}
              </div>
              <div className="h-8 w-px bg-border/40" />
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground/60">
                <span>{projects.length} projects</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{featuredCount} featured</span>
                {vipCount > 0 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-amber-400">{vipCount} VIP</span>
                  </>
                )}
                {categories.length > 0 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>{categories.length} categories</span>
                  </>
                )}
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          PROJECTS GRID
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {projects.map((project, i) => (
              <Card key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/60 p-10 backdrop-blur-xl md:p-14">
            <div className="absolute inset-0 bg-hero opacity-50" />
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
              <div className="hidden shrink-0 md:flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Monitor className="h-9 w-9" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">
                  Your project next
                </p>
                <h2 className="font-display text-2xl font-bold leading-snug md:text-3xl">
                  Ready to build something{" "}
                  <span className="gradient-brand">exceptional</span>?
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-xl">
                  From backend systems to polished interfaces — I build products that scale and
                  delight. Let's turn your idea into reality.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
