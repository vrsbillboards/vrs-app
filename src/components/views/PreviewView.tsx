"use client";

import { useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Download,
  Eye,
  Image,
  RefreshCw,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { useCreative } from "@/context/CreativeContext";

/* ─── típusok ─── */
type FontChoice = "condensed" | "normal" | "serif";
type TextPos = "top" | "center" | "bottom";
type Mode = "image" | "text";

const FONT_CLASS: Record<FontChoice, string> = {
  condensed:
    "font-[family-name:var(--font-barlow-condensed)] font-black tracking-wide uppercase",
  normal: "font-[family-name:var(--font-barlow)] font-bold",
  serif: "font-serif font-bold italic",
};

const BG_SWATCHES = [
  "#0c0f0b", "#000000", "#111610", "#1a1a2e",
  "#0f3460", "#d4ff00", "#ffffff", "#ef4444",
];

const TEXT_SWATCHES = [
  "#d4ff00", "#ffffff", "#000000", "#fbbf24",
  "#38bdf8", "#ef4444", "#a3e635", "#f472b6",
];

const OVERLAY_PRESETS = [
  { label: "Nincs", value: "none" },
  { label: "Sötét", value: "dark" },
  { label: "Világos", value: "light" },
  { label: "Neon", value: "neon" },
] as const;
type OverlayPreset = (typeof OVERLAY_PRESETS)[number]["value"];

const DEFAULTS = {
  mode: "text" as Mode,
  headline: "REKLÁMOZZ VELÜNK",
  subtext: "6ékony Reklám · Győr · Prémium helyszínek",
  bg: "#0c0f0b",
  textColor: "#d4ff00",
  font: "condensed" as FontChoice,
  textPos: "center" as TextPos,
  showText: true,
  overlay: "dark" as OverlayPreset,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

/* ─── segéd komponensek ─── */
function Swatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
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

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  unit = "%",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
          {label}
        </label>
        <span className="font-mono text-[11px] text-[#d4ff00]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer appearance-none rounded-full h-[5px] outline-none"
        style={{
          background: `linear-gradient(to right, #d4ff00 ${pct}%, #1a1a1a ${pct}%)`,
        }}
      />
    </div>
  );
}

function overlayStyle(preset: OverlayPreset): string {
  switch (preset) {
    case "dark":
      return "bg-black/50";
    case "light":
      return "bg-white/30";
    case "neon":
      return "bg-[#d4ff00]/20";
    default:
      return "";
  }
}

function textPosClass(pos: TextPos): string {
  switch (pos) {
    case "top":
      return "items-start pt-10";
    case "bottom":
      return "items-end pb-10";
    default:
      return "items-center";
  }
}

/* ─── fő komponens ─── */
export function PreviewView() {
  const { previewUrl: contextUrl, setPreviewUrl } = useCreative();

  const [mode, setMode] = useState<Mode>(contextUrl ? "image" : "text");
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(contextUrl);
  const [dragOver, setDragOver] = useState(false);

  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [subtext, setSubtext] = useState(DEFAULTS.subtext);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [textColor, setTextColor] = useState(DEFAULTS.textColor);
  const [font, setFont] = useState<FontChoice>(DEFAULTS.font);
  const [textPos, setTextPos] = useState<TextPos>(DEFAULTS.textPos);
  const [showText, setShowText] = useState(DEFAULTS.showText);
  const [overlay, setOverlay] = useState<OverlayPreset>(DEFAULTS.overlay);
  const [brightness, setBrightness] = useState(DEFAULTS.brightness);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [saturation, setSaturation] = useState(DEFAULTS.saturation);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = localImageUrl ?? contextUrl;

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!/\.(jpe?g|png|webp|gif)$/i.test(f.name) && !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setLocalImageUrl(url);
    setPreviewUrl(url);
    setMode("image");
  };

  const clearImage = () => {
    setLocalImageUrl(null);
    setPreviewUrl(null);
    setMode("text");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const reset = () => {
    setHeadline(DEFAULTS.headline);
    setSubtext(DEFAULTS.subtext);
    setBg(DEFAULTS.bg);
    setTextColor(DEFAULTS.textColor);
    setFont(DEFAULTS.font);
    setTextPos(DEFAULTS.textPos);
    setShowText(DEFAULTS.showText);
    setOverlay(DEFAULTS.overlay);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const inputBase =
    "w-full rounded-xl border border-[#1a1a1a] bg-[#000000] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#555555] focus:border-[#d4ff00]/50 focus:ring-1 focus:ring-[#d4ff00]/15";

  const imageFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

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
              Töltsd fel a kreatívodat · szerkeszd szövegekkel · valós idejű billboard előnézet
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

            {/* Mode tab */}
            <div className="flex gap-1 rounded-xl border border-[#1a1a1a] bg-[#000000] p-1">
              <button
                type="button"
                onClick={() => setMode("image")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                  mode === "image"
                    ? "bg-[#d4ff00] text-black"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                <Image className="h-3.5 w-3.5" strokeWidth={2} />
                Kép
              </button>
              <button
                type="button"
                onClick={() => setMode("text")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                  mode === "text"
                    ? "bg-[#d4ff00] text-black"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                <Type className="h-3.5 w-3.5" strokeWidth={2} />
                Szöveges
              </button>
            </div>

            {/* KÉP MÓD vezérlők */}
            {mode === "image" && (
              <>
                {/* Upload zone */}
                {!imageUrl ? (
                  <div
                    className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                      dragOver
                        ? "border-[#d4ff00] bg-[#d4ff00]/5"
                        : "border-[#333333] bg-[#000000]/60"
                    }`}
                    onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleFile(e.dataTransfer.files?.[0] ?? null);
                    }}
                  >
                    <label className="block cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                      />
                      <Upload className="mx-auto mb-3 h-8 w-8 text-[#555555]" strokeWidth={1.5} />
                      <p className="text-sm font-semibold text-white">Ejtsd ide a kreatívot</p>
                      <p className="mt-1 text-[11px] text-[#888888]">JPG · PNG · WebP</p>
                      <span className="mt-3 inline-block rounded-lg border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-3 py-1.5 text-[11px] font-bold text-[#d4ff00] transition hover:bg-[#d4ff00]/20">
                        Fájl kiválasztása
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Kép miniatűr + törlés */}
                    <div className="relative overflow-hidden rounded-xl border border-[#1a1a1a]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Kreatív előnézet"
                        className="h-28 w-full object-cover"
                        style={{ filter: imageFilter }}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-[#ff4444]/80"
                        aria-label="Kép eltávolítása"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                        <p className="text-[10px] text-white/70">Feltöltött kreatív</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-lg border border-[#1a1a1a] py-2 text-[11px] font-bold text-[#888888] transition hover:border-[#d4ff00]/30 hover:text-[#d4ff00]"
                    >
                      Csere
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                )}

                {/* Képbeállítások — csak ha van kép */}
                {imageUrl && (
                  <div className="space-y-4 border-t border-[#1a1a1a] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                      Képkorrekció
                    </p>
                    <Slider label="Fényerő" value={brightness} min={40} max={160} onChange={setBrightness} />
                    <Slider label="Kontraszt" value={contrast} min={50} max={150} onChange={setContrast} />
                    <Slider label="Telítettség" value={saturation} min={0} max={200} onChange={setSaturation} />
                  </div>
                )}

                {/* Overlay preset — csak ha van kép */}
                {imageUrl && (
                  <div className="space-y-2 border-t border-[#1a1a1a] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                      Szöveg alatti réteg
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {OVERLAY_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setOverlay(p.value)}
                          className={`rounded-lg border py-1.5 text-[10px] font-bold transition ${
                            overlay === p.value
                              ? "border-[#d4ff00]/50 bg-[#d4ff00]/12 text-[#d4ff00]"
                              : "border-[#1a1a1a] text-[#888888] hover:border-[#333] hover:text-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SZÖVEGES MÓD háttérszín */}
            {mode === "text" && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                  Háttérszín
                </p>
                <div className="flex flex-wrap gap-2">
                  {BG_SWATCHES.map((c) => (
                    <Swatch key={c} color={c} selected={bg === c} onClick={() => setBg(c)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Szöveg beállítások (mindkét módban) ── */}
            <div className="space-y-4 border-t border-[#1a1a1a] pt-4">
              {/* Szöveg megjelenítése toggle */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                  Szöveg overlay
                </p>
                <button
                  type="button"
                  onClick={() => setShowText((v) => !v)}
                  className={`relative h-5 w-9 rounded-full border transition-colors ${
                    showText
                      ? "border-[#d4ff00]/50 bg-[#d4ff00]/20"
                      : "border-[#333] bg-[#111]"
                  }`}
                  aria-label="Szöveg megjelenítése"
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                      showText
                        ? "left-[calc(100%-18px)] bg-[#d4ff00]"
                        : "left-0.5 bg-[#555]"
                    }`}
                  />
                </button>
              </div>

              {showText && (
                <>
                  {/* Főcím */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                      Főcím
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

                  {/* Szöveg pozíció */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                      Pozíció
                    </label>
                    <div className="flex gap-1">
                      {(
                        [
                          { pos: "top" as TextPos, icon: <AlignLeft className="h-3.5 w-3.5 rotate-90" />, label: "Fent" },
                          { pos: "center" as TextPos, icon: <AlignCenter className="h-3.5 w-3.5" />, label: "Közép" },
                          { pos: "bottom" as TextPos, icon: <AlignRight className="h-3.5 w-3.5 -rotate-90" />, label: "Lent" },
                        ] as const
                      ).map(({ pos, icon, label }) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setTextPos(pos)}
                          title={label}
                          className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-[10px] transition ${
                            textPos === pos
                              ? "border-[#d4ff00]/50 bg-[#d4ff00]/12 text-[#d4ff00]"
                              : "border-[#1a1a1a] text-[#888888] hover:border-[#333] hover:text-white"
                          }`}
                        >
                          {icon}
                          {label}
                        </button>
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
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                      Betűtípus
                    </label>
                    <div className="flex gap-1">
                      {(["condensed", "normal", "serif"] as FontChoice[]).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFont(f)}
                          className={`flex-1 rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wide transition ${
                            font === f
                              ? "border-[#d4ff00]/50 bg-[#d4ff00]/12 text-[#d4ff00]"
                              : "border-[#1a1a1a] bg-[#000000] text-[#888888] hover:border-[#333] hover:text-white"
                          }`}
                        >
                          {f === "condensed" ? "Kondenzált" : f === "normal" ? "Normál" : "Serif"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
            <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0c0f0b] p-4 sm:p-6">
              <div className="w-full max-w-[700px]">
                {/* Tartótartó teteje */}
                <div className="flex justify-center">
                  <div className="h-4 w-20 rounded-t-sm bg-[#1f1f1f]" />
                </div>

                {/* Billboard tábla */}
                <div
                  className="relative overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_3px_rgba(255,255,255,0.05)] ring-4 ring-black/60"
                  style={{ aspectRatio: "16/9" }}
                >
                  {/* Háttérkép vagy szín */}
                  {mode === "image" && imageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        filter: imageFilter,
                      }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 transition-colors duration-300"
                      style={{ background: bg }}
                    />
                  )}

                  {/* Overlay réteg (kép módban) */}
                  {mode === "image" && imageUrl && overlay !== "none" && (
                    <div className={`absolute inset-0 ${overlayStyle(overlay)}`} />
                  )}

                  {/* Fényes sarokeffekt */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(255,255,255,0.06)_0%,transparent_55%)]" />

                  {/* Szöveg overlay */}
                  {showText && (
                    <div
                      className={`absolute inset-0 flex flex-col justify-${textPos === "top" ? "start" : textPos === "bottom" ? "end" : "center"} gap-3 px-8 text-center ${textPosClass(textPos)}`}
                    >
                      {headline && (
                        <p
                          className={`w-full break-words leading-tight transition-all duration-200 text-[clamp(1.1rem,4.5vw,3rem)] ${FONT_CLASS[font]}`}
                          style={{
                            color: textColor,
                            textShadow: `0 2px 24px ${textColor}55, 0 0 60px ${textColor}22`,
                          }}
                        >
                          {headline}
                        </p>
                      )}
                      {subtext && (
                        <p
                          className="w-full break-words text-[clamp(0.55rem,1.8vw,0.95rem)] font-medium opacity-85 transition-all duration-200"
                          style={{ color: textColor }}
                        >
                          {subtext}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Keret 3D hatás */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-[6px] ring-inset ring-black/25" />

                  {/* "Feltöltsd a kreatívot" placeholder — kép módban kép nélkül */}
                  {mode === "image" && !imageUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                      <Upload className="h-10 w-10 text-[#333]" strokeWidth={1.25} />
                      <p className="text-sm font-semibold text-[#555]">
                        Töltsd fel a kreatívodat a bal panelen
                      </p>
                    </div>
                  )}
                </div>

                {/* Tartóoszlopok */}
                <div className="flex justify-center gap-24">
                  <div className="h-8 w-2.5 rounded-b-sm bg-[#1f1f1f]" />
                  <div className="h-8 w-2.5 rounded-b-sm bg-[#1f1f1f]" />
                </div>
              </div>
            </div>

            {/* Letöltés + megjegyzés */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0c0f0b] px-4 py-3">
              <p className="text-[11px] leading-relaxed text-[#888888]">
                Előnézet illusztratív ·{" "}
                <span className="text-[#d4ff00]">504×238 cm / 300 DPI</span>{" "}
                a tényleges spec · exporthoz kérd a tervező sablont.
              </p>
              <a
                href={imageUrl ?? "#"}
                download={imageUrl ? "kreativ-elonezet.jpg" : undefined}
                target={imageUrl ? "_blank" : undefined}
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                  imageUrl
                    ? "border-[#d4ff00]/30 text-[#d4ff00] hover:border-[#d4ff00]/60 hover:bg-[#d4ff00]/8"
                    : "cursor-not-allowed border-[#1a1a1a] text-[#444]"
                }`}
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                Letöltés
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
