"use client";

import { Bell, Filter, LogOut, Plus, Search, UserCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type TopbarProps = {
  title: string;
  search: string;
  onSearchChange: (v: string) => void;
  onOpenNotifications: () => void;
  onNewBooking: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
};

export function Topbar({
  title,
  search,
  onSearchChange,
  onOpenNotifications,
  onNewBooking,
  user,
  onOpenAuth,
  onLogout,
}: TopbarProps) {
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "VR";

  return (
    <header className="flex h-[54px] shrink-0 items-center gap-2.5 border-b border-[var(--b1)] bg-[var(--bg2)] px-5">
      <h1 className="flex-1 font-[family-name:var(--font-barlow-condensed)] text-[19px] font-extrabold tracking-wide text-[var(--text)]">
        {title}
      </h1>
      <div className="relative w-[240px] max-md:hidden">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[var(--t3)]" strokeWidth={2.5} />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Felület kód, város..."
          className="w-full rounded-lg border border-[var(--b1)] bg-[var(--bg3)] py-1.5 pl-7 pr-3 text-xs text-[var(--text)] outline-none transition-colors placeholder:text-[var(--t3)] focus:border-[var(--b2)]"
        />
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded border border-[var(--b1)] bg-transparent px-3 py-1.5 text-[11px] font-semibold text-[var(--t2)] transition-all hover:border-[var(--b2)] hover:text-[var(--text)] max-sm:hidden"
      >
        <Filter className="h-3 w-3" strokeWidth={2} />
        Szűrő
      </button>
      <button
        type="button"
        onClick={onOpenNotifications}
        className="relative flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--b1)] bg-[var(--bg3)] text-[var(--t2)] transition-all hover:border-[var(--b2)] hover:text-[var(--neon)]"
        aria-label="Értesítések"
      >
        <Bell className="h-[15px] w-[15px]" strokeWidth={2} />
        <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-[var(--bg2)] bg-[var(--neon)] animate-nbp" />
      </button>

      {/* Auth szekció */}
      {user ? (
        <div className="flex items-center gap-2">
          {/* Avatar + email */}
          <div className="flex items-center gap-2 rounded-lg border border-[var(--b1)] bg-[var(--bg3)] px-2.5 py-1 max-sm:hidden">
            <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--b3)] bg-[var(--nk)] font-[family-name:var(--font-barlow-condensed)] text-[10px] font-black text-[var(--neon)]">
              {initials}
            </div>
            <span className="max-w-[130px] truncate text-[11px] text-[var(--t2)]">
              {user.email}
            </span>
          </div>
          {/* Csak mobilon: kis avatar gomb */}
          <div className="hidden max-sm:flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--b3)] bg-[var(--nk)] font-[family-name:var(--font-barlow-condensed)] text-xs font-black text-[var(--neon)]">
            {initials}
          </div>
          {/* Kijelentkezés */}
          <button
            type="button"
            onClick={onLogout}
            aria-label="Kijelentkezés"
            title="Kijelentkezés"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[var(--b1)] bg-[var(--bg3)] text-[var(--t2)] transition-all hover:border-[#5a1a1a] hover:text-[#ff6b6b]"
          >
            <LogOut className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenAuth}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#d4ff00]/40 bg-[#d4ff00]/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#d4ff00] transition-all hover:border-[#d4ff00] hover:bg-[#d4ff00]/15"
        >
          <UserCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          Bejelentkezés
        </button>
      )}

      <button
        type="button"
        onClick={onNewBooking}
        className="relative inline-flex items-center gap-1 overflow-hidden rounded-md bg-[var(--neon)] px-3 py-1.5 text-[11px] font-bold text-[#070908] transition-all after:absolute after:inset-0 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] after:transition-transform after:duration-400 hover:after:translate-x-full hover:shadow-[0_4px_18px_rgba(212,255,0,0.3)]"
      >
        <Plus className="h-[11px] w-[11px]" strokeWidth={2.5} />
        Új Foglalás
      </button>
    </header>
  );
}
