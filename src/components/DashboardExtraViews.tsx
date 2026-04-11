"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Download, Play, X } from "lucide-react";

export function InvoicesView() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
      <div className="mb-3.5 grid grid-cols-3 gap-2.5 max-md:grid-cols-1">
        <div className="relative overflow-hidden rounded-[10px] border border-[var(--b1)] bg-[var(--card)] p-3.5">
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-[var(--neon)]" />
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
            Kifizetett
          </div>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[26px] font-black leading-none text-[var(--neon)]">
            440 000 Ft
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[10px] border border-[var(--b1)] bg-[var(--card)] p-3.5">
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-[var(--yellow)]" />
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
            Nyitott
          </div>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[26px] font-black leading-none text-[var(--yellow)]">
            200 000 Ft
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[10px] border border-[var(--b1)] bg-[var(--card)] p-3.5">
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-[var(--blue)]" />
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
            Lejárt
          </div>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[26px] font-black leading-none text-[var(--red)]">
            0 Ft
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--b1)] bg-[var(--card)]">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--b1)] bg-[var(--bg3)] text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
              {["Számlaszám", "Kampány", "Kiállítás", "Határidő", "Összeg", "Állapot", "Letöltés"].map(
                (h) => (
                  <th key={h} className="px-4 py-2.5 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--b1)]">
              <td className="px-4 py-3 font-semibold text-[var(--neon)]">VRS-2025-001</td>
              <td className="px-4 py-3">
                <div className="font-bold">GYOP05 – ETO Park</div>
                <div className="text-[10px] text-[var(--t2)]">4 hét · Győr</div>
              </td>
              <td className="px-4 py-3">2025-04-20</td>
              <td className="px-4 py-3">2025-05-01</td>
              <td className="px-4 py-3 font-[family-name:var(--font-barlow-condensed)] text-[17px] font-black text-[var(--neon)]">
                240 000 Ft
              </td>
              <td className="px-4 py-3">
                <span className="rounded-[10px] border border-[rgba(212,255,0,0.3)] bg-[rgba(212,255,0,0.1)] px-2 py-0.5 text-[9px] font-bold text-[var(--neon)]">
                  Fizetve
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--b1)] bg-transparent px-2 py-1 text-[10px] font-semibold text-[var(--t2)] hover:border-[var(--b2)] hover:text-[var(--neon)]"
                >
                  <Download className="h-3 w-3" />
                  PDF
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold text-[var(--neon)]">VRS-2025-002</td>
              <td className="px-4 py-3">
                <div className="font-bold">SZFP01 – Palotai út</div>
                <div className="text-[10px] text-[var(--t2)]">4 hét · Székesfehérvár</div>
              </td>
              <td className="px-4 py-3">2025-05-01</td>
              <td className="px-4 py-3">2025-05-15</td>
              <td className="px-4 py-3 font-[family-name:var(--font-barlow-condensed)] text-[17px] font-black text-[var(--neon)]">
                200 000 Ft
              </td>
              <td className="px-4 py-3">
                <span className="rounded-[10px] border border-[rgba(255,200,50,0.3)] bg-[rgba(255,200,50,0.1)] px-2 py-0.5 text-[9px] font-bold text-[var(--yellow)]">
                  Nyitott
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--b1)] bg-transparent px-2 py-1 text-[10px] font-semibold text-[var(--t2)] hover:border-[var(--b2)] hover:text-[var(--neon)]"
                >
                  <Download className="h-3 w-3" />
                  PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const BG_SW = [
  { bg: "#050705", gw: "rgba(212,255,0,.1)" },
  { bg: "#080014", gw: "rgba(120,80,255,.1)" },
  { bg: "#0e0600", gw: "rgba(255,140,0,.1)" },
  { bg: "#08000a", gw: "rgba(255,50,100,.08)" },
  { bg: "#001a0e", gw: "rgba(0,255,150,.08)" },
  { bg: "#0a0a0a", gw: "rgba(255,255,255,.05)" },
];

const TC_SW = ["#d4ff00", "#ffffff", "#38bdf8", "#ff7a60", "#ffc832", "#c084fc"];

type CreativePreviewProps = { onBookThisDesign: () => void };

export function CreativePreview({ onBookThisDesign }: CreativePreviewProps) {
  const [main, setMain] = useState("VRS BILLBOARDS");
  const [sub, setSub] = useState("Foglalj most online");
  const [bgIdx, setBgIdx] = useState(0);
  const [tcIdx, setTcIdx] = useState(0);
  const [font, setFont] = useState<"condensed" | "barlow" | "serif">("condensed");
  const [sizeLabel, setSizeLabel] = useState("504×238 cm – Óriásplakát (szabvány)");

  const fontFamily = useMemo(() => {
    if (font === "condensed") return "var(--font-barlow-condensed), sans-serif";
    if (font === "barlow") return "var(--font-barlow), sans-serif";
    return "Georgia, serif";
  }, [font]);

  const { bg, gw } = BG_SW[bgIdx] ?? BG_SW[0];
  const tc = TC_SW[tcIdx] ?? TC_SW[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-5">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-[var(--neon)]">
          Kreatív Előnézet eszköz
        </div>
        <p className="mt-1 text-[13px] text-[var(--t2)]">
          Írd be a szöveget és látod hogyan néz ki a 6ékony Reklám felületen
        </p>
      </div>
      <div className="grid grid-cols-[340px_1fr] gap-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-3">
          <Field label="Főcím szöveg">
            <input
              value={main}
              maxLength={40}
              onChange={(e) => setMain(e.target.value)}
              className="w-full rounded-lg border border-[var(--b2)] bg-[var(--bg2)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--b3)]"
            />
          </Field>
          <Field label="Alcím (opcionális)">
            <input
              value={sub}
              maxLength={60}
              onChange={(e) => setSub(e.target.value)}
              className="w-full rounded-lg border border-[var(--b2)] bg-[var(--bg2)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--b3)]"
            />
          </Field>
          <div>
            <Field label="Háttérszín" />
            <div className="flex flex-wrap gap-2">
              {BG_SW.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBgIdx(i)}
                  className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${
                    bgIdx === i ? "border-white/70 scale-110" : "border-transparent"
                  }`}
                  style={{ background: b.bg }}
                  aria-label={`Háttér ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div>
            <Field label="Szövegszín" />
            <div className="flex flex-wrap gap-2">
              {TC_SW.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTcIdx(i)}
                  className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${
                    tcIdx === i ? "border-white/70 scale-110" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label={`Szín ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div>
            <Field label="Betűstílus" />
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["condensed", "Kondenzált"],
                  ["barlow", "Normál"],
                  ["serif", "Serif"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFont(k)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] transition-all ${
                    font === k
                      ? "border-[var(--b3)] bg-[var(--ns)] text-[var(--neon)]"
                      : "border-[var(--b1)] bg-[var(--bg3)] text-[var(--t2)] hover:border-[var(--b3)]"
                  }`}
                >
                  {lab}
                </button>
              ))}
            </div>
          </div>
          <Field label="Felület méret">
            <select
              value={sizeLabel}
              onChange={(e) => setSizeLabel(e.target.value)}
              className="w-full rounded-lg border border-[var(--b2)] bg-[var(--bg2)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--b3)]"
            >
              <option>504×238 cm – Óriásplakát (szabvány)</option>
              <option>600×300 cm – Óriás felület</option>
              <option>300×200 cm – Kis felület</option>
            </select>
          </Field>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBookThisDesign}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--neon)] px-3 py-2 text-xs font-bold text-[#070908]"
            >
              <Play className="h-3.5 w-3.5" />
              Ezt a designt foglalom
            </button>
            <button
              type="button"
              onClick={() => alert("Letöltés a PRO csomagban elérhető!")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--b3)] bg-transparent px-3 py-2 text-[11px] font-semibold text-[var(--neon)] transition-colors hover:bg-[var(--ns)]"
            >
              <Download className="h-3.5 w-3.5" />
              Letöltés
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--b1)] bg-[var(--bg2)] px-8 py-8">
          <div
            className="w-full max-w-lg transition-transform duration-400 [filter:drop-shadow(0_30px_50px_rgba(0,0,0,0.7))] hover:[transform:perspective(1000px)_rotateY(-3deg)_rotateX(2deg)]"
          >
            <div className="relative overflow-hidden rounded-md border-[3px] border-[#1a2415] bg-[#090e08] p-1">
              <div
                className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded px-3 transition-colors"
                style={{ background: bg }}
              >
                <div
                  className="pointer-events-none absolute inset-0 z-[1]"
                  style={{
                    background: `radial-gradient(ellipse at center, ${gw}, transparent 65%)`,
                  }}
                />
                <div
                  className="relative z-[1] px-3 pb-1 pt-3 text-center [font-size:clamp(22px,4vw,44px)] font-black uppercase leading-tight tracking-[4px] transition-all"
                  style={{
                    color: tc,
                    fontFamily,
                    textShadow: `0 0 40px ${tc}66`,
                  }}
                >
                  {main || "VRS BILLBOARDS"}
                </div>
                <div
                  className="relative z-[1] px-3 pb-3 text-center [font-size:clamp(10px,1.2vw,16px)] tracking-[2px] opacity-75 transition-all"
                  style={{ color: tc }}
                >
                  {sub}
                </div>
                <div className="pointer-events-none absolute inset-0 z-[3] rounded border-[1.5px] border-white/5" />
                <div
                  className="pointer-events-none absolute inset-0 z-[2]"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,0,0,.07) 4px,rgba(0,0,0,.07) 5px)",
                  }}
                />
              </div>
            </div>
            <div className="mt-0.5 flex justify-center gap-[100px]">
              <div className="h-11 w-3 rounded-b-sm bg-[linear-gradient(180deg,#1a2415,#0c1009)]" />
              <div className="h-11 w-3 rounded-b-sm bg-[linear-gradient(180deg,#1a2415,#0c1009)]" />
            </div>
            <div className="-mt-0.5 mx-auto h-1.5 w-[170px] rounded bg-[#0c1009]" />
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-[2px] text-[var(--t3)]">
            Élő előnézet · {sizeLabel.split("–")[0]?.trim()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--t3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-nbp" />
            Szerkesztés közben frissül
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function RoiCalculator() {
  const [budget, setBudget] = useState(250000);
  const [ots, setOts] = useState(45000);
  const [days, setDays] = useState(28);
  const [conv, setConv] = useState(1.5);
  const [aov, setAov] = useState(15000);

  const totalImp = ots * days;
  const totalConv = Math.floor(totalImp * (conv / 100));
  const totalRev = totalConv * aov;
  const roiPct = budget > 0 ? ((totalRev - budget) / budget) * 100 : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-5">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-[var(--neon)]">
          ROI Kalkulátor
        </div>
        <p className="mt-1 text-[13px] text-[var(--t2)]">
          Becsüld meg a kampány megtérülését az iparági átlagok alapján.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="flex flex-col gap-3.5">
          <RoiSlider
            label="Kampány költségkeret (HUF)"
            min={50000}
            max={2000000}
            step={50000}
            value={budget}
            onChange={setBudget}
            format={(v) => `${v.toLocaleString("hu-HU")} Ft`}
          />
          <RoiSlider
            label="Átlagos OTS (Napi elérés) / Felület"
            min={10000}
            max={150000}
            step={5000}
            value={ots}
            onChange={setOts}
            format={(v) => v.toLocaleString("hu-HU")}
          />
          <RoiSlider
            label="Kampány időtartam (Nap)"
            min={7}
            max={90}
            step={1}
            value={days}
            onChange={setDays}
            format={(v) => `${v} Nap`}
          />
          <RoiSlider
            label="Várható konverziós arány (%)"
            min={0.1}
            max={5}
            step={0.1}
            value={conv}
            onChange={setConv}
            format={(v) => `${v.toFixed(1)} %`}
          />
          <RoiSlider
            label="Átlagos kosárérték / Ügyfélérték (HUF)"
            min={5000}
            max={100000}
            step={1000}
            value={aov}
            onChange={setAov}
            format={(v) => `${v.toLocaleString("hu-HU")} Ft`}
          />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--b2)] bg-[var(--card)] px-6 py-6">
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-[linear-gradient(90deg,var(--neon),transparent)]" />
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[2px] text-[var(--nd)]">
            Becsült Eredmények
          </div>
          <div className="flex flex-col">
            <RoiMetric
              label="Összes Megjelenés (Impression)"
              desc="Potenciális megtekintések száma"
              value={totalImp.toLocaleString("hu-HU")}
              unit="alkalom"
            />
            <RoiMetric
              label="Várható Konverziók"
              desc="Becsült vásárlás/érdeklődés"
              value={totalConv.toLocaleString("hu-HU")}
              unit="db"
            />
            <RoiMetric
              label="Becsült Bevétel"
              desc="Konverzió × Kosárérték"
              value={totalRev.toLocaleString("hu-HU")}
              unit="HUF"
              valueColor="var(--yellow)"
            />
            <div className="mt-2.5 border-t border-[var(--b1)] pt-2">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neon)]">Becsült ROI (Megtérülés)</span>
                <span className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-black text-[var(--neon)]">
                  {roiPct.toLocaleString("hu-HU", { maximumFractionDigits: 0 })} %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoiSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-sm bg-[var(--b2)] accent-[var(--neon)]"
        />
        <span className="min-w-[120px] text-right font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-[var(--neon)]">
          {format(value)}
        </span>
      </div>
    </div>
  );
}

function RoiMetric({
  label,
  desc,
  value,
  unit,
  valueColor,
}: {
  label: string;
  desc: string;
  value: string;
  unit: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-end justify-between border-b border-[var(--b1)] py-2.5 last:border-b-0">
      <div>
        <div className="text-xs text-[var(--t2)]">{label}</div>
        <div className="mt-0.5 text-[10px] text-[var(--t3)]">{desc}</div>
      </div>
      <div className="text-right">
        <div
          className="font-[family-name:var(--font-barlow-condensed)] text-[22px] font-black"
          style={{ color: valueColor ?? "var(--neon)" }}
        >
          {value}
        </div>
        <div className="text-[10px] text-[var(--t2)]">{unit}</div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
      <div className="mb-3.5 grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
        <Kpi label="Hálózat Mérete" value="26" sub="Aktív felület" green />
        <Kpi label="Kihasználtság" value="75%" sub="↑ 12% ezen a héten" green />
        <Kpi label="Havi Bevétel" value="12.4M" sub="HUF" green />
        <Kpi label="Függő Foglalások" value="3" sub="Jóváhagyásra vár" yellow />
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-lg:grid-cols-1">
        <div className="rounded-xl border border-[var(--b1)] bg-[var(--card)] p-[17px]">
          <div className="mb-3 text-xs font-bold text-[var(--text)]">
            Legutóbbi Foglalások (Jóváhagyandó)
          </div>
          <div className="flex flex-col gap-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--b1)] py-2 last:border-b-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--b3)] bg-[var(--nk)] font-[family-name:var(--font-barlow-condensed)] text-[11px] font-black text-[var(--neon)]">
                KBT
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">Kovács Bt.</div>
                <div className="text-[10px] text-[var(--t2)]">GYOP05 - Győr (4 hét)</div>
              </div>
              <div className="font-[family-name:var(--font-barlow-condensed)] text-[15px] font-black text-[var(--neon)]">
                240 000 Ft
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--b3)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--neon)] transition-colors hover:bg-[var(--ns)]"
              >
                <Check className="h-3.5 w-3.5" />
                Jóváhagyás
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(255,90,58,0.3)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--red)] transition-colors hover:bg-[var(--rs)]"
              >
                <X className="h-3.5 w-3.5" />
                Elutasítás
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--b1)] bg-[var(--card)] p-[17px]">
          <div className="mb-3 text-xs font-bold text-[var(--text)]">Hálózat Állapota (Városok)</div>
          <div className="flex flex-col gap-2">
            {[
              ["Győr", 85],
              ["Székesfehérvár", 60],
              ["Kecskemét", 45],
            ].map(([name, pct]) => (
              <div key={name as string} className="flex items-center gap-2 text-xs">
                <span className="w-[110px] shrink-0 text-[var(--t2)]">{name}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-sm bg-[var(--bg3)]">
                  <div
                    className="h-full rounded-sm bg-[var(--neon)] transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-[family-name:var(--font-barlow-condensed)] text-sm font-bold text-[var(--neon)]">
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  green,
  yellow,
}: {
  label: string;
  value: string;
  sub: string;
  green?: boolean;
  yellow?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[var(--b1)] bg-[var(--card)] p-[15px] transition-all hover:-translate-y-px hover:border-[var(--b2)]">
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-[var(--neon)]" />
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">{label}</div>
      <div
        className={`font-[family-name:var(--font-barlow-condensed)] text-[30px] font-black leading-none [text-shadow:0_0_18px_rgba(212,255,0,0.2)] ${
          yellow ? "text-[var(--yellow)]" : "text-[var(--neon)]"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1.5 text-[10px] ${green ? "text-[var(--neon)]" : yellow ? "text-[var(--t2)]" : "text-[var(--t2)]"}`}
      >
        {sub}
      </div>
    </div>
  );
}
