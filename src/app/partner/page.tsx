"use client";

import { useState, useEffect, type ElementType } from "react";
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

// ─── Role toggle for testing ──────────────────────────────────────────────────
type PartnerRole = "agency" | "owner";

// ─── Mock data — Agencies ─────────────────────────────────────────────────────

const MOCK_AGENCY_CLIENTS = [
  { id: "cl-001", name: "FoodPanda Kft.",       campaigns: 4, monthlySpend: 920000,  status: "active"   as const },
  { id: "cl-002", name: "Telekom Zrt.",          campaigns: 2, monthlySpend: 560000,  status: "active"   as const },
  { id: "cl-003", name: "OTP Bank Nyrt.",        campaigns: 3, monthlySpend: 1240000, status: "active"   as const },
  { id: "cl-004", name: "Decathlon Kft.",        campaigns: 1, monthlySpend: 310000,  status: "paused"   as const },
  { id: "cl-005", name: "MediaMarkt Hungary",    campaigns: 2, monthlySpend: 480000,  status: "active"   as const },
  { id: "cl-006", name: "MOL Nyrt.",             campaigns: 5, monthlySpend: 1850000, status: "active"   as const },
  { id: "cl-007", name: "Wizz Air Hungary Kft.", campaigns: 1, monthlySpend: 270000,  status: "pending"  as const },
];

const MOCK_AGENCY_CAMPAIGNS = [
  { id: "cmp-01", client: "FoodPanda Kft.",    billboard: "GY-OP-04", city: "Győr",            start: "2026-04-01", end: "2026-04-28", budget: 248000,  status: "active" as const },
  { id: "cmp-02", client: "Telekom Zrt.",       billboard: "SF-OP-06", city: "Székesfehérvár",  start: "2026-04-07", end: "2026-05-05", budget: 224000,  status: "active" as const },
  { id: "cmp-03", client: "OTP Bank Nyrt.",     billboard: "GY-OP-10", city: "Győr",            start: "2026-03-15", end: "2026-04-12", budget: 360000,  status: "active" as const },
  { id: "cmp-04", client: "MOL Nyrt.",          billboard: "KC-OP-01", city: "Kecskemét",       start: "2026-04-14", end: "2026-05-12", budget: 290000,  status: "pending" as const },
  { id: "cmp-05", client: "MediaMarkt Hungary", billboard: "GY-OP-04", city: "Győr",            start: "2026-05-01", end: "2026-05-28", budget: 248000,  status: "scheduled" as const },
  { id: "cmp-06", client: "FoodPanda Kft.",     billboard: "KC-OP-01", city: "Kecskemét",       start: "2026-03-01", end: "2026-03-28", budget: 232000,  status: "completed" as const },
];

// Commission tiers
const COMMISSION_TIERS = [
  { min: 0,       max: 2000000,  rate: 10, label: "Alap" },
  { min: 2000000, max: 5000000,  rate: 15, label: "Ezüst" },
  { min: 5000000, max: 10000000, rate: 18, label: "Arany" },
  { min: 10000000, max: Infinity, rate: 22, label: "Platina" },
];

// ─── Mock data — Owners ───────────────────────────────────────────────────────

const MOCK_OWNER_BILLBOARDS = [
  { id: "GY-OP-04", name: "ETO Park – Mártírok útja",     city: "Győr",            type: "Óriásplakát", weeklyRate: 62000,  occupancy: 87, activeBookings: 3, monthlyRevenue: 248000,  status: "booked" as const },
  { id: "SF-OP-06", name: "Palotai út – Koronás Park",    city: "Székesfehérvár",  type: "Óriásplakát", weeklyRate: 56000,  occupancy: 62, activeBookings: 2, monthlyRevenue: 168000,  status: "booked" as const },
  { id: "GY-OP-10", name: "Szent Imre út – körforgalom",  city: "Győr",            type: "Óriásplakát", weeklyRate: 60000,  occupancy: 94, activeBookings: 4, monthlyRevenue: 300000,  status: "booked" as const },
  { id: "KC-OP-01", name: "Izsáki út (52-es) – bevezető", city: "Kecskemét",       type: "Óriásplakát", weeklyRate: 58000,  occupancy: 45, activeBookings: 1, monthlyRevenue: 116000,  status: "free"   as const },
  { id: "BP-OP-12", name: "Váci út – Westend mellett",    city: "Budapest",        type: "Óriásplakát", weeklyRate: 95000,  occupancy: 100, activeBookings: 5, monthlyRevenue: 475000,  status: "booked" as const },
];

const MOCK_OWNER_PAYOUTS = [
  { id: "pay-01", period: "2026. március",    amount: 1180000, status: "Kifizetve"    as const, date: "2026-04-05" },
  { id: "pay-02", period: "2026. február",    amount: 1045000, status: "Kifizetve"    as const, date: "2026-03-05" },
  { id: "pay-03", period: "2026. április",    amount: 1307000, status: "Feldolgozás"  as const, date: "—" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString("hu-HU"); }

function fmtDate(d: string) {
  if (d === "—") return d;
  return new Date(d).toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

type Tab = "overview" | "campaigns" | "clients" | "billboards" | "payouts" | "settings";

type PartnerNavItem = { id: Tab; label: string; icon: ElementType };

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
  userEmail: string | null;
}) {
  return (
    <aside className={`flex h-full flex-col border-r border-[#0f0f0f] bg-[#050505] ${
      mobile ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl" : "hidden w-56 shrink-0 lg:flex xl:w-64"
    }`}>
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#0f0f0f] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: role === "agency" ? "rgba(129,140,248,0.15)" : "rgba(212,255,0,0.12)", border: role === "agency" ? "1px solid rgba(129,140,248,0.3)" : "1px solid rgba(212,255,0,0.25)" }}>
          {role === "agency"
            ? <Building2 className="h-3.5 w-3.5 text-[#818cf8]" strokeWidth={2.5} />
            : <MapPin className="h-3.5 w-3.5 text-[#d4ff00]" strokeWidth={2.5} />}
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
              onClick={() => { setRole(r); setTab("overview"); setSidebarOpen(false); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition ${
                role === r
                  ? r === "agency" ? "bg-[#818cf8]/15 text-[#818cf8]" : "bg-[#d4ff00]/10 text-[#d4ff00]"
                  : "text-[#333] hover:text-[#666]"
              }`}
            >
              {r === "agency" ? "Ügynökség" : "Tulajdonos"}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#222]">Navigáció</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const accent = role === "agency" ? "#818cf8" : "#d4ff00";
          return (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                tab === id ? "" : "text-[#444] hover:bg-[#0a0a0a] hover:text-[#999]"
              }`}
              style={tab === id ? { background: `${accent}10`, color: accent } : {}}
            >
              <Icon className="h-4 w-4 shrink-0 transition"
                style={{ color: tab === id ? accent : "#2a2a2a" }}
                strokeWidth={tab === id ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {tab === id && <ChevronRight className="h-3 w-3 opacity-40" strokeWidth={2} />}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[#0f0f0f] p-4">
        <div className="mb-3 rounded-xl border border-[#141414] bg-[#080808] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2a2a2a]">Partner fiók</p>
          <p className="mt-0.5 truncate text-[11px] text-[#444]">{userEmail ?? "partner@example.hu"}</p>
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

function KpiCard({ label, value, sub, icon: Icon, accent, trend }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; accent: string; trend?: { value: string; up: boolean };
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#141414] bg-[#0a0a0a] p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-[#222]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}18, transparent 70%)` }} />
      <div className="mb-5 flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#444]">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2.5} />
        </div>
      </div>
      <p className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black" style={{ color: accent, textShadow: `0 0 30px ${accent}30` }}>
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${trend.up ? "text-[#4ade80]" : "text-[#ff6b6b]"}`}>
            {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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
  const map: Record<string, { color: string; bg: string; border: string; label: string }> = {
    active:    { color: "#d4ff00", bg: "#d4ff00", border: "#d4ff00", label: "Aktív" },
    pending:   { color: "#fbbf24", bg: "#fbbf24", border: "#fbbf24", label: "Függő" },
    scheduled: { color: "#818cf8", bg: "#818cf8", border: "#818cf8", label: "Ütemezett" },
    completed: { color: "#4ade80", bg: "#4ade80", border: "#4ade80", label: "Befejezett" },
    paused:    { color: "#ff6b6b", bg: "#ff6b6b", border: "#ff6b6b", label: "Szüneteltetve" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide"
      style={{ color: s.color, background: `${s.bg}10`, border: `1px solid ${s.border}30` }}>
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

// ═══════════════════════════════════════════════════════════════════════════════
// AGENCY VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function AgencyOverview() {
  const totalSpend = MOCK_AGENCY_CLIENTS.reduce((s, c) => s + c.monthlySpend, 0);
  const totalCampaigns = MOCK_AGENCY_CLIENTS.reduce((s, c) => s + c.campaigns, 0);
  const tier = COMMISSION_TIERS.find((t) => totalSpend >= t.min && totalSpend < t.max) ?? COMMISSION_TIERS[0];
  const nextTier = COMMISSION_TIERS[COMMISSION_TIERS.indexOf(tier) + 1];
  const progress = nextTier ? Math.min(100, Math.round(((totalSpend - tier.min) / (nextTier.min - tier.min)) * 100)) : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Hozott ügyfelek" value={String(MOCK_AGENCY_CLIENTS.length)} sub="aktív partnerek" icon={Users} accent="#d4ff00" trend={{ value: "+2 ez a hónap", up: true }} />
        <KpiCard label="Havi forgalom" value={`${fmt(totalSpend)} Ft`} sub="összes ügyfélköltés" icon={TrendingUp} accent="#00ff87" trend={{ value: "+18%", up: true }} />
        <KpiCard label="Aktív kampányok" value={String(totalCampaigns)} sub="összes ügyfélnél" icon={BarChart3} accent="#7fff57" />
        <KpiCard label="Jutalékszint" value={`${tier.rate}%`} sub={`${tier.label} szint`} icon={Percent} accent="#818cf8" />
      </div>

      {/* Commission tier progress */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">Jutalék szint haladás</h3>
            <p className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-white">
              {tier.label} → {nextTier ? nextTier.label : "Maximum"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#444]">Jelenlegi forgalom</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-[#d4ff00]">{fmt(totalSpend)} Ft</p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414]">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #d4ff00, #00ff87)" }} />
        </div>
        {nextTier && (
          <p className="mt-2 text-[11px] text-[#3a3a3a]">
            Még <span className="font-bold text-[#d4ff00]">{fmt(nextTier.min - totalSpend)} Ft</span> a következő szintig ({nextTier.rate}%)
          </p>
        )}
      </div>

      {/* Recent campaigns */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">Legutóbbi kampányok</h3>
          <span className="text-[10px] font-bold text-[#333]">{MOCK_AGENCY_CAMPAIGNS.length} kampány</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#111] text-[10px] font-black uppercase tracking-[0.14em] text-[#333]">
                {["Ügyfél", "Felület", "Város", "Időszak", "Költségvetés", "Állapot"].map((h) => (
                  <th key={h} className="px-6 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_AGENCY_CAMPAIGNS.map((c) => (
                <tr key={c.id} className="border-b border-[#0d0d0d] transition-colors last:border-0 hover:bg-[#0d0d0d]">
                  <td className="px-6 py-3.5">
                    <span className="text-[13px] font-semibold text-[#ccc]">{c.client}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">{c.billboard}</span>
                  </td>
                  <td className="px-6 py-3.5 text-[12px] text-[#777]">{c.city}</td>
                  <td className="px-6 py-3.5 text-[12px] tabular-nums text-[#888]">{fmtDate(c.start)} – {fmtDate(c.end)}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">{fmt(c.budget)} Ft</span>
                  </td>
                  <td className="px-6 py-3.5"><CampaignStatus status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client list */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">Ügyfélportfólió</h3>
        </div>
        <div className="divide-y divide-[#0d0d0d]">
          {MOCK_AGENCY_CLIENTS.map((cl) => (
            <div key={cl.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-[#0d0d0d]">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">
                  {cl.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#ccc]">{cl.name}</p>
                  <p className="text-[11px] text-[#444]">{cl.campaigns} aktív kampány</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">{fmt(cl.monthlySpend)} Ft</p>
                  <p className="text-[10px] text-[#3a3a3a]">havi költés</p>
                </div>
                <CampaignStatus status={cl.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function OwnerOverview() {
  const totalBoards = MOCK_OWNER_BILLBOARDS.length;
  const bookedCount = MOCK_OWNER_BILLBOARDS.filter((b) => b.status === "booked").length;
  const avgOccupancy = Math.round(MOCK_OWNER_BILLBOARDS.reduce((s, b) => s + b.occupancy, 0) / totalBoards);
  const monthlyTotal = MOCK_OWNER_BILLBOARDS.reduce((s, b) => s + b.monthlyRevenue, 0);
  const expectedPayout = Math.round(monthlyTotal * 0.72);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Saját plakátjaim" value={String(totalBoards)} sub={`${bookedCount} foglalt`} icon={MapPin} accent="#d4ff00" />
        <KpiCard label="Átl. kihasználtság" value={`${avgOccupancy}%`} sub="összes felületre" icon={BarChart3} accent="#00ff87" trend={{ value: "+5% vs. előző hó", up: true }} />
        <KpiCard label="Havi bevétel" value={`${fmt(monthlyTotal)} Ft`} sub="bruttó hirdetési díj" icon={TrendingUp} accent="#7fff57" trend={{ value: "+12%", up: true }} />
        <KpiCard label="Várható kifizetés" value={`${fmt(expectedPayout)} Ft`} sub="nettó (72%-os arány)" icon={CreditCard} accent="#818cf8" />
      </div>

      {/* Occupancy chart (simple bar visualization) */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a] p-6">
        <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">Felületi kihasználtság</h3>
        <div className="space-y-4">
          {MOCK_OWNER_BILLBOARDS.map((bb) => (
            <div key={bb.id} className="flex items-center gap-4">
              <span className="w-24 shrink-0 font-mono text-[11px] font-bold text-[#d4ff00]">{bb.id}</span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] text-[#777]">{bb.name}</span>
                  <span className="text-[12px] font-bold tabular-nums text-[#ccc]">{bb.occupancy}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414]">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${bb.occupancy}%`,
                      background: bb.occupancy > 80 ? "linear-gradient(90deg, #d4ff00, #00ff87)"
                               : bb.occupancy > 50 ? "linear-gradient(90deg, #fbbf24, #d4ff00)"
                               : "linear-gradient(90deg, #ff6b6b, #fbbf24)",
                    }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billboard table */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">Felületek részletei</h3>
          <span className="text-[10px] font-bold text-[#333]">{totalBoards} felület</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#111] text-[10px] font-black uppercase tracking-[0.14em] text-[#333]">
                {["ID", "Helyszín", "Város", "Típus", "Heti ár", "Aktív foglalások", "Havi bevétel", "Állapot"].map((h) => (
                  <th key={h} className="px-5 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_OWNER_BILLBOARDS.map((bb) => (
                <tr key={bb.id} className="border-b border-[#0d0d0d] transition-colors last:border-0 hover:bg-[#0d0d0d]">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">{bb.id}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#ccc]">{bb.name}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#777]">{bb.city}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#777]">{bb.type}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">{fmt(bb.weeklyRate)} Ft</span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-[13px] text-[#ccc]">{bb.activeBookings}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#00ff87]">{fmt(bb.monthlyRevenue)} Ft</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                      bb.status === "booked"
                        ? "border border-[#d4ff00]/25 bg-[#d4ff00]/8 text-[#d4ff00]"
                        : "border border-[#fbbf24]/25 bg-[#fbbf24]/8 text-[#fbbf24]"
                    }`}>
                      {bb.status === "booked" ? "Foglalt" : "Szabad"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout history */}
      <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-[#111] px-6 py-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">Kifizetési előzmények</h3>
        </div>
        <div className="divide-y divide-[#0d0d0d]">
          {MOCK_OWNER_PAYOUTS.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-[#0d0d0d]">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] text-[#4ade80]">
                  <CreditCard className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#ccc]">{p.period}</p>
                  <p className="text-[11px] text-[#444]">Kifizetés dátuma: {p.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-[#00ff87]">{fmt(p.amount)} Ft</span>
                <PayoutStatus status={p.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ═══════════════════════════════════════════════════════════════════════════════

export default function PartnerPortal() {
  const [role, setRole] = useState<PartnerRole>("agency");
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  const agencyNav: PartnerNavItem[] = [
    { id: "overview",  label: "Áttekintés",        icon: LayoutDashboard },
    { id: "campaigns", label: "Kampányok",          icon: BarChart3 },
    { id: "clients",   label: "Ügyfelek",           icon: Users },
    { id: "settings",  label: "Beállítások",        icon: FileText },
  ];

  const ownerNav: PartnerNavItem[] = [
    { id: "overview",   label: "Áttekintés",        icon: LayoutDashboard },
    { id: "billboards", label: "Felületek",          icon: MapPin },
    { id: "payouts",    label: "Kifizetések",        icon: CreditCard },
    { id: "settings",   label: "Beállítások",        icon: FileText },
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#020202] text-white">
      <PartnerPortalSidebar
        role={role}
        setRole={setRole}
        tab={tab}
        setTab={setTab}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        userEmail={userEmail}
      />

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <PartnerPortalSidebar
            mobile
            role={role}
            setRole={setRole}
            tab={tab}
            setTab={setTab}
            setSidebarOpen={setSidebarOpen}
            navItems={navItems}
            userEmail={userEmail}
          />
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
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
            <a href="/foglalas"
              className="flex items-center gap-1.5 rounded-lg border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#d4ff00] transition hover:bg-[#d4ff00]/12">
              <ExternalLink className="h-3 w-3" strokeWidth={2} />
              Foglalás
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {tab === "overview" && role === "agency" && <AgencyOverview />}
          {tab === "overview" && role === "owner" && <OwnerOverview />}
          {tab === "campaigns" && <AgencyOverview />}
          {tab === "clients" && <AgencyOverview />}
          {tab === "billboards" && <OwnerOverview />}
          {tab === "payouts" && <OwnerOverview />}
          {tab === "settings" && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#141414] bg-[#0a0a0a] py-20">
              <Shield className="mb-4 h-10 w-10 text-[#222]" strokeWidth={1.5} />
              <p className="text-lg font-bold text-[#333]">Beállítások</p>
              <p className="mt-2 text-sm text-[#222]">Hamarosan elérhető — API integráció, számlaadatok, értesítések.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
