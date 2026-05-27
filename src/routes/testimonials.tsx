// testimonials.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useCallback } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  MessageSquareQuote,
  Play,
  Quote,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
  Video,
  X,
  Clock,
  Zap,
} from "lucide-react";
import {
  fetchSections,
  listContent,
  sectionByKey,
  seoHead,
  uploadMedia,
  type AnyRecord,
} from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/testimonials")({
  head: () => seoHead("testimonials", "Testimonials - Ajmal AT"),
  component: Testimonials,
});

// ─── Edge function helper ─────────────────────────────────────────────────────
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

// ─── Zod schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  client_name: z.string().min(2, "Name must be at least 2 characters").max(80),
  company_name: z.string().max(80).optional().or(z.literal("")),
  project_reference: z.string().min(2, "Please mention the project").max(120),
  review: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(1000, "Max 1000 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
  client_image_url: z.string().url().optional().or(z.literal("")),
  project_image_url: z.string().url().optional().or(z.literal("")),
  video_testimonial_url: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/35 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:bg-background/80";

// ─── Step indicator ───────────────────────────────────────────────────────────
type StepStatus = "active" | "done" | "idle";

function StepDot({
  n,
  status,
  label,
}: {
  n: number;
  status: StepStatus;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-semibold transition-all duration-300 ${status === "done"
          ? "bg-primary text-primary-foreground shadow-glow"
          : status === "active"
            ? "border-2 border-primary text-primary bg-primary/10"
            : "border border-border/60 text-muted-foreground bg-surface/40"
          }`}
      >
        {status === "done" ? "✓" : n}
        {status === "active" && (
          <span className="absolute -inset-1 animate-ping rounded-full border border-primary/40" />
        )}
      </div>
      <span
        className={`font-mono text-[10px] uppercase tracking-widest ${status === "idle" ? "text-muted-foreground/40" : "text-muted-foreground"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

function FormSteps({
  otpSent,
  verified,
}: {
  otpSent: boolean;
  verified: boolean;
}) {
  return (
    <div className="flex items-start gap-0 mb-8">
      <StepDot n={1} status="done" label="Details" />
      <div className="flex-1 mt-4 h-px bg-gradient-to-r from-primary/60 to-border/40" />
      <StepDot
        n={2}
        status={verified ? "done" : otpSent ? "active" : "idle"}
        label="Verify"
      />
      <div className="flex-1 mt-4 h-px bg-gradient-to-r from-border/40 to-border/20" />
      <StepDot n={3} status={verified ? "active" : "idle"} label="Submit" />
    </div>
  );
}

// ─── OTP section ──────────────────────────────────────────────────────────────
interface OtpSectionProps {
  email: string;
  onEmailChange: (v: string) => void;
  otp: string;
  onOtpChange: (v: string) => void;
  otpSent: boolean;
  verified: boolean;
  otpLoading: boolean;
  verifyLoading: boolean;
  resendCooldown: number;
  onSend: () => void;
  onVerify: () => void;
  onResend: () => void;
  error: string | null;
  info: string | null;
}

function OtpSection({
  email,
  onEmailChange,
  otp,
  onOtpChange,
  otpSent,
  verified,
  otpLoading,
  verifyLoading,
  resendCooldown,
  onSend,
  onVerify,
  onResend,
  error,
  info,
}: OtpSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          Email address <span className="text-destructive">*</span>
        </label>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Verified
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          disabled={verified}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className={`${inputCls} min-w-0 flex-1 disabled:opacity-60`}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={otpLoading || verified || !email}
          className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          {otpLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : verified ? (
            "Verified ✓"
          ) : otpSent ? (
            "Resend"
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              Send code
            </>
          )}
        </button>
      </div>

      {otpSent && !verified && (
        <div className="space-y-3 rounded-2xl border border-border/40 bg-background/40 p-5">
          <p className="font-mono text-[11px] text-muted-foreground/60">
            Enter the 6-digit code sent to your inbox
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ""))}
              placeholder="——————"
              className={`${inputCls} flex-1 text-center font-mono tracking-[0.4em]`}
            />
            <button
              type="button"
              onClick={onVerify}
              disabled={verifyLoading || otp.length < 6}
              className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-50"
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
          <p className="font-mono text-[11px] text-muted-foreground/50">
            Didn't receive it?{" "}
            {resendCooldown > 0 ? (
              <span>Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:opacity-70"
              >
                <RefreshCw className="h-3 w-3" />
                Resend code
              </button>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${verified
            ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
            : "border-primary/20 bg-primary/8 text-primary"
            }`}
        >
          {info}
        </div>
      )}
    </div>
  );
}

// ─── Media upload field ───────────────────────────────────────────────────────
type MediaType = "image" | "video";

interface MediaUploadProps {
  label: string;
  icon: React.ReactNode;
  accept: string;
  mediaType: MediaType;
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

function MediaUploadField({
  label,
  icon,
  accept,
  mediaType,
  bucket,
  value,
  onChange,
  hint,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setUploading(true);
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      try {
        const url = await uploadMedia(file, bucket);
        onChange(url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed.");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [bucket, onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = () => {
    setPreview(null);
    onChange("");
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          {icon}
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className="font-mono text-[10px] text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
        >
          {urlMode ? "Upload file" : "Enter URL"}
        </button>
      </div>

      {urlMode ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className={inputCls}
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[110px] overflow-hidden
            ${dragging
              ? "border-primary/60 bg-primary/8 scale-[1.01]"
              : value || preview
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-background/30 hover:border-primary/40 hover:bg-primary/5"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="font-mono text-[11px] text-muted-foreground/60">
                Uploading…
              </span>
            </div>
          ) : preview || value ? (
            <div className="relative w-full">
              {mediaType === "image" ? (
                <img
                  src={preview || value}
                  alt="Preview"
                  className="w-full max-h-40 object-cover rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Video className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/70 truncate max-w-[200px]">
                    {value || "Video uploaded"}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-destructive transition-colors backdrop-blur ring-1 ring-border/40"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface/60 text-muted-foreground/50 ring-1 ring-border/40">
                <Upload className="h-4.5 w-4.5" />
              </div>
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center px-4">
                Drag & drop or click to upload
              </p>
              {hint && (
                <p className="font-mono text-[10px] text-muted-foreground/35">
                  {hint}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="font-mono text-[11px] text-destructive">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Star picker ──────────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-100 hover:scale-110"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-7 w-7 transition-colors duration-150 ${n <= (hover || value)
              ? "fill-amber-400 text-amber-400"
              : "fill-border/30 text-border/40"
              }`}
          />
        </button>
      ))}
      <span className="ml-2 font-mono text-xs text-muted-foreground/60">
        {hover || value ? `${hover || value}/5` : "Select rating"}
      </span>
    </div>
  );
}

// ─── Star rating display ──────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-border/40 text-border/40"
            }`}
        />
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, image }: { name: string; image?: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-11 w-11 rounded-full object-cover ring-2 ring-border/50"
      />
    );
  }
  return (
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20">
      {initials}
    </div>
  );
}

// ─── Testimonial card (uniform size) ─────────────────────────────────────────
function TestimonialCard({
  item,
  index,
}: {
  item: AnyRecord;
  index: number;
}) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <Reveal delay={index * 0.06}>
        <figure className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-glow h-full">

          {/* Hover shimmer */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.18_245/0.06),transparent_60%)]" />
          </div>
          {/* Top accent bar */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Project image — fixed height, uniform */}
          <div className="relative h-36 flex-shrink-0 overflow-hidden bg-gradient-to-br from-cyan-500/15 via-primary/8 to-violet-500/15">
            {item.project_image ? (
              <>
                <img
                  src={item.project_image}
                  alt={item.project_reference ?? "Project"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
              </>
            ) : (
              <div className="absolute inset-0 grid-bg opacity-30" />
            )}

            {/* Video play overlay */}
            {item.video_testimonial && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 text-primary backdrop-blur ring-1 ring-primary/30 shadow-glow hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
              </button>
            )}
          </div>

          {/* Card body */}
          <div className="relative z-10 flex flex-1 flex-col p-7">
            {/* Stars + quote icon */}
            <div className="flex items-start justify-between">
              <StarRating rating={item.rating ?? 5} />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary/50 ring-1 ring-primary/12 transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary">
                <Quote className="h-4 w-4" />
              </div>
            </div>

            {/* Review */}
            <blockquote className="mt-5 flex-1 text-sm leading-[1.9] text-foreground/80 line-clamp-4">
              "{item.review}"
            </blockquote>

            {/* Project tag */}
            {item.project_reference && (
              <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-border/40 bg-background/40 px-3 py-1.5">
                <Briefcase className="h-3 w-3 text-primary/50" />
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {item.project_reference}
                </span>
              </div>
            )}

            {/* Video button (no project image) */}
            {!item.project_image && item.video_testimonial && (
              <button
                onClick={() => setShowVideo(true)}
                className="mt-4 inline-flex items-center gap-2 self-start rounded-xl border border-primary/20 bg-primary/8 px-3 py-1.5 font-mono text-[11px] text-primary transition-all hover:bg-primary/15"
              >
                <Play className="h-3 w-3" />
                Watch testimonial
              </button>
            )}

            {/* Divider */}
            <div className="my-5 h-px bg-gradient-to-r from-border/50 via-border/20 to-transparent" />

            {/* Author */}
            <figcaption className="flex items-center gap-3">
              <Avatar name={item.client_name} image={item.client_image} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                  {item.client_name}
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                </p>
                {item.company_name && (
                  <p className="truncate font-mono text-[11px] text-muted-foreground/55">
                    {item.company_name}
                  </p>
                )}
              </div>
            </figcaption>
          </div>
        </figure>
      </Reveal>

      {/* Video modal */}
      {showVideo && item.video_testimonial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative max-w-3xl w-full mx-4 rounded-2xl overflow-hidden ring-1 ring-border/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={item.video_testimonial}
              controls
              autoPlay
              className="w-full"
            />
            <button
              onClick={() => setShowVideo(false)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 space-y-6 animate-pulse">
      <div className="h-3 w-28 rounded-full bg-primary/10" />
      <div className="h-14 w-2/3 rounded-xl bg-primary/8" />
      <div className="h-5 w-1/2 rounded-lg bg-primary/6" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-primary/5" />
        ))}
      </div>
    </div>
  );
}

// ─── Testimonial submission form ──────────────────────────────────────────────
function SubmitTestimonialForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [clientImageUrl, setClientImageUrl] = useState("");
  const [projectImageUrl, setProjectImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");
  const review = watch("review");

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
      setOtpError("Please enter your email first.");
      return;
    }
    setOtpError(null);
    setOtpInfo(null);
    setOtpLoading(true);
    const { error } = await callEdge("send-contact-otp", { email });
    setOtpLoading(false);
    if (error) {
      setOtpError(error);
      return;
    }
    setOtpSent(true);
    setOtpInfo(`Verification code sent to ${email}. Expires in 5 minutes.`);
    startCooldown(60);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtp("");
    await sendOtp();
  };

  const verifyOtp = async () => {
    if (!otp) {
      setOtpError("Enter the verification code.");
      return;
    }
    setOtpError(null);
    setVerifyLoading(true);
    const { data, error } = await callEdge<{ token: string }>(
      "verify-contact-otp",
      { email, otp }
    );
    setVerifyLoading(false);
    if (error) {
      setOtpError(error);
      return;
    }
    setVerificationToken(data?.token ?? null);
    setVerified(true);
    setOtpInfo("Email verified. You can now submit your testimonial.");
  };

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!verified || !verificationToken)
        throw new Error("Email not verified.");
      const { error } = await (supabase as any).from("testimonials").insert([
        {
          client_name: data.client_name,
          client_email: email,
          company_name: data.company_name || null,
          project_reference: data.project_reference,
          review: data.review,
          rating: data.rating,
          client_image: clientImageUrl || null,
          project_image: projectImageUrl || null,
          video_testimonial: videoUrl || null,
          moderation_status: "pending",
          is_active: false,
        },
      ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      reset();
      setEmail("");
      setOtp("");
      setOtpSent(false);
      setVerified(false);
      setVerificationToken(null);
      setOtpError(null);
      setOtpInfo(null);
      setClientImageUrl("");
      setProjectImageUrl("");
      setVideoUrl("");
      onSuccess();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
      className="space-y-7"
    >
      <FormSteps otpSent={otpSent} verified={verified} />

      {/* Name + Company */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
            <User className="h-3 w-3" />
            Full name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("client_name")}
            placeholder="John Smith"
            className={inputCls}
          />
          {errors.client_name && (
            <p className="font-mono text-[11px] text-destructive">
              {errors.client_name.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
            <Building2 className="h-3 w-3" />
            Company name
          </label>
          <input
            {...register("company_name")}
            placeholder="Acme Inc."
            className={inputCls}
          />
        </div>
      </div>

      {/* Project reference */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          <Briefcase className="h-3 w-3" />
          Project / Service <span className="text-destructive">*</span>
        </label>
        <input
          {...register("project_reference")}
          placeholder="e.g. Portfolio Website, SaaS Platform"
          className={inputCls}
        />
        {errors.project_reference && (
          <p className="font-mono text-[11px] text-destructive">
            {errors.project_reference.message}
          </p>
        )}
      </div>

      {/* OTP verification */}
      <div className="rounded-2xl border border-border/50 bg-background/30 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Email Verification
          </span>
        </div>
        <OtpSection
          email={email}
          onEmailChange={(v) => {
            setEmail(v);
            if (otpSent) {
              setOtpSent(false);
              setOtp("");
              setVerified(false);
              setVerificationToken(null);
              setOtpInfo(null);
            }
          }}
          otp={otp}
          onOtpChange={setOtp}
          otpSent={otpSent}
          verified={verified}
          otpLoading={otpLoading}
          verifyLoading={verifyLoading}
          resendCooldown={resendCooldown}
          onSend={sendOtp}
          onVerify={verifyOtp}
          onResend={resendOtp}
          error={otpError}
          info={otpInfo}
        />
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          <Star className="h-3 w-3" />
          Rating <span className="text-destructive">*</span>
        </label>
        <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3.5">
          <StarPicker
            value={rating}
            onChange={(n) => setValue("rating", n, { shouldValidate: true })}
          />
        </div>
        {errors.rating && (
          <p className="font-mono text-[11px] text-destructive">
            Please select a rating
          </p>
        )}
      </div>

      {/* Review */}
      <div className="space-y-1.5">
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
            <MessageSquare className="h-3 w-3" />
            Your review <span className="text-destructive">*</span>
          </span>
          <span
            className={`font-mono text-[10px] transition-colors ${(review?.length ?? 0) > 900
              ? "text-destructive"
              : "text-muted-foreground/40"
              }`}
          >
            {review?.length ?? 0}/1000
          </span>
        </label>
        <textarea
          {...register("review")}
          rows={5}
          placeholder="Describe your experience working with Ajmal. What problem did he solve? What made the collaboration exceptional?"
          className={`${inputCls} resize-none leading-relaxed`}
        />
        {errors.review && (
          <p className="font-mono text-[11px] text-destructive">
            {errors.review.message}
          </p>
        )}
      </div>

      {/* Media uploads */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="h-4 w-4 text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Optional Media
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/40">
            (makes your review stand out)
          </span>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <MediaUploadField
            label="Your photo"
            icon={<User className="h-3 w-3" />}
            accept="image/*"
            mediaType="image"
            bucket="testimonial-client-images"
            value={clientImageUrl}
            onChange={setClientImageUrl}
            hint="JPG, PNG · max 5MB"
          />
          <MediaUploadField
            label="Project image"
            icon={<ImageIcon className="h-3 w-3" />}
            accept="image/*"
            mediaType="image"
            bucket="testimonial-project-images"
            value={projectImageUrl}
            onChange={setProjectImageUrl}
            hint="Screenshot or mockup"
          />
          <MediaUploadField
            label="Video testimonial"
            icon={<Video className="h-3 w-3" />}
            accept="video/*"
            mediaType="video"
            bucket="testimonial-videos"
            value={videoUrl}
            onChange={setVideoUrl}
            hint="MP4, MOV · max 100MB"
          />
        </div>
      </div>

      {/* Submit error */}
      {submitMutation.isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {submitMutation.error instanceof Error
            ? submitMutation.error.message
            : "Something went wrong. Please try again."}
        </div>
      )}

      {/* Note */}
      <p className="font-mono text-[10px] text-muted-foreground/40">
        * Your review will appear after moderation (usually within 24h). Email
        is never shown publicly.
      </p>

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitMutation.isPending || !verified}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Review
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function Testimonials() {
  const qc = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials-content"],
    queryFn: async () => {
      const [sections, testimonials] = await Promise.all([
        fetchSections("testimonials"),
        listContent("testimonials", { activeOnly: true }),
      ]);
      return { sections, testimonials };
    },
  });

  const handleSuccess = () => {
    setSubmitted(true);
    qc.invalidateQueries({ queryKey: ["testimonials-content"] });
  };

  const openForm = () => {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  if (isLoading) return <Skeleton />;

  const hero = sectionByKey(data?.sections ?? [], "hero");
  const items: AnyRecord[] = data?.testimonials ?? [];

  const avgRating =
    items.length > 0
      ? (
        items.reduce((s, t) => s + (t.rating ?? 5), 0) / items.length
      ).toFixed(1)
      : "5.0";

  return (
    <div className="overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {String(hero?.eyebrow ?? "Client Stories").replace(/^\/\/\s*/, "")}
            </span>
          </div>

          <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[1.06] tracking-tight md:text-7xl">
            {hero?.heading ? (
              <>
                {String(hero.heading).split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-brand">
                  {String(hero.heading).split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                What clients <span className="gradient-brand">say</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {hero?.body ??
              "Real feedback from clients who trusted me to deliver their projects."}
          </p>

          {/* Info pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { Icon: Clock, text: "Reviews since 2024" },
              { Icon: Zap, text: "100% project satisfaction" },
              { Icon: CheckCircle2, text: "Moderated & verified" },
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

          {/* Social proof strip */}
          {items.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex items-center">
                {items.slice(0, 5).map((t, i) => (
                  <div
                    key={t.id}
                    className="relative"
                    style={{ marginLeft: i === 0 ? 0 : "-10px", zIndex: 5 - i }}
                  >
                    <Avatar name={t.client_name} image={t.client_image} />
                  </div>
                ))}
                {items.length > 5 && (
                  <div
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/80 font-mono text-[10px] text-muted-foreground backdrop-blur"
                    style={{ marginLeft: "-10px", zIndex: 0 }}
                  >
                    +{items.length - 5}
                  </div>
                )}
              </div>
              <div className="h-8 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <StarRating rating={5} />
                <span className="font-display text-sm font-semibold">
                  {avgRating}
                </span>
                <span className="font-mono text-xs text-muted-foreground/55">
                  from {items.length} review{items.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          GRID
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        {items.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-20 text-center">
              <MessageSquareQuote className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No testimonials yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/55">
                Be the first to leave a review below.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {items.map((item, i) => (
              <TestimonialCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SUBMIT TESTIMONIAL
      ════════════════════════════════════════════════════════════════ */}
      <section ref={formRef} className="mx-auto max-w-7xl px-6 pb-20 scroll-mt-8">
        <Reveal>
          {!formOpen && !submitted ? (
            /* Collapsed CTA card */
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-10 backdrop-blur md:p-12">
              <div className="pointer-events-none absolute inset-0 bg-hero opacity-30" />
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
                <div className="hidden shrink-0 md:flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <MessageSquareQuote className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                      Share Your Experience
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold leading-snug md:text-3xl">
                    Worked with me?{" "}
                    <span className="gradient-brand">Tell the world.</span>
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                    Your honest feedback helps other clients make informed
                    decisions. Takes less than 2 minutes.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Verified reviews only",
                      "Email never published",
                      "Live within 24h",
                    ].map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/40 px-3 py-1 font-mono text-[10px] text-muted-foreground/60"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={openForm}
                    className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Leave a Testimonial
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Expanded form */
            <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
              {/* Left — intro */}
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                    Share Your Experience
                  </span>
                </div>

                <h2 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
                  Worked with me?{" "}
                  <span className="gradient-brand">Tell the world.</span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  Your honest feedback helps other clients make informed
                  decisions — and helps me improve. Takes less than 2 minutes.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      icon: <ShieldCheck className="h-4 w-4" />,
                      label: "Verify your email with OTP",
                      sub: "One-time code keeps reviews authentic",
                    },
                    {
                      icon: <MessageCircle className="h-4 w-4" />,
                      label: "Write your honest review",
                      sub: "Optionally add photos & video",
                    },
                    {
                      icon: <CheckCircle2 className="h-4 w-4" />,
                      label: "Goes live after moderation",
                      sub: "Usually within 24 hours",
                    },
                  ].map(({ icon, label, sub }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                        {icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/90">
                          {label}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground/55">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {[
                    "Email never published",
                    "NDA on request",
                    "Verified reviews only",
                  ].map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/40 px-3 py-1 font-mono text-[10px] text-muted-foreground/60"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                      {badge}
                    </span>
                  ))}
                </div>

                {!submitted && (
                  <button
                    onClick={() => setFormOpen(false)}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl border border-border/50 bg-surface/40 px-4 py-2 font-mono text-xs text-muted-foreground/60 transition-all hover:border-border hover:text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                )}
              </div>

              {/* Right — form */}
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-7 backdrop-blur md:p-8">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold">
                      Thank you!
                    </h3>
                    <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                      Your review has been submitted and will appear after
                      moderation. I appreciate it!
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormOpen(false);
                      }}
                      className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-5 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                    >
                      Back to testimonials{" "}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <SubmitTestimonialForm onSuccess={handleSuccess} />
                )}
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/60 p-10 backdrop-blur-xl md:p-14">
            <div className="absolute inset-0 bg-hero opacity-50" />
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
              <div className="hidden shrink-0 md:flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <MessageSquareQuote className="h-9 w-9" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">
                  Your story next
                </p>
                <h2 className="font-display text-2xl font-bold leading-snug md:text-3xl">
                  Ready to create something{" "}
                  <span className="gradient-brand">exceptional</span> together?
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-xl">
                  Join the growing list of clients who've trusted me to build
                  their products. Let's turn your idea into a polished, scalable
                  reality.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}