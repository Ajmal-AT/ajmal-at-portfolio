import { MessageCircle } from "lucide-react";
import { useProfileInformation } from "./Footer";

export function FloatingWhatsApp() {
  const { data: profile } = useProfileInformation();
  if (!profile?.whatsapp_url) return null;
  return (
    <a
      href={profile.whatsapp_url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-105 animate-pulse-ring"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
