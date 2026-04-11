/** Aktív fő tartalom nézet azonosítója (oldalsáv → fő terület). */
export type DashboardViewId =
  | "map"
  | "browse"
  | "bookings"
  | "analytics"
  | "invoices"
  | "preview"
  | "roi";

export const DASHBOARD_VIEWS: readonly DashboardViewId[] = [
  "map",
  "browse",
  "bookings",
  "analytics",
  "invoices",
  "preview",
  "roi",
] as const;

/** Topbar / dokumentumcímhez */
export const VIEW_TITLES: Record<DashboardViewId, string> = {
  map: "Térkép nézet",
  browse: "Böngészés",
  bookings: "Foglalásaim",
  analytics: "Analitika",
  invoices: "Számlák",
  preview: "Kreatív Előnézet",
  roi: "ROI Kalkulátor",
};

export function isDashboardViewId(v: string): v is DashboardViewId {
  return (DASHBOARD_VIEWS as readonly string[]).includes(v);
}
