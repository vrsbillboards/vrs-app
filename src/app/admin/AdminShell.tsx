"use client";

import { useState, useTransition, useMemo, type ElementType } from "react";
import {
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { AdminBooking, AdminBillboard, AdminProfile, AdminStats } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "bookings"
  | "agencies"
  | "billboards"
  | "crm"
  | "invoices";

function ClientPortfolioTableHead() {
  return (
    <thead>
      <tr className="border-b border-[#141414] text-[10px] font-black uppercase tracking-[0.14em] text-[#444]">
        {["Név", "Cég", "Össz. költés", "Foglalások", "Függő", "Regisztrált"].map((h) => (
          <th key={h} className="px-5 py-3.5 font-bold">{h}</th>
        ))}
      </tr>
    </thead>
  );
}

type AdminNavItem = { id: Tab; label: string; icon: ElementType; badge?: number };

function AdminShellSidebar({
  mobile = false,
  tab,
  setTab,
  setSidebarOpen,
  navItems,
  adminEmail,
}: {
  mobile?: boolean;
  tab: Tab;
  setTab: (t: Tab) => void;
  setSidebarOpen: (v: boolean) => void;
  navItems: AdminNavItem[];
  adminEmail: string;
}) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-[#131313] bg-[#060606] ${
        mobile
          ? "fixed inset-y-0 left-0 z-50 w-64 transition-transform"
          : "hidden w-56 shrink-0 lg:flex xl:w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#131313] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d4ff00]/30 bg-[#d4ff00]/8">
          <Shield className="h-3.5 w-3.5 text-[#d4ff00]" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black tracking-widest text-white">
            VRS <span className="text-[#d4ff00]">CMD</span>
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#333]">Command Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#2a2a2a]">
          Navigáció
        </p>
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); setSidebarOpen(false); }}
            className={`group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
              tab === id
                ? "bg-[#d4ff00]/10 text-[#d4ff00]"
                : "text-[#555] hover:bg-[#111] hover:text-[#ccc]"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition ${tab === id ? "text-[#d4ff00]" : "text-[#3a3a3a] group-hover:text-[#888]"}`}
              strokeWidth={tab === id ? 2.5 : 2}
            />
            <span className="flex-1">{label}</span>
            {badge ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#fbbf24] px-1.5 text-[10px] font-black text-black">
                {badge}
              </span>
            ) : null}
            {tab === id && <ChevronRight className="h-3 w-3 text-[#d4ff00]/50" strokeWidth={2} />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#131313] p-4">
        <div className="mb-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#333]">Admin</p>
          <p className="mt-0.5 truncate text-[11px] text-[#555]">{adminEmail}</p>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
          className="flex w-full items-center gap-2 rounded-xl border border-[#1a1a1a] px-3 py-2 text-[12px] font-semibold text-[#555] transition hover:border-[#5a1a1a] hover:text-[#ff6b6b]"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}

type Props = {
  bookings: AdminBooking[];
  billboards: AdminBillboard[];
  profiles: AdminProfile[];
  stats: AdminStats;
  adminEmail: string;
  billboardBookingCount: Record<string, number>;
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("hu-HU");
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#d4ff00]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} /> Jóváhagyva
      </span>
    );
  if (status === "cancelled")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#ff6b6b]">
        <XCircle className="h-3 w-3" strokeWidth={2.5} /> Elutasítva
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
      <Clock className="h-3 w-3" strokeWidth={2.5} /> Függőben
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  if (status === "Kifizetve")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4ade80]/35 bg-[#4ade80]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#4ade80]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} /> Kifizetve
      </span>
    );
  if (status === "Lejárt")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#ff6b6b]">
        <AlertCircle className="h-3 w-3" strokeWidth={2.5} /> Lejárt
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
      <Clock className="h-3 w-3" strokeWidth={2.5} /> Fizetésre vár
    </span>
  );
}

function ClientTypeBadge({ type }: { type: string }) {
  if (type === "agency")
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-[#818cf8]/35 bg-[#818cf8]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#818cf8]">
        <Building2 className="h-2.5 w-2.5" strokeWidth={2.5} /> Ügynökség
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#38bdf8]/30 bg-[#38bdf8]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#38bdf8]">
      <Users className="h-2.5 w-2.5" strokeWidth={2.5} /> Közvetlen
    </span>
  );
}

function CreativeCell({ url }: { url?: string | null }) {
  if (!url)
    return (
      <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] text-[#3a3a3a]">
        <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
      </div>
    );
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-9 w-14 items-center justify-center overflow-hidden rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] transition hover:border-[#d4ff00]/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Kreatív" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/50">
        <ExternalLink className="h-3 w-3 text-white opacity-0 transition group-hover:opacity-100" strokeWidth={2} />
      </div>
    </a>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl"
        style={{ background: accent }}
      />
      <div className="mb-4 flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#555]">{label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={2.5} />
        </div>
      </div>
      <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-[#444]">{sub}</p>}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  stats,
  bookings,
}: {
  stats: AdminStats;
  bookings: AdminBooking[];
}) {
  const recent = bookings.slice(0, 6);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Össz. bevétel" value={`${fmt(stats.totalRevenue)} Ft`} sub="összes foglalásból" icon={TrendingUp} accent="#d4ff00" />
        <KpiCard label="Függő jóváhagyás" value={String(stats.pendingCount)} sub="azonnali figyelmet igényel" icon={Clock} accent="#fbbf24" />
        <KpiCard label="Aktív kampányok" value={String(stats.confirmedCount)} sub="jóváhagyott foglalás" icon={Zap} accent="#4ade80" />
        <KpiCard label="Ügyfelek" value={String(stats.totalClients)} sub="regisztrált felhasználó" icon={Users} accent="#818cf8" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue breakdown */}
        <div className="col-span-1 rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5 lg:col-span-2">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#555]">
            Legutóbbi foglalások
          </h3>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#444]">Még nincs foglalás.</p>
          ) : (
            <div className="divide-y divide-[#141414]">
              {recent.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CreativeCell url={b.creative_url} />
                    <div>
                      <p className="text-[12px] font-semibold text-[#ccc]">
                        {b.user_email}
                      </p>
                      <p className="text-[10px] text-[#444]">
                        {b.billboard_id} · {fmtDate(b.start_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">
                      {fmt(b.total_price)} Ft
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#555]">Konverziós arány</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black text-white">
              {stats.totalBookings > 0
                ? Math.round((stats.confirmedCount / stats.totalBookings) * 100)
                : 0}%
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
              <div
                className="h-full rounded-full bg-[#d4ff00]"
                style={{
                  width: `${stats.totalBookings > 0 ? Math.round((stats.confirmedCount / stats.totalBookings) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#555]">Összes foglalás</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black text-white">
              {stats.totalBookings}
            </p>
            <div className="mt-2 flex gap-2 text-[10px]">
              <span className="text-[#fbbf24]">{stats.pendingCount} függő</span>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#d4ff00]">{stats.confirmedCount} aktív</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bookings Tab (Közvetlen Ügyfelek) ────────────────────────────────────────

function BookingsTab({ bookings: initial }: { bookings: AdminBooking[] }) {
  const [bookings, setBookings] = useState<AdminBooking[]>(initial);
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject" | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [, startTransition] = useTransition();

  async function handleAction(bookingId: string, action: "approve" | "reject") {
    setActionLoading((prev) => ({ ...prev, [bookingId]: action }));
    setError(null);
    try {
      const { data: sd } = await supabase.auth.getSession();
      const token = sd.session?.access_token;
      if (!token) throw new Error("Lejárt a session.");

      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = (await res.json()) as { success?: boolean; status?: string; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Ismeretlen hiba.");

      startTransition(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: data.status! } : b))
        );
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
  }

  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[#5a1a1a] bg-[#120808] px-4 py-3 text-sm text-[#ff6b6b]">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
              filter === f
                ? "border-[#d4ff00]/40 bg-[#d4ff00]/12 text-[#d4ff00]"
                : "border-[#1c1c1c] text-[#555] hover:border-[#333] hover:text-[#888]"
            }`}
          >
            {{ all: "Összes", pending: "Függőben", confirmed: "Jóváhagyva", cancelled: "Elutasítva" }[f]}
            <span className="ml-1.5 text-[10px] opacity-70">
              {f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#1c1c1c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#555] transition hover:border-[#333] hover:text-[#d4ff00]"
        >
          <RefreshCw className="h-3 w-3" strokeWidth={2} /> Frissítés
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d]">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#444]">Nincs megjelenítendő foglalás.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#141414] text-[10px] font-black uppercase tracking-[0.14em] text-[#444]">
                  {["ID", "Ügyfél", "Típus", "Felület", "Időszak", "Összeg", "Kreatív", "Állapot", "Műveletek"].map(
                    (h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => {
                  const isLoading = actionLoading[b.id];
                  return (
                    <tr key={b.id} className="border-b border-[#0f0f0f] transition-colors last:border-0 hover:bg-[#111]/60">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[10px] text-[#444]">{b.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="max-w-[150px] truncate text-[12px] text-[#ccc]">{b.user_email}</p>
                          {b.client_company && (
                            <p className="text-[10px] text-[#555]">{b.client_company}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <ClientTypeBadge type={b.client_type ?? "direct"} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/6 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">
                          {b.billboard_id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] tabular-nums text-[#ccc]">
                          {fmtDate(b.start_date)} – {fmtDate(b.end_date)}
                        </p>
                        <p className="text-[10px] text-[#444]">{fmtDate(b.created_at)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black tabular-nums text-[#d4ff00]">
                          {fmt(b.total_price)} Ft
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <CreativeCell url={b.creative_url} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={!!isLoading || b.status === "confirmed"}
                            onClick={() => handleAction(b.id, "approve")}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#d4ff00]/35 bg-[#d4ff00]/8 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#d4ff00] transition hover:bg-[#d4ff00]/18 disabled:cursor-not-allowed disabled:opacity-25"
                          >
                            {isLoading === "approve" ? (
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#d4ff00]/30 border-t-[#d4ff00]" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
                            )}
                            OK
                          </button>
                          <button
                            type="button"
                            disabled={!!isLoading || b.status === "cancelled"}
                            onClick={() => handleAction(b.id, "reject")}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#ff6b6b]/30 bg-[#ff6b6b]/6 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#ff6b6b] transition hover:bg-[#ff6b6b]/14 disabled:cursor-not-allowed disabled:opacity-25"
                          >
                            {isLoading === "reject" ? (
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#ff6b6b]/30 border-t-[#ff6b6b]" />
                            ) : (
                              <XCircle className="h-3 w-3" strokeWidth={2.5} />
                            )}
                            NEM
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Agencies Tab ─────────────────────────────────────────────────────────────

function AgenciesTab({ profiles, bookings }: { profiles: AdminProfile[]; bookings: AdminBooking[] }) {
  const agencies = profiles.filter((p) => p.client_type === "agency");
  const direct = profiles.filter((p) => p.client_type !== "agency");

  function ClientRow({ p }: { p: AdminProfile }) {
    const pBookings = bookings.filter((b) => b.user_id === p.id);
    const pending = pBookings.filter((b) => b.status === "pending").length;
    return (
      <tr className="border-b border-[#0f0f0f] transition-colors last:border-0 hover:bg-[#111]/50">
        <td className="px-5 py-4">
          <div>
            <p className="text-[13px] font-semibold text-[#ccc]">{p.full_name ?? "—"}</p>
            <p className="text-[11px] text-[#555]">{p.email}</p>
          </div>
        </td>
        <td className="px-5 py-4">
          <p className="text-[12px] text-[#888]">{p.company ?? "—"}</p>
        </td>
        <td className="px-5 py-4">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-[#d4ff00]">
            {fmt(p.total_spent)} Ft
          </span>
        </td>
        <td className="px-5 py-4">
          <span className="text-[13px] text-[#ccc]">{p.booking_count}</span>
        </td>
        <td className="px-5 py-4">
          {pending > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#fbbf24]/35 bg-[#fbbf24]/8 px-2 py-0.5 text-[10px] font-bold text-[#fbbf24]">
              <Clock className="h-2.5 w-2.5" /> {pending} függő
            </span>
          ) : (
            <span className="text-[11px] text-[#3a3a3a]">—</span>
          )}
        </td>
        <td className="px-5 py-4">
          <span className="text-[11px] text-[#555]">{fmtDate(p.created_at)}</span>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agencies */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#818cf8]" strokeWidth={2} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#555]">
            Ügynökségek ({agencies.length})
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d]">
          {agencies.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#444]">
              Még nincs besorolható ügynökség. Ha egy ügyfél cégnevét ügynökséggel regisztrálta, itt fog megjelenni.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <ClientPortfolioTableHead />
                <tbody>{agencies.map((p) => <ClientRow key={p.id} p={p} />)}</tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Direct clients */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#38bdf8]" strokeWidth={2} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#555]">
            Közvetlen ügyfelek ({direct.length})
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d]">
          {direct.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#444]">Nincsenek közvetlen ügyfelek.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <ClientPortfolioTableHead />
                <tbody>{direct.map((p) => <ClientRow key={p.id} p={p} />)}</tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Billboards Tab (Plakáttulajok) ───────────────────────────────────────────

function BillboardsTab({
  billboards,
  bookingCount,
}: {
  billboards: AdminBillboard[];
  bookingCount: Record<string, number>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Összes felület" value={String(billboards.length)} icon={MapPin} accent="#d4ff00" />
        <KpiCard
          label="Foglalt"
          value={String(billboards.filter((b) => b.status === "booked").length)}
          icon={CheckCircle2}
          accent="#4ade80"
        />
        <KpiCard
          label="Szabad"
          value={String(billboards.filter((b) => b.status === "free").length)}
          icon={Zap}
          accent="#fbbf24"
        />
        <KpiCard
          label="Átl. heti ár"
          value={`${fmt(Math.round(billboards.reduce((s, b) => s + b.price, 0) / (billboards.length || 1)))} Ft`}
          icon={CreditCard}
          accent="#818cf8"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#141414] text-[10px] font-black uppercase tracking-[0.14em] text-[#444]">
                {["ID", "Helyszín", "Város", "Típus", "OTS/nap", "Heti ár", "Jóváhagyott kampányok", "Állapot"].map(
                  (h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {billboards.map((bb) => {
                const campaigns = bookingCount[bb.id] ?? 0;
                const occupancy = Math.min(100, campaigns * 25);
                return (
                  <tr key={bb.id} className="border-b border-[#0f0f0f] transition-colors last:border-0 hover:bg-[#111]/50">
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/6 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">
                        {bb.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[200px] text-[13px] font-medium text-[#ccc]">{bb.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] text-[#888]">{bb.city}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] text-[#888]">{bb.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] tabular-nums text-[#ccc]">{bb.ots ?? "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">
                        {fmt(bb.price)} Ft
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] tabular-nums text-[#ccc]">{campaigns} kampány</span>
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-[#1a1a1a]">
                          <div
                            className="h-full rounded-full bg-[#d4ff00]"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                          bb.status === "booked"
                            ? "border-[#ff6b6b]/35 bg-[#ff6b6b]/10 text-[#ff6b6b]"
                            : "border-[#4ade80]/30 bg-[#4ade80]/8 text-[#4ade80]"
                        }`}
                      >
                        {bb.status === "booked" ? "Foglalt" : "Szabad"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── CRM Tab ──────────────────────────────────────────────────────────────────

function CrmTab({ bookings }: { bookings: AdminBooking[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        !q ||
        b.user_email.toLowerCase().includes(q) ||
        b.billboard_id.toLowerCase().includes(q) ||
        (b.client_company ?? "").toLowerCase().includes(q)
    );
  }, [bookings, search]);

  function saveNote(id: string) {
    setSaved((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés: e-mail, felület, cég..."
          className="w-full rounded-xl border border-[#1c1c1c] bg-[#0d0d0d] px-4 py-2.5 text-sm text-[#ccc] outline-none transition placeholder:text-[#3a3a3a] focus:border-[#d4ff00]/30 focus:ring-1 focus:ring-[#d4ff00]/10 sm:max-w-sm"
        />
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#444]">Nincs találat.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CreativeCell url={b.creative_url} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-[#ccc]">{b.user_email}</p>
                      <ClientTypeBadge type={b.client_type ?? "direct"} />
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#555]">
                      {b.billboard_id} · {fmtDate(b.start_date)} – {fmtDate(b.end_date)} ·{" "}
                      <span className="text-[#d4ff00]">{fmt(b.total_price)} Ft</span>
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#333]">{b.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div className="mt-3 flex items-end gap-2">
                <textarea
                  value={notes[b.id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  placeholder="Belső megjegyzés hozzáadása..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-[#1c1c1c] bg-[#060606] px-3 py-2 text-[12px] text-[#aaa] outline-none transition placeholder:text-[#2a2a2a] focus:border-[#d4ff00]/25"
                />
                <button
                  type="button"
                  onClick={() => saveNote(b.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                    saved[b.id]
                      ? "border-[#4ade80]/35 bg-[#4ade80]/10 text-[#4ade80]"
                      : "border-[#d4ff00]/30 bg-[#d4ff00]/8 text-[#d4ff00] hover:bg-[#d4ff00]/15"
                  }`}
                >
                  {saved[b.id] ? <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} /> : <MessageSquare className="h-3 w-3" strokeWidth={2} />}
                  {saved[b.id] ? "Mentve" : "Mentés"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Invoices Tab (Számlák) ────────────────────────────────────────────────────

type Invoice = {
  id: string;
  booking_id: string;
  user_email: string;
  billboard_id: string;
  amount: number;
  created_at: string;
  due_date: string;
  invoice_status: "Kifizetve" | "Fizetésre vár" | "Lejárt";
};

function InvoicesTab({ bookings }: { bookings: AdminBooking[] }) {
  const [filter, setFilter] = useState<"all" | "Kifizetve" | "Fizetésre vár" | "Lejárt">("all");

  const invoices: Invoice[] = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => b.status !== "cancelled")
      .map((b, i) => {
        const created = new Date(b.created_at);
        const due = new Date(created);
        due.setDate(due.getDate() + 30);

        let invoice_status: Invoice["invoice_status"];
        if (b.status === "confirmed") {
          invoice_status = "Kifizetve";
        } else if (due < now) {
          invoice_status = "Lejárt";
        } else {
          invoice_status = "Fizetésre vár";
        }

        return {
          id: `INV-${String(i + 1).padStart(4, "0")}`,
          booking_id: b.id,
          user_email: b.user_email,
          billboard_id: b.billboard_id,
          amount: b.total_price,
          created_at: b.created_at,
          due_date: due.toISOString(),
          invoice_status,
        };
      });
  }, [bookings]);

  const visible = filter === "all" ? invoices : invoices.filter((i) => i.invoice_status === filter);

  const totalPaid = invoices.filter((i) => i.invoice_status === "Kifizetve").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.invoice_status === "Fizetésre vár").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.invoice_status === "Lejárt").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Kifizetve" value={`${fmt(totalPaid)} Ft`} icon={CheckCircle2} accent="#4ade80" />
        <KpiCard label="Fizetésre vár" value={`${fmt(totalPending)} Ft`} icon={Clock} accent="#fbbf24" />
        <KpiCard label="Lejárt" value={`${fmt(totalOverdue)} Ft`} icon={AlertCircle} accent="#ff6b6b" />
        <KpiCard label="Összes számla" value={String(invoices.length)} icon={FileText} accent="#d4ff00" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "Kifizetve", "Fizetésre vár", "Lejárt"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
              filter === f
                ? "border-[#d4ff00]/40 bg-[#d4ff00]/12 text-[#d4ff00]"
                : "border-[#1c1c1c] text-[#555] hover:border-[#333] hover:text-[#888]"
            }`}
          >
            {f === "all" ? "Összes" : f}
            <span className="ml-1.5 text-[10px] opacity-70">
              {f === "all" ? invoices.length : invoices.filter((i) => i.invoice_status === f).length}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => alert("Számla generálása hamarosan elérhető.")}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#d4ff00]/30 bg-[#d4ff00]/8 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#d4ff00] transition hover:bg-[#d4ff00]/18"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Számla Generálása
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d]">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#444]">Nincs megjelenítendő számla.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#141414] text-[10px] font-black uppercase tracking-[0.14em] text-[#444]">
                  {["Számlaszám", "Ügyfél", "Felület", "Összeg", "Kiállítva", "Határidő", "Állapot", ""].map(
                    (h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#0f0f0f] transition-colors last:border-0 hover:bg-[#111]/50">
                    <td className="px-5 py-4">
                      <span className="font-mono text-[12px] font-bold text-[#ccc]">{inv.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="max-w-[150px] truncate text-[12px] text-[#888]">{inv.user_email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded border border-[#d4ff00]/20 bg-[#d4ff00]/6 px-2 py-0.5 font-mono text-[11px] font-bold text-[#d4ff00]">
                        {inv.billboard_id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-[#d4ff00]">
                        {fmt(inv.amount)} Ft
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] tabular-nums text-[#888]">{fmtDate(inv.created_at)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[12px] tabular-nums ${inv.invoice_status === "Lejárt" ? "text-[#ff6b6b]" : "text-[#888]"}`}>
                        {fmtDate(inv.due_date)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <InvoiceStatusBadge status={inv.invoice_status} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => alert(`PDF export: ${inv.id} – hamarosan elérhető.`)}
                        className="flex items-center gap-1 rounded-lg border border-[#1c1c1c] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#555] transition hover:border-[#333] hover:text-[#ccc]"
                      >
                        <FileText className="h-3 w-3" strokeWidth={2} />
                        PDF
                      </button>
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

// ─── Main Shell ───────────────────────────────────────────────────────────────

export function AdminShell({
  bookings,
  billboards,
  profiles,
  stats,
  adminEmail,
  billboardBookingCount,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: AdminNavItem[] = [
    { id: "overview", label: "Áttekintés", icon: LayoutDashboard },
    { id: "bookings", label: "Foglalások", icon: BarChart3, badge: stats.pendingCount || undefined },
    { id: "agencies", label: "Ügyfelek", icon: Users },
    { id: "billboards", label: "Plakáttulajok", icon: MapPin },
    { id: "crm", label: "CRM / Megjegyzések", icon: MessageSquare },
    { id: "invoices", label: "Számlák", icon: FileText },
  ];

  const pageTitles: Record<Tab, string> = {
    overview: "Áttekintés",
    bookings: "Foglalások moderálása",
    agencies: "Ügyfelek & Ügynökségek",
    billboards: "Plakáttulajok",
    crm: "CRM / Megjegyzések",
    invoices: "Számlák & Pénzügy",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020202] text-white">
      <AdminShellSidebar
        tab={tab}
        setTab={setTab}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        adminEmail={adminEmail}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <AdminShellSidebar
            mobile
            tab={tab}
            setTab={setTab}
            setSidebarOpen={setSidebarOpen}
            navItems={navItems}
            adminEmail={adminEmail}
          />
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#131313] bg-[#060606] px-5">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1c1c1c] text-[#555] transition hover:border-[#333] hover:text-[#ccc] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <div className="space-y-1">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-3 bg-current" />
                <span className="block h-px w-4 bg-current" />
              </div>
            </button>
            <div>
              <h1 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-wide text-white">
                {pageTitles[tab]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-[#333] sm:block">{adminEmail}</span>
            <div className="h-4 w-px bg-[#1c1c1c]" />
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/6 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#d4ff00]">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d4ff00]" />
              Live
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {tab === "overview" && <OverviewTab stats={stats} bookings={bookings} />}
          {tab === "bookings" && <BookingsTab bookings={bookings} />}
          {tab === "agencies" && <AgenciesTab profiles={profiles} bookings={bookings} />}
          {tab === "billboards" && <BillboardsTab billboards={billboards} bookingCount={billboardBookingCount} />}
          {tab === "crm" && <CrmTab bookings={bookings} />}
          {tab === "invoices" && <InvoicesTab bookings={bookings} />}
        </main>
      </div>
    </div>
  );
}
