import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Loader2,
  Trash2,
  Inbox,
  Mail,
  Clock,
  DollarSign,
  Calendar,
  RefreshCw,
  Filter,
  ExternalLink,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: AdminInquiries,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

type FilterState = "all" | "open" | "handled";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Strips non-digit characters so WhatsApp links work with international numbers. */
const sanitizePhone = (phone: string) => phone.replace(/\D/g, "");

const FILTER_LABELS: FilterState[] = ["all", "open", "handled"];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInquiries() {
  return useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select(
          "id, name, email, phone, service, budget, timeline, message, handled, created_at"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });
}

function useSetHandled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      handled,
    }: {
      id: string;
      handled: boolean;
    }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ handled })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });
}

function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inquiries")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminInquiries() {
  const [filter, setFilter] = useState<FilterState>("all");

  const { data, isLoading, refetch, isFetching } = useInquiries();
  const setHandled = useSetHandled();
  const remove = useDeleteInquiry();

  const inquiries = data ?? [];
  const openCount = inquiries.filter((i) => !i.handled).length;

  const filtered = inquiries.filter((i) => {
    if (filter === "open") return !i.handled;
    if (filter === "handled") return i.handled;
    return true;
  });

  const stats = [
    { label: "Total", value: inquiries.length, color: "text-foreground" },
    { label: "Open", value: openCount, color: "text-amber-400" },
    {
      label: "Handled",
      value: inquiries.length - openCount,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              inquiries
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Project Inquiries
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads submitted via the contact form.
            {openCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] text-amber-400">
                {openCount} open
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 rounded-xl border border-border/60 bg-surface/40 p-1.5">
        {FILTER_LABELS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg px-3 py-1.5 font-mono text-xs capitalize transition-all ${filter === f
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {f}
            {f === "open" && openCount > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                {openCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      {!isLoading && inquiries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-surface/40 px-4 py-3 text-center"
            >
              <p
                className={`font-display text-2xl font-semibold tabular-nums ${s.color}`}
              >
                {s.value}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/60">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="font-mono text-xs text-muted-foreground">
                loading inquiries...
              </p>
            </div>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No inquiries here
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {filter !== "all"
                ? "Try switching the filter above"
                : "Inquiries will appear when visitors submit the contact form"}
            </p>
          </div>
        )}

        {filtered.map((inquiry) => (
          <InquiryCard
            key={inquiry.id}
            inquiry={inquiry}
            onToggleHandled={() =>
              setHandled.mutate({ id: inquiry.id, handled: !inquiry.handled })
            }
            onDelete={() => {
              if (confirm(`Delete inquiry from ${inquiry.name}?`))
                remove.mutate(inquiry.id);
            }}
            isTogglingHandled={setHandled.isPending}
            isDeleting={remove.isPending}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Inquiry Card ─────────────────────────────────────────────────────────────

type InquiryCardProps = {
  inquiry: Inquiry;
  onToggleHandled: () => void;
  onDelete: () => void;
  isTogglingHandled: boolean;
  isDeleting: boolean;
};

function InquiryCard({
  inquiry,
  onToggleHandled,
  onDelete,
  isTogglingHandled,
  isDeleting,
}: InquiryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLongMessage = inquiry.message.length > 300;

  const metaItems = (
    [
      inquiry.service && { icon: Filter, label: inquiry.service },
      inquiry.budget && { icon: DollarSign, label: inquiry.budget },
      inquiry.timeline && { icon: Calendar, label: inquiry.timeline },
    ] as ({ icon: React.ElementType; label: string } | false)[]
  ).filter(Boolean) as { icon: React.ElementType; label: string }[];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all ${inquiry.handled
        ? "border-border/40 bg-surface/20 opacity-70"
        : "border-border/60 bg-surface/50 hover:border-border/80 hover:bg-surface/70"
        }`}
    >
      {/* Left accent bar — unhandled only */}
      {!inquiry.handled && (
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-primary to-accent" />
      )}

      <div className="p-5 pl-6">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* Left: identity + contact */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{inquiry.name}</p>
              <StatusBadge handled={inquiry.handled} />
            </div>

            {/* Contact links */}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <a
                href={`mailto:${inquiry.email}`}
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <Mail className="h-3 w-3" />
                {inquiry.email}
                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
              </a>

              {inquiry.phone && (
                <PhoneActions phone={inquiry.phone} />
              )}
            </div>

            {/* Meta pills */}
            {metaItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {metaItems.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-lg border border-border/40 bg-background/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground/70"
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: timestamp + actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              {formatDate(inquiry.created_at)}
            </span>

            <button
              onClick={onToggleHandled}
              disabled={isTogglingHandled}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${inquiry.handled
                ? "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                }`}
            >
              {isTogglingHandled ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {inquiry.handled ? "Reopen" : "Mark done"}
            </button>

            <button
              onClick={onDelete}
              disabled={isDeleting}
              aria-label="Delete inquiry"
              className="rounded-lg border border-transparent p-1.5 text-muted-foreground/40 transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4 rounded-xl bg-background/40 px-4 py-3">
          <p
            className={`whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 transition-all ${!expanded && isLongMessage ? "line-clamp-4" : ""
              }`}
          >
            {inquiry.message}
          </p>
          {isLongMessage && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 font-mono text-[11px] text-primary/70 hover:text-primary"
            >
              {expanded ? "Show less ↑" : "Read more ↓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ handled }: { handled: boolean }) {
  return handled ? (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
      handled
    </span>
  ) : (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-400">
      open
    </span>
  );
}

/**
 * Renders two compact action links for a phone number:
 * a direct phone-call link and a WhatsApp link.
 */
function PhoneActions({ phone }: { phone: string }) {
  const digits = sanitizePhone(phone);

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <a
        href={`tel:${phone}`}
        title="Call"
        className="ml-1 transition-colors hover:text-primary"
      >
        <Phone className="h-3 w-3" />
        <span className="sr-only">Call {phone}</span>
      </a>

      <a
        href={`https://wa.me/${digits}`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        className="transition-colors hover:text-[#25D366]"
      >
        <MessageCircle className="h-3 w-3" />
        <span className="sr-only">WhatsApp {phone}</span>
      </a>

      <span>{phone}</span>
    </span>
  );
}