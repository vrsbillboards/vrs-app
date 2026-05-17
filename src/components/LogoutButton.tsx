"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function LogoutButton({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      // signOut redirects via session listener; force-navigate as a safety net.
      window.location.href = "/";
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label="Kijelentkezés"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 text-[11px] font-bold uppercase tracking-wide text-[#888] transition hover:border-[#ff6b6b]/30 hover:text-[#ff6b6b] disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
        Kilépés
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-[#888] transition hover:border-[#ff6b6b]/35 hover:text-[#ff6b6b] disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      Kijelentkezés
    </button>
  );
}
