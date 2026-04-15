"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LayoutGrid, MapPinned } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import { BookingWizard } from "@/components/BookingWizard";
import { DashboardViewRouter } from "@/components/DashboardViewRouter";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { DashboardViewProvider, useDashboardView } from "@/context/DashboardViewContext";
import { ToastProvider } from "@/context/ToastContext";
import { CreativeProvider } from "@/context/CreativeContext";
import { billboards, type SurfaceFilter } from "@/lib/billboards";
import { requestMapInvalidate } from "@/lib/map-events";
import { supabase } from "@/lib/supabaseClient";
import { VIEW_TITLES, type DashboardViewId } from "@/types/dashboard";

function DashboardShell() {
  const { view, setView, navigate } = useDashboardView();
  const [slim, setSlim] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SurfaceFilter>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [notifOpen, setNotifOpen] = useState(false);
  const [wizOpen, setWizOpen] = useState(false);
  const [wizBbId, setWizBbId] = useState<string | null>(null);
  const [wizKey, setWizKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingWhenLoggedIn, setPendingWhenLoggedIn] = useState(0);

  // Hitelesítési állapot szinkronizálása
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setAuthOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Függőben lévő foglalások száma a sidebar badge-hez (kijelentkezéskor deriváltan 0, sync setState nélkül)
  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .then(({ count }) => setPendingWhenLoggedIn(count ?? 0));
  }, [user]);

  const pendingCount = user ? pendingWhenLoggedIn : 0;

  const available = billboards.filter((b) => b.status === "free").length;
  const booked = billboards.filter((b) => b.status === "booked").length;
  const total = billboards.length;

  const showMapChrome = view === "map" || view === "browse";

  const openWiz = (id?: string | null) => {
    setNotifOpen(false);
    setWizBbId(id ?? null);
    setWizKey((k) => k + 1);
    setWizOpen(true);
  };

  return (
    <div className="relative z-[1] flex h-screen min-h-0 overflow-hidden bg-[#000000] text-[var(--text)]">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-[300] transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          slim={slim}
          onToggleSlim={() => setSlim((s) => !s)}
          active={view}
          onNavigate={(v) => {
            navigate(v);
            setMobileSidebarOpen(false);
          }}
          user={user}
          pendingCount={pendingCount}
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0c0f0b]">
        <Topbar
          view={view}
          title={VIEW_TITLES[view]}
          search={search}
          onSearchChange={setSearch}
          onOpenNotifications={() => setNotifOpen(true)}
          onNewBooking={() => openWiz()}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          user={user}
          onOpenAuth={() => setAuthOpen(true)}
          onLogout={() => supabase.auth.signOut()}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <LiveTicker />
          {showMapChrome && (
            <>
              <StatsRow available={available} booked={booked} total={total} />
              <FilterBar
                typeFilter={typeFilter}
                onTypeFilter={setTypeFilter}
                cityFilter={cityFilter}
                onCityFilter={setCityFilter}
                view={view}
                onViewMap={() => navigate("map")}
                onViewBrowse={() => navigate("browse")}
              />
            </>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardViewRouter
              view={view}
              onRequestBooking={openWiz}
              browseSearch={search}
              browseTypeFilter={typeFilter}
              browseCityFilter={cityFilter}
              user={user}
              onOpenAuth={() => setAuthOpen(true)}
            />
          </div>
        </div>
      </div>
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} user={user} />
      <BookingWizard
        key={wizKey}
        open={wizOpen}
        onClose={() => {
          setWizOpen(false);
          setWizBbId(null);
          requestAnimationFrame(() => requestMapInvalidate());
        }}
        initialBillboardId={wizBbId}
        onCompleteGoBookings={() => {
          setView("bookings");
          requestAnimationFrame(() => requestMapInvalidate());
        }}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export function Dashboard() {
  return (
    <ToastProvider>
      <CreativeProvider>
        <DashboardViewProvider initialView="map">
          <DashboardShell />
        </DashboardViewProvider>
      </CreativeProvider>
    </ToastProvider>
  );
}

function LiveTicker() {
  const freeN = billboards.filter((b) => b.status === "free").length;
  const totalN = billboards.length;
  const sampleGy = billboards.find((b) => b.id === "GY001");
  const otsHint = sampleGy?.ots ?? "45 000";
  const items = [
    <>
      <strong>Kovács Bt.</strong> foglalt · GY001 · 4 hét{" "}
      <span className="text-[#d4ff00]">+240 000 Ft</span>
    </>,
    <>
      Felület elérhetőség:{" "}
      <strong>
        {freeN}/{totalN}
      </strong>{" "}
      szabad
    </>,
    <>
      <strong>Mai megjelenés:</strong> <span className="text-[#d4ff00]">0</span> · Indulás előtt
    </>,
    <>
      6ékony partner: <strong>aktív</strong> · 6 város · {totalN} felület a platformon
    </>,
    <>
      Legforgalmasabb: <strong>GY001</strong> · ~{otsHint}/nap OTS
    </>,
  ];
  return (
    <div className="flex h-8 shrink-0 items-center overflow-hidden border-b border-[var(--b1)] bg-[var(--bg2)]">
      <div className="flex shrink-0 items-center gap-2 border-r border-[var(--b1)] px-4">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4ff00] animate-nbp" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#d4ff00]">Élő</span>
      </div>
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="flex animate-ltk whitespace-nowrap">
          {[...items, ...items].map((line, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 border-r border-[var(--b1)] px-6 text-[11px] text-[var(--t2)]"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsRow({
  available,
  booked,
  total,
}: {
  available: number;
  booked: number;
  total: number;
}) {
  return (
    <div className="grid shrink-0 grid-cols-4 gap-2.5 px-5 py-3.5 max-md:grid-cols-2">
      <StatCard
        highlight
        label="Elérhető felület"
        value={String(available)}
        sub={
          <>
            <span className="text-[#d4ff00]">6</span> városban
          </>
        }
      />
      <StatCard label="Foglalt" value={String(booked)} sub="75% kihasználtság" />
      <StatCard label="Összes felület" value={String(total)} sub="6ékony Reklám Kft." />
      <StatCard label="Bevétel (hó)" value="0 Ft" sub="Indulás előtt 🚀" />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative cursor-default overflow-hidden rounded-[10px] border border-[var(--b1)] bg-[var(--card)] px-4 py-3 transition-all hover:-translate-y-px hover:border-[var(--b2)] ${
        highlight ? "border-[var(--b2)]" : ""
      }`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-0.5 origin-left bg-[linear-gradient(90deg,#d4ff00,transparent)] transition-transform duration-[400ms] ${
          highlight ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--t2)]">{label}</div>
      <div
        className={`font-[family-name:var(--font-barlow-condensed)] text-[28px] font-black leading-none text-[var(--text)] ${
          highlight ? "text-[#d4ff00] [text-shadow:0_0_18px_rgba(212,255,0,0.2)]" : ""
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-[var(--t2)]">{sub}</div>
    </div>
  );
}

function FilterBar({
  typeFilter,
  onTypeFilter,
  cityFilter,
  onCityFilter,
  view,
  onViewMap,
  onViewBrowse,
}: {
  typeFilter: SurfaceFilter;
  onTypeFilter: (t: SurfaceFilter) => void;
  cityFilter: string;
  onCityFilter: (c: string) => void;
  view: DashboardViewId;
  onViewMap: () => void;
  onViewBrowse: () => void;
}) {
  const chips: { id: SurfaceFilter; label: string }[] = [
    { id: "all", label: "Összes" },
    { id: "oriasplakat", label: "Óriásplakát" },
    { id: "orias", label: "Óriás felület" },
    { id: "kis", label: "Kis felület" },
  ];
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 px-5 pb-3">
      <span className="text-[11px] font-semibold text-[var(--t2)]">Típus:</span>
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onTypeFilter(c.id)}
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
            typeFilter === c.id
              ? "border-[var(--b3)] bg-[var(--ns)] text-[#d4ff00]"
              : "border-[var(--b1)] bg-[var(--bg3)] text-[var(--t2)] hover:border-[var(--b3)] hover:bg-[var(--ns)] hover:text-[#d4ff00]"
          }`}
        >
          {c.label}
        </button>
      ))}
      <select
        value={cityFilter}
        onChange={(e) => onCityFilter(e.target.value)}
        className="rounded-md border border-[var(--b1)] bg-[var(--bg3)] px-2.5 py-1 text-[11px] text-[var(--text)] outline-none"
      >
        <option value="all">Összes város</option>
        <option>Győr</option>
        <option>Mosonmagyaróvár</option>
        <option>Kecskemét</option>
        <option>Székesfehérvár</option>
        <option>Szolnok</option>
        <option>Velence</option>
      </select>
      <div className="ml-auto flex overflow-hidden rounded-md border border-[var(--b1)] bg-[var(--bg3)]">
        <button
          type="button"
          onClick={onViewMap}
          className={`flex items-center gap-1 px-3 py-1 text-[11px] transition-all ${
            view === "map"
              ? "bg-[var(--ns)] text-[#d4ff00]"
              : "bg-transparent text-[var(--t2)] hover:text-[var(--text)]"
          }`}
        >
          <MapPinned className="h-[13px] w-[13px]" strokeWidth={2} />
          Térkép
        </button>
        <button
          type="button"
          onClick={onViewBrowse}
          className={`flex items-center gap-1 px-3 py-1 text-[11px] transition-all ${
            view === "browse"
              ? "bg-[var(--ns)] text-[#d4ff00]"
              : "bg-transparent text-[var(--t2)] hover:text-[var(--text)]"
          }`}
        >
          <LayoutGrid className="h-[13px] w-[13px]" strokeWidth={2} />
          Rács
        </button>
      </div>
    </div>
  );
}
