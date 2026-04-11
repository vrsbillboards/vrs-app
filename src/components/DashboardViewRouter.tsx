"use client";

import type { User } from "@supabase/supabase-js";
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
  onRequestBooking: (initialBillboardId?: string | null) => void;
  browseSearch: string;
  browseTypeFilter: SurfaceFilter;
  browseCityFilter: string;
  user: User | null;
  onOpenAuth: () => void;
};

export function DashboardViewRouter({
  view,
  onRequestBooking,
  browseSearch,
  browseTypeFilter,
  browseCityFilter,
  user,
  onOpenAuth,
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
      return (
        <BookingsView
          onRequestBooking={onRequestBooking}
          user={user}
          onOpenAuth={onOpenAuth}
        />
      );
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
