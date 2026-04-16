"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";

function SuccessContent() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    // Frissítjük a foglalás státuszát "confirmed"-re
    supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId)
      .then(({ error }) => {
        if (error) {
          console.error("[success] Booking update error:", error.message);
        } else {
          setConfirmed(true);
          console.info("[success] Booking confirmed:", bookingId);
        }
      });
  }, [bookingId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] px-6 text-center">
      {/* Háttér noise */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Checkmark */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d4ff00]/40 bg-[#d4ff00]/10 shadow-[0_0_60px_rgba(212,255,0,0.25)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d4ff00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 drop-shadow-[0_0_12px_rgba(212,255,0,0.8)]"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Szöveg */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7aaa44]">
            VRS Billboards
          </p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-black tracking-wide text-white sm:text-5xl">
            Sikeres fizetés és foglalás!
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#888888]">
            {confirmed
              ? "A foglalásod megerősítve. A részleteket e-mailben is elküldjük."
              : "A kreatívod hamarosan kikerül a felületre. A részleteket e-mailben is elküldjük."}
          </p>
        </div>

        {/* Státusz badge */}
        {bookingId && (
          <div className="flex items-center gap-2 rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/8 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#d4ff00]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4ff00]">
              {confirmed ? "Foglalás megerősítve" : "Foglalás feldolgozás alatt…"}
            </span>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/foglalas"
          className="relative mt-2 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#d4ff00] px-7 py-3.5 font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-[0.14em] text-black shadow-[0_0_32px_rgba(212,255,0,0.35)] transition after:pointer-events-none after:absolute after:inset-0 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.28)_50%,transparent_60%)] after:transition-transform after:duration-500 hover:brightness-105 hover:after:translate-x-full active:scale-[0.99]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Vissza a Vezérlőpultra
        </Link>

        {/* Díszítő vonal */}
        <div className="mt-4 flex items-center gap-4">
          <div className="h-px w-16 bg-[#1a1a1a]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#333333]">
            6ékony Reklám Kft.
          </span>
          <div className="h-px w-16 bg-[#1a1a1a]" />
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#000000]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4ff00]/20 border-t-[#d4ff00]" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
