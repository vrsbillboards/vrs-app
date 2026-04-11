"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, LogIn, Mail, UserPlus, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type AuthMode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    setError(null);
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (oauthErr) {
      setError(translateAuthError(oauthErr.message));
      setOauthLoading(null);
    }
    // Sikeres esetben a Supabase átirányít, ezért nem kell onClose()
  };

  if (!open) return null;

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authErr) throw authErr;
        onClose();
      } else {
        const { data, error: authErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authErr) throw authErr;
        // Supabase email confirmation is enabled by default
        if (data.session) {
          onClose();
        } else {
          setInfo("Regisztráció sikeres! Erősítsd meg az e-mail-címedet a bejelentkezéshez.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(translateAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-[#1a1a1a] bg-[#000000] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#555555] focus:border-[#d4ff00]/50 focus:ring-1 focus:ring-[#d4ff00]/15";

  return (
    <div
      className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="auth-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fejléc */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7aaa44]">
              VRS Billboards
            </p>
            <h2
              id="auth-title"
              className="mt-0.5 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-wide text-white"
            >
              {mode === "login" ? "Bejelentkezés" : "Regisztráció"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bezárás"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1a1a1a] bg-black/40 text-[#888888] transition-colors hover:border-[#d4ff00]/40 hover:text-[#d4ff00]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Tab váltó */}
        <div className="flex border-b border-[#1a1a1a]">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                mode === m
                  ? "border-b-2 border-[#d4ff00] text-[#d4ff00]"
                  : "text-[#555555] hover:text-[#888888]"
              }`}
            >
              {m === "login" ? "Bejelentkezés" : "Regisztráció"}
            </button>
          ))}
        </div>

        {/* OAuth gombok */}
        <div className="space-y-3 px-6 pt-6">
          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth("google")}
            className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] py-2.5 text-sm font-semibold text-white transition hover:border-[#3a3a3a] hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {oauthLoading === "google" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <GoogleIcon />
            )}
            Folytatás Google-fiókkal
          </button>

          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth("apple")}
            className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] py-2.5 text-sm font-semibold text-white transition hover:border-[#3a3a3a] hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {oauthLoading === "apple" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <AppleIcon />
            )}
            Folytatás Apple-fiókkal
          </button>

          {/* Elválasztó */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#444444]">vagy</span>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>
        </div>

        {/* E-mail / jelszó form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          {/* E-mail */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              E-mail cím
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444444]" strokeWidth={2} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@ceg.hu"
                required
                autoComplete="email"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          {/* Jelszó */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Jelszó
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444444]" strokeWidth={2} />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min. 6 karakter" : "••••••••"}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={`${inputBase} pl-9 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444444] transition hover:text-[#888888]"
                aria-label={showPw ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Hibaüzenet */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-[#5a1a1a] bg-[#1e0808] px-3.5 py-3 text-sm text-[#ff6b6b]">
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b6b]" />
              {error}
            </div>
          )}

          {/* Megerősítő üzenet */}
          {info && (
            <div className="flex items-start gap-2 rounded-xl border border-[#d4ff00]/30 bg-[#d4ff00]/8 px-3.5 py-3 text-sm text-[#d4ff00]">
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4ff00]" />
              {info}
            </div>
          )}

          {/* Submit gomb */}
          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#d4ff00] py-3 font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-[0.12em] text-black shadow-[0_0_28px_rgba(212,255,0,0.3)] transition after:pointer-events-none after:absolute after:inset-0 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.28)_50%,transparent_60%)] after:transition-transform after:duration-500 enabled:hover:brightness-105 enabled:hover:after:translate-x-full enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                Feldolgozás…
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" strokeWidth={2.5} />
                Bejelentkezés
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" strokeWidth={2.5} />
                Fiók létrehozása
              </>
            )}
          </button>

          {/* Váltás */}
          <p className="text-center text-[11px] text-[#555555]">
            {mode === "login" ? (
              <>
                Még nincs fiókod?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[#7aaa44] underline-offset-2 hover:text-[#d4ff00] hover:underline"
                >
                  Regisztrálj ingyen
                </button>
              </>
            ) : (
              <>
                Már van fiókod?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[#7aaa44] underline-offset-2 hover:text-[#d4ff00] hover:underline"
                >
                  Jelentkezz be
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

/** Angol Supabase auth hibák lefordítása magyarra */
function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Helytelen e-mail vagy jelszó.";
  if (msg.includes("Email not confirmed")) return "Az e-mail-cím még nincs megerősítve.";
  if (msg.includes("User already registered")) return "Ez az e-mail-cím már regisztrálva van.";
  if (msg.includes("Password should be at least")) return "A jelszónak legalább 6 karakter hosszúnak kell lennie.";
  if (msg.includes("Unable to validate email")) return "Érvénytelen e-mail-cím.";
  if (msg.includes("rate limit")) return "Túl sok próbálkozás. Kérjük, várj egy kicsit.";
  if (msg.includes("provider is not enabled")) return "Ez a bejelentkezési mód nincs engedélyezve. Kérjük, használj e-mail-t.";
  return msg;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-98.8-91.2-156.4-91.2-225.6c0-129.7 84.7-196.8 167.2-196.8 44.2 0 81.1 29.3 108.8 29.3 26.4 0 68.1-31.5 122.2-31.5 19.8 0 108.2 1.9 165.3 90.8zm-130.5-94.8c27.7-35.5 47.5-84.7 47.5-133.9 0-6.4-.6-12.8-1.9-17.9-44.8 1.9-98.2 30.2-130.5 71.9-24.3 30.8-47.5 79.4-47.5 130.2 0 7 1.3 13.5 1.9 15.4 3.2.6 8.4 1.3 13.5 1.3 40.2 0 89.4-26.4 117-67z" />
    </svg>
  );
}
