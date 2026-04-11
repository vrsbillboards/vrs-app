"use client";

import { Activity, AlertTriangle, Bell, Calendar, Shield } from "lucide-react";

type NotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
};

const items = [
  {
    unread: true,
    icon: Activity,
    tone: "g" as const,
    title: "Kampány élőben!",
    desc: "A GY001 Mártírok út kampányod elindult. Az első megjelenések már futnak.",
    time: "2 perce",
  },
  {
    unread: true,
    icon: AlertTriangle,
    tone: "y" as const,
    title: "Büdzsé figyelmeztetés",
    desc: "Az SF004 kampány büdzséje 80%-on van. Érdemes feltölteni.",
    time: "18 perce",
  },
  {
    unread: true,
    icon: Calendar,
    tone: "b" as const,
    title: "Foglalás jóváhagyva",
    desc: "A GY003 – Szent Imre út foglalásod megerősítésre került. Kezdés: máj. 1.",
    time: "1 órája",
  },
  {
    unread: true,
    icon: Shield,
    tone: "g" as const,
    title: "Kreatív jóváhagyva ✓",
    desc: "A feltöltött JPG kreatív megfelel a 6ékony Reklám specifikációinak.",
    time: "3 órája",
  },
  {
    unread: true,
    icon: Bell,
    tone: "r" as const,
    title: "Fizetési emlékeztető",
    desc: "A 2025-03 számla (240 000 Ft) határideje 5 nap múlva lejár.",
    time: "5 órája",
  },
  {
    unread: false,
    icon: Activity,
    tone: "g" as const,
    title: "Heti riport kész",
    desc: "Múlt heti kampány összefoglaló: 156 840 megjelenés összesen.",
    time: "1 napja",
  },
];

const toneClass: Record<
  "g" | "y" | "r" | "b",
  { wrap: string; icon: string }
> = {
  g: { wrap: "bg-[rgba(212,255,0,0.1)] text-[var(--neon)]", icon: "" },
  y: { wrap: "bg-[rgba(255,200,50,0.1)] text-[var(--yellow)]", icon: "" },
  r: { wrap: "bg-[rgba(255,90,58,0.1)] text-[var(--red)]", icon: "" },
  b: { wrap: "bg-[rgba(56,189,248,0.1)] text-[var(--blue)]", icon: "" },
};

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
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
        className={`fixed bottom-0 right-0 top-0 z-[5000] flex w-[360px] max-w-[100vw] flex-col border-l border-[var(--b2)] bg-[var(--bg2)] shadow-[-16px_0_48px_rgba(0,0,0,0.5)] transition-[right] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "right-0" : "right-[-360px]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--b1)] px-[18px] pb-3.5 pt-[18px]">
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[22px] font-black text-[var(--text)]">
            Értesítések
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-[10px] bg-[var(--neon)] px-2 py-0.5 text-[10px] font-bold text-[#070908]">
              5 új
            </span>
            <button
              type="button"
              onClick={onClose}
              className="border-none bg-transparent text-[22px] leading-none text-[var(--t2)] transition-colors hover:text-[var(--neon)]"
              aria-label="Bezárás"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex gap-1 border-b border-[var(--b1)] px-[18px] py-2.5">
          {["Összes", "Olvasatlan", "Kampányok"].map((t, i) => (
            <button
              key={t}
              type="button"
              className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                i === 0
                  ? "border border-[var(--b2)] bg-[var(--ns)] text-[var(--neon)]"
                  : "border border-transparent bg-transparent text-[var(--t2)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          {items.map((n, idx) => {
            const Icon = n.icon;
            const tc = toneClass[n.tone];
            return (
              <div
                key={idx}
                className={`relative mb-0.5 flex gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-[var(--bg3)] ${
                  n.unread ? "border border-[rgba(212,255,0,0.06)] bg-[rgba(212,255,0,0.03)]" : ""
                }`}
              >
                {n.unread && (
                  <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-nbp" />
                )}
                <div
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg ${tc.wrap}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-xs font-semibold text-[var(--text)]">{n.title}</div>
                  <div className="text-[11px] leading-snug text-[var(--t2)]">{n.desc}</div>
                  <div className="mt-1 text-[10px] text-[var(--t3)]">{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
