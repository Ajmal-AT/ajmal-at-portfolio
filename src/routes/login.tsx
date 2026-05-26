import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, UserPlus, ArrowLeft, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Ajmal AT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

const inputClass =
  "w-full rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:bg-background/80";

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (redirect || "/admin") as any });
    });
  }, [navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: (redirect || "/admin") as any });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const isSignIn = mode === "signin";

  return (
    <div className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-20">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-accent/6 blur-[100px]" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to portfolio
        </Link>

        {/* Logo / brand mark */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Ajmal AT</p>
            <p className="font-mono text-[10px] text-muted-foreground/60">
              admin access
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {isSignIn ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignIn
              ? "Sign in to access the admin dashboard."
              : "Create an account to manage content."}
          </p>
        </div>

        {/* Form card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-7 backdrop-blur">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* Alerts */}
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">
                {info}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignIn ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Mode toggle */}
          <div className="mt-5 border-t border-border/40 pt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {isSignIn
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Security note */}
        <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground/40">
          Admin access only · Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}