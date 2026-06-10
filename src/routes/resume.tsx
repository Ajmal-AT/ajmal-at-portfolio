// resume.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Sparkles, AlertCircle } from "lucide-react";
import { fetchSections, listContent, sectionByKey, seoHead } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/resume")({
  head: () => seoHead("resume", "Resume - Ajmal AT"),
  component: Resume,
});

// ─── Types ─────────────────────────────────────────────────────────────────

type ResumeRow = {
  id: string;
  title: string;
  type: string;
  resume_url: string;
  thumbnail?: string | null;
  version: number;
  downloads_count: number;
  views_count: number;
  is_active: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const db = supabase as any;

async function incrementCount(
  id: string,
  field: "views_count" | "downloads_count"
): Promise<void> {
  const { data, error: fetchError } = await db
    .from("resumes")
    .select(field)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(`[resume] Failed to fetch ${field}:`, fetchError.message);
    return;
  }

  const current: number = (data as Record<string, number>)[field] ?? 0;

  const { error: updateError } = await db
    .from("resumes")
    .update({ [field]: current + 1 })
    .eq("id", id);

  if (updateError) {
    console.error(`[resume] Failed to increment ${field}:`, updateError.message);
  }
}

// ─── Thumbnail Preview ────────────────────────────────────────────────────
//
// Three states:
//   1. thumbnail   → <img> with hover scale
//   2. resume_url  → <iframe> PDF embed with loading shimmer + error fallback
//   3. neither     → decorative placeholder

type PreviewState = "idle" | "loading" | "ready" | "error";

function ResumeThumbnail({
  title,
  thumbnail,
  resumeUrl,
}: {
  title: string;
  thumbnail?: string | null;
  resumeUrl?: string;
}) {
  const [previewState, setPreviewState] = useState<PreviewState>(
    resumeUrl && !thumbnail ? "loading" : "idle"
  );

  // ── Case 1: thumbnail image ──────────────────────────────────────────
  if (thumbnail) {
    return (
      <div className="group/preview relative overflow-hidden rounded-2xl border border-border/50 bg-background/40">
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover/preview:scale-[1.03]"
          />
        </div>
        {/* subtle gradient overlay at bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/60 to-transparent" />
      </div>
    );
  }

  // ── Case 2: iframe PDF preview ───────────────────────────────────────
  if (resumeUrl) {
    // Append #toolbar=0&view=FitH for a cleaner embedded look
    const embedSrc = `${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/40">
        <div className="relative aspect-[3/4] w-full">

          {/* Loading shimmer — shown until iframe fires onLoad */}
          {previewState === "loading" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/60 backdrop-blur-sm">
              <div className="relative flex h-14 w-14 items-center justify-center">
                {/* spinning ring */}
                <span className="absolute inset-0 animate-spin rounded-full border-2 border-border/40 border-t-primary" />
                <FileText className="h-5 w-5 text-primary/60" />
              </div>
              <div className="space-y-2 text-center">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                  Loading preview
                </p>
                {/* skeleton lines */}
                <div className="mx-auto flex flex-col items-center gap-1.5">
                  {[80, 60, 70].map((w, i) => (
                    <div
                      key={i}
                      style={{ width: `${w}px` }}
                      className="h-1.5 animate-pulse rounded-full bg-primary/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {previewState === "error" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/60 p-6 text-center backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="font-mono text-[11px] text-muted-foreground/60">
                Preview unavailable in this browser.
              </p>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/8 px-3 py-1.5 font-mono text-[11px] text-primary transition-colors hover:bg-primary/15"
              >
                <Eye className="h-3 w-3" />
                Open in new tab
              </a>
            </div>
          )}

          {/* iframe — always rendered so it can fire onLoad / onError */}
          <iframe
            src={embedSrc}
            title={`Preview of ${title}`}
            className={`h-full w-full border-0 transition-opacity duration-500 ${previewState === "ready" ? "opacity-100" : "opacity-0"
              }`}
            onLoad={() => setPreviewState("ready")}
            onError={() => setPreviewState("error")}
          // Some browsers block iframes on cross-origin PDFs; we catch that via onError
          />
        </div>

        {/* "Live preview" badge */}
        {previewState === "ready" && (
          <div className="pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/80 px-2.5 py-1 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" />
            <span className="font-mono text-[10px] text-muted-foreground/70">
              Live preview
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Case 3: neither thumbnail nor URL ────────────────────────────────
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/40">
      <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 p-8 text-center">
        {/* background texture */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-surface/60 text-muted-foreground/40 shadow-inner ring-1 ring-border/30">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold text-foreground/60">
              {title}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground/40">
              Preview not available
            </p>
          </div>
          {/* decorative dashed border hint */}
          <div className="mt-2 flex flex-col items-center gap-1.5">
            {[56, 40, 48].map((w, i) => (
              <div
                key={i}
                style={{ width: `${w}px` }}
                className="h-1 rounded-full bg-border/30"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Resume card ──────────────────────────────────────────────────────────

function ResumeCard({ resume }: { resume: ResumeRow }) {
  const qc = useQueryClient();

  const trackView = useMutation({
    mutationFn: () => incrementCount(resume.id, "views_count"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume-content"] }),
  });

  const trackDownload = useMutation({
    mutationFn: () => incrementCount(resume.id, "downloads_count"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume-content"] }),
  });

  const handleView = () => {
    trackView.mutate();
    window.open(resume.resume_url, "_blank", "noreferrer noopener");
  };

  const handleDownload = async () => {
    trackDownload.mutate();
    try {
      const response = await fetch(resume.resume_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.title.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(resume.resume_url, "_blank", "noreferrer noopener");
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-8 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-glow">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:ring-primary/30">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold">{resume.title}</h2>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground/60">
            {resume.type} format · Version {resume.version}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground/60">
          <Eye className="h-3 w-3" />
          {resume.views_count.toLocaleString()} views
        </span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground/60">
          <Download className="h-3 w-3" />
          {resume.downloads_count.toLocaleString()} downloads
        </span>
      </div>

      {/* ── Smart thumbnail preview ── */}
      <div className="mt-6">
        <ResumeThumbnail
          title={resume.title}
          thumbnail={resume.thumbnail}
          resumeUrl={resume.resume_url}
        />
      </div>

      {/* CTA buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          disabled={trackDownload.isPending}
          className="group/btn inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {trackDownload.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              Downloading…
            </>
          ) : (
            <>
              <Download className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
              Download Resume
            </>
          )}
        </button>

        <button
          onClick={handleView}
          disabled={trackView.isPending}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-5 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
        >
          {trackView.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
              Opening…
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              View Online
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────

function Resume() {
  const { data, isLoading } = useQuery({
    queryKey: ["resume-content"],
    queryFn: async () => {
      const [sections, resumes] = await Promise.all([
        fetchSections("resume"),
        listContent<ResumeRow>("resumes", { activeOnly: true }),
      ]);
      return { sections, resumes };
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded-md bg-primary/8" />
          <div className="h-14 w-2/3 animate-pulse rounded-md bg-primary/8" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded-md bg-primary/8" />
        </div>
      </div>
    );
  }

  const hero = sectionByKey(data?.sections ?? [], "hero");

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-16">
        <div className="max-w-3xl animate-fade-up">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {(hero.eyebrow ?? "Resume").replace(/^\/\/\s*/, "")}
            </span>
          </div>

          <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.1] tracking-tight md:text-7xl">
            {hero.heading ? (
              <>
                {hero.heading.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-brand">
                  {hero.heading.split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                Download my <span className="gradient-brand">Resume</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            {hero.body ??
              "Choose the format that works best for you — optimized for ATS systems and human reviewers alike."}
          </p>
        </div>
      </section>

      {/* ── Resume cards ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        {(data?.resumes ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-24 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No resumes available yet
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {(data?.resumes ?? []).map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
