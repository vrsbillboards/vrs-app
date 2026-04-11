"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { X } from "lucide-react";
import { VRS_MAP_INVALIDATE_EVENT } from "@/lib/map-events";
import { supabase, type DbBillboard } from "@/lib/supabaseClient";

export type MapBillboard = {
  id: string;
  title: string;
  city: string;
  lat: number;
  lng: number;
  ots: string;
  type: string;
  size?: string;
  price: number;
  imageUrl: string;
  status: "free" | "booked";
  desc: string;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540960149937-f5b868f8f6d1?w=1200&q=85&auto=format&fit=crop";

function dbToMapBillboard(db: DbBillboard): MapBillboard {
  return {
    id: db.id,
    title: db.name,
    city: db.city,
    lat: Number(db.lat),
    lng: Number(db.lng),
    ots: db.ots ?? "",
    type: db.type,
    price: Number(db.price),
    imageUrl: db.image_url ?? FALLBACK_IMG,
    status: db.status,
    desc: "",
  };
}

const TILE =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const CENTER: [number, number] = [47.2, 19.35];
const DEFAULT_ZOOM = 7;

function neonMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-leaflet-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div class="vrs-marker-pulse" aria-hidden="true"><span class="vrs-marker-dot"></span></div>`,
  });
}

function MapFlyToSelection({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (lat == null || lng == null) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 11), { duration: 0.85 });
  }, [lat, lng, map]);

  return null;
}

function MapInvalidateOnEvent() {
  const map = useMap();
  useEffect(() => {
    const fix = () => {
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };
    window.addEventListener(VRS_MAP_INVALIDATE_EVENT, fix);
    window.addEventListener("resize", fix);
    fix();
    return () => {
      window.removeEventListener(VRS_MAP_INVALIDATE_EVENT, fix);
      window.removeEventListener("resize", fix);
    };
  }, [map]);
  return null;
}

export type MapComponentProps = {
  /** Opcionális: pl. foglaló varázsló megnyitása */
  onCampaignBook?: (billboard: MapBillboard) => void;
};

export default function MapComponent({ onCampaignBook }: MapComponentProps) {
  const [selectedBillboard, setSelectedBillboard] = useState<MapBillboard | null>(null);
  const [billboards, setBillboards] = useState<MapBillboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const markerIcon = useMemo(() => neonMarkerIcon(), []);

  useEffect(() => {
    async function fetchBillboards() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("billboards")
        .select("*")
        .order("city");
      if (error) {
        console.error("[MapComponent] Supabase fetch error:", error.message);
      } else {
        setBillboards((data as DbBillboard[]).map(dbToMapBillboard));
      }
      setIsLoading(false);
    }
    fetchBillboards();
  }, []);

  const closePanel = useCallback(() => setSelectedBillboard(null), []);

  const flyLat = selectedBillboard?.lat ?? null;
  const flyLng = selectedBillboard?.lng ?? null;

  return (
    <div className="relative flex h-full min-h-[420px] flex-1 flex-col bg-[#060907]">
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#060907]/80 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-[#d4ff00]/20 border-t-[#d4ff00]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7aaa44]">
              Adatok betöltése…
            </p>
          </div>
        </div>
      )}
      <MapContainer
        center={CENTER}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-full w-full flex-1"
        style={{ minHeight: 360 }}
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url={TILE} maxZoom={19} />
        <ZoomControl position="bottomright" />
        <MapInvalidateOnEvent />
        <MapFlyToSelection lat={flyLat} lng={flyLng} />
        {billboards.map((bb) => (
          <Marker
            key={bb.id}
            position={[bb.lat, bb.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => setSelectedBillboard(bb),
            }}
          />
        ))}
      </MapContainer>

      {/* Jobb oldali panel */}
      <aside
        aria-hidden={!selectedBillboard}
        className={`absolute inset-y-0 right-0 z-40 flex w-full max-w-[400px] flex-col border-l border-[#1a1a1a] bg-[#0c0f0b] shadow-[-12px_0_40px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          selectedBillboard ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        {selectedBillboard ? (
          <>
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#1a1a1a] px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7aaa44]">
                  Felület részletei
                </p>
                <p className="mt-1 text-xs text-[#3a6022]">{selectedBillboard.city}</p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-[#7aaa44] transition-colors hover:border-[#d4ff00]/30 hover:text-[#d4ff00]"
                aria-label="Panel bezárása"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedBillboard.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span
                  className={`absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                    selectedBillboard.status === "free"
                      ? "bg-[#d4ff00] text-black"
                      : "bg-[#3f0f0f] text-[#ff6b6b]"
                  }`}
                >
                  {selectedBillboard.status === "free" ? "Elérhető" : "Foglalt"}
                </span>
              </div>

              <div className="space-y-4 px-4 py-4">
                <span className="inline-flex rounded-md border border-[#d4ff00]/35 bg-[#d4ff00]/10 px-2.5 py-1 font-mono text-xs font-black tracking-wide text-[#d4ff00]">
                  {selectedBillboard.id}
                </span>

                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black leading-tight tracking-wide text-[#eeffc0]">
                  {selectedBillboard.title}
                </h2>

                {selectedBillboard.desc ? (
                  <p className="text-[12px] leading-relaxed text-[#888888]">
                    {selectedBillboard.desc}
                  </p>
                ) : null}

                <dl className="grid gap-3 rounded-xl border border-white/[0.06] bg-black/40 p-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/[0.06] pb-3">
                    <dt className="text-[#7aaa44]">OTS (napi elérés)</dt>
                    <dd className="font-semibold tabular-nums text-[#d4ff00]">
                      {selectedBillboard.ots}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/[0.06] pb-3">
                    <dt className="text-[#7aaa44]">Típus</dt>
                    <dd className="font-semibold text-[#eeffc0]">
                      {selectedBillboard.type}
                      {selectedBillboard.size ? ` · ${selectedBillboard.size}` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#7aaa44]">Heti listaár</dt>
                    <dd className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black tabular-nums text-[#d4ff00]">
                      {selectedBillboard.price.toLocaleString("hu-HU")} Ft
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  disabled={selectedBillboard.status === "booked"}
                  onClick={() => {
                    if (selectedBillboard.status === "booked") return;
                    onCampaignBook?.(selectedBillboard);
                    closePanel();
                  }}
                  className="relative w-full overflow-hidden rounded-xl border-2 border-[#d4ff00]/40 bg-[#d4ff00] py-5 font-[family-name:var(--font-barlow-condensed)] text-lg font-black uppercase leading-tight tracking-[0.14em] text-black shadow-[0_0_32px_rgba(212,255,0,0.4)] transition after:pointer-events-none after:absolute after:inset-0 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.28)_50%,transparent_60%)] after:transition-transform after:duration-500 enabled:hover:brightness-105 enabled:hover:after:translate-x-full enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#333] disabled:bg-[#252525] disabled:text-[#666] disabled:shadow-none sm:text-2xl"
                >
                  {selectedBillboard.status === "booked" ? "Jelenleg nem foglalható" : "Kampány foglalása"}
                </button>
                <p className="text-center text-[10px] text-[#3a6022]">
                  Árak ÁFA nélkül · végleges díj egyeztetés után
                </p>
              </div>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
