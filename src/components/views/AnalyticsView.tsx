"use client";

import { useEffect, useMemo, useRef } from "react";
import { TrendingUp } from "lucide-react";

const NEON = "#d4ff00";

const WEEKLY_DATA = [
  { label: "H", short: "Hétfő", imp: 51800, display: "51,8K" },
  { label: "K", short: "Kedd", imp: 78200, display: "78,2K" },
  { label: "Sze", short: "Szerda", imp: 65100, display: "65,1K" },
  { label: "Cs", short: "Csütörtök", imp: 91400, display: "91,4K" },
  { label: "P", short: "Péntek", imp: 88300, display: "88,3K" },
  { label: "Szo", short: "Szombat", imp: 72100, display: "72,1K" },
  { label: "V", short: "Vasárnap", imp: 59200, display: "59,2K" },
] as const;

const CAMPAIGN_SHARE = [
  { id: "GY001", name: "Győr hálózat", pct: 43, imp: 217150, color: NEON, line: "rgba(212,255,0,0.55)" },
  { id: "SF001", name: "Székesfehérvár", pct: 28, imp: 141400, color: "#ffc832", line: "rgba(255,200,50,0.45)" },
  { id: "MM001", name: "Mosonmagyaróvár", pct: 18, imp: 90900, color: "#38bdf8", line: "rgba(56,189,248,0.45)" },
  { id: "Egyéb", name: "Többi város (6ékony)", pct: 11, imp: 55550, color: "#4d7cff", line: "rgba(77,124,255,0.45)" },
] as const;

/** Top teljesítők (relatív mutató, max = 100) */
const TOP_SURFACES = [
  { id: "GY001", city: "Győr", score: 100 },
  { id: "SF001", city: "Székesfehérvár", score: 86 },
  { id: "KC001", city: "Kecskemét", score: 72 },
  { id: "SN001", city: "Szolnok", score: 64 },
] as const;

const KPI = [
  {
    label: "Összes megjelenés",
    value: "505 120",
    unit: "",
    delta: "14,2",
    deltaLabel: "előző hóhoz",
    positive: true,
  },
  {
    label: "Elköltött összeg",
    value: "440 000",
    unit: "Ft",
    delta: "8,1",
    deltaLabel: "előző hóhoz",
    positive: true,
  },
  {
    label: "Aktív kampányok",
    value: "12",
    unit: "",
    delta: "3",
    deltaLabel: "új ezen a héten",
    positive: true,
    deltaNumeric: true,
  },
  {
    label: "Átl. napi megjelenés",
    value: "72 160",
    unit: "",
    delta: "5,4",
    deltaLabel: "előző héthez (WoW)",
    positive: true,
  },
] as const;

function campaignConicBackground() {
  let acc = 0;
  const parts = CAMPAIGN_SHARE.map((c) => {
    const start = acc;
    acc += c.pct;
    return `${c.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(from -90deg, ${parts.join(", ")})`;
}

export function AnalyticsView() {
  const maxImp = Math.max(...WEEKLY_DATA.map((d) => d.imp), 1);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((r) => Math.round((maxImp * r) / 1000));
  const donutBg = useMemo(() => campaignConicBackground(), []);
  const topMax = Math.max(...TOP_SURFACES.map((t) => t.score), 1);

  useEffect(() => {
    const run = () => {
      barRefs.current.forEach((el, i) => {
        if (!el) return;
        const pct = (WEEKLY_DATA[i]?.imp ?? 0) / maxImp;
        el.style.height = `${pct * 100}%`;
      });
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(run));
    return () => cancelAnimationFrame(id);
  }, [maxImp]);

  const totalWeekly = WEEKLY_DATA.reduce((s, d) => s + d.imp, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#000000] px-4 py-4 pb-8 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
            Analitika
          </h1>
          <p className="mt-0.5 text-[11px] font-medium text-[#888888]">
            VRS hálózat · Utolsó frissítés: élő adatcsatorna
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0f0b] px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4ff00] opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4ff00]" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4ff00]">
            Adatok élőben
          </span>
        </div>
      </div>

      {/* KPI sor */}
      <div className="grid shrink-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {KPI.map((k) => (
          <article
            key={k.label}
            className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#111610] p-4 shadow-[inset_0_1px_0_rgba(212,255,0,0.04)] transition-colors hover:border-[rgba(212,255,0,0.2)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4ff00]/45 to-transparent opacity-70" />
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                {k.label}
              </span>
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#d4ff00]/35 transition-colors group-hover:text-[#d4ff00]" />
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(1.65rem,4.5vw,2.15rem)] font-black leading-none tracking-tight text-[#d4ff00] tabular-nums [text-shadow:0_0_28px_rgba(212,255,0,0.22)]">
                {k.value}
              </span>
              {k.unit ? <span className="text-[11px] font-semibold text-[#888888]">{k.unit}</span> : null}
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-1 border-t border-white/[0.06] pt-2.5 text-[10px] leading-snug">
              {k.positive ? (
                <>
                  <span className="font-bold text-[#d4ff00]">
                    {"deltaNumeric" in k && k.deltaNumeric ? "↑ +" : "↑ "}
                    {k.delta}
                    {"deltaNumeric" in k && k.deltaNumeric ? "" : "%"}
                  </span>{" "}
                  <span className="text-[#888888]">{k.deltaLabel}</span>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_min(400px,38%)]">
        {/* Heti megjelenések */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f0b] p-4 sm:p-5 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
                Heti megjelenések
              </h2>
              <p className="mt-0.5 text-[11px] text-[#888888]">Elmúlt 7 nap · összesített OTS becslés</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Összesen</div>
              <div className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black tabular-nums text-[#d4ff00]">
                {totalWeekly.toLocaleString("hu-HU")}
              </div>
            </div>
          </div>

          <div className="relative flex h-[min(300px,40vh)] min-h-[230px] items-stretch gap-3 sm:gap-4">
            <div className="flex w-9 shrink-0 flex-col justify-between py-1 pb-7 text-right sm:w-10">
              {yTicks.map((t, i) => (
                <span key={i} className="text-[9px] font-medium tabular-nums text-[#888888]">
                  {t === 0 ? "0" : `${t}k`}
                </span>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between pb-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-px w-full bg-white/[0.06]" />
                ))}
              </div>

              <div className="relative flex h-full items-end gap-1 sm:gap-2 pb-7 pt-2">
                {WEEKLY_DATA.map((d, i) => (
                  <div
                    key={d.label}
                    className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div
                      title={`${d.short}: ${d.imp.toLocaleString("hu-HU")}`}
                      className="relative mx-auto flex h-[88%] w-full max-w-[56px] items-end justify-center"
                    >
                      <div
                        ref={(el) => {
                          barRefs.current[i] = el;
                        }}
                        className="relative w-full rounded-t-md border border-[#d4ff00]/25 shadow-[0_0_28px_rgba(212,255,0,0.18)] transition-[height] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#d4ff00]/50 hover:shadow-[0_0_36px_rgba(212,255,0,0.28)]"
                        style={{
                          height: "0%",
                          background: `linear-gradient(180deg, ${NEON} 0%, rgba(212,255,0,0.45) 32%, rgba(212,255,0,0.12) 72%, rgba(212,255,0,0) 100%)`,
                        }}
                      >
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.1] bg-[#111610] px-2 py-1 font-[family-name:var(--font-barlow-condensed)] text-[11px] font-black tabular-nums text-[#d4ff00] opacity-0 shadow-lg ring-1 ring-[#d4ff00]/15 transition-opacity duration-200 group-hover:opacity-100">
                          {d.display}
                        </span>
                      </div>
                    </div>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-[#888888]">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/[0.06] pt-3 text-[10px] text-[#888888]">
            <span>
              Csúcs: <strong className="text-[#d4ff00]">Cs · 91,4k</strong>
            </span>
            <span>
              Heti átlag:{" "}
              <strong className="text-white">
                {(totalWeekly / 7).toLocaleString("hu-HU", { maximumFractionDigits: 0 })}
              </strong>
            </span>
            <span>Időzóna: CET · 7 napos ablak</span>
          </div>
        </section>

        {/* Kampányok aránya */}
        <section className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f0b] p-4 sm:p-5 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
          <div className="mb-4">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
              Kampányok aránya
            </h2>
            <p className="mt-0.5 text-[11px] text-[#888888]">Megjelenés szerinti megoszlás · becsült</p>
          </div>

          <div className="mb-5 flex flex-col items-center gap-5 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start sm:justify-between">
            {/* SVG-szerű gyűrű: tiszta conic-gradient */}
            <div className="relative shrink-0" aria-hidden>
              <div
                className="h-[132px] w-[132px] rounded-full p-[10px] sm:h-[148px] sm:w-[148px]"
                style={{ background: donutBg }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0c0f0b] text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                    Hálózat
                  </span>
                  <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-[#d4ff00]">
                    100%
                  </span>
                  <span className="text-[9px] text-[#888888]">megoszlás</span>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2 self-stretch">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Összesített sáv</p>
              <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#000000] p-1">
                <div className="flex h-4 w-full overflow-hidden rounded-md">
                  {CAMPAIGN_SHARE.map((c) => (
                    <div
                      key={c.id}
                      className="h-full min-w-0 transition-all duration-500 first:rounded-l-md last:rounded-r-md"
                      style={{
                        width: `${c.pct}%`,
                        background: `linear-gradient(180deg, ${c.color}ee, ${c.color}55)`,
                        boxShadow: `inset 0 1px 0 ${c.line}`,
                      }}
                      title={`${c.name}: ${c.pct}%`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between px-0.5 text-[9px] font-bold uppercase tracking-wider text-[#888888]">
                  <span>0%</span>
                  <span className="text-[#d4ff00]/90">100% megjelenés</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-0 divide-y divide-white/[0.06]">
            {CAMPAIGN_SHARE.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                <div
                  className="h-10 w-1 shrink-0 rounded-full"
                  style={{ background: c.color, boxShadow: `0 0 12px ${c.color}55` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-mono text-[11px] font-black text-[#d4ff00]">{c.id}</span>
                    <span className="truncate text-[11px] font-semibold text-white">{c.name}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#111610]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${c.pct}%`,
                          background: `linear-gradient(90deg, ${c.color}, ${c.color}aa)`,
                        }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right font-[family-name:var(--font-barlow-condensed)] text-sm font-black tabular-nums text-white">
                      {c.pct}%
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black tabular-nums text-[#d4ff00]">
                    {c.imp.toLocaleString("hu-HU")}
                  </div>
                  <div className="text-[9px] font-medium uppercase tracking-wide text-[#888888]">
                    megjelenés
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-white/[0.08] bg-[#111610]/60 px-3 py-2 text-[10px] leading-relaxed text-[#888888]">
            A százalékos arányok modellbecslésen alapulnak; a végleges riport a számlázási időszak
            lezárásakor záródik.
          </div>
        </section>
      </div>

      {/* Top teljesítő felületek */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f0b] shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
              Top teljesítő felületek
            </h2>
            <p className="mt-0.5 text-[11px] text-[#888888]">
              Relatív teljesítmény · az elmúlt 30 nap OTS-alapú becslése
            </p>
          </div>
          <span className="rounded-md border border-[#d4ff00]/25 bg-[#d4ff00]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d4ff00]">
            Top 4
          </span>
        </div>

        <div className="overflow-x-auto px-2 pb-4 sm:px-5">
          <table className="w-full min-w-[320px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                <th className="px-2 py-3 font-bold sm:px-3">Felület ID</th>
                <th className="px-2 py-3 font-bold sm:px-3">Város</th>
                <th className="min-w-[180px] px-2 py-3 font-bold sm:px-3">Teljesítmény</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {TOP_SURFACES.map((row, idx) => {
                const rel = (row.score / topMax) * 100;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.04] transition-colors hover:bg-[#111610]/80"
                  >
                    <td className="px-2 py-3.5 font-mono font-black text-[#d4ff00] sm:px-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#111610] text-[10px] text-[#888888]">
                          {idx + 1}
                        </span>
                        {row.id}
                      </span>
                    </td>
                    <td className="px-2 py-3.5 font-medium text-white sm:px-3">{row.city}</td>
                    <td className="px-2 py-3.5 sm:px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 min-w-[96px] flex-1 overflow-hidden rounded-full bg-[#111610] ring-1 ring-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#d4ff00] via-[#e8ff5c] to-[#d4ff00] shadow-[0_0_14px_rgba(212,255,0,0.35)] transition-all duration-500"
                            style={{ width: `${rel}%` }}
                            title={`${row.score}% (relatív)`}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right font-[family-name:var(--font-barlow-condensed)] text-base font-black tabular-nums text-[#d4ff00]">
                          {row.score}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
