"use client";

import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
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

function surfaceLine(id: string): { surface: string; location: string } | null {
  const b = billboards.find((x) => x.id === id);
  if (!b) return null;
  return { surface: `${b.id} · ${b.name}`, location: b.city };
}

const g1 = surfaceLine("GY001");
const k1 = surfaceLine("KC001");
const s1 = surfaceLine("SF001");

const MOCK_BOOKINGS: BookingRow[] = [
  {
    id: "bk-1",
    surface: g1?.surface ?? "GY001 · Mártírok út · centrum",
    location: g1?.location ?? "Győr",
    start: new Date(2026, 3, 1),
    end: new Date(2026, 3, 28),
    amountFt: 240_000,
    status: "Aktív",
  },
  {
    id: "bk-2",
    surface: k1?.surface ?? "KC001 · Izsáki út",
    location: k1?.location ?? "Kecskemét",
    start: new Date(2026, 3, 10),
    end: new Date(2026, 4, 7),
    amountFt: 198_000,
    status: "Függőben",
  },
  {
    id: "bk-3",
    surface: s1?.surface ?? "SF001 · Palotai út",
    location: s1?.location ?? "Székesfehérvár",
    start: new Date(2026, 1, 3),
    end: new Date(2026, 2, 2),
    amountFt: 156_000,
    status: "Befejezett",
  },
];

function formatHuDate(d: Date): string {
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

function durationDays(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (86400 * 1000)));
}

function tabLabel(t: BookingTab): string {
  switch (t) {
    case "active":
      return "Aktív";
    case "pending":
      return "Függőben";
    case "done":
      return "Befejezett";
  }
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

export type BookingsViewProps = {
  onRequestBooking?: (initialBillboardId?: string | null) => void;
};

export function BookingsView({ onRequestBooking }: BookingsViewProps) {
  const [tab, setTab] = useState<BookingTab>("active");

  const rows = useMemo(() => {
    const want =
      tab === "active" ? "Aktív" : tab === "pending" ? "Függőben" : "Befejezett";
    return MOCK_BOOKINGS.filter((r) => r.status === want);
  }, [tab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap gap-1 rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] p-1"
            role="tablist"
            aria-label="Foglalások szűrése"
          >
            {(["active", "pending", "done"] as const).map((t) => (
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
                {rows.map((row) => {
                  const days = durationDays(row.start, row.end);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[#1a1a1a]/80 transition-colors last:border-0 hover:bg-[#111610]/50"
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
                          <span className="text-[11px] text-[#888888]">{days} nap · kampány</span>
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
                          className="rounded-lg border border-white/[0.12] bg-transparent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#888888] transition hover:border-[#d4ff00]/35 hover:text-[#d4ff00]"
                        >
                          Részletek
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 ? (
            <div className="border-t border-[#1a1a1a] px-6 py-12 text-center text-sm text-[#888888]">
              Ebben a kategóriában még nincs foglalás.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
