"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Billboard } from "@/lib/billboards";

type AnalyticsProps = {
  billboards: Billboard[];
};

const BAR_DAYS = [
  { label: "H", target: 52, val: "52K" },
  { label: "K", target: 78, val: "78K" },
  { label: "Sze", target: 65, val: "65K" },
  { label: "Cs", target: 91, val: "91K" },
  { label: "P", target: 88, val: "88K" },
  { label: "Szo", target: 72, val: "72K" },
  { label: "V", target: 59, val: "59K" },
];

export function Analytics({ billboards }: AnalyticsProps) {
  const totalImp = 505000;
  const spend = 0;
  const daily = 0;
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      barRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = BAR_DAYS[i]?.target ?? 0;
        el.style.height = `${target}%`;
      });
    });
    return () => cancelAnimationFrame(t);
  }, []);

  const topPerf = [...billboards]
    .sort((a, b) => parseInt(b.ots.replace(/\s/g, ""), 10) - parseInt(a.ots.replace(/\s/g, ""), 10))
    .slice(0, 4);

  const maxOts = Math.max(
    ...topPerf.map((b) => parseInt(b.ots.replace(/\s/g, ""), 10)),
    1
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-5">
      <div className="grid shrink-0 grid-cols-4 gap-2.5 max-md:grid-cols-2">
        <Kpi
          label="Összes megjelenés"
          value={totalImp.toLocaleString("hu-HU")}
          change={
            <>
              <span className="text-[var(--neon)]">↑ 14%</span> előző hóhoz
            </>
          }
        />
        <Kpi
          label="Elköltött összeg"
          value={`${spend.toLocaleString("hu-HU")} Ft`}
          change={
            <>
              <span className="text-[var(--neon)]">↑ 8%</span> előző hóhoz
            </>
          }
        />
        <Kpi
          label="Aktív kampányok"
          value="2"
          change={
            <>
              <span className="text-[var(--neon)]">↑ 1</span> ezen a héten
            </>
          }
        />
        <Kpi
          label="Átl. napi megjelenés"
          value={daily.toLocaleString("hu-HU")}
          change={
            <>
              <span className="text-[var(--neon)]">↑ 5%</span> előző hóhoz
            </>
          }
        />
      </div>
      <div className="grid grid-cols-[1fr_360px] gap-3.5 max-lg:grid-cols-1">
        <div className="rounded-xl border border-[var(--b1)] bg-[var(--card)] p-[18px]">
          <div className="mb-3.5 flex items-center justify-between text-[13px] font-bold text-[var(--text)]">
            Heti megjelenések
            <span className="text-[11px] font-normal text-[var(--t2)]">elmúlt 7 nap</span>
          </div>
          <div className="relative">
            <div className="relative flex h-[140px] items-end gap-1.5 pb-[18px]">
              <div className="pointer-events-none absolute inset-0 bottom-[18px] flex flex-col justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-px w-full bg-[var(--b1)]" />
                ))}
              </div>
              {BAR_DAYS.map((d, i) => (
                <div key={d.label} className="relative flex min-w-0 flex-1 flex-col items-center">
                  <div
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    data-val={d.val}
                    className="group relative w-full rounded-t bg-[linear-gradient(180deg,var(--neon),rgba(212,255,0,0.3))] transition-[height] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ height: 0 }}
                  >
                    <span className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-[var(--t2)] opacity-0 transition-opacity group-hover:opacity-100">
                      {d.val}
                    </span>
                  </div>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-[var(--t3)]">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--b1)] bg-[var(--card)] p-[18px]">
          <div className="mb-2 flex items-center justify-between text-[13px] font-bold text-[var(--text)]">
            Kampányok aránya
            <span className="text-[11px] font-normal text-[var(--t2)]">megjelenés szerint</span>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <svg width="110" height="110" viewBox="0 0 110 110" className="shrink-0">
              <circle cx="55" cy="55" r="44" fill="none" stroke="var(--bg3)" strokeWidth="13" />
              <circle
                cx="55"
                cy="55"
                r="44"
                fill="none"
                stroke="var(--neon)"
                strokeWidth="13"
                strokeDasharray="165 111"
                strokeDashoffset="23"
                strokeLinecap="round"
              />
              <circle
                cx="55"
                cy="55"
                r="44"
                fill="none"
                stroke="var(--yellow)"
                strokeWidth="13"
                strokeDasharray="82 194"
                strokeDashoffset="-142"
                strokeLinecap="round"
              />
              <circle
                cx="55"
                cy="55"
                r="44"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="13"
                strokeDasharray="30 246"
                strokeDashoffset="-224"
                strokeLinecap="round"
              />
              <text
                x="55"
                y="51"
                textAnchor="middle"
                fill="var(--neon)"
                className="font-[family-name:var(--font-barlow-condensed)] text-[17px] font-black"
              >
                505K
              </text>
              <text x="55" y="64" textAnchor="middle" fill="var(--t2)" fontSize="8">
                megjelenés
              </text>
            </svg>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--neon)]" />
                <span className="flex-1 text-[var(--t2)]">GYOP05 – Győr</span>
                <span className="font-semibold text-[var(--text)]">43%</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--yellow)]" />
                <span className="flex-1 text-[var(--t2)]">SZFP01 – Fehérvár</span>
                <span className="font-semibold text-[var(--text)]">28%</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--blue)]" />
                <span className="flex-1 text-[var(--t2)]">Egyéb</span>
                <span className="font-semibold text-[var(--text)]">29%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-[var(--b1)] bg-[var(--card)] p-[18px]">
        <div className="mb-3 flex items-center justify-between text-[13px] font-bold text-[var(--text)]">
          Top teljesítő felületek
          <span className="text-[11px] font-normal text-[var(--t2)]">becsült megjelenés/nap</span>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {topPerf.map((b, idx) => {
              const v = parseInt(b.ots.replace(/\s/g, ""), 10);
              const pct = Math.round((v / maxOts) * 100);
              return (
                <tr key={b.id} className="border-b border-[var(--b1)] last:border-b-0">
                  <td className="py-2 pr-2 align-middle">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-[15px] font-black text-[var(--t3)]">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    <div className="font-semibold text-[var(--text)]">{b.id}</div>
                    <div className="text-[10px] text-[var(--t2)]">{b.city}</div>
                  </td>
                  <td className="min-w-[80px] py-2 align-middle">
                    <div className="h-[3px] overflow-hidden rounded-sm bg-[var(--bg3)]">
                      <div
                        className="h-full rounded-sm bg-[var(--neon)] transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2 text-right align-middle font-[family-name:var(--font-barlow-condensed)] text-[13px] font-bold whitespace-nowrap text-[var(--neon)]">
                    ~{b.ots}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: ReactNode;
}) {
  return (
    <div className="relative cursor-default overflow-hidden rounded-[10px] border border-[var(--b1)] bg-[var(--card)] p-[15px] transition-all hover:-translate-y-px hover:border-[var(--b2)]">
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-[var(--neon)]" />
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
        {label}
      </div>
      <div className="font-[family-name:var(--font-barlow-condensed)] text-[30px] font-black leading-none text-[var(--neon)] [text-shadow:0_0_18px_rgba(212,255,0,0.2)]">
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--t2)]">{change}</div>
    </div>
  );
}
