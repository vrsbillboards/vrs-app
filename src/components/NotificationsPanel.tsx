"use client";

import { useEffect, useState } from "react";
import { Activity, Bell, Calendar, CheckCircle, Info, LogIn, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase, type DbBooking } from "@/lib/supabaseClient";

type NotifItem = {
  id: string;
  icon: typeof Activity;
  tone: "g" | "y" | "r" | "b";
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  category: "campaign" | "system";
};

type NotifTab = "all" | "unread" | "campaign";

type NotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

const toneClass: Record<"g" | "y" | "r" | "b", string> = {
  g: "bg-[rgba(212,255,0,0.1)] text-[#d4ff00]",
  y: "bg-[rgba(255,200,50,0.1)] text-[#fbbf24]",
  r: "bg-[rgba(255,90,58,0.1)] text-[#ff6b6b]",
  b: "bg-[rgba(56,189,248,0.1)] text-[#38bdf8]",
};

function relativeTime(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "most";
  if (secs < 3600) return `${Math.floor(secs / 60)} perce`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} órája`;
  return `${Math.floor(secs / 86400)} napja`;
}

function bookingsToNotifs(bookings: DbBooking[]): NotifItem[] {
  return bookings.slice(0, 6).map((b) => {
    const isPending = b.status === "pending";
    const isConfirmed = b.status === "confirmed";
    const created = new Date(b.created_at);
    return {
      id: b.id,
      icon: isConfirmed ? CheckCircle : isPending ? Calendar : Info,
      tone: isConfirmed ? "g" : isPending ? "y" : "b",
      title: isConfirmed
        ? "Foglalás megerősítve ✓"
        : isPending
          ? "Foglalás feldolgozás alatt"
          : "Kampány befejezve",
      desc: `Felület: ${b.billboard_id} · ${b.total_price.toLocaleString("hu-HU")} Ft · ${new Date(b.start_date).toLocaleDateString("hu-HU", { month: "short", day: "numeric" })} – ${new Date(b.end_date).toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}`,
      time: relativeTime(created),
      unread: isPending,
      category: "campaign",
    };
  });
}

const systemNotifs: NotifItem[] = [
  {
    id: "sys-1",
    icon: Bell,
    tone: "b",
    title: "Üdvözlünk a VRS Billboards-on!",
    desc: "Foglalj prémium DOOH felületeket másodpercek alatt, valós idejű adatokkal.",
    time: "",
    unread: false,
    category: "system",
  },
  {
    id: "sys-2",
    icon: Activity,
    tone: "g",
    title: "Kreatív előnézet elérhető",
    desc: "Töltsd fel a kreatívodat és nézd meg élőben, hogyan néz ki a felületen.",
    time: "",
    unread: false,
    category: "system",
  },
];

export function NotificationsPanel({ open, onClose, user }: NotificationsPanelProps) {
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<NotifTab>("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setIsLoading(true);
    supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        const rows = bookingsToNotifs((data ?? []) as DbBooking[]);
        setNotifs([...rows, ...systemNotifs]);
        setIsLoading(false);
      });
  }, [open, user]);

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]));
  }

  function markAllRead() {
    setReadIds(new Set(notifs.map((n) => n.id)));
  }

  const displayed = notifs.map((n) => ({ ...n, unread: n.unread && !readIds.has(n.id) }));
  const filtered =
    tab === "all"
      ? displayed
      : tab === "unread"
        ? displayed.filter((n) => n.unread)
        : displayed.filter((n) => n.category === "campaign");
  const unreadCount = displayed.filter((n) => n.unread).length;

  return (
    <>
      <div
        className={`fixed inset-0 z-[4999] bg-[rgba(7,9,8,0.4)] backdrop-blur-[2px] transition-opacity ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed bottom-0 right-0 top-0 z-[5000] flex w-[360px] max-w-[100vw] flex-col border-l border-[var(--b2)] bg-[var(--bg2)] shadow-[-16px_0_48px_rgba(0,0,0,0.5)] transition-[transform] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-[360px]"
        }`}
      >
        {/* Fejléc */}
        <div className="flex items-center justify-between border-b border-[var(--b1)] px-[18px] pb-3.5 pt-[18px]">
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[22px] font-black text-[var(--text)]">
            Értesítések
          </div>
          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-[10px] bg-[var(--neon)] px-2 py-0.5 text-[10px] font-bold text-[#070908] transition hover:brightness-95"
              >
                {unreadCount} új
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--b1)] bg-transparent text-[var(--t2)] transition hover:border-[var(--b2)] hover:text-[var(--neon)]"
              aria-label="Bezárás"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Tabsáv */}
        <div className="flex gap-1 border-b border-[var(--b1)] px-[18px] py-2.5">
          {(["all", "unread", "campaign"] as const).map((t) => {
            const label = t === "all" ? "Összes" : t === "unread" ? "Olvasatlan" : "Kampányok";
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                  tab === t
                    ? "border border-[var(--b2)] bg-[var(--ns)] text-[var(--neon)]"
                    : "border border-transparent text-[var(--t2)] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tartalom */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          {!user ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--b1)] bg-[var(--bg3)] text-[var(--t2)]">
                <LogIn className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-[var(--t2)]">
                Jelentkezz be az értesítések megtekintéséhez.
              </p>
            </div>
          ) : isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mb-0.5 flex gap-2.5 rounded-lg p-2.5">
                <div className="h-[34px] w-[34px] shrink-0 animate-pulse rounded-lg bg-[var(--bg3)]" />
                <div className="flex-1 space-y-1.5 py-1">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--bg3)]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[var(--bg3)]" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[var(--t2)]">
              Nincs megjeleníthető értesítés.
            </div>
          ) : (
            filtered.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`relative mb-0.5 flex cursor-pointer gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-[var(--bg3)] ${
                    n.unread ? "border border-[rgba(212,255,0,0.06)] bg-[rgba(212,255,0,0.03)]" : ""
                  }`}
                >
                  {n.unread && (
                    <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-nbp" />
                  )}
                  <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg ${toneClass[n.tone]}`}>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-xs font-semibold text-[var(--text)]">{n.title}</div>
                    <div className="text-[11px] leading-snug text-[var(--t2)]">{n.desc}</div>
                    {n.time && <div className="mt-1 text-[10px] text-[var(--t3)]">{n.time}</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
