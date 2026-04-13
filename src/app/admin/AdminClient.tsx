"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { AdminBooking } from "./page";

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  revenue: number;
};

type Props = {
  bookings: AdminBooking[];
  stats: Stats;
  adminEmail: string;
};

type BookingStatus = string;

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4ff00]/40 bg-[#d4ff00]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#d4ff00]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
        Jóváhagyva
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ff6b6b]">
        <XCircle className="h-3 w-3" strokeWidth={2.5} />
        Elutasítva
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
      <Clock className="h-3 w-3" strokeWidth={2.5} />
      Függőben
    </span>
  );
}

function CreativeCell({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#0c0f0b] text-[#444444]">
        <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Megnyitás új lapon"
      className="group relative flex h-10 w-16 items-center justify-center overflow-hidden rounded-lg border border-[#1a1a1a] bg-[#0c0f0b] transition hover:border-[#d4ff00]/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Kreatív"
        className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
        <ExternalLink className="h-3.5 w-3.5 text-white opacity-0 transition group-hover:opacity-100" strokeWidth={2} />
      </div>
    </a>
  );
}

export function AdminClient({ bookings: initialBookings, stats, adminEmail }: Props) {
  const [bookings, setBookings] = useState<AdminBooking[]>(initialBookings);
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject" | null>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleAction(bookingId: string, action: "approve" | "reject") {
    setActionLoading((prev) => ({ ...prev, [bookingId]: action }));
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Lejárt a session.");

      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, action }),
      });

      const data = (await res.json()) as { success?: boolean; status?: string; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Ismeretlen hiba.");
      }

      // Lokálisan frissítjük az állapotot (nem kell újratölteni)
      startTransition(() => {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: data.status! } : b
          )
        );
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
  }

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const revenue = bookings.reduce((s, b) => s + (b.total_price ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#1a1a1a] bg-[#000000]/95 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d4ff00]/40 bg-[#d4ff00]/10">
            <Shield className="h-4 w-4 text-[#d4ff00]" strokeWidth={2} />
          </div>
          <span className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-widest text-white">
            VRS <span className="text-[#d4ff00]">ADMIN</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#666666]">{adminEmail}</span>
          <button
            type="button"
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a1a1a] text-[#888888] transition hover:border-[#5a1a1a] hover:text-[#ff6b6b]"
            title="Kijelentkezés"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">

        {/* KPI kártyák */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Összes foglalás", value: String(bookings.length), icon: LayoutGrid, color: "#d4ff00" },
            { label: "Függőben", value: String(pending), icon: Clock, color: "#fbbf24" },
            { label: "Jóváhagyva", value: String(confirmed), icon: CheckCircle2, color: "#4ade80" },
            { label: "Össz. bevétel", value: `${revenue.toLocaleString("hu-HU")} Ft`, icon: Shield, color: "#d4ff00" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#666666]">{label}</span>
                <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
              </div>
              <p
                className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black"
                style={{ color }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Hibaüzenet */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-sm text-[#ff6b6b]">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {/* Cím sor */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-wide text-white">
            Foglalások moderálása
          </h1>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-lg border border-[#1a1a1a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#888888] transition hover:border-[#333333] hover:text-[#d4ff00]"
          >
            <RefreshCw className="h-3 w-3" strokeWidth={2} />
            Frissítés
          </button>
        </div>

        {/* Táblázat */}
        <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          {bookings.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#555555]">
              Még nincs egyetlen foglalás sem.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-[10px] font-black uppercase tracking-[0.14em] text-[#555555]">
                    <th className="px-5 py-4 font-bold">ID</th>
                    <th className="px-5 py-4 font-bold">Felhasználó</th>
                    <th className="px-5 py-4 font-bold">Felület</th>
                    <th className="px-5 py-4 font-bold">Időszak</th>
                    <th className="px-5 py-4 font-bold">Összeg</th>
                    <th className="px-5 py-4 font-bold">Kreatív</th>
                    <th className="px-5 py-4 font-bold">Állapot</th>
                    <th className="px-5 py-4 font-bold">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const isLoading = actionLoading[booking.id];
                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-[#1a1a1a]/60 transition-colors last:border-0 hover:bg-[#111610]/40"
                      >
                        {/* ID */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-[11px] text-[#555555]">
                            {booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4">
                          <span className="max-w-[160px] truncate text-[12px] text-[#cfcfcf]">
                            {booking.user_email}
                          </span>
                        </td>

                        {/* Billboard ID */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded border border-[#d4ff00]/25 bg-[#d4ff00]/8 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">
                            {booking.billboard_id}
                          </span>
                        </td>

                        {/* Időszak */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[12px] tabular-nums text-[#cfcfcf]">
                              {new Date(booking.start_date).toLocaleDateString("hu-HU", {
                                month: "short",
                                day: "numeric",
                              })}
                              {" – "}
                              {new Date(booking.end_date).toLocaleDateString("hu-HU", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-[10px] text-[#555555]">
                              {new Date(booking.created_at).toLocaleDateString("hu-HU")}
                            </span>
                          </div>
                        </td>

                        {/* Összeg */}
                        <td className="px-5 py-4">
                          <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black tabular-nums text-[#d4ff00]">
                            {Number(booking.total_price).toLocaleString("hu-HU")} Ft
                          </span>
                        </td>

                        {/* Kreatív előnézet */}
                        <td className="px-5 py-4">
                          <CreativeCell url={booking.creative_url} />
                        </td>

                        {/* Állapot */}
                        <td className="px-5 py-4">
                          <StatusBadge status={booking.status} />
                        </td>

                        {/* Műveletek */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* Jóváhagyás */}
                            <button
                              type="button"
                              disabled={!!isLoading || booking.status === "confirmed"}
                              onClick={() => handleAction(booking.id, "approve")}
                              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#d4ff00] transition hover:bg-[#d4ff00]/20 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              {isLoading === "approve" ? (
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#d4ff00]/30 border-t-[#d4ff00]" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                              )}
                              Jóváhagyás
                            </button>

                            {/* Elutasítás */}
                            <button
                              type="button"
                              disabled={!!isLoading || booking.status === "cancelled"}
                              onClick={() => handleAction(booking.id, "reject")}
                              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#ff6b6b]/35 bg-[#ff6b6b]/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff6b6b] transition hover:bg-[#ff6b6b]/15 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              {isLoading === "reject" ? (
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#ff6b6b]/30 border-t-[#ff6b6b]" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                              )}
                              Elutasítás
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-[#333333]">
          VRS Billboards Admin Panel · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
