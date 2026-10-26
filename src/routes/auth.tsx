import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";

type AuthSearchParams = {
  mode?: "signin" | "signup";
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearchParams => ({
    mode: search.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Teacher & Admin Auth — Rachna 2K26" },
      {
        name: "description",
        content: "Sign in or create a teacher account for the Rachna 2K26 admin panel.",
      },
      { property: "og:title", content: "Teacher & Admin Auth — Rachna 2K26" },
      {
        property: "og:description",
        content: "Restricted area for Team Kalki coordinators and teachers.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode || "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local"));

  useEffect(() => {
    // If dev admin is already stored on localhost, navigate to admin
    if (isLocalhost && localStorage.getItem("rachna_dev_admin")) {
      navigate({ to: "/admin" });
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, isLocalhost]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          const lowerMsg = error.message.toLowerCase();
          if (lowerMsg.includes("invalid login credentials")) {
            throw new Error(
              "Account not found or password incorrect. If you haven't created an account yet, click 'Create Account' above.",
            );
          }
          if (lowerMsg.includes("email not confirmed")) {
            throw new Error(
              "Email confirmation is pending. Please verify the confirmation link sent to your email.",
            );
          }
          throw error;
        }
        toast.success("Signed in successfully");
        navigate({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;

        // If session created immediately (email confirmation disabled or bypassed)
        if (data.session) {
          toast.success("Account created and signed in!");
          navigate({ to: "/admin" });
          return;
        }

        // If user already registered (empty identities returned by Supabase)
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Switched to Sign In mode.");
          setMode("signin");
          return;
        }

        toast.success(
          "Account registered! If confirmation is required, please check your email inbox before signing in.",
          { duration: 8000 },
        );
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  function handleDevAdminQuickLogin() {
    localStorage.setItem(
      "rachna_dev_admin",
      JSON.stringify({
        id: "dev-admin-id",
        email: email.trim() || "admin@kkgroup.org",
        role: "admin",
      }),
    );
    toast.success("Logged in as Local Admin");
    navigate({ to: "/admin" });
  }

  return (
    <PageShell>
      <section className="px-5 pt-16 pb-10 md:px-10">
        <p className="meta text-muted-foreground">Restricted / Team Kalki</p>
        <h1 className="display mt-4" style={{ fontSize: "13vw" }}>
          Admin
        </h1>
      </section>

      <div className="grid grid-cols-1 gap-8 border-t border-border px-5 py-16 md:grid-cols-12 md:px-10">
        <div className="border border-ink p-8 md:col-span-6">
          {/* Segmented Neo-Brutalist Tabs */}
          <div className="mb-8 grid grid-cols-2 border border-ink">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors md:text-sm ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`border-l border-ink py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors md:text-sm ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <h2 className="display text-[2rem]">
              {mode === "signin" ? "Sign In to Panel" : "Create Admin Account"}
            </h2>
            <p className="meta mt-1 text-muted-foreground">
              {mode === "signin"
                ? "Enter your teacher or coordinator credentials."
                : "Register a teacher account. First signup becomes Fest Admin."}
            </p>

            <div className="mt-6">
              <label className="meta mb-2 block">Email</label>
              <input
                className="brutal-input"
                type="email"
                placeholder="teacher@kkgroup.org"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-baseline justify-between">
                <label className="meta block">Password</label>
                {mode === "signup" && (
                  <span className="text-xs text-muted-foreground">Min 6 characters</span>
                )}
              </div>
              <input
                className="brutal-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                maxLength={72}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-brutal mt-8 w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {isLocalhost && (
            <div className="mt-8 border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="meta font-semibold text-primary">Localhost Fast Access</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Testing on localhost? Access the admin dashboard directly.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-brutal whitespace-nowrap px-4 py-2 text-xs"
                  onClick={handleDevAdminQuickLogin}
                >
                  Enter Dev Admin
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="md:col-span-5 md:col-start-8 md:mt-4">
          <div className="border-t border-ink pt-4">
            <p className="meta">Important Note</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              The first account created becomes the admin automatically. Further teacher accounts
              must be granted admin access by an existing admin.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              If you already created an account, make sure you are on the{" "}
              <strong className="text-foreground">Sign In</strong> tab above.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
