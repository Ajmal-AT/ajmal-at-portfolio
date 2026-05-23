import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: AdminInquiries,
});

type Inquiry = {
  id: string; name: string; email: string;
  service: string | null; budget: string | null; timeline: string | null;
  message: string; handled: boolean; created_at: string;
};

function AdminInquiries() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });

  const setHandled = useMutation({
    mutationFn: async ({ id, handled }: { id: string; handled: boolean }) => {
      const { error } = await supabase.from("inquiries").update({ handled }).eq("id", id);
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

  return (
    <div>
      <h1 className="font-display text-3xl">Inquiries</h1>
      <p className="mt-2 text-sm text-muted-foreground">Project requests submitted via the contact form.</p>

      <div className="mt-6 space-y-3">
        {isLoading && <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {data?.length === 0 && <p className="rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">No inquiries yet.</p>}
        {data?.map((i) => (
          <div key={i.id} className={`rounded-2xl border p-5 ${i.handled ? "border-border bg-surface/40 opacity-70" : "border-border bg-surface"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{i.name} <span className="text-xs text-muted-foreground">· {i.email}</span></p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[i.service, i.budget, i.timeline].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span>
                <button onClick={() => setHandled.mutate({ id: i.id, handled: !i.handled })}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary">
                  <Check className="h-3.5 w-3.5" /> {i.handled ? "Reopen" : "Mark handled"}
                </button>
                <button onClick={() => confirm("Delete inquiry?") && remove.mutate(i.id)}
                  className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{i.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
