"use client";

import { Download, FileText } from "lucide-react";

type InvoiceStatus = "Kifizetett" | "Nyitott" | "Lejárt";

type Invoice = {
  id: string;
  number: string;
  campaign: string;
  issued: string;
  due: string;
  amountFt: number;
  status: InvoiceStatus;
};

const MOCK_INVOICES: Invoice[] = [
  { id: "inv-1", number: "2026-0041", campaign: "GY-OP-04 · ETO Park kampány", issued: "2026-03-01", due: "2026-03-31", amountFt: 248_000, status: "Kifizetett" },
  { id: "inv-2", number: "2026-0042", campaign: "SF-OP-06 · Palotai út (Koronás Park)", issued: "2026-03-10", due: "2026-04-09", amountFt: 168_000, status: "Nyitott" },
  { id: "inv-3", number: "2026-0043", campaign: "KC-OP-01 · Izsáki út bevezető", issued: "2026-02-15", due: "2026-03-15", amountFt: 116_000, status: "Lejárt" },
  { id: "inv-4", number: "2026-0044", campaign: "MM-OP-02 · Hild tér (Vasútállomás)", issued: "2026-03-20", due: "2026-04-19", amountFt: 84_000, status: "Nyitott" },
  { id: "inv-5", number: "2026-0045", campaign: "GY-OF-01 · Óriás tábla 10×15 m", issued: "2026-01-05", due: "2026-02-04", amountFt: 360_000, status: "Kifizetett" },
  { id: "inv-6", number: "2026-0046", campaign: "SF-OF-03 · Budai út homlokzat", issued: "2026-02-01", due: "2026-03-01", amountFt: 480_000, status: "Lejárt" },
];

const KPI_CARDS = [
  {
    label: "Kifizetett",
    amount: MOCK_INVOICES.filter((i) => i.status === "Kifizetett").reduce((s, i) => s + i.amountFt, 0),
    color: "#d4ff00",
    bg: "rgba(212,255,0,0.06)",
    border: "rgba(212,255,0,0.18)",
    count: MOCK_INVOICES.filter((i) => i.status === "Kifizetett").length,
  },
  {
    label: "Nyitott",
    amount: MOCK_INVOICES.filter((i) => i.status === "Nyitott").reduce((s, i) => s + i.amountFt, 0),
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.2)",
    count: MOCK_INVOICES.filter((i) => i.status === "Nyitott").length,
  },
  {
    label: "Lejárt",
    amount: MOCK_INVOICES.filter((i) => i.status === "Lejárt").reduce((s, i) => s + i.amountFt, 0),
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
    count: MOCK_INVOICES.filter((i) => i.status === "Lejárt").length,
  },
];

function formatHuDate(iso: string): string {
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  if (status === "Kifizetett")
    return (
      <span className="inline-flex rounded-full border border-[#d4ff00]/40 bg-[#d4ff00]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#d4ff00]">
        Kifizetett
      </span>
    );
  if (status === "Nyitott")
    return (
      <span className="inline-flex rounded-full border border-[#fbbf24]/45 bg-[#fbbf24]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
        Nyitott
      </span>
    );
  return (
    <span className="inline-flex rounded-full border border-[#ef4444]/40 bg-[#ef4444]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ef4444]">
      Lejárt
    </span>
  );
}

export function InvoicesView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">

        {/* Fejléc */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
              <FileText className="h-5 w-5 text-[#d4ff00]" strokeWidth={2} />
              Számlák
            </h1>
            <p className="mt-1 text-[11px] text-[#888888]">
              Kifizetett és nyitott számlák · PDF letöltés elérhető
            </p>
          </div>
        </div>

        {/* KPI sor */}
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
          {KPI_CARDS.map((k) => (
            <article
              key={k.label}
              className="relative overflow-hidden rounded-xl border bg-[#111610] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{ borderColor: k.border, background: k.bg }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg,transparent,${k.color}60,transparent)` }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">{k.label}</p>
              <p
                className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-[clamp(1.5rem,4vw,2rem)] font-black leading-none tabular-nums"
                style={{ color: k.color, textShadow: `0 0 24px ${k.color}44` }}
              >
                {k.amount.toLocaleString("hu-HU")} Ft
              </p>
              <p className="mt-2 text-[11px] text-[#888888]">{k.count} számla</p>
            </article>
          ))}
        </div>

        {/* Tábla */}
        <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0e130d] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[10px] font-black uppercase tracking-[0.14em] text-[#888888]">
                  <th className="px-5 py-4 font-bold">Számlaszám</th>
                  <th className="px-5 py-4 font-bold">Kampány</th>
                  <th className="px-5 py-4 font-bold">Kiállítás</th>
                  <th className="px-5 py-4 font-bold">Határidő</th>
                  <th className="px-5 py-4 font-bold">Összeg</th>
                  <th className="px-5 py-4 font-bold">Állapot</th>
                  <th className="px-5 py-4 font-bold text-right">Letöltés</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[#1a1a1a]/80 text-sm transition-colors last:border-0 hover:bg-[#111610]/60"
                  >
                    <td className="px-5 py-4 font-mono font-black text-[#d4ff00]">{inv.number}</td>
                    <td className="px-5 py-4 font-medium text-white">{inv.campaign}</td>
                    <td className="px-5 py-4 tabular-nums text-[#888888]">{formatHuDate(inv.issued)}</td>
                    <td className="px-5 py-4 tabular-nums text-[#888888]">{formatHuDate(inv.due)}</td>
                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black tabular-nums text-[#d4ff00]">
                        {inv.amountFt.toLocaleString("hu-HU")} Ft
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#888888] transition hover:border-[#d4ff00]/35 hover:text-[#d4ff00]"
                        aria-label={`Számla ${inv.number} letöltése`}
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
