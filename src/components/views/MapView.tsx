"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] flex-1 items-center justify-center bg-[#060907] text-sm text-[#888888]">
      Térkép betöltése…
    </div>
  ),
});

type MapViewProps = {
  onRequestBooking: (initialBillboardId?: string | null) => void;
};

export function MapView({ onRequestBooking }: MapViewProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <MapComponent
        onCampaignBook={(bb) => {
          onRequestBooking(bb.id);
        }}
      />
    </div>
  );
}
