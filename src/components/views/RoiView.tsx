"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("hu-HU");
}

function fmtPct(n: number): string {
  return n.toLocaleString("hu-HU", { maximumFractionDigits: 1 });
}

type SliderProps = {
  label: string;
  sub?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  displayValue: string;
};

function Slider({ label, sub, min, max, step, value, onChange, displayValue }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  // A track fill inline gradient-tel: nincs layering, natívan húzható
  const trackBg = `linear-gradient(to right, #d4ff00 ${pct}%, #222822 ${pct}%)`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">{label}</p>
          {sub ? <p className="mt-0.5 text-[10px] text-[#555555]">{sub}</p> : null}
        </div>
        <span className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tabular-nums text-[#d4ff00]">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className={[
          "w-full cursor-grab active:cursor-grabbing",
          "h-2 appearance-none rounded-full outline-none",
          // webkit thumb
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black",
          "[&::-webkit-slider-thumb]:bg-[#d4ff00]",
          "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,255,0,0.55)]",
          "[&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-[1.2] [&::-webkit-slider-thumb]:active:scale-[1.1]",
          // moz thumb
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black",
          "[&::-moz-range-thumb]:bg-[#d4ff00]",
          "[&::-moz-range-thumb]:shadow-[0_0_12px_rgba(212,255,0,0.55)]",
          "[&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing",
          // moz track (filled left side via separate element)
          "[&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
          "[&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[#d4ff00]",
        ].join(" ")}
        style={{ background: trackBg }}
      />
    </div>
  );
}

type ResultCardProps = {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  positive?: boolean | null;
};

function ResultCard({ label, value, unit, accent, positive }: ResultCardProps) {
  const isPos = positive === true;
  const isNeg = positive === false;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-colors ${
        accent
          ? "border-[#d4ff00]/25 bg-[#d4ff00]/05"
          : "border-white/[0.07] bg-[#111610]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: accent
            ? "linear-gradient(90deg,transparent,#d4ff00aa,transparent)"
            : "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)",
        }}
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span
          className={`font-[family-name:var(--font-barlow-condensed)] text-[clamp(1.5rem,4vw,2.1rem)] font-black leading-none tabular-nums ${
            accent
              ? "text-[#d4ff00] [text-shadow:0_0_24px_rgba(212,255,0,0.22)]"
              : isNeg
                ? "text-[#ef4444]"
                : "text-white"
          }`}
        >
          {value}
        </span>
        {unit ? <span className="text-[12px] font-semibold text-[#888888]">{unit}</span> : null}
      </div>
      {positive != null ? (
        <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${isPos ? "text-[#d4ff00]" : "text-[#ef4444]"}`}>
          <TrendingUp className={`h-3 w-3 ${isNeg ? "rotate-180" : ""}`} strokeWidth={3} />
          {isPos ? "Pozitív megtérülés" : "Negatív megtérülés"}
        </div>
      ) : null}
    </div>
  );
}

export function RoiView() {
  const [budget, setBudget] = useState(200_000);
  const [ots, setOts] = useState(35_000);
  const [days, setDays] = useState(14);
  const [convRate, setConvRate] = useState(2);
  const [aov, setAov] = useState(12_000);

  const results = useMemo(() => {
    const impressions = ots * days;
    const conversions = impressions * (convRate / 100);
    const revenue = conversions * aov;
    const roi = budget > 0 ? ((revenue - budget) / budget) * 100 : 0;
    return { impressions, conversions, revenue, roi };
  }, [budget, ots, days, convRate, aov]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">

        {/* Fejléc */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
              <Calculator className="h-5 w-5 text-[#d4ff00]" strokeWidth={2} />
              ROI Kalkulátor
            </h1>
            <p className="mt-1 text-[11px] text-[#888888]">
              Becsült kampánymegtérülés valós idejű számítással
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0f0b] px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4ff00] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4ff00]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4ff00]">
              Élő számítás
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[min(420px,44%)_1fr]">

          {/* ── Bal: Bemenő paraméterek ── */}
          <aside className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#0c0f0b] p-5 shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-wider text-white">
              Kampányparaméterek
            </h2>

            <Slider
              label="Költségkeret"
              sub="A teljes kampánybüdzsé"
              min={50_000} max={2_000_000} step={10_000}
              value={budget}
              onChange={setBudget}
              displayValue={`${fmt(budget)} Ft`}
            />
            <Slider
              label="Átlagos OTS / nap"
              sub="Becsült napi láthatóság"
              min={5_000} max={100_000} step={1_000}
              value={ots}
              onChange={setOts}
              displayValue={fmt(ots)}
            />
            <Slider
              label="Időtartam"
              sub="Kampányfutás napokban"
              min={1} max={90} step={1}
              value={days}
              onChange={setDays}
              displayValue={`${days} nap`}
            />
            <Slider
              label="Konverziós arány"
              sub="Megjelenőkből cselekvők aránya"
              min={0.1} max={10} step={0.1}
              value={convRate}
              onChange={setConvRate}
              displayValue={`${convRate.toLocaleString("hu-HU", { minimumFractionDigits: 1 })}%`}
            />
            <Slider
              label="Kosárérték (AOV)"
              sub="Átlagos rendelési érték"
              min={1_000} max={100_000} step={500}
              value={aov}
              onChange={setAov}
              displayValue={`${fmt(aov)} Ft`}
            />
          </aside>

          {/* ── Jobb: Eredmények ── */}
          <div className="flex flex-col gap-4">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-wider text-white">
              Becsült eredmény
            </h2>

            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
              <ResultCard
                label="Összes megjelenés"
                value={fmt(results.impressions)}
                unit="alkalom"
              />
              <ResultCard
                label="Várható konverziók"
                value={fmt(results.conversions)}
                unit="konverzió"
              />
              <ResultCard
                label="Becsült bevétel"
                value={`${fmt(results.revenue)} Ft`}
              />
              <ResultCard
                label="Becsült ROI"
                value={`${results.roi >= 0 ? "+" : ""}${fmtPct(results.roi)}%`}
                accent
                positive={results.roi >= 0 ? true : false}
              />
            </div>

            {/* ROI vizuális sáv */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0c0f0b] p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                  Bevétel / Büdzsé arány
                </p>
                <p className="text-[11px] font-semibold text-[#888888]">
                  <span className="text-white">{fmt(results.revenue)}</span> /{" "}
                  {fmt(budget)} Ft
                </p>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#d4ff00] via-[#e8ff5c] to-[#d4ff00] shadow-[0_0_18px_rgba(212,255,0,0.4)] transition-all duration-500"
                  style={{
                    width: `${Math.min(100, budget > 0 ? (results.revenue / (budget * 3)) * 100 : 0)}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-wider text-[#555555]">
                <span>0</span>
                <span>3× büdzsé</span>
              </div>
            </div>

            {/* Jogi megjegyzés */}
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-[#0c0f0b] px-4 py-3 text-[10px] leading-relaxed text-[#888888]">
              A számítás becslésen alapul. A tényleges konverziós arány iparágtól, kreatívtól és kampányperiódustól függően
              eltérhet. A 6ékony Reklám nem vállal garanciát a prognosztizált értékekre.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
