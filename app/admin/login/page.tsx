"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/admin");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError("Sign-in failed — check the email and password.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <section className="page-body">
      <div className="wrap">
        <div className="panel" style={{ maxWidth: 440, margin: "24px auto" }}>
          <h1 style={{ marginTop: 0, fontSize: "1.5rem" }}>Blog admin — sign in</h1>
          {!supabaseConfigured ? (
            <p className="hint">
              The admin panel is not configured yet. Set the Supabase env vars first (see
              ADMIN-SETUP.md in the project).
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="field">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p role="alert" style={{ color: "var(--red-600)", fontWeight: 600 }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-green" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
