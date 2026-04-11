"use client";

import type { DashboardViewId } from "@/types/dashboard";
import type { SurfaceFilter } from "@/lib/billboards";
import {
  AnalyticsView,
  BookingsView,
  BrowseView,
  InvoicesView,
  MapView,
  PreviewView,
  RoiView,
} from "@/components/views";

type DashboardViewRouterProps = {
  view: DashboardViewId;
  /** Varázsló megnyitása (Topbar, térkép, böngészés, foglalások) */
  onRequestBooking: (initialBillboardId?: string | null) => void;
  browseSearch: string;
  browseTypeFilter: SurfaceFilter;
  browseCityFilter: string;
};

export function DashboardViewRouter({
  view,
  onRequestBooking,
  browseSearch,
  browseTypeFilter,
  browseCityFilter,
}: DashboardViewRouterProps) {
  switch (view) {
    case "map":
      return <MapView onRequestBooking={onRequestBooking} />;
    case "browse":
      return (
        <BrowseView
          onRequestBooking={onRequestBooking}
          search={browseSearch}
          typeFilter={browseTypeFilter}
          cityFilter={browseCityFilter}
        />
      );
    case "bookings":
      return <BookingsView onRequestBooking={onRequestBooking} />;
    case "analytics":
      return <AnalyticsView />;
    case "invoices":
      return <InvoicesView />;
    case "preview":
      return <PreviewView />;
    case "roi":
      return <RoiView />;
  }
}
