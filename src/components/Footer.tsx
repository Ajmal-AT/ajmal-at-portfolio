import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Instagram, MessageCircle, Link2, Mail } from "lucide-react";

export const SOCIAL = {
  instagram: "https://www.instagram.com/code.with.ajmal",
  linkedin: "https://www.linkedin.com/in/ajmal-at/",
  github: "https://github.com/Ajmal-AT",
  whatsapp: "https://api.whatsapp.com/send/?phone=918592817937&text&type=phone_number&app_absent=0",
  linktree: "https://linktr.ee/ajmal_at",
  email: "mailto:hello@ajmal.dev",
};

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-semibold">
              Ajmal <span className="gradient-brand">AT</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Software engineer & tech consultant building scalable, enterprise-grade applications,
              SaaS platforms and modern developer experiences.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: SOCIAL.github, Icon: Github, label: "GitHub" },
                { href: SOCIAL.linkedin, Icon: Linkedin, label: "LinkedIn" },
                { href: SOCIAL.instagram, Icon: Instagram, label: "Instagram" },
                { href: SOCIAL.whatsapp, Icon: MessageCircle, label: "WhatsApp" },
                { href: SOCIAL.linktree, Icon: Link2, label: "Linktree" },
                { href: SOCIAL.email, Icon: Mail, label: "Email" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  aria-label={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
              <li><Link to="/projects" className="hover:text-foreground">Projects</Link></li>
              <li><Link to="/testimonials" className="hover:text-foreground">Testimonials</Link></li>
              <li><Link to="/resume" className="hover:text-foreground">Resume</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Get in touch</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground">Start a project</Link></li>
              <li><a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer" className="hover:text-foreground">WhatsApp</a></li>
              <li><a href={SOCIAL.email} className="hover:text-foreground">Email</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Ajmal AT. Crafted with precision.</p>
          <p>Available for freelance & consulting · Based in India</p>
        </div>
      </div>
    </footer>
  );
}
