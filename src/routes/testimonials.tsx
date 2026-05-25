import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Quote,
  Star,
  Sparkles,
  ArrowRight,
  MessageSquareQuote,
} from "lucide-react";
import {
  fetchSections,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/testimonials")({
  head: () => seoHead("testimonials", "Testimonials - Ajmal AT"),
  component: Testimonials,
});

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function TestimonialsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 animate-pulse space-y-6">
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

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 transition-colors ${i < rating
            ? "fill-amber-400 text-amber-400"
            : "fill-border text-border"
            }`}
        />
      ))}
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
        className="h-11 w-11 rounded-full object-cover ring-2 ring-border/60"
      />
    );
  }

  return (
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground ring-2 ring-border/60">
      {initials}
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({
  item,
  index,
  featured = false,
}: {
  item: AnyRecord;
  index: number;
  featured?: boolean;
}) {
  return (
    <Reveal delay={index * 0.07}>
      <figure
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow ${featured ? "md:col-span-2 lg:col-span-1" : ""
          }`}
      >
        {/* Hover shimmer */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.06),transparent_60%)]" />
        </div>

        {/* Top decorative line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Header row: stars + quote icon */}
          <div className="flex items-start justify-between">
            <StarRating rating={item.rating ?? 5} />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary/60 ring-1 ring-primary/15 transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary group-hover:ring-primary/25">
              <Quote className="h-4 w-4" />
            </div>
          </div>

          {/* Review text */}
          <blockquote className="mt-5 flex-1 text-sm leading-[1.9] text-foreground/80">
            "{item.review}"
          </blockquote>

          {/* Project reference */}
          {item.project_reference && (
            <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-border/40 bg-background/40 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
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
                <p className="truncate font-mono text-[11px] text-muted-foreground/60">
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

// ─── Page component ───────────────────────────────────────────────────────────
function Testimonials() {
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

  if (isLoading) return <TestimonialsSkeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");
  const items: AnyRecord[] = data?.testimonials ?? [];

  // Average rating
  const avgRating =
    items.length > 0
      ? (items.reduce((s, t) => s + (t.rating ?? 5), 0) / items.length).toFixed(
        1
      )
      : "5.0";

  return (
    <div className="overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-0 top-0 h-[400px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute right-0 top-10 h-[300px] w-[400px] rounded-full bg-accent/6 blur-[100px]" />
        </div>

        <Reveal>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {hero.eyebrow ?? "Testimonials"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-8 max-w-3xl font-display text-5xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
            {hero.heading ? (
              <>
                {String(hero.heading).split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-brand">
                  {String(hero.heading).split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                What clients{" "}
                <span className="gradient-brand">say</span>
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
                <span className="font-display text-sm font-semibold">
                  {avgRating}
                </span>
                <span className="font-mono text-xs text-muted-foreground/60">
                  from {items.length} reviews
                </span>
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TESTIMONIALS GRID
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {items.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-24 text-center">
              <MessageSquareQuote className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No testimonials yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Client reviews will appear here.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <TestimonialCard
                key={item.id}
                item={item}
                index={i}
              />
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
            {/* Layered backgrounds */}
            <div className="absolute inset-0 bg-hero opacity-50" />
            <div className="absolute inset-0 grid-bg opacity-25" />
            {/* Orbs */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
            {/* Top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
              {/* Big quote icon */}
              <div className="hidden shrink-0 md:flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <MessageSquareQuote className="h-9 w-9" />
              </div>

              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">
                  Your story next
                </p>
                <h2 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
                  Ready to create something{" "}
                  <span className="gradient-brand">exceptional</span> together?
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-xl">
                  Join the growing list of clients who've trusted me to build
                  their products. Let's turn your idea into a polished, scalable
                  reality.
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