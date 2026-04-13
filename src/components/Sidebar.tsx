"use client";

import {
  Calculator,
  CalendarDays,
  Eye,
  FileText,
  LayoutGrid,
  LineChart,
  Map,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { DashboardViewId } from "@/types/dashboard";

type NavItem = {
  id: DashboardViewId;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

const mainItems: NavItem[] = [
  { id: "map",       label: "Térkép",          icon: Map },
  { id: "browse",    label: "Böngészés",        icon: LayoutGrid },
  { id: "bookings",  label: "Foglalásaim",      icon: CalendarDays },
  { id: "analytics", label: "Analitika",        icon: LineChart },
  { id: "invoices",  label: "Számlák",          icon: FileText },
];

const toolItems: NavItem[] = [
  { id: "preview", label: "Kreatív Előnézet", icon: Eye },
  { id: "roi",     label: "ROI Kalkulátor",   icon: Calculator },
];

type SidebarProps = {
  slim: boolean;
  onToggleSlim: () => void;
  active: DashboardViewId;
  onNavigate: (view: DashboardViewId) => void;
  user: User | null;
  pendingCount: number;
};

export function Sidebar({ slim, onToggleSlim, active, onNavigate, user, pendingCount }: SidebarProps) {
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "VR";
  const displayName = user?.email ?? "VRS Admin";
  const displayRole = user ? "Bejelentkezve" : "Tulajdonos";
  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-[var(--b1)] bg-[#0c0f0b] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        slim ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap border-b border-[var(--b1)] px-[17px] pb-4 pt-[19px]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--b2)] bg-[var(--nk)] text-[#d4ff00]">
          <Map className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </div>
        <div className={slim ? "hidden" : ""}>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[22px] font-black tracking-[2px] text-[#d4ff00] [text-shadow:0_0_18px_rgba(212,255,0,0.2)] animate-flk">
            VRS
          </div>
          <div className="text-[9px] uppercase tracking-[2.5px] text-[var(--t2)]">Billboards</div>
        </div>
      </div>
      <button
        type="button"
        aria-label={slim ? "Menü kibontása" : "Menü összecsukása"}
        onClick={onToggleSlim}
        className="absolute right-[-12px] top-[22px] z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--b2)] bg-[var(--bg3)] text-[var(--t2)] transition-all hover:border-[var(--b3)] hover:bg-[var(--nk)] hover:text-[#d4ff00]"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-2.5 w-2.5 transition-transform duration-300 ${slim ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-2.5">
        <NavSection slim={slim} title="Főmenü" />
        {mainItems.map((item) => (
          <NavButton
            key={item.id}
            item={{ ...item, badge: item.id === "bookings" && pendingCount > 0 ? pendingCount : undefined }}
            slim={slim}
            active={active === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
        <NavSection slim={slim} title="Eszközök" />
        {toolItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            slim={slim}
            active={active === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>
      <div className="overflow-hidden border-t border-[var(--b1)] px-2 py-2.5">
        <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-[var(--bg3)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--b3)] bg-[var(--nk)] font-[family-name:var(--font-barlow-condensed)] text-[11px] font-black text-[#d4ff00] [text-shadow:0_0_8px_rgba(212,255,0,0.2)]">
            {initials}
          </div>
          <div className={slim ? "hidden" : "min-w-0"}>
            <div className="truncate text-xs font-semibold text-[var(--text)]">{displayName}</div>
            <div className="text-[10px] text-[var(--t2)]">{displayRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({ slim, title }: { slim: boolean; title: string }) {
  return (
    <div
      className={`px-2 pb-[5px] pt-3 text-[9px] font-bold uppercase tracking-[2px] text-[var(--nd)] transition-opacity duration-200 ${
        slim ? "pointer-events-none h-0 overflow-hidden p-0 opacity-0" : ""
      }`}
    >
      {title}
    </div>
  );
}

function NavButton({
  item,
  slim,
  active,
  onClick,
}: {
  item: NavItem;
  slim: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative mb-0.5 flex cursor-pointer items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-[180ms] ${
        slim ? "justify-center px-2.5" : ""
      } ${
        active
          ? "border-[var(--b2)] bg-[var(--ns)] text-[#d4ff00] before:scale-y-100"
          : "border-transparent text-[var(--t2)] before:scale-y-0 hover:bg-[var(--bg3)] hover:text-[var(--text)]"
      } before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:block before:w-0.5 before:rounded-sm before:bg-[#d4ff00] before:transition-transform before:duration-200 before:content-['']`}
    >
      <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={2} />
      <span
        className={`transition-opacity duration-200 ${slim ? "w-0 overflow-hidden opacity-0" : ""}`}
      >
        {item.label}
      </span>
      {item.badge != null && (
        <span
          className={`ml-auto shrink-0 rounded-[10px] bg-[#d4ff00] px-1.5 py-px text-[9px] font-bold text-[#000000] animate-nbp ${
            slim ? "hidden" : ""
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
