"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, CreditCard, Loader2, Trash2, Upload, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase, type DbBillboard } from "@/lib/supabaseClient";
import { useToast } from "@/context/ToastContext";
import { useCreative } from "@/context/CreativeContext";

export type WizardBillboard = {
  id: string;
  name: string;
  city: string;
  type: string;
  price: number;
  status: "free" | "booked";
};

type BookingWizardProps = {
  open: boolean;
  onClose: () => void;
  initialBillboardId: string | null;
  onCompleteGoBookings: () => void;
  user: User | null;
  onOpenAuth?: () => void;
};

const STEPS = ["Felület", "Időzítés", "Kreatív", "Fizetés"] as const;

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2) || d2 < d1) return 0;
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function BookingWizard({
  open,
  onClose,
  initialBillboardId,
  onCompleteGoBookings,
  user,
  onOpenAuth,
}: BookingWizardProps) {
  const { toast } = useToast();
  const { setPreviewUrl } = useCreative();
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(initialBillboardId);
  const [cityFilter, setCityFilter] = useState("");

  // Supabase adatlekérés
  const [platforms, setPlatforms] = useState<WizardBillboard[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPlatformsLoading(true);
    supabase
      .from("billboards")
      .select("id, name, city, type, price, status")
      .order("city")
      .then(({ data, error }) => {
        if (error) {
          console.error("[BookingWizard] billboards fetch error:", error.message);
        } else {
          setPlatforms(
            (data as DbBillboard[]).map((b) => ({
              id: b.id,
              name: b.name,
              city: b.city,
              type: b.type,
              price: b.price,
              status: b.status,
            }))
          );
        }
        setPlatformsLoading(false);
      });
  }, [open]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [timeTarget, setTimeTarget] = useState("full");
  const [campaignName, setCampaignName] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [footerHidden, setFooterHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const selected = useMemo(
    () => platforms.find((b) => b.id === selectedId) ?? null,
    [platforms, selectedId]
  );

  const weeks = useMemo(() => {
    const d = daysBetween(start, end);
    if (d > 0) return Math.max(1, Math.ceil(d / 7));
    return 1;
  }, [start, end]);

  const estimated = selected != null ? selected.price * weeks : null;

  const cities = useMemo(() => [...new Set(platforms.map((b) => b.city))].sort(), [platforms]);

  const filteredList = useMemo(() => {
    if (!cityFilter) return platforms;
    return platforms.filter((b) => b.city === cityFilter);
  }, [cityFilter, platforms]);

  const canContinue = useMemo(() => {
    if (step === 0) {
      if (selectedId == null) return false;
      return selected?.status === "free";
    }
    if (step === 1) return Boolean(selectedId && start && end && campaignName.trim());
    if (step === 2) return Boolean(filePreview);
    if (step === 3) return Boolean(selectedId);
    return true;
  }, [campaignName, end, filePreview, selected, selectedId, start, step]);

  const handleBookingSubmit = async () => {
    // Bejelentkezési guard — AuthModal megnyitása alert helyett
    if (!user) {
      onClose();
      onOpenAuth?.();
      toast("A foglaláshoz be kell jelentkezni.", "info");
      return;
    }
    if (!selected || !start || !end || !selectedFile || estimated == null) return;

    setIsSubmitting(true);
    try {
      // 1. Kreatív feltöltése a Supabase Storage "creatives" bucket-be
      const safeFileName = selectedFile.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-]/g, "_");
      const uniqueName = `${Date.now()}_${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("creatives")
        .upload(uniqueName, selectedFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("creatives")
        .getPublicUrl(uniqueName);

      console.info("[BookingWizard] Creative uploaded →", urlData.publicUrl);

      // 2. Foglalás mentése a bookings táblába
      const { data: bookingData, error: insertError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          billboard_id: selected.id,
          start_date: start,
          end_date: end,
          total_price: estimated,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // 3. Stripe Checkout Session létrehozása és átirányítás
      setIsRedirecting(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: estimated,
          billboardName: selected.name,
          bookingId: bookingData?.id ?? null,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "A Stripe session létrehozása sikertelen.");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[BookingWizard] Submit error:", msg);
      toast(`Hiba a foglalás során: ${msg}`, "error");
      setIsRedirecting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const go = (dir: number) => {
    if (dir > 0 && !canContinue) return;
    const next = step + dir;
    if (next < 0) return;
    if (next > 3) {
      void handleBookingSubmit();
      return;
    }
    setStep(next);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    setSelectedFile(f);
    const url = URL.createObjectURL(f);
    setFilePreview(url);
    // Megosztjuk a CreativeContext-en keresztül a PreviewView-val
    if (f.type.startsWith("image/")) {
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setFilePreview(null);
    setFileName(null);
    setSelectedFile(null);
  };

  const reviewDates =
    start && end
      ? `${new Date(start).toLocaleDateString("hu-HU")} – ${new Date(end).toLocaleDateString("hu-HU")}`
      : "—";

  const resetAndClose = () => {
    onClose();
  };

  if (!open) return null;

  const inputBase =
    "w-full rounded-xl border border-[#1a1a1a] bg-[#000000] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#888888] focus:border-[#d4ff00]/50 focus:ring-1 focus:ring-[#d4ff00]/20";

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="wiz-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fejléc */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] px-6 py-4">
          <h2
            id="wiz-title"
            className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black tracking-wide text-white sm:text-2xl"
          >
            Új kampány foglalása
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] bg-black/40 text-[#888888] transition-colors hover:border-[#d4ff00]/40 hover:text-[#d4ff00]"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Lépések */}
        <div className="shrink-0 border-b border-[#1a1a1a] px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3 sm:gap-4">
            {STEPS.map((label, i) => {
              const cur = i === step;
              const done = i < step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (done || cur) setStep(i);
                  }}
                  className={`flex min-w-0 shrink-0 items-center gap-2 border-b-2 py-2 transition-colors ${
                    cur
                      ? "border-[#d4ff00] text-[#d4ff00]"
                      : done
                        ? "border-transparent text-[#888888]"
                        : "border-transparent text-[#555555]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                      cur
                        ? "border-[#d4ff00] bg-[#d4ff00] text-black"
                        : done
                          ? "border-[#d4ff00]/50 bg-[#d4ff00]/10 text-[#d4ff00]"
                          : "border-[#333333] text-[#888888]"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4ff00]/40 bg-[#d4ff00]/10 text-[#d4ff00] animate-scl-pop">
                <Check className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-[#d4ff00] sm:text-3xl">
                Foglalás rögzítve
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#888888]">
                A kampányod feldolgozás alatt áll. Visszaigazolást küldünk e-mailben. A Stripe tranzakció ebben a demóban nem
                került levonásra.
              </p>
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  onCompleteGoBookings();
                }}
                className="mt-6 rounded-xl bg-[#d4ff00] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110"
              >
                Foglalásaim megtekintése
              </button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <WizardPanel
                  title="Válassz felületet"
                  subtitle="Kattints egy megjelenő felületre. Az aktív választás neon kerettel kiemelésre kerül."
                >
                  <div className="mb-4">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                      Szűrés város szerint
                    </label>
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className={inputBase}
                      disabled={platformsLoading}
                    >
                      <option value="">Összes város</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {platformsLoading ? (
                    <div className="flex items-center justify-center gap-3 py-16 text-[#888888]">
                      <Loader2 className="h-5 w-5 animate-spin text-[#d4ff00]" strokeWidth={2} />
                      <span className="text-sm">Felületek betöltése…</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid max-h-[min(52vh,480px)] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                        {filteredList.map((bb) => {
                          const on = selectedId === bb.id;
                          const booked = bb.status === "booked";
                          return (
                            <button
                              key={bb.id}
                              type="button"
                              disabled={booked}
                              onClick={() => {
                                if (!booked) setSelectedId(bb.id);
                              }}
                              className={`rounded-2xl border-2 bg-[#000000] p-4 text-left transition-all ${
                                booked
                                  ? "cursor-not-allowed border-[#331818] opacity-55"
                                  : on
                                    ? "border-[#d4ff00] shadow-[0_0_24px_rgba(212,255,0,0.22)]"
                                    : "border-[#1a1a1a] hover:border-[#333333]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono text-xs font-black text-[#d4ff00]">{bb.id}</span>
                                {booked ? (
                                  <span className="rounded-md bg-[#3f0f0f] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#ff6b6b]">
                                    Foglalt
                                  </span>
                                ) : on ? (
                                  <span className="rounded-md bg-[#d4ff00] px-1.5 py-0.5 text-[9px] font-bold text-black">
                                    Kiválasztva
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 font-semibold text-white">{bb.name}</p>
                              <p className="mt-1 text-xs text-[#888888]">
                                {bb.city} · {bb.type}
                              </p>
                              <p className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-[#d4ff00]">
                                {bb.price.toLocaleString("hu-HU")}{" "}
                                <span className="text-xs font-normal text-[#888888]">Ft / hét</span>
                              </p>
                            </button>
                          );
                        })}
                      </div>
                      {!platformsLoading && filteredList.length === 0 && (
                        <p className="mt-3 text-sm text-[#888888]">Nincs találat ehhez a városhoz.</p>
                      )}
                    </>
                  )}
                </WizardPanel>
              )}

              {step === 1 && (
                <WizardPanel
                  title="Időzítés"
                  subtitle="Kattints a naptárban a kezdő majd a záró napra."
                >
                  <div className="mb-4">
                    <InlineDateRangePicker
                      start={start}
                      end={end}
                      onChange={(s, e) => { setStart(s); setEnd(e); }}
                    />
                  </div>
                  <div className="mb-4">
                    <Field label="Időzítés / napszak célzás">
                      <select
                        value={timeTarget}
                        onChange={(e) => setTimeTarget(e.target.value)}
                        className={inputBase}
                      >
                        <option value="full">Egész nap (0–24 óra)</option>
                        <option value="morning">Reggeli csúcs (7–9)</option>
                        <option value="mid">Déli (11–14)</option>
                        <option value="evening">Esti csúcs (17–20)</option>
                      </select>
                    </Field>
                  </div>
                  <div className="mb-4">
                    <Field label="Kampány neve">
                      <input
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="pl. Tavaszi kampány 2026"
                        className={inputBase}
                      />
                    </Field>
                  </div>
                  <div className="rounded-2xl border border-[#d4ff00]/35 bg-[rgba(212,255,0,0.08)] p-4 shadow-[0_0_32px_rgba(212,255,0,0.12)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#d4ff00]">
                      Becsült kampányköltség
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tabular-nums text-[#d4ff00]">
                      {estimated != null ? `${estimated.toLocaleString("hu-HU")} Ft` : "—"}
                    </p>
                    <p className="mt-1 text-xs text-[#888888]">
                      {selected
                        ? `${weeks} hét × ${selected.price.toLocaleString("hu-HU")} Ft/hét · ÁFA nélkül · becsült`
                        : "Válassz felületet és dátumot"}
                    </p>
                  </div>
                </WizardPanel>
              )}

              {step === 2 && (
                <WizardPanel
                  title="Kreatív"
                  subtitle="Húzd ide a fájlt (JPG, PNG, MP4), vagy kattints a feltöltéshez."
                >
                  <div
                    className={`mb-4 rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors ${
                      dragOver ? "border-[#d4ff00] bg-[#d4ff00]/5" : "border-[#333333] bg-[#000000]/60"
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0] ?? null;
                      if (f && /\.(jpe?g|png|mp4)$/i.test(f.name)) handleFile(f);
                    }}
                  >
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.mp4,image/jpeg,image/png,video/mp4"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                      />
                      <Upload className="mx-auto mb-3 h-10 w-10 text-[#888888]" strokeWidth={1.25} />
                      <p className="text-sm font-semibold text-white">Ejtsd ide a kreatívot</p>
                      <p className="mt-1 text-xs text-[#888888]">JPG · PNG · MP4 · max. 200 MB</p>
                    </label>
                  </div>
                  {filePreview ? (
                    <div className="mb-4 rounded-2xl border border-[#1a1a1a] bg-[#000000] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#d4ff00]">Fájl kész</p>
                          <p className="mt-1 truncate text-xs text-[#888888]">{fileName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#1a1a1a] px-2 py-1 text-[10px] font-semibold text-[#888888] hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eltávolítás
                        </button>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={filePreview} alt="" className="mt-3 max-h-36 w-full rounded-xl object-cover" />
                    </div>
                  ) : null}
                </WizardPanel>
              )}

              {step === 3 && selected ? (
                <WizardPanel
                  title="Fizetés"
                  subtitle="Összesítő és demo Stripe-adatok. Éles környezetben a Stripe Elements kezeli a mezőket."
                >
                  <div className="mb-5 space-y-2 rounded-2xl border border-[#1a1a1a] bg-[#000000] p-4 text-sm">
                    <Row k="Felület" v={`${selected.id} — ${selected.name}`} />
                    <Row k="Helyszín" v={selected.city} />
                    <Row k="Típus" v={selected.type} />
                    <Row k="Időszak" v={reviewDates} />
                    <Row k="Kampány" v={campaignName || "—"} />
                    <Row k="Napszak célzás" v={timeLabel(timeTarget)} />
                    <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-3">
                      <span className="text-[#888888]">Fizetendő (becsült)</span>
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-[#d4ff00]">
                        {estimated != null ? `${estimated.toLocaleString("hu-HU")} Ft` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-[#111111] to-[#000000] p-5">
                    <div className="mb-4 flex items-center gap-2 text-[#888888]">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Bankkártya (Stripe demo)</span>
                    </div>
                    <div className="space-y-3">
                      <Field label="Kártyaszám">
                        <input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          autoComplete="cc-number"
                          className={inputBase}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Lejárat">
                          <input
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="HH / ÉÉ"
                            className={inputBase}
                          />
                        </Field>
                        <Field label="CVC">
                          <input
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            className={inputBase}
                          />
                        </Field>
                      </div>
                      <Field label="Kártyán szereplő név">
                        <input
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Mint Péter"
                          className={inputBase}
                        />
                      </Field>
                    </div>
                    <p className="mt-4 text-center text-[10px] text-[#555555]">
                      Titkosított csatorna ·{" "}
                      <a href="https://stripe.com" className="text-[#888888] underline hover:text-[#d4ff00]" target="_blank" rel="noreferrer">
                        Stripe
                      </a>
                    </p>
                  </div>
                </WizardPanel>
              ) : null}

              {step === 3 && !selected ? (
                <p className="text-sm text-[#888888]">Előbb válassz felületet az 1. lépésben.</p>
              ) : null}
            </>
          )}
        </div>

        {!footerHidden ? (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#1a1a1a] px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => go(-1)}
              className={`rounded-xl border border-[#1a1a1a] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#888888] transition hover:border-[#333333] hover:text-white ${
                step === 0 ? "pointer-events-none invisible" : ""
              }`}
            >
              Vissza
            </button>
            <span className="text-[11px] text-[#555555]">
              {step + 1}. / 4. lépés
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={!canContinue || isSubmitting}
              className="inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-xl bg-[#d4ff00] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                  {isRedirecting ? "Átirányítás a bankhoz…" : "Töltés…"}
                </>
              ) : step === 3 ? (
                "Fizetés és foglalás"
              ) : (
                "Következő"
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function timeLabel(v: string): string {
  const m: Record<string, string> = {
    full: "Egész nap",
    morning: "Reggeli csúcs",
    mid: "Déli",
    evening: "Esti csúcs",
  };
  return m[v] ?? v;
}

function WizardPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white sm:text-2xl">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[#888888]">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]">{label}</label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[#888888]">{k}</span>
      <span className="max-w-[60%] text-right font-medium text-white">{v}</span>
    </div>
  );
}

// ─── Inline naptár dátumtartomány-választó ───────────────────────────────────

const HU_DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const HU_MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];

function fmtYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function InlineDateRangePicker({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (s: string, e: string) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [vy, setVy] = useState(today.getFullYear());
  const [vm, setVm] = useState(today.getMonth());

  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const offset = (new Date(vy, vm, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDay = (day: number) => {
    const d = new Date(vy, vm, day);
    if (d < today) return;
    const s = fmtYMD(d);
    if (!start || (start && end)) {
      onChange(s, "");
    } else if (s <= start) {
      onChange(s, "");
    } else {
      onChange(start, s);
    }
  };

  const canGoPrev =
    vy > today.getFullYear() ||
    (vy === today.getFullYear() && vm > today.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (vm === 0) { setVm(11); setVy((y) => y - 1); }
    else setVm((m) => m - 1);
  };
  const nextMonth = () => {
    if (vm === 11) { setVm(0); setVy((y) => y + 1); }
    else setVm((m) => m + 1);
  };

  const todayStr = fmtYMD(today);
  const totalDays = start && end ? daysBetween(start, end) : 0;

  const fmtDisplay = (iso: string) =>
    iso ? new Date(iso + "T00:00:00").toLocaleDateString("hu-HU", { month: "short", day: "numeric" }) : "—";

  return (
    <div className="rounded-2xl border border-[#1a1a1a] bg-[#000000] p-4">
      {/* Kiválasztott tartomány összefoglaló */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] px-4 py-3">
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#555555]">Kezdés</p>
          <p className={`mt-0.5 font-[family-name:var(--font-barlow-condensed)] text-base font-black ${start ? "text-[#d4ff00]" : "text-[#444444]"}`}>
            {fmtDisplay(start)}
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="h-px w-16 bg-[#333333]" />
          {totalDays > 0 && (
            <span className="text-[9px] font-bold text-[#888888]">{totalDays} nap</span>
          )}
        </div>
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#555555]">Vége</p>
          <p className={`mt-0.5 font-[family-name:var(--font-barlow-condensed)] text-base font-black ${end ? "text-[#d4ff00]" : "text-[#444444]"}`}>
            {fmtDisplay(end)}
          </p>
        </div>
      </div>

      {/* Navigáció */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a1a1a] text-[#888888] transition hover:border-[#333333] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-wider text-white">
          {HU_MONTHS[vm]} {vy}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a1a1a] text-[#888888] transition hover:border-[#333333] hover:text-white"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Napok fejléc */}
      <div className="mb-1 grid grid-cols-7">
        {HU_DAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[9px] font-bold uppercase tracking-wider text-[#555555]">
            {d}
          </div>
        ))}
      </div>

      {/* Naptár cellák */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;

          const d = new Date(vy, vm, day);
          const ds = fmtYMD(d);
          const isPast = d < today;
          const isToday = ds === todayStr;
          const isStart = ds === start;
          const isEnd = ds === end;
          const inRange = Boolean(start && end && ds > start && ds < end);

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => handleDay(day)}
              className={[
                "flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all",
                isPast
                  ? "cursor-not-allowed text-[#2a2a2a]"
                  : isStart || isEnd
                    ? "bg-[#d4ff00] font-black text-black shadow-[0_0_12px_rgba(212,255,0,0.35)]"
                    : inRange
                      ? "bg-[#d4ff00]/10 text-[#d4ff00]"
                      : isToday
                        ? "ring-1 ring-[#d4ff00]/50 text-white hover:bg-[#1a1a1a]"
                        : "text-white hover:bg-[#1a1a1a]",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Tipp */}
      <p className="mt-3 text-center text-[10px] text-[#444444]">
        {!start
          ? "Kattints a kezdő napra"
          : !end
            ? "Kattints a záró napra"
            : `${Math.max(1, Math.ceil(totalDays / 7))} hét · ${totalDays} nap`}
      </p>
    </div>
  );
}
