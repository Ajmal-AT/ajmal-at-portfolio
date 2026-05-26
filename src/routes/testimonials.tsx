// testimonials.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  MessageSquareQuote,
  Quote,
  Send,
  Sparkles,
  Star,
  ArrowRight,
  User,
  Building2,
  Mail,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import {
  fetchSections,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/testimonials")({
  head: () => seoHead("testimonials", "Testimonials - Ajmal AT"),
  component: Testimonials,
});

// ─── Zod schema ───────────────────────────────────────────────────────────────
const testimonialSchema = z.object({
  client_name: z.string().min(2, "Name must be at least 2 characters").max(80),
  client_email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  company_name: z.string().max(80).optional().or(z.literal("")),
  project_reference: z.string().max(120).optional().or(z.literal("")),
  rating: z.number().min(1).max(5),
  review: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(1000, "Review cannot exceed 1000 characters"),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function TestimonialsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 space-y-6 animate-pulse">
      <div className="h-3 w-28 rounded-full bg-primary/10" />
      <div className="h-14 w-2/3 rounded-xl bg-primary/8" />
      <div className="h-5 w-1/2 rounded-lg bg-primary/6" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-primary/5" />
        ))}
      </div>
    </div>
  );
}

// ─── Star rating display ──────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 transition-colors ${i < rating ? "fill-amber-400 text-amber-400" : "fill-border/40 text-border/40"
            }`}
        />
      ))}
    </div>
  );
}

// ─── Interactive star picker ──────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform duration-100 hover:scale-110"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-7 w-7 transition-colors duration-150 ${filled ? "fill-amber-400 text-amber-400" : "fill-border/30 text-border/40"
                }`}
            />
          </button>
        );
      })}
      <span className="ml-2 font-mono text-xs text-muted-foreground/60">
        {hover || value ? `${hover || value}/5` : "Select rating"}
      </span>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, image }: { name: string; image?: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-11 w-11 rounded-full object-cover ring-2 ring-border/50"
      />
    );
  }
  return (
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20">
      {initials}
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({
  item,
  index,
}: {
  item: AnyRecord;
  index: number;
}) {
  return (
    <Reveal delay={index * 0.06}>
      <figure className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow">
        {/* Hover shimmer */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.06),transparent_60%)]" />
        </div>
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Stars + quote icon */}
          <div className="flex items-start justify-between">
            <StarRating rating={item.rating ?? 5} />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary/50 ring-1 ring-primary/12 transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary">
              <Quote className="h-4 w-4" />
            </div>
          </div>

          {/* Review */}
          <blockquote className="mt-5 flex-1 text-sm leading-[1.9] text-foreground/80">
            "{item.review}"
          </blockquote>

          {/* Project tag */}
          {item.project_reference && (
            <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-border/40 bg-background/40 px-3 py-1.5">
              <Briefcase className="h-3 w-3 text-primary/50" />
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {item.project_reference}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="my-5 h-px bg-gradient-to-r from-border/50 via-border/20 to-transparent" />

          {/* Author */}
          <figcaption className="flex items-center gap-3">
            <Avatar name={item.client_name} image={item.client_image} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                {item.client_name}
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              </p>
              {item.company_name && (
                <p className="truncate font-mono text-[11px] text-muted-foreground/55">
                  {item.company_name}
                </p>
              )}
            </div>
          </figcaption>
        </div>
      </figure>
    </Reveal>
  );
}

// ─── Submission form ──────────────────────────────────────────────────────────
function SubmitTestimonialForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");

  const submit = useMutation({
    mutationFn: async (data: TestimonialForm) => {
      const { error } = await (supabase as any)
        .from("testimonials")
        .insert([
          {
            client_name: data.client_name,
            client_email: data.client_email || null,
            company_name: data.company_name || null,
            project_reference: data.project_reference || null,
            rating: data.rating,
            review: data.review,
            moderation_status: "pending", // pending review by admin
            is_active: false, // hidden until admin approves
          },
        ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      reset();
      onSuccess();
    },
  });

  const inputClass =
    "w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/35 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/12 focus:bg-background/70";

  return (
    <form
      onSubmit={handleSubmit((data) => submit.mutate(data))}
      className="space-y-5"
    >
      {/* Name + Company */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            <User className="h-3 w-3" />
            Your name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("client_name")}
            placeholder="John Smith"
            className={inputClass}
          />
          {errors.client_name && (
            <p className="text-[11px] text-destructive">{errors.client_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            <Building2 className="h-3 w-3" />
            Company
          </label>
          <input
            {...register("company_name")}
            placeholder="Acme Inc. (optional)"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email + Project */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            <Mail className="h-3 w-3" />
            Email
          </label>
          <input
            {...register("client_email")}
            type="email"
            placeholder="you@example.com (optional)"
            className={inputClass}
          />
          {errors.client_email && (
            <p className="text-[11px] text-destructive">{errors.client_email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            <Briefcase className="h-3 w-3" />
            Project / Service
          </label>
          <input
            {...register("project_reference")}
            placeholder="e.g. Portfolio Website (optional)"
            className={inputClass}
          />
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
          <Star className="h-3 w-3" />
          Rating <span className="text-destructive">*</span>
        </label>
        <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3.5">
          <StarPicker
            value={rating}
            onChange={(n) => setValue("rating", n, { shouldValidate: true })}
          />
        </div>
        {errors.rating && (
          <p className="text-[11px] text-destructive">Please select a rating</p>
        )}
      </div>

      {/* Review */}
      <div className="space-y-1.5">
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            <MessageSquare className="h-3 w-3" />
            Your review <span className="text-destructive">*</span>
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/40">
            {watch("review")?.length ?? 0}/1000
          </span>
        </label>
        <textarea
          {...register("review")}
          rows={5}
          placeholder="Share your experience working with Ajmal. What was the project? What made the collaboration great? Would you recommend?"
          className={`${inputClass} resize-none leading-relaxed`}
        />
        {errors.review && (
          <p className="text-[11px] text-destructive">{errors.review.message}</p>
        )}
      </div>

      {/* Error */}
      {submit.isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {submit.error instanceof Error
            ? submit.error.message
            : "Something went wrong. Please try again."}
        </div>
      )}

      {/* Note */}
      <p className="font-mono text-[10px] text-muted-foreground/40">
        * Your review will be visible after moderation (usually within 24h). Email is never published.
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={submit.isPending}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submit.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Review
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
function Testimonials() {
  const qc = useQueryClient();
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials-content"],
    queryFn: async () => {
      const [sections, testimonials] = await Promise.all([
        fetchSections("testimonials"),
        listContent("testimonials", { activeOnly: true }),
      ]);
      return { sections, testimonials };
    },
  });

  const handleSuccess = () => {
    setSubmitted(true);
    qc.invalidateQueries({ queryKey: ["testimonials-content"] });
  };

  if (isLoading) return <TestimonialsSkeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");
  const items: AnyRecord[] = data?.testimonials ?? [];

  const avgRating =
    items.length > 0
      ? (items.reduce((s, t) => s + (t.rating ?? 5), 0) / items.length).toFixed(1)
      : "5.0";

  return (
    <div className="overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {(hero.eyebrow ?? "Client Stories").replace(/^\/\/\s*/, "")}
            </span>
          </div>

          <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[1.06] tracking-tight md:text-7xl">
            {hero.heading ? (
              <>
                {String(hero.heading).split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-brand">
                  {String(hero.heading).split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                What clients <span className="gradient-brand">say</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {hero.body ??
              "Real feedback from clients who trusted me to deliver their projects."}
          </p>

          {/* Social proof strip */}
          {items.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {/* Stacked avatars */}
              <div className="flex items-center">
                {items.slice(0, 5).map((t, i) => (
                  <div
                    key={t.id}
                    className="relative"
                    style={{ marginLeft: i === 0 ? 0 : "-10px", zIndex: 5 - i }}
                  >
                    <Avatar name={t.client_name} image={t.client_image} />
                  </div>
                ))}
                {items.length > 5 && (
                  <div
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/80 font-mono text-[10px] text-muted-foreground backdrop-blur"
                    style={{ marginLeft: "-10px", zIndex: 0 }}
                  >
                    +{items.length - 5}
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-border/40" />

              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={5} />
                <span className="font-display text-sm font-semibold">{avgRating}</span>
                <span className="font-mono text-xs text-muted-foreground/55">
                  from {items.length} review{items.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TESTIMONIALS GRID
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        {items.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-20 text-center">
              <MessageSquareQuote className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No testimonials yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/55">
                Be the first to leave a review below.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <TestimonialCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SUBMIT TESTIMONIAL
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            {/* Left — intro */}
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
                <MessageSquareQuote className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                  Share Your Experience
                </span>
              </div>

              <h2 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
                Worked with me?{" "}
                <span className="gradient-brand">Tell the world.</span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Your honest feedback helps other clients make informed decisions and
                helps me improve. Takes less than 2 minutes.
              </p>

              {/* What happens next */}
              <div className="mt-8 space-y-3">
                {[
                  "Your review is submitted for moderation",
                  "Approved reviews go live within 24 hours",
                  "Your email is never shown publicly",
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] text-primary">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-7 backdrop-blur md:p-8">
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              {submitted ? (
                /* Success state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">
                    Thank you!
                  </h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                    Your review has been submitted and will appear after moderation.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-5 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                  >
                    Submit another review
                  </button>
                </div>
              ) : (
                <SubmitTestimonialForm onSuccess={handleSuccess} />
              )}
            </div>
          </div>
        </Reveal>
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
                <MessageSquareQuote className="h-9 w-9" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">
                  Your story next
                </p>
                <h2 className="font-display text-2xl font-bold leading-snug md:text-3xl">
                  Ready to create something{" "}
                  <span className="gradient-brand">exceptional</span> together?
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-xl">
                  Join the growing list of clients who've trusted me to build their
                  products. Let's turn your idea into a polished, scalable reality.
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