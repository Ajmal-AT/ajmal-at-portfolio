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
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: AdminInquiries,
});

type Inquiry = {
  id: string;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

function AdminInquiries() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "open" | "handled">("all");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });

  const setHandled = useMutation({
    mutationFn: async ({ id, handled }: { id: string; handled: boolean }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ handled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const filtered = (data ?? []).filter((i) => {
    if (filter === "open") return !i.handled;
    if (filter === "handled") return i.handled;
    return true;
  });

  const openCount = (data ?? []).filter((i) => !i.handled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              // inquiries
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Project Inquiries
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads submitted via the contact form.
            {openCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] text-amber-400">
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
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 rounded-xl border border-border/60 bg-surface/40 p-1.5">
        {(["all", "open", "handled"] as const).map((f) => (
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

      {/* List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="font-mono text-xs text-muted-foreground">loading inquiries...</p>
            </div>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">No inquiries here</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {filter !== "all" ? "Try switching the filter above" : "Inquiries will appear when visitors submit the contact form"}
            </p>
          </div>
        )}

        {filtered.map((i) => (
          <div
            key={i.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all ${i.handled
              ? "border-border/40 bg-surface/20 opacity-60"
              : "border-border/60 bg-surface/50 hover:border-border/80 hover:bg-surface/70"
              }`}
          >
            {/* Left accent */}
            {!i.handled && (
              <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-primary to-accent" />
            )}

            <div className="p-5 pl-6">
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{i.name}</p>
                    {i.handled ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                        handled
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                        open
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {i.email}
                    </span>
                    {i.service && (
                      <span className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        {i.service}
                      </span>
                    )}
                    {i.budget && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {i.budget}
                      </span>
                    )}
                    {i.timeline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {i.timeline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Clock className="h-3 w-3" />
                    {new Date(i.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setHandled.mutate({ id: i.id, handled: !i.handled })}
                    disabled={setHandled.isPending}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${i.handled
                      ? "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {i.handled ? "Reopen" : "Mark done"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete inquiry from ${i.name}?`)) remove.mutate(i.id);
                    }}
                    disabled={remove.isPending}
                    className="rounded-lg border border-transparent p-1.5 text-muted-foreground/40 transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="mt-4 rounded-xl bg-background/40 px-4 py-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {i.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}