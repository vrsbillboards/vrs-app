"use client";

import { Plus } from "lucide-react";

type BookingsListProps = {
  onNewBooking: () => void;
};

export function BookingsList({ onNewBooking }: BookingsListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-0.5 rounded-lg border border-[var(--b1)] bg-[var(--bg3)] p-0.5">
          {["Aktív", "Függőben", "Befejezett"].map((t, i) => (
            <button
              key={t}
              type="button"
              className={`rounded-md px-4 py-1.5 text-[11px] font-semibold transition-all ${
                i === 0
                  ? "border border-[var(--b2)] bg-[var(--ns)] text-[var(--neon)]"
                  : "border border-transparent bg-transparent text-[var(--t2)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onNewBooking}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--neon)] px-3 py-1.5 text-[11px] font-bold text-[#070908] hover:shadow-[0_4px_12px_rgba(212,255,0,0.25)]"
        >
          <Plus className="h-[11px] w-[11px]" strokeWidth={2.5} />
          Új foglalás
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--b1)] bg-[var(--card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Felület", "Helyszín", "Időszak", "Összeg", "Állapot", ""].map((h) => (
                <th
                  key={h}
                  className="border-b border-[var(--b1)] bg-[var(--bg3)] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="transition-colors hover:bg-[rgba(212,255,0,0.02)]">
              <td className="border-b border-[var(--b1)] px-4 py-3 text-xs text-[var(--text)]">
                <div className="mb-0.5 font-bold">GYOP05 – Mártírok u. ETO Park</div>
                <div className="text-[10px] text-[var(--t2)]">Óriásplakát · 504×238 cm</div>
              </td>
              <td className="border-b border-[var(--b1)] px-4 py-3 text-xs">Győr</td>
              <td className="border-b border-[var(--b1)] px-4 py-3 text-xs">
                <div>máj. 1 – máj. 28</div>
                <div className="text-[10px] text-[var(--t2)]">4 hét</div>
              </td>
              <td className="border-b border-[var(--b1)] px-4 py-3 font-[family-name:var(--font-barlow-condensed)] text-[17px] font-black text-[var(--neon)]">
                240 000 Ft
              </td>
              <td className="border-b border-[var(--b1)] px-4 py-3">
                <span className="inline-block rounded-[10px] border border-[rgba(212,255,0,0.3)] bg-[rgba(212,255,0,0.1)] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[var(--neon)]">
                  Aktív
                </span>
              </td>
              <td className="border-b border-[var(--b1)] px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-[var(--b1)] bg-transparent px-2 py-1 text-[10px] font-semibold text-[var(--t2)] hover:border-[var(--b2)] hover:text-[var(--text)]"
                >
                  Részlet
                </button>
              </td>
            </tr>
            <tr className="transition-colors hover:bg-[rgba(212,255,0,0.02)]">
              <td className="px-4 py-3 text-xs text-[var(--text)]">
                <div className="mb-0.5 font-bold">SZFP01 – Palotai út centrum</div>
                <div className="text-[10px] text-[var(--t2)]">Óriásplakát · 504×238 cm</div>
              </td>
              <td className="px-4 py-3 text-xs">Székesfehérvár</td>
              <td className="px-4 py-3 text-xs">
                <div>máj. 15 – jún. 11</div>
                <div className="text-[10px] text-[var(--t2)]">4 hét</div>
              </td>
              <td className="px-4 py-3 font-[family-name:var(--font-barlow-condensed)] text-[17px] font-black text-[var(--neon)]">
                200 000 Ft
              </td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-[10px] border border-[rgba(255,200,50,0.3)] bg-[rgba(255,200,50,0.1)] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[var(--yellow)]">
                  Függőben
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-[var(--b1)] bg-transparent px-2 py-1 text-[10px] font-semibold text-[var(--t2)] hover:border-[var(--b2)] hover:text-[var(--text)]"
                >
                  Részlet
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
