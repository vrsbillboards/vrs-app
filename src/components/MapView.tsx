"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinned, X } from "lucide-react";
import type { Billboard } from "@/lib/billboards";

const TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export type MapCityKey =
  | "all"
  | "gyor"
  | "mmov"
  | "kecs"
  | "szfv"
  | "szol"
  | "vel";

const CITY_VIEW: Record<MapCityKey, { center: [number, number]; zoom: number }> = {
  all: { center: [47.162, 19.503], zoom: 7 },
  gyor: { center: [47.68, 17.63], zoom: 12 },
  mmov: { center: [47.678, 17.269], zoom: 12 },
  kecs: { center: [46.9, 19.69], zoom: 12 },
  szfv: { center: [47.19, 18.41], zoom: 12 },
  szol: { center: [47.174, 20.196], zoom: 12 },
  vel: { center: [47.233, 18.652], zoom: 12 },
};

function FlyTo({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

function markerIcon(free: boolean) {
  const color = free ? "#d4ff00" : "#ff5a3a";
  const html = `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:3px solid #070908;box-shadow:0 0 10px ${color}"></div>`;
  return L.divIcon({
    html,
    className: "custom-leaflet-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

type MapViewProps = {
  billboards: Billboard[];
  cityKey: MapCityKey;
  onCityChange: (key: MapCityKey) => void;
  selected: Billboard | null;
  onSelect: (bb: Billboard) => void;
  onClearSelection: () => void;
  onBook: (id: string) => void;
  availableCount: number;
  totalCount: number;
};

const IMPRESSIONS = [40, 55, 48, 62, 58, 45, 50];

export default function MapView({
  billboards,
  cityKey,
  onCityChange,
  selected,
  onSelect,
  onClearSelection,
  onBook,
  availableCount,
  totalCount,
}: MapViewProps) {
  const view = CITY_VIEW[cityKey];

  const cityButtons: { key: MapCityKey; label: string }[] = useMemo(
    () => [
      { key: "all", label: "Összes" },
      { key: "gyor", label: "Győr" },
      { key: "mmov", label: "Mosonmagyaróvár" },
      { key: "kecs", label: "Kecskemét" },
      { key: "szfv", label: "Székesfehérvár" },
      { key: "szol", label: "Szolnok" },
      { key: "vel", label: "Velence" },
    ],
    []
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={view.center}
          zoom={view.zoom}
          className="h-full w-full min-h-[280px]"
          zoomControl={false}
          scrollWheelZoom
        >
          <FlyTo center={view.center} zoom={view.zoom} />
          <TileLayer attribution="&copy; VRS Billboards" url={TILE} maxZoom={19} />
          <ZoomControl position="bottomright" />
          {billboards.map((bb) => (
            <Marker
              key={bb.id}
              position={[bb.lat, bb.lng]}
              icon={markerIcon(bb.status === "free")}
              eventHandlers={{
                click: () => onSelect(bb),
              }}
            />
          ))}
        </MapContainer>
        <div className="pointer-events-none absolute inset-0 z-[400] [&_*]:pointer-events-auto">
          <div className="absolute left-1/2 top-3 z-[1000] flex max-w-[95%] -translate-x-1/2 flex-wrap justify-center gap-1.5">
            {cityButtons.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => onCityChange(b.key)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md transition-all ${
                  cityKey === b.key
                    ? "border-[var(--b3)] bg-[var(--ns)] text-[var(--neon)]"
                    : "border-[var(--b2)] bg-[rgba(7,9,8,0.88)] text-[var(--t2)] hover:border-[var(--b3)] hover:bg-[var(--ns)] hover:text-[var(--neon)]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="absolute bottom-3.5 left-3.5 z-[1000] flex flex-col gap-1.5 rounded-[10px] border border-[var(--b2)] bg-[rgba(7,9,8,0.9)] px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--t2)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--neon)]" />
              Elérhető
            </div>
            <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--t2)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--red)]" />
              Foglalt
            </div>
          </div>
          <div className="absolute bottom-3.5 right-3.5 z-[1000] flex flex-col gap-1.5 text-right">
            <div className="rounded-[9px] border border-[var(--b2)] bg-[rgba(7,9,8,0.88)] px-3 py-2 backdrop-blur-md">
              <div className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black leading-none text-[var(--neon)]">
                {availableCount}
              </div>
              <div className="mt-0.5 text-[9px] tracking-wide text-[var(--t2)]">Elérhető</div>
            </div>
            <div className="rounded-[9px] border border-[var(--b2)] bg-[rgba(7,9,8,0.88)] px-3 py-2 backdrop-blur-md">
              <div className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black leading-none text-[var(--neon)]">
                {totalCount}
              </div>
              <div className="mt-0.5 text-[9px] tracking-wide text-[var(--t2)]">Összes</div>
            </div>
          </div>
        </div>
      </div>
      <aside className="flex w-[310px] max-w-[40vw] shrink-0 flex-col overflow-y-auto border-l border-[var(--b1)] bg-[var(--bg2)] max-[1100px]:hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--b1)] px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--t2)]">
            Felület részletei
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-8 w-8 items-center justify-center border-none bg-transparent text-lg leading-none text-[var(--t2)] transition-colors hover:text-[var(--neon)]"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center text-[var(--t3)]">
            <MapPinned className="mb-3 h-[26px] w-[26px] opacity-30" strokeWidth={1.5} />
            <p className="text-xs leading-relaxed">
              Kattints egy jelölőre a térképen a részletek megtekintéséhez
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3.5">
            <div className="relative h-[110px] overflow-hidden rounded border border-[var(--b2)] bg-[var(--bg3)]">
              <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-barlow-condensed)] text-[13px] font-black tracking-[2px] text-[var(--neon)] [text-shadow:0_0_18px_rgba(212,255,0,0.4)]">
                KÉP HELYE
              </div>
            </div>
            <div>
              <div className="mb-0.5 text-[10px] font-bold tracking-wide text-[var(--nd)]">
                {selected.id}
              </div>
              <div className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black leading-tight text-[var(--text)]">
                {selected.name}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--t2)]">
                {selected.city} · {selected.type}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--b1)]">
              <div className="flex items-center justify-between border-b border-[var(--b1)] px-3 py-1.5 text-[11px] last:border-b-0">
                <span className="text-[var(--t2)]">OTS (Napi)</span>
                <span className="font-semibold text-[var(--neon)]">{selected.ots}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px]">
                <span className="text-[var(--t2)]">Méret</span>
                <span className="font-semibold text-[var(--text)]">504×238 cm</span>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--b2)] bg-[rgba(212,255,0,0.06)] px-3 py-2.5">
              <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--nd)]">
                Heti listaár
              </div>
              <div className="font-[family-name:var(--font-barlow-condensed)] text-[28px] font-black leading-none text-[var(--neon)] [text-shadow:0_0_16px_rgba(212,255,0,0.2)]">
                {selected.price.toLocaleString("hu-HU")} Ft
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-[var(--t2)]">
                Becsült megjelenés (7 nap)
              </div>
              <div className="mt-0.5 flex h-10 items-end gap-0.5">
                {IMPRESSIONS.map((h, i) => (
                  <div
                    key={i}
                    className="min-w-0 flex-1 rounded-t-sm bg-[var(--neon)] opacity-40 transition-opacity hover:opacity-100"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[8px] text-[var(--t3)]">
                <span>H</span>
                <span>V</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBook(selected.id)}
              className="relative w-full overflow-hidden rounded-lg border-none bg-[var(--neon)] py-2.5 text-xs font-bold text-[#070908] transition-all after:absolute after:inset-0 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] after:transition-transform after:duration-400 hover:after:translate-x-full hover:shadow-[0_5px_20px_rgba(212,255,0,0.3)]"
            >
              KAMPÁNY FOGLALÁSA
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
