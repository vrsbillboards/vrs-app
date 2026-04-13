"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { CalendarPlus, LogIn } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase, type DbBooking } from "@/lib/supabaseClient";
import { billboards } from "@/lib/billboards";

type BookingTab = "active" | "pending" | "done";

type BookingRow = {
  id: string;
  surface: string;
  location: string;
  start: Date;
  end: Date;
  amountFt: number;
  status: "Aktív" | "Függőben" | "Befejezett";
};

function dbToRow(b: DbBooking): BookingRow {
  const bb = billboards.find((x) => x.id === b.billboard_id);
  const surface = bb ? `${bb.id} · ${bb.name}` : b.billboard_id;
  const location = bb?.city ?? "—";
  const statusMap: Record<string, BookingRow["status"]> = {
    confirmed: "Aktív",
    pending: "Függőben",
    cancelled: "Befejezett",
  };
  return {
    id: b.id,
    surface,
    location,
    start: new Date(b.start_date),
    end: new Date(b.end_date),
    amountFt: b.total_price,
    status: statusMap[b.status] ?? "Függőben",
  };
}

function formatHuDate(d: Date): string {
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

function durationDays(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (86400 * 1000)));
}

function tabLabel(t: BookingTab): string {
  return t === "active" ? "Aktív" : t === "pending" ? "Függőben" : "Befejezett";
}

function statusPill(status: BookingRow["status"]) {
  if (status === "Aktív") {
    return (
      <span className="inline-flex rounded-full border border-[#d4ff00]/40 bg-[#d4ff00]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#d4ff00]">
        Aktív
      </span>
    );
  }
  if (status === "Függőben") {
    return (
      <span className="inline-flex rounded-full border border-[#f59e0b]/45 bg-[#f59e0b]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
        Függőben
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#888888]">
      Befejezett
    </span>
  );
}

function DetailField({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#555555]">{label}</span>
      <span
        className={`text-[13px] font-semibold ${mono ? "font-mono" : ""} ${accent ? "text-[#d4ff00]" : "text-[#cfcfcf]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#1a1a1a]/80">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-4 sm:px-5">
          <div className="h-4 w-full animate-pulse rounded bg-[#1a1a1a]" />
        </td>
      ))}
    </tr>
  );
}

export type BookingsViewProps = {
  onRequestBooking?: (initialBillboardId?: string | null) => void;
  user: User | null;
  onOpenAuth?: () => void;
};

export function BookingsView({ onRequestBooking, user, onOpenAuth }: BookingsViewProps) {
  const [tab, setTab] = useState<BookingTab>("pending");
  const [allRows, setAllRows] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[BookingsView] Supabase fetch error:", error.message);
        } else {
          setAllRows((data as DbBooking[]).map(dbToRow));
        }
        setIsLoading(false);
      });
  }, [user]);

  const rows = useMemo(() => {
    const want = tab === "active" ? "Aktív" : tab === "pending" ? "Függőben" : "Befejezett";
    return allRows.filter((r) => r.status === want);
  }, [allRows, tab]);

  // Nem bejelentkezett állapot
  if (!user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 bg-[#000000] px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0c0f0b] text-[#888888]">
          <LogIn className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
            Foglalásaid megtekintéséhez jelentkezz be
          </p>
          <p className="mt-1 text-sm text-[#888888]">
            A saját foglalásaid és kampányaid itt jelennek meg.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAuth}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-wider text-black transition hover:brightness-110"
        >
          <LogIn className="h-4 w-4" strokeWidth={2.5} />
          Bejelentkezés
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        {/* Fejléc — tab + gomb */}
        <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap gap-1 rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] p-1"
            role="tablist"
            aria-label="Foglalások szűrése"
          >
            {(["pending", "active", "done"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                  tab === t
                    ? "bg-[#d4ff00] text-black shadow-[0_0_20px_rgba(212,255,0,0.2)]"
                    : "text-[#888888] hover:bg-[#111610] hover:text-white"
                }`}
              >
                {tabLabel(t)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onRequestBooking?.()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#d4ff00]/45 bg-[#d4ff00] px-5 py-2.5 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_0_24px_rgba(212,255,0,0.2)] transition hover:brightness-105 active:scale-[0.99]"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={2.5} />
            Új foglalás
          </button>
        </div>

        {/* Táblázat */}
        <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0e130d] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[10px] font-black uppercase tracking-[0.14em] text-[#888888]">
                  <th className="px-4 py-4 font-bold sm:px-5">Felület</th>
                  <th className="px-4 py-4 font-bold sm:px-5">Helyszín</th>
                  <th className="px-4 py-4 font-bold sm:px-5">Időszak</th>
                  <th className="px-4 py-4 font-bold sm:px-5">Összeg</th>
                  <th className="px-4 py-4 font-bold sm:px-5">Állapot</th>
                  <th className="px-4 py-4 font-bold sm:px-5 sm:text-right" />
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                  : rows.map((row) => {
                      const days = durationDays(row.start, row.end);
                      const isExpanded = expandedIds.has(row.id);
                      return (
                        <Fragment key={row.id}>
                          <tr
                            className={`border-b border-[#1a1a1a]/80 transition-colors hover:bg-[#111610]/50 ${isExpanded ? "bg-[#111610]/30" : "last:border-0"}`}
                          >
                            <td className="px-4 py-4 font-semibold text-white sm:px-5">
                              {row.surface}
                            </td>
                            <td className="px-4 py-4 text-[#888888] sm:px-5">{row.location}</td>
                            <td className="px-4 py-4 text-[#cfcfcf] sm:px-5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium tabular-nums">
                                  {formatHuDate(row.start)} – {formatHuDate(row.end)}
                                </span>
                                <span className="text-[11px] text-[#888888]">{days} nap</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 sm:px-5">
                              <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black tabular-nums text-[#d4ff00]">
                                {row.amountFt.toLocaleString("hu-HU")} Ft
                              </span>
                            </td>
                            <td className="px-4 py-4 sm:px-5">{statusPill(row.status)}</td>
                            <td className="px-4 py-4 text-right sm:px-5">
                              <button
                                type="button"
                                onClick={() => toggleExpand(row.id)}
                                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                                  isExpanded
                                    ? "border-[#d4ff00]/45 bg-[#d4ff00]/10 text-[#d4ff00]"
                                    : "border-white/[0.12] bg-transparent text-[#888888] hover:border-[#d4ff00]/35 hover:text-[#d4ff00]"
                                }`}
                              >
                                {isExpanded ? "Bezárás" : "Részletek"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b border-[#1a1a1a]/80 last:border-0">
                              <td colSpan={6} className="bg-[#0a0d09] px-5 py-5">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                                  <DetailField label="Foglalás ID" value={row.id.slice(0, 8).toUpperCase()} mono />
                                  <DetailField label="Helyszín" value={row.location} />
                                  <DetailField label="Kezdés" value={formatHuDate(row.start)} />
                                  <DetailField label="Befejezés" value={formatHuDate(row.end)} />
                                  <DetailField label="Időtartam" value={`${days} nap (${Math.ceil(days / 7)} hét)`} />
                                  <DetailField label="Összeg" value={`${row.amountFt.toLocaleString("hu-HU")} Ft`} accent />
                                  <DetailField label="Állapot" value={row.status} />
                                  <DetailField label="Felület" value={row.surface} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {!isLoading && rows.length === 0 && (
            <div className="border-t border-[#1a1a1a] px-6 py-12 text-center text-sm text-[#888888]">
              {allRows.length === 0
                ? "Még nincs egyetlen foglalásod sem. Kezdd az első kampányodat!"
                : "Ebben a kategóriában nincs foglalás."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
