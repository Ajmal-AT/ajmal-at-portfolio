import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Sparkles } from "lucide-react";
import { fetchSections, listContent, sectionByKey, seoHead } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";

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
  // Fetch current value then increment — compatible with any Supabase plan
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
    // Trigger native download via temporary anchor
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
      // Fallback: open in new tab
      window.open(resume.resume_url, "_blank", "noreferrer noopener");
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-8 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-glow">
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

      {/* Thumbnail preview */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border/50 bg-background/40">
        <div className="aspect-[3/4] w-full">
          {resume.thumbnail ? (
            <img
              src={resume.thumbnail}
              alt={resume.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="relative flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
              <div className="relative z-10">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                  <FileText className="h-7 w-7" />
                </div>
                <p className="font-display text-xl font-semibold">Ajmal AT</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground/60">{resume.title}</p>
              </div>
            </div>
          )}
        </div>
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
      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
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
            {hero.body ?? "Choose the format that works best for you — optimized for ATS systems and human reviewers alike."}
          </p>
        </div>
      </section>

      {/* ── Resume cards ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        {(data?.resumes ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-24 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">No resumes available yet</p>
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