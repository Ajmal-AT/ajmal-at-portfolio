import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
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
} from "lucide-react";

import { useProfileInformation } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seoHead } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("contact", "Contact - Ajmal AT"),
  component: Contact,
});

// ─── helpers ────────────────────────────────────────────────────────────────

async function callEdge<T = unknown>(
  fn: string,
  body: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(fn, { body });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}

// ─── step indicator ──────────────────────────────────────────────────────────

type StepStatus = "active" | "done" | "idle";

function StepDot({ n, status }: { n: number; status: StepStatus }) {
  const base =
    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 font-mono";
  const variants: Record<StepStatus, string> = {
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    idle: "bg-muted text-muted-foreground",
  };
  return (
    <div className={`${base} ${variants[status]}`}>
      {status === "done" ? "✓" : n}
    </div>
  );
}

function Steps({
  otpSent,
  verified,
}: {
  otpSent: boolean;
  verified: boolean;
}) {
  const s1: StepStatus = "done";
  const s2: StepStatus = verified ? "done" : otpSent ? "active" : "idle";
  const s3: StepStatus = verified ? "active" : "idle";

  return (
    <div className="flex items-center gap-2 mb-6">
      <StepDot n={1} status={s1} />
      <div className="flex-1 h-px bg-border" />
      <StepDot n={2} status={s2} />
      <div className="flex-1 h-px bg-border" />
      <StepDot n={3} status={s3} />
    </div>
  );
}

// ─── component ──────────────────────────────────────────────────────────────

function Contact() {
  const { data: profile } = useProfileInformation();

  // ── email / otp state ──────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  // ── form state ─────────────────────────────────────────────────────────
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ── feedback ───────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // ── resend cooldown ────────────────────────────────────────────────────
  const [resendCooldown, setResendCooldown] = useState(0);

  function startCooldown(seconds = 60) {
    setResendCooldown(seconds);
    const id = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  const sendOtp = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setInfo(null);
    setOtpLoading(true);
    const { error } = await callEdge("send-contact-otp", { email });
    setOtpLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setOtpSent(true);
    setInfo(`Code sent to ${email}. Expires in 5 minutes.`);
    startCooldown(60);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtp("");
    await sendOtp();
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Enter the verification code.");
      return;
    }
    setError(null);
    setVerifyLoading(true);
    const { data, error } = await callEdge<{ token: string }>(
      "verify-contact-otp",
      { email, otp }
    );
    setVerifyLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setVerificationToken(data?.token ?? null);
    setVerified(true);
    setInfo("Email verified. You can now send your inquiry.");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verified || !verificationToken) {
      setError("Please verify your email first.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email,
      service: String(fd.get("service") || "") || null,
      budget: String(fd.get("budget") || "") || null,
      type: String(fd.get("type") || "") || null,
      timeline: String(fd.get("timeline") || "") || null,
      message: String(fd.get("message") || "").trim(),
      verification_token: verificationToken,
    };
    setError(null);
    setLoading(true);
    const { error } = await callEdge("submit-contact-inquiry", payload);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
    form.reset();
    setOtp("");
    setEmail("");
    setOtpSent(false);
    setVerified(false);
    setVerificationToken(null);
    setInfo(null);
  };

  // ── channels ───────────────────────────────────────────────────────────
  const channels = [
    {
      href: profile?.whatsapp_url,
      Icon: MessageCircle,
      label: "WhatsApp",
      sub: profile?.phone,
    },
    {
      href: profile?.email ? `mailto:${profile.email}` : undefined,
      Icon: Mail,
      label: "Email",
      sub: profile?.email,
    },
    {
      href: profile?.linkedin_url,
      Icon: Linkedin,
      label: "LinkedIn",
      sub: profile?.linkedin_url,
    },
    {
      href: profile?.github_url,
      Icon: Github,
      label: "GitHub",
      sub: profile?.github_url,
    },
    {
      href: profile?.instagram_url,
      Icon: Instagram,
      label: "Instagram",
      sub: profile?.instagram_url,
    },
    {
      href: profile?.linktree_url,
      Icon: Link2,
      label: "Linktree",
      sub: profile?.linktree_url,
    },
  ].filter((item) => item.href);

  // ──────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            contact
          </span>
        </div>

        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Start a project with{" "}
          <em className="italic">{profile?.full_name ?? "Ajmal AT"}</em>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-muted-foreground leading-relaxed">
          {profile?.availability_status ??
            "Available for freelance projects. Share your requirements and get a tailored proposal within 24 hours."}
        </p>
      </section>

      {/* ── form + aside ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── inquiry form ──────────────────────────────────────────── */}
          <div>
            {sent ? (
              /* ── success state ──────────────────────────────────────── */
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
                <div className="text-4xl mb-4">✉</div>
                <h2 className="font-serif text-2xl font-normal">
                  Inquiry sent!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  I'll respond within 24 hours with scope, pricing, and next
                  steps.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-xs text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Send another inquiry →
                </button>
              </div>
            ) : (
              /* ── form ───────────────────────────────────────────────── */
              <form
                onSubmit={submit}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-7"
              >
                <p className="font-serif text-xl font-normal">
                  Start your project
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Fill in your requirements. Verify your email before
                  submitting.
                </p>

                <div className="mt-5">
                  <Steps otpSent={otpSent} verified={verified} />
                </div>

                {/* name + service */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    name="name"
                    required
                    placeholder="Ajmal A T"
                  />
                  <SelectField
                    label="Service needed"
                    name="service"
                    options={[
                      "Custom Software & SaaS — From ₹49,999",
                      "Backend & APIs — Custom Quote",
                      "Enterprise Systems — From ₹99,999",
                      "Developer Portfolio — From ₹5,999",
                      "Business Portfolio — From ₹9,999",
                      "ATS Resume Rewrite — From ₹199",
                      "LinkedIn Optimization — From ₹999",
                    ]}
                  />
                </div>

                {/* email + OTP */}
                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    Email address
                    {verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Verified
                      </span>
                    )}
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      disabled={verified}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (otpSent) {
                          setOtpSent(false);
                          setOtp("");
                          setVerified(false);
                          setVerificationToken(null);
                          setInfo(null);
                        }
                      }}
                      placeholder="you@example.com"
                      className="flex-1 rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpLoading || verified}
                      className="min-w-[100px] rounded-lg border border-border bg-muted px-4 py-2.5 text-xs font-medium transition hover:bg-muted/80 disabled:opacity-50"
                    >
                      {otpLoading ? (
                        <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                      ) : verified ? (
                        "Verified ✓"
                      ) : otpSent ? (
                        "Resend"
                      ) : (
                        "Send code"
                      )}
                    </button>
                  </div>

                  {otpSent && !verified && (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="——————"
                          className="flex-1 rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm tracking-[.25em] text-center outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 font-mono"
                        />
                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={verifyLoading || otp.length < 6}
                          className="inline-flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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

                      <p className="text-[11px] text-muted-foreground">
                        Didn't receive it?{" "}
                        {resendCooldown > 0 ? (
                          <span>Resend in {resendCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={resendOtp}
                            className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:opacity-70"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Resend code
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* budget + timeline */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Estimated budget"
                    name="budget"
                    options={[
                      "₹199 – ₹999",
                      "₹1,000 – ₹5,000",
                      "₹5,000 – ₹15,000",
                      "₹15,000 – ₹50,000",
                      "₹50,000 – ₹1,00,000",
                      "₹1,00,000 – ₹5,00,000",
                      "₹5,00,000+",
                    ]}
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

                <div className="mt-4">
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
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    Project details
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe your project goals, requirements, and any relevant context..."
                    className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 resize-none leading-relaxed"
                  />
                </div>

                {/* alerts */}
                {error && (
                  <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3.5 py-2.5 text-xs text-destructive leading-relaxed">
                    {error}
                  </div>
                )}
                {info && (
                  <div
                    className={`mt-3 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed ${verified
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                      : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                      }`}
                  >
                    {info}
                  </div>
                )}

                {/* submit */}
                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={loading || !verified}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending inquiry...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send inquiry
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Average response time: within 24 hours
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* ── aside ─────────────────────────────────────────────────── */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="font-serif text-lg font-normal">
                Reach me directly
              </p>

              {profile?.location && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </div>
              )}

              <div className="mt-4 border-t border-border pt-4 space-y-1.5">
                {channels.map(({ href, Icon, label, sub }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3 transition hover:border-border/80 hover:bg-muted/60 group"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium">{label}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {sub}
                      </span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* response time card */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                Response time
              </p>
              <p className="font-serif text-2xl font-normal">≤ 24 hours</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Weekdays, IST timezone
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

// ─── shared primitives ───────────────────────────────────────────────────────

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <select
        name={name}
        className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}