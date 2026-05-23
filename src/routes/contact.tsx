import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Linkedin, Instagram, MessageCircle, Link2, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { SOCIAL } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ajmal AT" },
      { name: "description", content: "Start a project, book a consultation or just say hi. Reach Ajmal AT via the form, WhatsApp, email or social." },
      { property: "og:title", content: "Contact — Ajmal AT" },
      { property: "og:description", content: "Hire Ajmal AT for software, SaaS and consulting work." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const SERVICES = ["Custom Software", "SaaS Development", "Backend / API", "Portfolio", "Resume", "Tech Consultation"];
const BUDGETS = ["< ₹50k", "₹50k – ₹2L", "₹2L – ₹10L", "₹10L+"];
const TIMELINES = ["ASAP", "1–4 weeks", "1–3 months", "Flexible"];

function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      service: String(fd.get("service") || "") || null,
      budget: String(fd.get("budget") || "") || null,
      timeline: String(fd.get("timeline") || "") || null,
      message: String(fd.get("message") || "").trim(),
    };
    if (!payload.name || !payload.email || !payload.message) {
      setError("Please fill name, email and message.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("inquiries").insert(payload);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">// contact</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold md:text-6xl">
          Let's build something <span className="gradient-brand">exceptional</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">
          Tell me about your project. I'll reply within one business day with next steps.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <form onSubmit={submit} className="rounded-3xl border border-border bg-surface p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Select label="Service Needed" name="service" options={SERVICES} />
                <Select label="Budget" name="budget" options={BUDGETS} />
                <Field label="Project Type" name="type" placeholder="e.g. SaaS dashboard" />
                <Select label="Timeline" name="timeline" options={TIMELINES} />
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell me about the goals, audience and what success looks like."
                  className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60"
                />
              </div>

              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  : sent ? <><CheckCircle2 className="h-4 w-4" /> Sent</>
                  : <>Send inquiry <Send className="h-4 w-4" /></>}
              </button>

              {sent && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Thanks — I'll get back to you shortly. For urgent requests, ping me on WhatsApp.
                </p>
              )}
            </form>
          </div>

          <aside className="lg:col-span-5">
            <div className="glass rounded-3xl p-6 md:p-8">
              <h2 className="font-display text-xl">Reach me directly</h2>
              <p className="mt-2 text-sm text-muted-foreground">Prefer a chat? Pick your channel.</p>
              <div className="mt-6 grid gap-2">
                {[
                  { href: SOCIAL.whatsapp, Icon: MessageCircle, label: "WhatsApp", sub: "+91 85928 17937" },
                  { href: SOCIAL.email, Icon: Mail, label: "Email", sub: "hello@ajmal.dev" },
                  { href: SOCIAL.linkedin, Icon: Linkedin, label: "LinkedIn", sub: "/in/ajmal-at" },
                  { href: SOCIAL.github, Icon: Github, label: "GitHub", sub: "Ajmal-AT" },
                  { href: SOCIAL.instagram, Icon: Instagram, label: "Instagram", sub: "@code.with.ajmal" },
                  { href: SOCIAL.linktree, Icon: Link2, label: "Linktree", sub: "linktr.ee/ajmal_at" },
                ].map(({ href, Icon, label, sub }) => (
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
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{sub}</span>
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

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
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
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        name={name}
        className="w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
