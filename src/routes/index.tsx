import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Download,
  Github,
  Linkedin,
  Terminal,
  Sparkles,
  Zap,
  Globe,
  Lock,
  Star,
  Users,
  Briefcase,
  Layers,
} from "lucide-react";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import {
  firstActive,
  getIcon,
  listContent,
  sectionByKey,
  seoHead,
  type AnyRecord,
} from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => seoHead("home", "Ajmal AT — Software Engineer & Tech Consultant"),
  component: Home,
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-32 space-y-8 animate-pulse">
      <div className="h-5 w-40 rounded-full bg-primary/10" />
      <div className="space-y-3">
        <div className="h-20 w-4/5 rounded-2xl bg-primary/8" />
        <div className="h-20 w-3/5 rounded-2xl bg-primary/6" />
      </div>
      <div className="h-5 w-2/3 rounded-lg bg-primary/6" />
      <div className="flex gap-3 pt-4">
        <div className="h-12 w-40 rounded-xl bg-primary/10" />
        <div className="h-12 w-36 rounded-xl bg-primary/6" />
      </div>
    </div>
  );
}

// ─── Animated grid background ─────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary glow */}
      <div className="absolute -left-60 -top-20 h-[700px] w-[700px] rounded-full bg-primary/8 blur-[160px]" />
      <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-accent/6 blur-[140px]" />
      <div className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* Scan line effect */}
      <div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        style={{ top: "30%" }}
      />
    </div>
  );
}

// ─── Floating tech pill ────────────────────────────────────────────────────────
function TechPill({
  label,
  delay = 0,
}: {
  label: string;
  delay?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/60 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur hover:border-primary/30 hover:text-foreground transition-colors cursor-default"
    >
      <span className="h-1 w-1 rounded-full bg-primary/60" />
      {label}
    </motion.span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  n,
  suffix,
  label,
  icon: Icon,
  delay,
}: {
  n: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface/40 p-6 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:bg-surface/60 hover:-translate-y-1">
        {/* Corner glow */}
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/8 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="font-display text-4xl font-bold gradient-text tabular-nums">
            <Counter to={n} suffix={suffix} />
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
            {label}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────────
function ServiceCard({
  item,
  index,
}: {
  item: AnyRecord;
  index: number;
}) {
  const Icon = getIcon(item.icon);

  return (
    <Reveal delay={index * 0.07}>
      <Link
        to="/services"
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface/80 via-surface/50 to-background/60 p-7 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl"
      >
        {/* Animated background glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-all duration-700 group-hover:opacity-100">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-accent/8 blur-3xl" />
        </div>

        {/* Shine sweep */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -left-full top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/4 to-transparent transition-all duration-1000 group-hover:left-[160%]" />
        </div>

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Icon */}
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-[0_0_20px_oklch(0.72_0.18_245/0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_oklch(0.72_0.18_245/0.3)]">
            <Icon className="h-6 w-6" />
          </div>

          {/* Title */}
          <h3 className="mt-6 font-display text-xl font-semibold leading-snug tracking-tight text-foreground">
            {item.title}
          </h3>

          {/* Description */}
          <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground/80">
            {item.description}
          </p>

          {/* Bottom */}
          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                From
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground/90">
                {item.pricing_text}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground/50 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

// ─── Tech stack marquee ────────────────────────────────────────────────────────
function StackMarquee({ items }: { items: AnyRecord[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex gap-3 py-2"
        style={{
          animation: "marquee 30s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((t, i) => (
          <span
            key={`${t.id}-${i}`}
            className="shrink-0 rounded-xl border border-border/40 bg-surface/40 px-4 py-2.5 font-mono text-xs text-muted-foreground/70 backdrop-blur transition-colors hover:border-primary/30 hover:text-foreground cursor-default"
          >
            {t.technology_name}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 60]);

  const { data, isLoading } = useQuery({
    queryKey: ["home-content"],
    queryFn: async () => {
      const [profile, stats, terminal, featuredServices, stack, sections] =
        await Promise.all([
          firstActive("profile_information"),
          firstActive("professional_statistics"),
          firstActive("terminal_showcase"),
          listContent("featured_services", { activeOnly: true }),
          listContent("technology_stack", { activeOnly: true, limit: 24 }),
          import("@/lib/content").then((m) => m.fetchSections("home")),
        ]);
      return { profile, stats, terminal, featuredServices, stack, sections };
    },
  });

  if (isLoading) return <HomeSkeleton />;

  const profile = data?.profile ?? {};
  const stats = data?.stats ?? {};
  const terminal = data?.terminal ?? {};
  const hero = sectionByKey(data?.sections ?? [], "hero");
  const services = sectionByKey(data?.sections ?? [], "services");
  const stackSection = sectionByKey(data?.sections ?? [], "stack");
  const cta = sectionByKey(data?.sections ?? [], "cta");

  const statCards = [
    { n: stats.years_of_experience ?? 0, suffix: "+", label: "Years experience", icon: Briefcase },
    { n: stats.projects_delivered ?? 0, suffix: "+", label: "Projects delivered", icon: Layers },
    { n: stats.happy_clients ?? 0, suffix: "+", label: "Happy clients", icon: Users },
    { n: stats.technologies_mastered ?? 0, suffix: "+", label: "Technologies", icon: Cpu },
  ];

  // Parse roles from stats
  const roles: string[] = stats.roles ?? [];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[95vh] overflow-hidden">
        <GridBackground />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 md:pt-32 lg:pt-36"
        >
          <div className="grid items-center gap-16 lg:grid-cols-12">
            {/* ── Left ── */}
            <div className="lg:col-span-7">
              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 inline-flex items-center gap-3 rounded-full border border-border/60 bg-surface/50 px-4 py-2 text-xs text-muted-foreground backdrop-blur"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span>{profile.availability_status ?? "Available for projects"}</span>
                {profile.location && (
                  <>
                    <span className="h-3 w-px bg-border/60" />
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {profile.location}
                    </span>
                  </>
                )}
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[3.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[4.5rem] lg:text-[5.5rem]"
              >
                {hero.heading ? (
                  <>
                    <span className="text-foreground">
                      {String(hero.heading).split(" ").slice(0, -2).join(" ")}{" "}
                    </span>
                    <span className="gradient-brand">
                      {String(hero.heading).split(" ").slice(-2).join(" ")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-foreground">Building </span>
                    <span className="gradient-brand">scalable</span>
                    <span className="text-foreground"> software</span>
                  </>
                )}
              </motion.h1>

              {/* Roles ticker */}
              {roles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="mt-5 flex flex-wrap items-center gap-2"
                >
                  {roles.map((role, i) => (
                    <span key={role} className="flex items-center gap-2">
                      {i > 0 && <span className="h-1 w-1 rounded-full bg-border/70" />}
                      <span className="font-mono text-sm text-muted-foreground">{role}</span>
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Bio */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-xl text-base leading-8 text-muted-foreground md:text-lg"
              >
                {profile.bio ?? hero.body}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <Link
                  to={(hero.cta_url ?? "/contact") as any}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_oklch(0.72_0.18_245/0.5)]"
                >
                  {hero.cta_label ?? "Start a project"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to={(hero.secondary_cta_url ?? "/projects") as any}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-6 py-3.5 text-sm font-medium backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                >
                  {hero.secondary_cta_label ?? "View projects"}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-surface/40 px-5 py-3.5 text-sm font-medium text-muted-foreground backdrop-blur transition-all duration-300 hover:border-border hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </Link>
              </motion.div>

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-9 flex flex-wrap items-center gap-5"
              >
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    <Github className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    {profile.github_url.split("github.com/")[1]}
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    {profile.linkedin_url
                      .replace("https://", "")
                      .replace("www.", "")
                      .split("linkedin.com/in/")[1]
                      ?.replace("/", "")}
                  </a>
                )}
                {/* Star badge */}
                <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 font-mono text-[10px] text-amber-400 md:inline-flex">
                  <Star className="h-3 w-3 fill-current" />
                  Top-rated freelancer
                </span>
              </motion.div>
            </div>

            {/* ── Right: Terminal ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              {/* Terminal card */}
              <div className="relative">
                {/* Glow behind terminal */}
                <div className="absolute -inset-4 rounded-3xl bg-primary/8 blur-2xl" />

                <div className="glass-strong relative rounded-2xl shadow-card">
                  {/* Title bar */}
                  <div className="flex items-center gap-2.5 border-b border-border/40 px-5 py-4">
                    <span className="h-3 w-3 rounded-full bg-red-400/70 ring-1 ring-red-400/30" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400/70 ring-1 ring-yellow-400/30" />
                    <span className="h-3 w-3 rounded-full bg-green-400/70 ring-1 ring-green-400/30" />
                    <div className="ml-3 flex items-center gap-1.5">
                      <Terminal className="h-3 w-3 text-muted-foreground/40" />
                      <span className="font-mono text-[11px] text-muted-foreground/40">
                        {terminal.terminal_title ?? "~/portfolio"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="rounded-b-2xl bg-background/60 p-6 font-mono text-[12.5px] leading-[2]">
                    <p>
                      <span className="text-muted-foreground/40">❯</span>{" "}
                      <span className="text-primary">whoami</span>
                    </p>
                    <p className="pl-2 text-muted-foreground/70">
                      {terminal.username}{" "}
                      <span className="text-muted-foreground/40">·</span>{" "}
                      <span className="text-foreground/80">{terminal.designation}</span>
                    </p>

                    <p className="mt-1">
                      <span className="text-muted-foreground/40">❯</span>{" "}
                      <span className="text-primary">cat</span>{" "}
                      <span className="text-muted-foreground/50">stack.config</span>
                    </p>

                    <div className="my-2 rounded-lg border border-border/25 bg-surface/30 p-3 text-[11.5px]">
                      {[
                        { key: "backend", val: terminal.backend_stack },
                        { key: "frontend", val: terminal.frontend_stack },
                        { key: "cloud", val: terminal.cloud_stack },
                        { key: "focus", val: terminal.focus_area },
                      ].map(({ key, val }, i, arr) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-muted-foreground/40">
                            {i === 0 ? "┌" : i === arr.length - 1 ? "└" : "├"}
                          </span>
                          <span className="text-muted-foreground/50">{key}</span>
                          <span className="text-muted-foreground/30">→</span>
                          <span className="text-foreground/80">{val}</span>
                        </div>
                      ))}
                    </div>

                    <p>
                      <span className="text-muted-foreground/40">❯</span>{" "}
                      <span className="text-primary">deploy</span>{" "}
                      <span className="text-muted-foreground/40">--env production</span>
                    </p>
                    <p className="pl-2">
                      <span className="text-emerald-400">✓ deployed</span>{" "}
                      <span className="text-muted-foreground/50">in</span>{" "}
                      <span className="text-primary">{terminal.deploy_speed}</span>
                      <span className="ml-1 inline-block h-3.5 w-[6px] animate-pulse rounded-[1px] bg-primary/80 align-middle" />
                    </p>
                  </div>
                </div>

                {/* Floating icon badges */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { Icon: Code2, label: "Clean Code" },
                    { Icon: Cpu, label: "Scalable" },
                    { Icon: Database, label: "Data-First" },
                  ].map(({ Icon, label }, i) => (
                    <motion.div
                      key={label}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 4,
                        delay: i * 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="glass rounded-xl p-3.5 text-center"
                    >
                      <Icon className="mx-auto h-4.5 w-4.5 text-primary" />
                      <p className="mt-1.5 font-mono text-[10px] leading-none text-muted-foreground/50">
                        {label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tech pill cloud */}
              <div className="mt-5 flex flex-wrap gap-2">
                {(data?.stack ?? []).slice(0, 8).map((t: AnyRecord, i: number) => (
                  <TechPill key={t.id} label={t.technology_name} delay={0.5 + i * 0.04} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED SERVICES
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        {/* Header */}
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {services.eyebrow ?? "// services"}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              {services.heading?.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text">
                {services.heading?.split(" ").at(-1) ?? "build"}
              </span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              {services.body}
            </p>
          </div>
          <Link
            to="/services"
            className="group hidden items-center gap-2 rounded-xl border border-border/60 bg-surface/40 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground md:inline-flex"
          >
            View all services
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Cards grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(data?.featuredServices ?? []).map((item: AnyRecord, i: number) => (
            <ServiceCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            View all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TECH STACK — MARQUEE
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/30 py-10 backdrop-blur">
            {/* Top bar with label */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/40" />
              <div className="flex items-center gap-2 rounded-full border border-border/50 bg-surface/60 px-4 py-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60">
                  {stackSection.eyebrow ?? "tech stack"}
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/40" />
            </div>

            <h2 className="mb-8 text-center font-display text-2xl font-semibold md:text-3xl">
              {stackSection.heading ?? "Technologies I work with"}
            </h2>

            {(data?.stack ?? []).length > 0 && (
              <StackMarquee items={data?.stack ?? []} />
            )}

            {/* Bottom note */}
            <p className="mt-8 text-center font-mono text-[11px] text-muted-foreground/40">
              {(data?.stack ?? []).length}+ technologies · production-grade · battle-tested
            </p>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/50 p-10 backdrop-blur-xl md:p-16">
            {/* Layered backgrounds */}
            <div className="absolute inset-0 bg-hero opacity-70" />
            <div className="absolute inset-0 grid-bg opacity-25" />
            {/* Orbs */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
            {/* Top shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-5 py-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
                  Let's build together
                </span>
              </div>

              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                {cta.heading ?? "Ready to start your next project?"}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                {cta.body}
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  to={(cta.cta_url ?? "/contact") as any}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03]"
                >
                  {cta.cta_label ?? "Start a project"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to={(cta.secondary_cta_url ?? "/services") as any}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-8 py-4 text-sm font-medium transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                >
                  {cta.secondary_cta_label ?? "View services"}
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground/50">
                {[
                  { Icon: Lock, text: "NDA on request" },
                  { Icon: Globe, text: "Global clients" },
                  { Icon: Zap, text: "Async-friendly" },
                  { Icon: CheckCircle2, text: "Production focused" },
                ].map(({ Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-primary/60" />
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}