"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = "info@vrsbillboards.hu";

export default function AdminLoginPage() {
  const [email, setEmail]       = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Ha már be van lépve admin-ként, azonnal átirányítjuk
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ADMIN_EMAIL) {
        window.location.replace("/admin");
      } else {
        setChecking(false);
      }
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authErr || !data.session) {
      setError(authErr?.message ?? "Hibás e-mail vagy jelszó.");
      setLoading(false);
      return;
    }

    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setError("Nincs jogosultságod az admin panelhez.");
      setLoading(false);
      return;
    }

    // Sikeres admin bejelentkezés — session cookie-ban van, navigálunk
    window.location.replace("/admin");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000]">
        <Loader2 className="h-6 w-6 animate-spin text-[#d4ff00]" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4ff00]/30 bg-[#d4ff00]/8">
            <Shield className="h-7 w-7 text-[#d4ff00]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-widest text-white">
              VRS <span className="text-[#d4ff00]">ADMIN</span>
            </h1>
            <p className="mt-1 text-sm text-[#555555]">Csak jogosult felhasználóknak</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] p-7 shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
        >
          {/* E-mail */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555]">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[#1a1a1a] bg-[#000000] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#444444] focus:border-[#d4ff00]/40 focus:ring-1 focus:ring-[#d4ff00]/15"
              placeholder="admin@vrsbillboards.hu"
            />
          </div>

          {/* Jelszó */}
          <div className="mb-6">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#555555]">
              Jelszó
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#1a1a1a] bg-[#000000] px-4 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-[#444444] focus:border-[#d4ff00]/40 focus:ring-1 focus:ring-[#d4ff00]/15"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] transition hover:text-[#888888]"
                tabIndex={-1}
              >
                {showPw
                  ? <EyeOff className="h-4 w-4" strokeWidth={2} />
                  : <Eye    className="h-4 w-4" strokeWidth={2} />
                }
              </button>
            </div>
          </div>

          {/* Hibaüzenet */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-sm text-[#ff6b6b]">
              <Lock className="h-4 w-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4ff00] py-3.5 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Belépés…
              </>
            ) : "Belépés az Admin Panelbe"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-[#2a2a2a]">
          VRS Billboards · Admin hozzáférés
        </p>
      </div>
    </div>
  );
}
