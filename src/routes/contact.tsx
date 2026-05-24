import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  Github,
  Instagram,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useProfileInformation } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seoHead } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("contact", "Contact - Ajmal AT"),
  component: Contact,
});

// ─── helpers ────────────────────────────────────────────────────────────────

/** Invoke a Supabase Edge Function and return { data, error }. */
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
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  // ── SEND OTP ───────────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!email) { setError("Please enter your email address."); return; }

    setError(null);
    setInfo(null);
    setOtpLoading(true);

    const { error } = await callEdge("send-contact-otp", { email });

    setOtpLoading(false);

    if (error) { setError(error); return; }

    setOtpSent(true);
    setInfo(`Verification code sent to ${email}. It expires in 5 minutes.`);
    startCooldown(60);
  };

  // ── RESEND OTP ─────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtp("");
    await sendOtp();
  };

  // ── VERIFY OTP ─────────────────────────────────────────────────────────
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

    // Short-lived token proves verification to the submit edge function.
    setVerificationToken(data?.token ?? null);
    setVerified(true);
    setInfo("Email verified successfully. You can now send your inquiry.");
  };

  // ── SUBMIT FORM ────────────────────────────────────────────────────────
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
      verification_token: verificationToken, // server-side proof of OTP verification
    };

    setError(null);
    setLoading(true);

    // The edge function `submit-contact-inquiry`:
    //   1. Validates the verification_token against contact_otps.
    //   2. Inserts into the inquiries table.
    //   3. Marks the OTP row as used.
    const { error } = await callEdge("submit-contact-inquiry", payload);

    setLoading(false);

    if (error) { setError(error); return; }

    setSent(true);
    setInfo("Inquiry submitted successfully. I'll respond within 24 hours.");

    form.reset();
    setOtp("");
    setEmail("");
    setOtpSent(false);
    setVerified(false);
    setVerificationToken(null);
  };

  // ── channels ───────────────────────────────────────────────────────────
  const channels = [
    { href: profile?.whatsapp_url, Icon: MessageCircle, label: "WhatsApp", sub: profile?.phone },
    { href: profile?.email ? `mailto:${profile.email}` : undefined, Icon: Mail, label: "Email", sub: profile?.email },
    { href: profile?.linkedin_url, Icon: Linkedin, label: "LinkedIn", sub: profile?.linkedin_url },
    { href: profile?.github_url, Icon: Github, label: "GitHub", sub: profile?.github_url },
    { href: profile?.instagram_url, Icon: Instagram, label: "Instagram", sub: profile?.instagram_url },
    { href: profile?.linktree_url, Icon: Link2, label: "Linktree", sub: profile?.linktree_url },
  ].filter((item) => item.href);

  // ──────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          // contact
        </p>

        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">
          Start a project with {profile?.full_name}
        </h1>

        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">
          {profile?.availability_status}
        </p>
      </section>

      {/* ── form + aside ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* ── inquiry form ──────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <form
              onSubmit={submit}
              className="rounded-3xl border border-border bg-surface/80 p-6 shadow-xl backdrop-blur md:p-8"
            >
              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Start Your Project
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Share your requirements, budget and timeline. You'll receive a
                  professional response with scope, pricing and next steps.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Verify your email before submitting your inquiry.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <Field label="Full Name" name="name" required placeholder="Ajmal A T" />

                {/* ── email + OTP block ──────────────────────────────── */}
                <div className="md:col-span-2 space-y-3">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>

                  {/* email row */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      disabled={verified}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Reset verification state when email changes
                        if (otpSent) {
                          setOtpSent(false);
                          setOtp("");
                          setVerified(false);
                          setVerificationToken(null);
                          setInfo(null);
                        }
                      }}
                      placeholder="you@example.com"
                      className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpLoading || verified}
                      className="min-w-[110px] rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/20 disabled:opacity-60"
                    >
                      {otpLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : verified ? (
                        "Verified ✓"
                      ) : otpSent ? (
                        "Resend Code"
                      ) : (
                        "Send Code"
                      )}
                    </button>
                  </div>

                  {/* OTP input — shown after code sent, before verified */}
                  {otpSent && !verified && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="6-digit code"
                          className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm tracking-widest outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                        />

                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={verifyLoading || otp.length < 6}
                          className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                        >
                          {verifyLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Verify
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Didn't receive it?{" "}
                        {resendCooldown > 0 ? (
                          <span className="text-muted-foreground/60">
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={resendOtp}
                            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Resend code
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {/* ── end email + OTP block ─────────────────────────── */}

                <Select
                  label="Service Needed"
                  name="service"
                  options={[
                    "Custom Software & SaaS — From ₹49,999",
                    "Backend & APIs — Custom Quote",
                    "Enterprise Systems — From ₹99,999",
                    "Premium Developer Portfolio — From ₹5,999",
                    "Business Portfolio Platform — From ₹9,999",
                    "ATS Resume Rewrite — From ₹199",
                    "LinkedIn Optimization — From ₹999",
                  ]}
                />

                <Select
                  label="Estimated Budget"
                  name="budget"
                  options={[
                    "₹199 - ₹999",
                    "₹1,000 - ₹5,000",
                    "₹5,000 - ₹15,000",
                    "₹15,000 - ₹50,000",
                    "₹50,000 - ₹1,00,000",
                    "₹1,00,000 - ₹5,00,000",
                    "₹5,00,000+",
                  ]}
                />

                <Select
                  label="Project Type"
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

                <Select
                  label="Preferred Timeline"
                  name="timeline"
                  options={[
                    "1 Week",
                    "2 - 4 Weeks",
                    "1 - 2 Months",
                    "2 - 4 Months",
                    "4+ Months",
                    "Flexible Timeline",
                  ]}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Project Details
                </label>

                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Describe your project requirements, goals, and any relevant context..."
                  className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {info && (
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {info}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || !verified}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : sent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Inquiry Sent Successfully
                    </>
                  ) : (
                    <>
                      Send Inquiry
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground">
                  Average response time: within 24 hours
                </p>
              </div>
            </form>
          </div>

          {/* ── aside: direct channels ────────────────────────────────── */}
          <aside className="lg:col-span-5">
            <div className="glass rounded-3xl p-6 md:p-8">
              <h2 className="font-display text-xl">Reach me directly</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {profile?.location}
              </p>

              <div className="mt-6 grid gap-2">
                {channels.map(({ href, Icon, label, sub }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3.5 transition-colors hover:border-primary/40"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary/20 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {sub}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

// ─── shared primitives ───────────────────────────────────────────────────────

function Field({
  label, name, type = "text", required, placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60"
      />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        name={name}
        className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}