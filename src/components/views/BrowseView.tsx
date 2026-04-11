"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, MapPin, Shapes } from "lucide-react";
import { filterBillboards, type Billboard, type SurfaceFilter } from "@/lib/billboards";
import { supabase, type DbBillboard } from "@/lib/supabaseClient";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540960149937-f5b868f8f6d1?w=1200&q=85&auto=format&fit=crop";

function dbToBillboard(db: DbBillboard): Billboard {
  return {
    id: db.id,
    name: db.name,
    city: db.city,
    type: db.type,
    desc: "",
    price: Number(db.price),
    lat: Number(db.lat),
    lng: Number(db.lng),
    ots: db.ots ?? "",
    status: db.status,
    imageUrl: db.image_url ?? FALLBACK_IMG,
  };
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b]">
      <div className="h-[160px] animate-pulse bg-[#111610]" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-3 w-1/4 animate-pulse rounded-full bg-[#1a1a1a]" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#1a1a1a]" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#1a1a1a]" />
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="h-5 w-1/3 animate-pulse rounded-full bg-[#1a1a1a]" />
          <div className="h-9 w-24 animate-pulse rounded-xl bg-[#1a1a1a]" />
        </div>
      </div>
    </div>
  );
}

function compactOtsForTag(otsRaw: string): string {
  const n = parseInt(otsRaw.replace(/\s/g, ""), 10);
  if (Number.isNaN(n)) return otsRaw;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export type BrowseViewProps = {
  /** Varázsló megnyitása — a Dashboard / `page` szinten (`openWiz`). */
  onRequestBooking: (billboardId?: string | null) => void;
  search: string;
  typeFilter: SurfaceFilter;
  cityFilter: string;
};

function BillboardCard({
  b,
  onBook,
}: {
  b: Billboard;
  onBook: (id: string) => void;
}) {
  const img = b.imageUrl || FALLBACK_IMG;
  const available = b.status === "free";
  const otsShort = compactOtsForTag(b.ots);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] shadow-[0_20px_48px_rgba(0,0,0,0.35)] transition-colors hover:border-[#d4ff00]/25">
      <div className="relative h-[160px] shrink-0 overflow-hidden bg-[#111610]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt=""
          className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span
          className={`absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide shadow-lg ${
            available
              ? "bg-[#d4ff00] text-black"
              : "bg-[#3f0f0f] text-[#ff6b6b]"
          }`}
        >
          {available ? "Elérhető" : "Foglalt"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-[11px] font-semibold text-[#888888]">{b.id}</p>
          <h3 className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-lg font-black leading-snug text-white">
            {b.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#888888]">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#d4ff00]/70" aria-hidden />
              {b.city}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Shapes className="h-3.5 w-3.5 shrink-0 text-[#d4ff00]/70" aria-hidden />
              {b.type}{b.size ? ` · ${b.size}` : ""}
            </span>
          </div>
          {b.desc ? (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#666666]">{b.desc}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/[0.08] bg-[#111610] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#cfcfcf]">
            Napi {otsShort} OTS
          </span>
          {b.size ? (
            <span className="rounded-full border border-white/[0.08] bg-[#111610] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#cfcfcf]">
              {b.size}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tabular-nums text-[#d4ff00] [text-shadow:0_0_20px_rgba(212,255,0,0.2)]">
            {b.price.toLocaleString("hu-HU")} Ft / hét
          </p>
          <button
            type="button"
            onClick={() => onBook(b.id)}
            disabled={!available}
            className="inline-flex items-center justify-center rounded-xl border-2 border-[#d4ff00]/50 bg-[#d4ff00] px-5 py-2.5 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_24px_rgba(212,255,0,0.25)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#333] disabled:bg-[#1a1a1a] disabled:text-[#666] disabled:shadow-none"
          >
            Foglalás
          </button>
        </div>
      </div>
    </article>
  );
}

export function BrowseView({
  onRequestBooking,
  search,
  typeFilter,
  cityFilter,
}: BrowseViewProps) {
  const [allBillboards, setAllBillboards] = useState<Billboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBillboards() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("billboards")
        .select("*")
        .order("city");
      if (error) {
        console.error("[BrowseView] Supabase fetch error:", error.message);
      } else {
        setAllBillboards((data as DbBillboard[]).map(dbToBillboard));
      }
      setIsLoading(false);
    }
    fetchBillboards();
  }, []);

  const items = useMemo(() => {
    const filtered = filterBillboards(allBillboards, typeFilter, cityFilter);
    const q = search.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q)
    );
  }, [allBillboards, search, typeFilter, cityFilter]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
              <LayoutGrid className="h-5 w-5 text-[#d4ff00]" strokeWidth={2} />
              Böngészés
            </h1>
            <p className="mt-1 text-[11px] text-[#888888]">
              {isLoading ? "Betöltés…" : `${items.length} felület · szűrők a lap tetején`}
            </p>
          </div>
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#7aaa44]">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d4ff00]/20 border-t-[#d4ff00]" />
              Adatok betöltése
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((b) => (
                <BillboardCard key={b.id} b={b} onBook={(id) => onRequestBooking(id)} />
              ))}
        </div>

        {!isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0c0f0b] px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-white">
              Nincs találat
            </p>
            <p className="mt-2 max-w-sm text-sm text-[#888888]">
              Más szűrővel vagy keresővel próbáld újra.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
