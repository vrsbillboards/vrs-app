"use client";

import { useState } from "react";
import { Eye, RefreshCw } from "lucide-react";

type FontChoice = "condensed" | "normal" | "serif";

const FONT_LABELS: Record<FontChoice, string> = {
  condensed: "Kondenzált",
  normal: "Normál",
  serif: "Serif",
};

const FONT_CLASS: Record<FontChoice, string> = {
  condensed: "font-[family-name:var(--font-barlow-condensed)] font-black tracking-wide uppercase",
  normal: "font-[family-name:var(--font-barlow)] font-bold",
  serif: "font-serif font-bold italic",
};

const BG_SWATCHES = [
  "#0c0f0b", "#000000", "#111610", "#1a1a2e",
  "#0f3460", "#16213e", "#1b1b2f", "#2c003e",
  "#d4ff00", "#ffffff", "#ffc832", "#ef4444",
];

const TEXT_SWATCHES = [
  "#d4ff00", "#ffffff", "#000000", "#fbbf24",
  "#38bdf8", "#ef4444", "#a3e635", "#f472b6",
];

const DEFAULTS = {
  headline: "REKLÁMOZZ VELÜNK",
  subtext: "6ékony Reklám · Győr · Prémium helyszínek",
  bg: "#0c0f0b",
  textColor: "#d4ff00",
  font: "condensed" as FontChoice,
};

function Swatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 w-7 shrink-0 rounded-lg border-2 transition-all hover:scale-110"
      style={{
        background: color,
        borderColor: selected ? "#d4ff00" : "rgba(255,255,255,0.1)",
        boxShadow: selected ? `0 0 10px ${color}88` : undefined,
      }}
      aria-label={color}
    />
  );
}

export function PreviewView() {
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [subtext, setSubtext] = useState(DEFAULTS.subtext);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [textColor, setTextColor] = useState(DEFAULTS.textColor);
  const [font, setFont] = useState<FontChoice>(DEFAULTS.font);

  const reset = () => {
    setHeadline(DEFAULTS.headline);
    setSubtext(DEFAULTS.subtext);
    setBg(DEFAULTS.bg);
    setTextColor(DEFAULTS.textColor);
    setFont(DEFAULTS.font);
  };

  const inputBase =
    "w-full rounded-xl border border-[#1a1a1a] bg-[#000000] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#555555] focus:border-[#d4ff00]/50 focus:ring-1 focus:ring-[#d4ff00]/15";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">

        {/* Fejléc */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
              <Eye className="h-5 w-5 text-[#d4ff00]" strokeWidth={2} />
              Kreatív Előnézet
            </h1>
            <p className="mt-1 text-[11px] text-[#888888]">
              Valós idejű előnézet · a jobb oldalon a módosítások azonnal megjelennek
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#0c0f0b] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#888888] transition hover:border-[#d4ff00]/30 hover:text-[#d4ff00]"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            Visszaállítás
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[min(380px,42%)_1fr]">

          {/* ── Bal oszlop: Vezérlők ── */}
          <aside className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#0c0f0b] p-5 shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-wider text-white">
              Beállítások
            </h2>

            {/* Főcím */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                Főcím szöveg
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Kampány szlogenje…"
                className={inputBase}
                maxLength={60}
              />
              <p className="text-right text-[9px] text-[#555555]">{headline.length}/60</p>
            </div>

            {/* Alcím */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                Alcím
              </label>
              <input
                type="text"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                placeholder="Cég neve, elérhetőség…"
                className={inputBase}
                maxLength={80}
              />
            </div>

            {/* Háttérszín */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                Háttérszín
              </label>
              <div className="flex flex-wrap gap-2">
                {BG_SWATCHES.map((c) => (
                  <Swatch key={c} color={c} selected={bg === c} onClick={() => setBg(c)} />
                ))}
              </div>
            </div>

            {/* Szövegszín */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                Szövegszín
              </label>
              <div className="flex flex-wrap gap-2">
                {TEXT_SWATCHES.map((c) => (
                  <Swatch key={c} color={c} selected={textColor === c} onClick={() => setTextColor(c)} />
                ))}
              </div>
            </div>

            {/* Betűtípus */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                Betűtípus
              </label>
              <div className="flex gap-2">
                {(Object.keys(FONT_LABELS) as FontChoice[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFont(f)}
                    className={`flex-1 rounded-lg border py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                      font === f
                        ? "border-[#d4ff00]/50 bg-[#d4ff00]/12 text-[#d4ff00]"
                        : "border-[#1a1a1a] bg-[#000000] text-[#888888] hover:border-[#333] hover:text-white"
                    }`}
                  >
                    {FONT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Jobb oszlop: Élő előnézet ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-wider text-white">
                Élő előnézet
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#888888]">
                16:9 · óriásplakát arány
              </span>
            </div>

            {/* Billboard stage */}
            <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0c0f0b] p-6">
              {/* 3D billboard keret */}
              <div className="w-full max-w-[680px]">
                {/* Vázlat-fejléc (tartótartó illúzió) */}
                <div className="flex justify-center">
                  <div className="h-4 w-16 rounded-t-sm bg-[#1a1a1a]" />
                </div>
                {/* Tábla keret */}
                <div
                  className="relative overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_3px_rgba(255,255,255,0.06)] ring-4 ring-black/50"
                  style={{ aspectRatio: "16/9" }}
                >
                  {/* Háttér */}
                  <div className="absolute inset-0 transition-colors duration-300" style={{ background: bg }} />

                  {/* Fényes sarokeffekt */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(255,255,255,0.07)_0%,transparent_55%)]" />

                  {/* Tartalom */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center">
                    <p
                      className={`w-full break-words leading-tight transition-all duration-300 text-[clamp(1.4rem,5.5vw,3.5rem)] ${FONT_CLASS[font]}`}
                      style={{ color: textColor, textShadow: `0 2px 20px ${textColor}44` }}
                    >
                      {headline || "\u00A0"}
                    </p>
                    {subtext && (
                      <p
                        className="w-full break-words text-[clamp(0.65rem,2vw,1.1rem)] font-medium opacity-80 transition-all duration-300"
                        style={{ color: textColor }}
                      >
                        {subtext}
                      </p>
                    )}
                  </div>

                  {/* Keretszél-szimulált 3D hatás */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-[6px] ring-inset ring-black/30" />
                </div>
                {/* Lábazat / tartóoszlop */}
                <div className="flex justify-center gap-20">
                  <div className="h-8 w-2.5 rounded-b-sm bg-[#1a1a1a]" />
                  <div className="h-8 w-2.5 rounded-b-sm bg-[#1a1a1a]" />
                </div>
              </div>
            </div>

            {/* Jelmagyarázat */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0f0b] px-4 py-3 text-[11px] leading-relaxed text-[#888888]">
              Az előnézet illusztratív — a tényleges nyomtatási paramétereket a kreatív specifikáció (
              <span className="text-[#d4ff00]">504×238 cm / 300 DPI</span>
              ) határozza meg. Exporthoz kérd a tervező sablont.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
