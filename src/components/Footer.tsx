import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Github, Instagram, Link2, Linkedin, Mail, MessageCircle } from "lucide-react";
import { firstActive } from "@/lib/content";

export function useProfileInformation() {
  return useQuery({
    queryKey: ["profile-information"],
    queryFn: () => firstActive("profile_information"),
  });
}

export function Footer() {
  const { data: profile } = useProfileInformation();
  const emailHref = profile?.email ? `mailto:${profile.email}` : undefined;
  const socials = [
    { href: profile?.github_url, Icon: Github, label: "GitHub" },
    { href: profile?.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
    { href: profile?.instagram_url, Icon: Instagram, label: "Instagram" },
    { href: profile?.whatsapp_url, Icon: MessageCircle, label: "WhatsApp" },
    { href: profile?.linktree_url, Icon: Link2, label: "Linktree" },
    { href: emailHref, Icon: Mail, label: "Email" },
  ].filter((item) => item.href);

  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-semibold">
              <span className="text-white">
                {profile?.full_name?.split(" ")[0]}
              </span>{" "}
              <span className="text-blue-500">
                {profile?.full_name?.split(" ").slice(1).join(" ")}
              </span>
            </div>

            <p className="mt-3 max-w-md text-sm text-muted-foreground">{profile?.short_intro ?? profile?.bio}</p>

            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} aria-label={label} href={href} target="_blank" rel="noreferrer noopener" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
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
              {profile?.whatsapp_url && <li><a href={profile.whatsapp_url} target="_blank" rel="noreferrer" className="hover:text-foreground">WhatsApp</a></li>}
              {emailHref && <li><a href={emailHref} className="hover:text-foreground">Email</a></li>}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {profile?.full_name}.</p>
          <p>{profile?.availability_status} · {profile?.location}</p>
        </div>
      </div>
    </footer>
  );
}
