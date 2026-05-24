import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Github, Instagram, Link2, Linkedin, Loader2, Mail, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useProfileInformation } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { listContent, seoHead } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("contact", "Contact - Ajmal AT"),
  component: Contact,
});

function Contact() {
  const { data: profile } = useProfileInformation();
  const { data: services = [] } = useQuery({
    queryKey: ["contact-service-options"],
    queryFn: async () => {
      const [software, resumes, portfolios] = await Promise.all([
        listContent("software_services", { activeOnly: true }),
        listContent("resume_services", { activeOnly: true }),
        listContent("portfolio_services", { activeOnly: true }),
      ]);
      return [...software, ...resumes, ...portfolios].map((item) => item.title);
    },
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    setError(null);
    setLoading(true);

    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      service: String(fd.get("service") || "") || null,
      budget: String(fd.get("budget") || "") || null,
      type: String(fd.get("type") || "") || null,
      timeline: String(fd.get("timeline") || "") || null,
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setError("Please fill name, email and message.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("inquiries")
      .insert(payload)
      .select();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
    form.reset();
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
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">// contact</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">Start a project with {profile?.full_name}</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{profile?.availability_status}</p>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12">
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
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Full Name"
                  name="name"
                  required
                  placeholder="Ajmal A T"
                />

                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />

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
                  placeholder="Describe your goals, features, business requirements, integrations, target audience and expected outcome..."
                  className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
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
          <aside className="lg:col-span-5">
            <div className="glass rounded-3xl p-6 md:p-8">
              <h2 className="font-display text-xl">Reach me directly</h2>
              <p className="mt-2 text-sm text-muted-foreground">{profile?.location}</p>
              <div className="mt-6 grid gap-2">
                {channels.map(({ href, Icon, label, sub }) => <a key={label} href={href} target="_blank" rel="noreferrer noopener" className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3.5 transition-colors hover:border-primary/40"><span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary/20 text-primary"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="block truncate text-xs text-muted-foreground">{sub}</span></span></a>)}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60" /></div>;
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label><select name={name} className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60"><option value="">Select...</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
