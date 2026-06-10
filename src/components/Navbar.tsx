import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/resume", label: "Resume" },
  { to: "/contact", label: "Contact" },
] as const;

const desktopLinkClass =
  "relative rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";
const desktopActiveLinkClass =
  "relative rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-medium text-primary shadow-[inset_0_-2px_0_oklch(0.72_0.18_245/0.7)]";
const mobileLinkClass =
  "block rounded-md border border-transparent px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground";
const mobileActiveLinkClass =
  "block rounded-md border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
            <img src={logoUrl} alt="Ajmal AT" width={36} height={36} decoding="async" className="h-9 w-9 object-contain" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            AJMAL <span className="gradient-brand">AT</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={desktopLinkClass}
                activeProps={{ className: desktopActiveLinkClass }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Hire Me
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden rounded-md p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="relative border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-6 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                  activeProps={{ className: mobileActiveLinkClass }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
