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

// ── Desktop: pill with gradient underline bar + subtle glow
const desktopLinkClass =
  "relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-white/[0.04]";

const desktopActiveLinkClass =
  "relative rounded-lg px-3 py-2 text-sm font-semibold text-primary " +
  // soft filled background
  "bg-primary/[0.08] " +
  // crisp border matching brand
  "border border-primary/25 " +
  // bottom gradient bar — the signature touch
  "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full " +
  "after:bg-gradient-to-r after:from-primary after:to-accent " +
  // very faint outer glow so it breathes
  "shadow-[0_0_18px_-4px_oklch(0.72_0.18_245/0.35)]";

// ── Mobile: left-accent bar active state
const mobileLinkClass =
  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground " +
  "transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground border border-transparent";

const mobileActiveLinkClass =
  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary " +
  // left accent bar
  "border-l-2 border-l-primary border-y border-r border-primary/20 " +
  "bg-primary/[0.07] pl-[calc(1rem-2px)] " +
  "shadow-[0_0_20px_-6px_oklch(0.72_0.18_245/0.4)]";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/75 backdrop-blur-xl border-b border-border" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* ── Brand ── */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border/60 group-hover:ring-primary/40 transition-all duration-200">
            <img
              src={logoUrl}
              alt="Ajmal AT"
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 object-contain"
            />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            AJMAL <span className="gradient-brand">AT</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <ul className="hidden items-center gap-0.5 md:flex">
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

        {/* ── Desktop actions ── */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_oklch(0.72_0.18_245/0.45)]"
          >
            Hire Me
          </Link>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          aria-label="Toggle menu"
          className="md:hidden rounded-xl border border-border/60 bg-surface/60 p-2 text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="relative border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          {/* subtle top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 pb-4">
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

            {/* Mobile hire me */}
            <li className="mt-2 border-t border-border/40 pt-3">
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Hire Me
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}