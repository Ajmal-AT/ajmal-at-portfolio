// contact.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Link2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  Zap,
  Phone,
} from "lucide-react";

import { useProfileInformation } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { listContent, seoHead, type AnyRecord } from "@/lib/content";
import { formatUSD } from "@/routes/services";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("contact", "Contact - Ajmal AT"),
  component: Contact,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const USD_TO_INR = Number(import.meta.env.VITE_USD_TO_INR_RATE || 100.41);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callEdge<T = unknown>(
  fn: string,
  body: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  try {
    console.log("🚀 Calling Edge Function:", fn);
    console.log("📦 Request Body:", body);

    const { data, error } = await supabase.functions.invoke<T>(fn, { body });
    console.log("📥 Response Data:", data);
    console.log("⚠️ Response Error:", error);

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}

// ─── Field primitives ─────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:bg-background/80";

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  badge,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          {label}
        </label>
        {badge}
      </div>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  loading,
}: {
  label: string;
  name: string;
  options: string[];
  loading?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
        {label}
      </label>
      <select name={name} disabled={loading} className={inputClass}>
        {loading ? (
          <option value="">Loading…</option>
        ) : (
          <>
            <option value="">Select…</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}

// ─── Email Verification Block ─────────────────────────────────────────────────

function EmailVerificationBlock({
  email,
  setEmail,
  otp,
  setOtp,
  otpSent,
  verified,
  otpLoading,
  verifyLoading,
  resendCooldown,
  error,
  info,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
}: {
  email: string;
  setEmail: (v: string) => void;
  otp: string;
  setOtp: (v: string) => void;
  otpSent: boolean;
  verified: boolean;
  otpLoading: boolean;
  verifyLoading: boolean;
  resendCooldown: number;
  error: string | null;
  info: string | null;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${verified ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary"}`}>
          {verified ? <CheckCircle2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/90 leading-tight">
            Email Verification
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-0.5">
            {verified ? "Identity confirmed" : "Required before submitting"}
          </p>
        </div>
        {verified && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/12 border border-emerald-500/20 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Verified
          </span>
        )}
      </div>

      {/* Email row */}
      <div className="space-y-1.5">
        <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          Email address <span className="text-destructive/70">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            disabled={verified}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`${inputClass} min-w-0 flex-1 ${verified ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          <button
            type="button"
            onClick={otpSent && !verified ? onResendOtp : onSendOtp}
            disabled={otpLoading || verified || !email}
            className="inline-flex min-w-[110px] items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-surface/60 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {otpLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : verified ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Verified</span>
              </>
            ) : otpSent ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Resend
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send code
              </>
            )}
          </button>
        </div>
      </div>

      {/* OTP input — shown after code sent, before verified */}
      {otpSent && !verified && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
              Enter the 6-digit code sent to your inbox
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="· · · · · ·"
                className={`${inputClass} flex-1 text-center font-mono tracking-[0.5em] text-base`}
                autoFocus
              />
              <button
                type="button"
                onClick={onVerifyOtp}
                disabled={verifyLoading || otp.length < 6}
                className="inline-flex min-w-[110px] items-center justify-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              >
                {verifyLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resend hint */}
          <p className="font-mono text-[11px] text-muted-foreground/50">
            Didn't receive it?{" "}
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground/40">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={onResendOtp}
                className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                <RefreshCw className="h-3 w-3" />
                Resend code
              </button>
            )}
          </p>
        </div>
      )}

      {/* Info / success message */}
      {info && (
        <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${verified
          ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
          : "border-primary/20 bg-primary/8 text-primary"
          }`}>
          {info}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive leading-relaxed">
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function Contact() {
  const { data: profile } = useProfileInformation();

  // ── Fetch services from DB ──────────────────────────────────────────────
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["contact-services"],
    queryFn: async () => {
      const [software, resumes, portfolios] = await Promise.all([
        listContent<AnyRecord>("software_services", { activeOnly: true }),
        listContent<AnyRecord>("resume_services", { activeOnly: true }),
        listContent<AnyRecord>("portfolio_services", { activeOnly: true }),
      ]);
      return [...software, ...portfolios, ...resumes].sort(
        (a, b) => Number(a.starting_price ?? 0) - Number(b.starting_price ?? 0)
      );
    },
  });

  const serviceOptions = (servicesData ?? []).map((s) => {
    const usd = Number(s.starting_price ?? 0);
    const inr = Math.round(usd * USD_TO_INR);
    const priceLabel =
      usd > 0
        ? `From ${formatUSD(usd)} (≈ ₹${inr.toLocaleString("en-IN")})`
        : "Custom Quote";
    return `${s.title} — ${priceLabel}`;
  });

  const budgetRanges: [number, number | null][] = [
    [1, 10], [10, 50], [50, 150], [150, 500],
    [500, 1000], [1000, 5000], [5000, null],
  ];

  const budgetOptions = budgetRanges.map(([min, max]) => {
    const minUSD = formatUSD(min);
    const maxUSD = max ? formatUSD(max) : null;
    const minINR = Math.round(min * USD_TO_INR).toLocaleString("en-IN");
    const maxINR = max ? Math.round(max * USD_TO_INR).toLocaleString("en-IN") : null;
    return max
      ? `${minUSD} – ${maxUSD} (≈ ₹${minINR} – ₹${maxINR})`
      : `${minUSD}+ (≈ ₹${minINR}+)`;
  });

  // ── Form state ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function startCooldown(seconds = 60) {
    setResendCooldown(seconds);
    const id = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  const sendOtp = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setError(null);
    setInfo(null);
    setOtpLoading(true);
    const { error } = await callEdge("send-contact-otp", { email });
    setOtpLoading(false);
    if (error) { setError(error); return; }
    setOtpSent(true);
    setInfo(`Verification code sent to ${email}. Expires in 5 minutes.`);
    startCooldown(60);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtp("");
    setInfo(null);
    setError(null);
    await sendOtp();
  };

  const verifyOtp = async () => {
    if (!otp) { setError("Enter the verification code."); return; }
    setError(null);
    setVerifyLoading(true);
    const { data, error } = await callEdge<{ token: string }>(
      "verify-contact-otp",
      { email, otp }
    );
    setVerifyLoading(false);
    if (error) { setError(error); return; }
    setVerificationToken(data?.token ?? null);
    setVerified(true);
    setInfo("Email verified. You can now send your inquiry.");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verified || !verificationToken) {
      setSubmitError("Please verify your email first.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email,
      phone: String(fd.get("phone") || "").trim() || null,
      service: String(fd.get("service") || "") || null,
      budget: String(fd.get("budget") || "") || null,
      type: String(fd.get("type") || "") || null,
      timeline: String(fd.get("timeline") || "") || null,
      message: String(fd.get("message") || "").trim(),
      verification_token: verificationToken,
    };
    setSubmitError(null);
    setLoading(true);
    const { error } = await callEdge("submit-contact-inquiry", payload);
    setLoading(false);
    if (error) { setSubmitError(error); return; }
    setSent(true);
    form.reset();
    setOtp("");
    setEmail("");
    setOtpSent(false);
    setVerified(false);
    setVerificationToken(null);
    setInfo(null);
  };

  const channels = [
    { href: profile?.whatsapp_url, Icon: MessageCircle, label: "WhatsApp", sub: profile?.phone },
    { href: profile?.email ? `mailto:${profile.email}` : undefined, Icon: Mail, label: "Email", sub: profile?.email },
    { href: profile?.linkedin_url, Icon: Linkedin, label: "LinkedIn", sub: profile?.linkedin_url },
    { href: profile?.github_url, Icon: Github, label: "GitHub", sub: profile?.github_url },
    { href: profile?.instagram_url, Icon: Instagram, label: "Instagram", sub: profile?.instagram_url },
    { href: profile?.linktree_url, Icon: Link2, label: "Linktree", sub: profile?.linktree_url },
  ].filter((item) => item.href);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-16">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Contact</span>
          </div>
          <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.1] tracking-tight md:text-7xl">
            Start a project{" "}
            <span className="gradient-brand">together</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            {profile?.availability_status ??
              "Available for freelance projects. Share your requirements and get a tailored proposal within 24 hours."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { Icon: Clock, text: "≤ 24h response" },
              { Icon: Zap, text: "IST timezone" },
              { Icon: CheckCircle2, text: "NDA on request" },
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
        </div>
      </section>

      {/* ── Form + Sidebar ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ── Inquiry form ──────────────────────────────────────────────── */}
          {sent ? (
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/60 p-12 text-center backdrop-blur">
              <div className="pointer-events-none absolute inset-0 bg-hero opacity-40" />
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
              <div className="relative z-10">
                <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="font-display text-3xl font-semibold">Inquiry sent!</h2>
                <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
                  I'll respond within 24 hours with scope, pricing, and next steps.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-5 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                >
                  Send another inquiry <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="rounded-3xl border border-border/60 bg-surface/40 p-7 backdrop-blur md:p-8 space-y-6"
            >
              {/* Form header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
                    project inquiry
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Tell me about your project</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verify your email first, then fill in your project details.
                </p>
              </div>

              {/* ── Step 1: Email verification (TOP) ── */}
              <EmailVerificationBlock
                email={email}
                setEmail={(v) => {
                  setEmail(v);
                  if (otpSent) {
                    setOtpSent(false);
                    setOtp("");
                    setVerified(false);
                    setVerificationToken(null);
                    setInfo(null);
                    setError(null);
                  }
                }}
                otp={otp}
                setOtp={setOtp}
                otpSent={otpSent}
                verified={verified}
                otpLoading={otpLoading}
                verifyLoading={verifyLoading}
                resendCooldown={resendCooldown}
                error={error}
                info={info}
                onSendOtp={sendOtp}
                onVerifyOtp={verifyOtp}
                onResendOtp={resendOtp}
              />

              {/* ── Step 2: Project details (locked until verified) ── */}
              <div className={`space-y-5 transition-all duration-300 ${!verified ? "opacity-40 pointer-events-none select-none" : "opacity-100"}`}>
                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                    Project details
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                {/* Name + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    name="name"
                    required
                    placeholder="Your name"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
                        Phone number
                      </label>
                      <span className="inline-flex items-center rounded-full border border-border/50 bg-surface/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
                        Optional
                      </span>
                    </div>
                    <div className="flex gap-0 rounded-xl border border-border/60 bg-background/60 overflow-hidden focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
                      <span className="inline-flex items-center gap-1.5 border-r border-border/40 bg-surface/40 px-3 text-muted-foreground/50">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="font-mono text-xs">+</span>
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="91 98765 43210"
                        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Service */}
                <SelectField
                  label="Service needed"
                  name="service"
                  options={serviceOptions}
                  loading={servicesLoading}
                />

                {/* Budget + Type */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Estimated budget"
                    name="budget"
                    options={budgetOptions}
                  />
                  <SelectField
                    label="Project type"
                    name="type"
                    options={[
                      "Resume / LinkedIn Optimization",
                      "Developer Portfolio",
                      "Business Website",
                      "Custom Web Application",
                      "SaaS Platform",
                      "Backend API System",
                      "Enterprise Dashboard",
                      "Automation Platform",
                      "Admin Panel",
                      "Cloud Infrastructure",
                    ]}
                  />
                </div>

                {/* Timeline */}
                <SelectField
                  label="Preferred timeline"
                  name="timeline"
                  options={[
                    "1 Week",
                    "2 – 4 Weeks",
                    "1 – 2 Months",
                    "2 – 4 Months",
                    "4+ Months",
                    "Flexible Timeline",
                  ]}
                />

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
                    Project details <span className="text-destructive/70">*</span>
                  </label>
                  <textarea
                    name="message"
                    required={verified}
                    rows={5}
                    placeholder="Describe your project goals, requirements, and any relevant context…"
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </div>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive leading-relaxed">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading || !verified}
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending inquiry…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Inquiry
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground/50">
                  Average response time: within 24 hours · NDA available on request
                </p>
              </div>
            </form>
          )}

          {/* ── Aside ──────────────────────────────────────────────────────── */}
          <aside className="space-y-5">
            {/* Direct contact card */}
            <div className="rounded-3xl border border-border/60 bg-surface/40 p-6 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <p className="font-display text-lg font-semibold">Reach me directly</p>
              </div>
              {profile?.location && (
                <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-muted-foreground/60">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </p>
              )}
              <div className="mt-5 space-y-2">
                {channels.map(({ href, Icon, label, sub }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface/60 text-muted-foreground transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground/90">{label}</span>
                      <span className="block truncate font-mono text-[11px] text-muted-foreground/60">{sub}</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-6 backdrop-blur">
              <div className="pointer-events-none absolute inset-0 bg-hero opacity-30" />
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
              <div className="relative z-10">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                  Avg. response time
                </p>
                <p className="mt-2 font-display text-4xl font-semibold gradient-text">≤ 24h</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground/50">Weekdays · IST timezone</p>
                <div className="mt-4 h-px bg-gradient-to-r from-primary/40 to-transparent" />
                <ul className="mt-4 space-y-2">
                  {["Detailed project proposal", "Transparent pricing breakdown", "NDA on request"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}