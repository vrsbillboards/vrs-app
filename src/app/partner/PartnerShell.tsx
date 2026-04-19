"use client";

import { useState, type ElementType } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Percent,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ─── Public types ─────────────────────────────────────────────────────────────

export type BookingRow = {
  id: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  creative_url?: string | null;
  billboards?: { name: string; city: string; code: string | null; type: string } | null;
};

export type BillboardRow = {
  id: string;
  code: string | null;
  name: string;
  city: string;
  type: string;
  price: number;
  status: "free" | "booked";
};

// ─── Commission tiers ─────────────────────────────────────────────────────────

const COMMISSION_TIERS = [
  { min: 0,         max: 2_000_000,  rate: 10, label: "Alap" },
  { min: 2_000_000, max: 5_000_000,  rate: 15, label: "Ezüst" },
  { min: 5_000_000, max: 10_000_000, rate: 18, label: "Arany" },
  { min: 10_000_000, max: Infinity,  rate: 22, label: "Platina" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("hu-HU");
}

function fmtDate(d: string) {
  if (!d || d === "—") return "—";
  try {
    return new Date(d).toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

function mapBookingStatus(s: string): "active" | "pending" | "completed" | "paused" | "scheduled" {
  if (s === "approved" || s === "confirmed") return "active";
  if (s === "pending") return "pending";
  if (s === "cancelled") return "completed";
  if (s === "rejected") return "paused";
  return "pending";
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PartnerRole = "agency" | "owner";
type Tab = "overview" | "campaigns" | "clients" | "billboards" | "payouts" | "settings";
type PartnerNavItem = { id: Tab; label: string; icon: ElementType };

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function PartnerPortalSidebar({
  mobile = false,
  role,
  setRole,
  tab,
  setTab,
  setSidebarOpen,
  navItems,
  userEmail,
}: {
  mobile?: boolean;
  role: PartnerRole;
  setRole: (r: PartnerRole) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  setSidebarOpen: (v: boolean) => void;
  navItems: PartnerNavItem[];
  userEmail: string;
}) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-[#0f0f0f] bg-[#050505] ${
        mobile ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl" : "hidden w-56 shrink-0 lg:flex xl:w-64"
      }`}
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#0f0f0f] px-5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: role === "agency" ? "rgba(129,140,248,0.15)" : "rgba(212,255,0,0.12)",
            border: role === "agency" ? "1px solid rgba(129,140,248,0.3)" : "1px solid rgba(212,255,0,0.25)",
          }}
        >
          {role === "agency" ? (
            <Building2 className="h-3.5 w-3.5 text-[#818cf8]" strokeWidth={2.5} />
          ) : (
            <MapPin className="h-3.5 w-3.5 text-[#d4ff00]" strokeWidth={2.5} />
          )}
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black tracking-widest text-white">
            VRS <span style={{ color: role === "agency" ? "#818cf8" : "#d4ff00" }}>PARTNER</span>
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2a2a2a]">
            {role === "agency" ? "Ügynökség" : "Tulajdonos"}
          </p>
        </div>
      </div>

      <div className="border-b border-[#0f0f0f] p-3">
        <div className="flex overflow-hidden rounded-xl border border-[#141414] bg-[#080808]">
          {(["agency", "owner"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setTab("overview");
                setSidebarOpen(false);
              }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition ${
                role === r
                  ? r === "agency"
                    ? "bg-[#818cf8]/15 text-[#818cf8]"
                    : "bg-[#d4ff00]/10 text-[#d4ff00]"
                  : "text-[#333] hover:text-[#666]"
              }`}
            >
              {r === "agency" ? "Ügynökség" : "Tulajdonos"}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#222]">
          Navigáció
        </p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const accent = role === "agency" ? "#818cf8" : "#d4ff00";
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setSidebarOpen(false);
              }}
              className={`group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                tab === id ? "" : "text-[#444] hover:bg-[#0a0a0a] hover:text-[#999]"
              }`}
              style={tab === id ? { background: `${accent}10`, color: accent } : {}}
            >
              <Icon
                className="h-4 w-4 shrink-0 transition"
                style={{ color: tab === id ? accent : "#2a2a2a" }}
                strokeWidth={tab === id ? 2.5 : 2}
              />
              <span className="flex-1">{label}</span>
              {tab === id && <ChevronRight className="h-3 w-3 opacity-40" strokeWidth={2} />}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[#0f0f0f] p-4">
        <div className="mb-3 rounded-xl border border-[#141414] bg-[#080808] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2a2a2a]">
            Partner fiók
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#444]">{userEmail}</p>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut().then(() => { window.location.href = "/"; })}
          className="flex w-full items-center gap-2 rounded-xl border border-[#141414] px-3 py-2 text-[12px] font-semibold text-[#444] transition hover:border-[#5a1a1a] hover:text-[#ff6b6b]"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, accent, trend,
}: {
  label: string; value: string; sub?: string;
  icon: ElementType; accent: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#141414] bg-[#0a0a0a] p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-[#222]">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}18, transparent 70%)` }}
      />
      <div className="mb-5 flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#444]">{label}</span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2.5} />
        </div>
      </div>
      <p
        className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black"
        style={{ color: accent, textShadow: `0 0 30px ${accent}30` }}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold ${
              trend.up ? "text-[#4ade80]" : "text-[#ff6b6b]"
            }`}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
        {sub && <span className="text-[11px] text-[#3a3a3a]">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Status badges ────────────────────────────────────────────────────────────

function CampaignStatus({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    active:    { color: "#d4ff00", label: "Aktív" },
    pending:   { color: "#fbbf24", label: "Függő" },
    scheduled: { color: "#818cf8", label: "Ütemezett" },
    completed: { color: "#4ade80", label: "Befejezett" },
    paused:    { color: "#ff6b6b", label: "Szüneteltetve" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide"
      style={{ color: s.color, background: `${s.color}10`, border: `1px solid ${s.color}30` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function PayoutStatus({ status }: { status: string }) {
  if (status === "Kifizetve")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4ade80]/30 bg-[#4ade80]/8 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#4ade80]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} /> Kifizetve
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/8 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
      <Clock className="h-3 w-3" strokeWidth={2.5} /> Feldolgozás alatt
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart3 className="mb-3 h-8 w-8 text-[#1a1a1a]" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-[#2a2a2a]">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENCY VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function AgencyOverview({ bookings }: { bookings: BookingRow[] }) {
  const totalSpend = bookings.reduce((s, b) => s + b.total_price, 0);
  const activeCampaigns = bookings.filter((b) =>
    ["approved", "confirmed"].includes(b.status)
  ).length;

  const tier =
    COMMISSION_TIERS.find((t) => totalSpend >= t.min && totalSpend < t.max) ??
    COMMISSION_TIERS[0];
  const nextTier = COMMISSION_TIERS[COMMISSION_TIERS.indexOf(tier) + 1];
  const progress = nextTier
    ? Math.min(100, Math.round(((totalSpend - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Összes kampány"
          value={String(bookings.length)}
          sub="összes foglalás"
          icon={Users}
          accent="#d4ff00"
        />
        <KpiCard
          label="Teljes költés"
          value={`${fmt(totalSpend)} Ft`}
          sub="összes foglalásból"
          icon={TrendingUp}
          accent="#00ff87"
        />
        <KpiCard
          label="Aktív kampányok"
          value={String(activeCampaigns)}
          sub="jóváhagyott"
          icon={BarChart3}
          accent="#7fff57"
        />
        <KpiCard
          label="Jutalékszint"
          value={`${tier.rate}%`}
          sub={`${tier.label} szint`}
          icon={Percent}
          accent="#818cf8"
        />
      </div>

      {/* Commission tier progress */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">
              Jutalék szint haladás
            </h3>
            <p className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-white">
              {tier.label} → {nextTier ? nextTier.label : "Maximum"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#444]">Jelenlegi forgalom</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-[#d4ff00]">
              {fmt(totalSpend)} Ft
            </p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414]">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #d4ff00, #00ff87)",
            }}
          />
        </div>
        {nextTier && (
          <p className="mt-2 text-[11px] text-[#3a3a3a]">
            Még{" "}
            <span className="font-bold text-[#d4ff00]">
              {fmt(nextTier.min - totalSpend)} Ft
            </span>{" "}
            a következő szintig ({nextTier.rate}%)
          </p>
        )}
      </div>

      {/* Campaigns table */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">
            Kampányaim
          </h3>
          <span className="text-[10px] font-bold text-[#333]">{bookings.length} kampány</span>
        </div>
        {bookings.length === 0 ? (
          <EmptyState label="Még nincs foglalásod. Indíts egy kampányt!" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#111] text-[10px] font-black uppercase tracking-[0.14em] text-[#333]">
                  {["Felület", "Kód", "Város", "Időszak", "Összeg", "Állapot"].map((h) => (
                    <th key={h} className="px-6 py-3 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-[#0d0d0d] transition-colors last:border-0 hover:bg-[#0d0d0d]"
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-[13px] font-semibold text-[#ccc]">
                        {b.billboards?.name ?? b.billboard_id}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">
                        {b.billboards?.code ?? b.billboard_id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-[#777]">
                      {b.billboards?.city ?? "—"}
                    </td>
                    <td className="px-6 py-3.5 text-[12px] tabular-nums text-[#888]">
                      {fmtDate(b.start_date)} – {fmtDate(b.end_date)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">
                        {fmt(b.total_price)} Ft
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <CampaignStatus status={mapBookingStatus(b.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER VIEW
// ═══════════════════════════════════════════════════════════════════════════════

type BillboardWithStats = BillboardRow & {
  activeBookings: number;
  monthlyRevenue: number;
  occupancy: number;
};

function OwnerOverview({
  billboards,
  bookings,
}: {
  billboards: BillboardRow[];
  bookings: BookingRow[];
}) {
  const now = new Date();

  // Group bookings by billboard_id
  const byBillboard = bookings.reduce<Record<string, BookingRow[]>>((acc, b) => {
    const arr = acc[b.billboard_id] ?? [];
    arr.push(b);
    return { ...acc, [b.billboard_id]: arr };
  }, {});

  const boards: BillboardWithStats[] = billboards.map((bb) => {
    const bbs = byBillboard[bb.id] ?? [];
    const activeBookings = bbs.filter((b) =>
      ["approved", "confirmed"].includes(b.status)
    ).length;
    const monthlyRevenue = bbs
      .filter((b) => {
        const d = new Date(b.created_at);
        return (
          d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        );
      })
      .reduce((s, b) => s + b.total_price, 0);
    // Derive occupancy from DB status + active bookings ratio
    const occupancy =
      bb.status === "booked"
        ? Math.min(100, 50 + activeBookings * 15)
        : activeBookings > 0
          ? Math.min(45, activeBookings * 15)
          : 0;
    return { ...bb, activeBookings, monthlyRevenue, occupancy };
  });

  const totalBoards = boards.length;
  const bookedCount = boards.filter((b) => b.status === "booked").length;
  const avgOccupancy =
    boards.length > 0
      ? Math.round(boards.reduce((s, b) => s + b.occupancy, 0) / boards.length)
      : 0;
  const monthlyTotal = boards.reduce((s, b) => s + b.monthlyRevenue, 0);
  const expectedPayout = Math.round(monthlyTotal * 0.72);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Felületek száma"
          value={String(totalBoards)}
          sub={`${bookedCount} foglalt`}
          icon={MapPin}
          accent="#d4ff00"
        />
        <KpiCard
          label="Átl. kihasználtság"
          value={`${avgOccupancy}%`}
          sub="összes felületre"
          icon={BarChart3}
          accent="#00ff87"
        />
        <KpiCard
          label="Havi bevétel"
          value={`${fmt(monthlyTotal)} Ft`}
          sub="aktuális hónap"
          icon={TrendingUp}
          accent="#7fff57"
        />
        <KpiCard
          label="Várható kifizetés"
          value={`${fmt(expectedPayout)} Ft`}
          sub="nettó (72%-os arány)"
          icon={CreditCard}
          accent="#818cf8"
        />
      </div>

      {/* Occupancy bars */}
      {boards.length > 0 && (
        <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a] p-6">
          <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">
            Felületi kihasználtság
          </h3>
          <div className="space-y-4">
            {boards.map((bb) => (
              <div key={bb.id} className="flex items-center gap-4">
                <span className="w-24 shrink-0 font-mono text-[11px] font-bold text-[#d4ff00]">
                  {bb.code ?? bb.id.slice(0, 8)}
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12px] text-[#777]">{bb.name}</span>
                    <span className="text-[12px] font-bold tabular-nums text-[#ccc]">
                      {bb.occupancy}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${bb.occupancy}%`,
                        background:
                          bb.occupancy > 80
                            ? "linear-gradient(90deg, #d4ff00, #00ff87)"
                            : bb.occupancy > 50
                              ? "linear-gradient(90deg, #fbbf24, #d4ff00)"
                              : "linear-gradient(90deg, #ff6b6b, #fbbf24)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billboard table */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">
            Felületek részletei
          </h3>
          <span className="text-[10px] font-bold text-[#333]">{totalBoards} felület</span>
        </div>
        {boards.length === 0 ? (
          <EmptyState label="Nincsenek elérhető felületek." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#111] text-[10px] font-black uppercase tracking-[0.14em] text-[#333]">
                  {["Kód", "Helyszín", "Város", "Típus", "Heti ár", "Aktív foglalások", "Havi bevétel", "Állapot"].map(
                    (h) => (
                      <th key={h} className="px-5 py-3 font-bold">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {boards.map((bb) => (
                  <tr
                    key={bb.id}
                    className="border-b border-[#0d0d0d] transition-colors last:border-0 hover:bg-[#0d0d0d]"
                  >
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">
                        {bb.code ?? bb.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#ccc]">{bb.name}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#777]">{bb.city}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#777]">{bb.type}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">
                        {fmt(bb.price)} Ft
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-[13px] text-[#ccc]">
                      {bb.activeBookings}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#00ff87]">
                        {fmt(bb.monthlyRevenue)} Ft
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                          bb.status === "booked"
                            ? "border border-[#d4ff00]/25 bg-[#d4ff00]/8 text-[#d4ff00]"
                            : "border border-[#fbbf24]/25 bg-[#fbbf24]/8 text-[#fbbf24]"
                        }`}
                      >
                        {bb.status === "booked" ? "Foglalt" : "Szabad"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts — no table yet, show placeholder */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">
            Kifizetési előzmények
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-14">
          <CreditCard className="mb-3 h-8 w-8 text-[#1a1a1a]" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#2a2a2a]">
            Kifizetési adatok hamarosan elérhetők
          </p>
          <p className="mt-1 text-[11px] text-[#1a1a1a]">
            Első kifizetés az első jóváhagyott kampány zárása után
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ═══════════════════════════════════════════════════════════════════════════════

type ShellProps = {
  user: { id: string; email: string };
  initialRole: PartnerRole;
  bookings: BookingRow[];
  billboards: BillboardRow[];
};

export function PartnerShell({ user, initialRole, bookings, billboards }: ShellProps) {
  const [role, setRole] = useState<PartnerRole>(initialRole);
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const agencyNav: PartnerNavItem[] = [
    { id: "overview",  label: "Áttekintés",  icon: LayoutDashboard },
    { id: "campaigns", label: "Kampányok",   icon: BarChart3 },
    { id: "settings",  label: "Beállítások", icon: FileText },
  ];

  const ownerNav: PartnerNavItem[] = [
    { id: "overview",   label: "Áttekintés",  icon: LayoutDashboard },
    { id: "billboards", label: "Felületek",   icon: MapPin },
    { id: "payouts",    label: "Kifizetések", icon: CreditCard },
    { id: "settings",   label: "Beállítások", icon: FileText },
  ];

  const navItems = role === "agency" ? agencyNav : ownerNav;

  const pageTitles: Record<Tab, string> = {
    overview:   "Áttekintés",
    campaigns:  "Aktív kampányok",
    clients:    "Ügyfélportfólió",
    billboards: "Saját felületek",
    payouts:    "Kifizetések",
    settings:   "Beállítások",
  };

  const sidebarProps = { role, setRole, tab, setTab, setSidebarOpen, navItems, userEmail: user.email };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020202] text-white">
      <PartnerPortalSidebar {...sidebarProps} />

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <PartnerPortalSidebar mobile {...sidebarProps} />
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#0f0f0f] bg-[#050505] px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#141414] text-[#444] transition hover:border-[#222] hover:text-[#ccc] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <div className="space-y-1">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-3 bg-current" />
                <span className="block h-px w-4 bg-current" />
              </div>
            </button>
            <h1 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
              {pageTitles[tab]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-[#2a2a2a] sm:block">
              {role === "agency" ? "Ügynökségi portál" : "Tulajdonosi portál"}
            </span>
            <div className="h-4 w-px bg-[#141414]" />
            <a
              href="/foglalas"
              className="flex items-center gap-1.5 rounded-lg border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#d4ff00] transition hover:bg-[#d4ff00]/12"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={2} />
              Foglalás
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {(tab === "overview" || tab === "campaigns" || tab === "clients") &&
            role === "agency" && <AgencyOverview bookings={bookings} />}
          {(tab === "overview" || tab === "billboards" || tab === "payouts") &&
            role === "owner" && <OwnerOverview billboards={billboards} bookings={bookings} />}
          {tab === "settings" && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#141414] bg-[#0a0a0a] py-20">
              <Shield className="mb-4 h-10 w-10 text-[#222]" strokeWidth={1.5} />
              <p className="text-lg font-bold text-[#333]">Beállítások</p>
              <p className="mt-2 text-sm text-[#222]">
                Hamarosan elérhető — API integráció, számlaadatok, értesítések.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
