"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart2, CalendarPlus, LogIn, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase, type DbBooking, type DbBillboard } from "@/lib/supabaseClient";

const NEON = "#d4ff00";

// ─── Típusok ─────────────────────────────────────────────────────────────────

export type AnalyticsViewProps = {
  user: User | null;
  onOpenAuth?: () => void;
  onRequestBooking?: () => void;
};

type EnrichedBooking = DbBooking & {
  billboardName: string;
  billboardCity: string;
  durationDays: number;
};

// ─── Segédfüggvények ──────────────────────────────────────────────────────────

function daysBetween(a: string, b: string) {
  return Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

// ─── Sub-komponensek ──────────────────────────────────────────────────────────

function LoginPrompt({ onOpenAuth }: { onOpenAuth?: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0c0f0b] text-[#888888]">
        <LogIn className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
          Bejelentkezés szükséges
        </p>
        <p className="mt-1 text-sm text-[#888888]">
          Az analitika megtekintéséhez jelentkezz be.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenAuth}
        className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-wider text-black transition hover:brightness-110"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.5} />
        Bejelentkezés
      </button>
    </div>
  );
}

function EmptyState({ onRequestBooking }: { onRequestBooking?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0c0f0b] text-[#555555]">
        <BarChart2 className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
          Még nincsenek adatok
        </p>
        <p className="mt-1 max-w-xs text-sm text-[#888888]">
          Az első kampányod elindítása után a megjelenések és statisztikák itt jelennek meg.
        </p>
      </div>
      {onRequestBooking && (
        <button
          type="button"
          onClick={onRequestBooking}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-wider text-black transition hover:brightness-110"
        >
          <CalendarPlus className="h-4 w-4" strokeWidth={2.5} />
          Első kampány indítása
        </button>
      )}
    </div>
  );
}

function SkeletonBlock({ h = "h-40" }: { h?: string }) {
  return <div className={`${h} w-full animate-pulse rounded-2xl bg-[#111610]`} />;
}

// ─── Sávdiagram ───────────────────────────────────────────────────────────────

function SpendBarChart({ bookings }: { bookings: EnrichedBooking[] }) {
  // Max 7 foglalás (csökkenő összeg szerint)
  const bars = [...bookings]
    .sort((a, b) => b.total_price - a.total_price)
    .slice(0, 7);
  const maxPrice = Math.max(...bars.map((b) => b.total_price), 1);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const run = () => {
      barRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.height = `${(bars[i]?.total_price ?? 0) / maxPrice * 100}%`;
      });
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(run));
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars.length, maxPrice]);

  const total = bars.reduce((s, b) => s + b.total_price, 0);

  const yTick = (r: number) => Math.round(maxPrice * r / 1000);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f0b] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
            Kiadás kampányonként
          </h2>
          <p className="mt-0.5 text-[11px] text-[#888888]">Foglalások összege · csökkenő sorrend</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Összesen</div>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black tabular-nums text-[#d4ff00]">
            {total.toLocaleString("hu-HU")} Ft
          </div>
        </div>
      </div>

      <div className="relative flex h-[min(260px,36vh)] min-h-[200px] items-stretch gap-3">
        {/* Y tengely */}
        <div className="flex w-12 shrink-0 flex-col justify-between pb-7 pt-1 text-right">
          {[1, 0.75, 0.5, 0.25, 0].map((r, i) => (
            <span key={i} className="text-[9px] tabular-nums text-[#888888]">
              {yTick(r) === 0 ? "0" : `${yTick(r)}k`}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Rácsvonalak */}
          <div className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-px w-full bg-white/[0.05]" />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-1 pb-7 pt-2 sm:gap-2">
            {bars.map((b, i) => (
              <div key={b.id} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end">
                <div className="relative mx-auto flex h-[88%] w-full max-w-[56px] items-end justify-center">
                  <div
                    ref={(el) => { barRefs.current[i] = el; }}
                    className="relative w-full rounded-t-md border border-[#d4ff00]/25 shadow-[0_0_24px_rgba(212,255,0,0.18)] transition-[height] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#d4ff00]/50"
                    style={{
                      height: "0%",
                      background: `linear-gradient(180deg, ${NEON} 0%, rgba(212,255,0,0.45) 32%, rgba(212,255,0,0.12) 72%, rgba(212,255,0,0) 100%)`,
                    }}
                  >
                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.1] bg-[#111610] px-2 py-1 font-[family-name:var(--font-barlow-condensed)] text-[10px] font-black tabular-nums text-[#d4ff00] opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                      {b.total_price.toLocaleString("hu-HU")} Ft
                    </span>
                  </div>
                </div>
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-[#888888]"
                  title={b.billboardName}
                >
                  {b.billboard_id.split("-")[0] ?? b.billboard_id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Eloszlás diagramm ───────────────────────────────────────────────────────

function DistributionChart({ bookings }: { bookings: EnrichedBooking[] }) {
  const COLORS = [NEON, "#ffc832", "#38bdf8", "#4d7cff", "#ff6b6b", "#a78bfa"];

  // Csoportosítás város szerint
  const cityMap = new Map<string, number>();
  bookings.forEach((b) => {
    cityMap.set(b.billboardCity, (cityMap.get(b.billboardCity) ?? 0) + b.total_price);
  });
  const total = bookings.reduce((s, b) => s + b.total_price, 0) || 1;
  const segments = [...cityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([city, amount], i) => ({
      city,
      amount,
      pct: Math.round((amount / total) * 100),
      color: COLORS[i % COLORS.length]!,
    }));

  // Conic gradient
  let acc = 0;
  const donutBg = `conic-gradient(from -90deg, ${segments
    .map((s) => {
      const start = acc;
      acc += s.pct;
      return `${s.color} ${start}% ${acc}%`;
    })
    .join(", ")})`;

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f0b] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="mb-4">
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
          Kiadás városonként
        </h2>
        <p className="mt-0.5 text-[11px] text-[#888888]">Összköltség szerinti megoszlás</p>
      </div>

      <div className="mb-5 flex flex-col items-center gap-5 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start">
        {/* Donut */}
        <div className="relative shrink-0" aria-hidden>
          <div
            className="h-[132px] w-[132px] rounded-full p-[10px] sm:h-[148px] sm:w-[148px]"
            style={{ background: donutBg }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0c0f0b] text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                Városok
              </span>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-[#d4ff00]">
                {segments.length}
              </span>
            </div>
          </div>
        </div>

        {/* Sáv */}
        <div className="min-w-0 flex-1 self-stretch space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Összesített sáv</p>
          <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#000000] p-1">
            <div className="flex h-4 w-full overflow-hidden rounded-md">
              {segments.map((s) => (
                <div
                  key={s.city}
                  className="h-full min-w-0 transition-all duration-500 first:rounded-l-md last:rounded-r-md"
                  style={{
                    width: `${s.pct}%`,
                    background: `linear-gradient(180deg, ${s.color}ee, ${s.color}55)`,
                  }}
                  title={`${s.city}: ${s.pct}%`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between px-0.5 text-[9px] font-bold uppercase tracking-wider text-[#888888]">
              <span>0%</span>
              <span className="text-[#d4ff00]/90">100% kiadás</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-white/[0.06]">
        {segments.map((s) => (
          <div key={s.city} className="flex items-center gap-3 py-3 first:pt-0">
            <div
              className="h-10 w-1 shrink-0 rounded-full"
              style={{ background: s.color, boxShadow: `0 0 12px ${s.color}55` }}
            />
            <div className="min-w-0 flex-1">
              <span className="truncate text-[12px] font-semibold text-white">{s.city}</span>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#111610]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right font-[family-name:var(--font-barlow-condensed)] text-sm font-black tabular-nums text-white">
                  {s.pct}%
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black tabular-nums text-[#d4ff00]">
                {s.amount.toLocaleString("hu-HU")} Ft
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Fő komponens ─────────────────────────────────────────────────────────────

export function AnalyticsView({ user, onOpenAuth, onRequestBooking }: AnalyticsViewProps) {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    Promise.all([
      supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("billboards").select("id, name, city"),
    ]).then(([bookingsRes, billboardsRes]) => {
      const raw = (bookingsRes.data ?? []) as DbBooking[];
      const bbs = (billboardsRes.data ?? []) as Pick<DbBillboard, "id" | "name" | "city">[];
      const bbMap = new Map(bbs.map((b) => [b.id, b]));

      const enriched: EnrichedBooking[] = raw.map((b) => {
        const bb = bbMap.get(b.billboard_id);
        return {
          ...b,
          billboardName: bb?.name ?? b.billboard_id,
          billboardCity: bb?.city ?? "—",
          durationDays: daysBetween(b.start_date, b.end_date),
        };
      });

      setBookings(enriched);
      setIsLoading(false);
    });
  }, [user]);

  if (!user) return <LoginPrompt onOpenAuth={onOpenAuth} />;

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const totalSpend = bookings.reduce((s, b) => s + b.total_price, 0);
  const totalDays = bookings.reduce((s, b) => s + b.durationDays, 0);

  const kpiCards = [
    {
      label: "Összes foglalás",
      value: bookings.length.toString(),
      unit: "db",
      sub: `${confirmed.length} megerősített`,
    },
    {
      label: "Elköltött összeg",
      value: totalSpend.toLocaleString("hu-HU"),
      unit: "Ft",
      sub: "összes foglalás",
    },
    {
      label: "Aktív kampányok",
      value: confirmed.length.toString(),
      unit: "db",
      sub: "megerősített státusz",
    },
    {
      label: "Összes kampánynap",
      value: totalDays.toLocaleString("hu-HU"),
      unit: "nap",
      sub: "összes foglalás",
    },
  ];

  // Top felületek összeg szerint
  const surfaceMap = new Map<string, { id: string; city: string; spend: number }>();
  bookings.forEach((b) => {
    const cur = surfaceMap.get(b.billboard_id);
    if (cur) {
      cur.spend += b.total_price;
    } else {
      surfaceMap.set(b.billboard_id, { id: b.billboard_id, city: b.billboardCity, spend: b.total_price });
    }
  });
  const topSurfaces = [...surfaceMap.values()].sort((a, b) => b.spend - a.spend).slice(0, 4);
  const topMax = Math.max(...topSurfaces.map((t) => t.spend), 1);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#000000] px-4 py-4 pb-8 sm:px-5">
      {/* Fejléc */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
            Analitika
          </h1>
          <p className="mt-0.5 text-[11px] font-medium text-[#888888]">
            Saját kampányok összesítő · valós adatok
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0f0b] px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4ff00] opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4ff00]" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4ff00]">Élő adatok</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} h="h-24" />)}
          </div>
          <SkeletonBlock h="h-64" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SkeletonBlock h="h-48" />
            <SkeletonBlock h="h-48" />
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState onRequestBooking={onRequestBooking} />
      ) : (
        <>
          {/* KPI sor */}
          <div className="grid shrink-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((k) => (
              <article
                key={k.label}
                className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#111610] p-4 shadow-[inset_0_1px_0_rgba(212,255,0,0.04)] transition-colors hover:border-[rgba(212,255,0,0.2)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4ff00]/45 to-transparent opacity-70" />
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">{k.label}</span>
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#d4ff00]/35 transition-colors group-hover:text-[#d4ff00]" />
                </div>
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(1.65rem,4.5vw,2.15rem)] font-black leading-none tracking-tight text-[#d4ff00] tabular-nums [text-shadow:0_0_28px_rgba(212,255,0,0.22)]">
                    {k.value}
                  </span>
                  {k.unit && (
                    <span className="text-[11px] font-semibold text-[#888888]">{k.unit}</span>
                  )}
                </div>
                <div className="mt-3 border-t border-white/[0.06] pt-2.5 text-[10px] text-[#888888]">
                  {k.sub}
                </div>
              </article>
            ))}
          </div>

          {/* Sávdiagram */}
          <SpendBarChart bookings={bookings} />

          {/* Eloszlás + Top felületek */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_min(400px,42%)]">
            <DistributionChart bookings={bookings} />

            {/* Top felületek */}
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f0b] shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
                <div>
                  <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
                    Top felületek
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#888888]">Összköltség szerinti sorrend</p>
                </div>
                <span className="rounded-md border border-[#d4ff00]/25 bg-[#d4ff00]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d4ff00]">
                  Top {topSurfaces.length}
                </span>
              </div>

              <div className="overflow-x-auto px-2 pb-4 sm:px-5">
                <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                      <th className="px-2 py-3 font-bold sm:px-3">Felület</th>
                      <th className="px-2 py-3 font-bold sm:px-3">Város</th>
                      <th className="min-w-[160px] px-2 py-3 font-bold sm:px-3">Kiadás</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {topSurfaces.map((row, idx) => {
                      const rel = (row.spend / topMax) * 100;
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
                              <div className="h-2.5 min-w-[80px] flex-1 overflow-hidden rounded-full bg-[#111610] ring-1 ring-white/[0.05]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#d4ff00] via-[#e8ff5c] to-[#d4ff00] shadow-[0_0_14px_rgba(212,255,0,0.35)] transition-all duration-500"
                                  style={{ width: `${rel}%` }}
                                />
                              </div>
                              <span className="shrink-0 font-[family-name:var(--font-barlow-condensed)] text-sm font-black tabular-nums text-[#d4ff00]">
                                {row.spend.toLocaleString("hu-HU")} Ft
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
        </>
      )}
    </div>
  );
}
