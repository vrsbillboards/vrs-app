import { Dashboard } from "@/components/Dashboard";

/**
 * Főoldal: a `BookingWizard` állapota a `Dashboard` / `DashboardShell` szintjén van.
 * A `BrowseView` „Foglalás” és a `BookingsView` „Új foglalás” gombja ugyanazt az
 * `onRequestBooking` (openWiz) hívást kapja a `DashboardViewRouter`-en keresztül.
 */
export default function Home() {
  return <Dashboard />;
}
