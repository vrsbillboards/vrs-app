"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CalendarPlus, Download, FileText, LogIn, Receipt } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase, type DbBooking, type DbBillboard } from "@/lib/supabaseClient";
import { toast } from "sonner";

// ─── Típusok ─────────────────────────────────────────────────────────────────

type InvoiceStatus = "Kifizetett" | "Nyitott" | "Lejárt" | "Lemondva";

type InvoiceRow = {
  id: string;
  number: string;
  campaign: string;
  issued: Date;
  due: Date;
  amountFt: number;
  status: InvoiceStatus;
};

export type InvoicesViewProps = {
  user: User | null;
  onOpenAuth?: () => void;
  onRequestBooking?: () => void;
};

// ─── Segédfüggvények ─────────────────────────────────────────────────────────

function deriveStatus(b: DbBooking): InvoiceStatus {
  if (b.status === "confirmed" || b.status === "approved") return "Kifizetett";
  if (b.status === "cancelled" || b.status === "rejected") return "Lemondva";
  const due = new Date(b.end_date);
  due.setDate(due.getDate() + 15);
  return due < new Date() ? "Lejárt" : "Nyitott";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Sub-komponensek ──────────────────────────────────────────────────────────

function StatusPill({ status }: { status: InvoiceStatus }) {
  if (status === "Kifizetett")
    return (
      <span className="inline-flex rounded-full border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#d4ff00]">
        Kifizetett
      </span>
    );
  if (status === "Nyitott")
    return (
      <span className="inline-flex rounded-full border border-[#fbbf24]/45 bg-[#fbbf24]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#fbbf24]">
        Nyitott
      </span>
    );
  if (status === "Lemondva")
    return (
      <span className="inline-flex rounded-full border border-[#ff6b6b]/30 bg-[#ff6b6b]/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ff6b6b]">
        Lemondva
      </span>
    );
  return (
    <span className="inline-flex rounded-full border border-[#ef4444]/40 bg-[#ef4444]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ef4444]">
      Lejárt
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#1a1a1a]/80">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-[#1a1a1a]" />
        </td>
      ))}
    </tr>
  );
}

function LoginPrompt({ onOpenAuth }: { onOpenAuth?: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0c0f0b] text-[#888888]">
        <LogIn className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
          Bejelentkezés szükséges
        </p>
        <p className="mt-1 text-sm text-[#888888]">
          A számláid megtekintéséhez jelentkezz be.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenAuth}
        className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-wider text-black transition hover:brightness-110"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.5} />
        Bejelentkezés
      </button>
    </div>
  );
}

function EmptyState({ onRequestBooking }: { onRequestBooking?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0c0f0b] text-[#555555]">
        <Receipt className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
          Még nincsenek számlák
        </p>
        <p className="mt-1 max-w-xs text-sm text-[#888888]">
          Az első kampányod lefoglalása után a kifizetések és számlák itt jelennek meg.
        </p>
      </div>
      {onRequestBooking && (
        <button
          type="button"
          onClick={onRequestBooking}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-wider text-black transition hover:brightness-110"
        >
          <CalendarPlus className="h-4 w-4" strokeWidth={2.5} />
          Új foglalás
        </button>
      )}
    </div>
  );
}

// ─── Fő komponens ─────────────────────────────────────────────────────────────

export function InvoicesView({ user, onOpenAuth, onRequestBooking }: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setIsLoading(true);
      setFetchError(null);

      const [bookingsRes, billboardsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("billboards").select("id, name, city"),
      ]);
      if (cancelled) return;
      if (bookingsRes.error || billboardsRes.error) {
        setFetchError("Nem sikerült betölteni a számlákat. Kérjük, próbáld újra.");
        setIsLoading(false);
        return;
      }
      const bookings = (bookingsRes.data ?? []) as DbBooking[];
      const bbs = (billboardsRes.data ?? []) as Pick<DbBillboard, "id" | "name" | "city">[];
      const bbMap = new Map(bbs.map((b) => [b.id, b]));

      const rows: InvoiceRow[] = bookings.map((b, i) => {
        const bb = bbMap.get(b.billboard_id);
        const issued = new Date(b.created_at);
        const due = new Date(b.end_date);
        due.setDate(due.getDate() + 15);
        const year = issued.getFullYear();
        return {
          id: b.id,
          number: `${year}-${String(1001 + i).padStart(4, "0")}`,
          campaign: bb ? `${bb.id} · ${bb.name}` : b.billboard_id,
          issued,
          due,
          amountFt: b.total_price,
          status: deriveStatus(b),
        };
      });

      setInvoices(rows);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, retryKey]);

  if (!user) return <LoginPrompt onOpenAuth={onOpenAuth} />;

  if (fetchError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-[#000000] px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#5a1a1a] bg-[#1a0a0a] text-[#ff6b6b]">
          <AlertCircle className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
            Betöltési hiba
          </p>
          <p className="mt-1 max-w-xs text-sm text-[#888888]">{fetchError}</p>
        </div>
        <button
          type="button"
          onClick={() => setRetryKey((k) => k + 1)}
          className="rounded-lg border border-white/[0.12] px-4 py-2 text-sm font-bold text-[#888888] transition hover:border-[#d4ff00]/35 hover:text-[#d4ff00]"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

  const paid = invoices.filter((i) => i.status === "Kifizetett");
  const open = invoices.filter((i) => i.status === "Nyitott");
  const overdue = invoices.filter((i) => i.status === "Lejárt");

  const kpiCards = [
    {
      label: "Kifizetett",
      amount: paid.reduce((s, i) => s + i.amountFt, 0),
      count: paid.length,
      color: "#d4ff00",
      bg: "rgba(212,255,0,0.06)",
      border: "rgba(212,255,0,0.18)",
    },
    {
      label: "Nyitott",
      amount: open.reduce((s, i) => s + i.amountFt, 0),
      count: open.length,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.06)",
      border: "rgba(251,191,36,0.2)",
    },
    {
      label: "Lejárt",
      amount: overdue.reduce((s, i) => s + i.amountFt, 0),
      count: overdue.length,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.2)",
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#000000]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">

        {/* Fejléc */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white">
              <FileText className="h-5 w-5 text-[#d4ff00]" strokeWidth={2} />
              Számlák
            </h1>
            <p className="mt-1 text-[11px] text-[#888888]">
              Foglalásaidhoz tartozó kifizetések
            </p>
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-[#111610]" />
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0e130d]">
              <table className="w-full min-w-[860px]">
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          </>
        ) : invoices.length === 0 ? (
          <EmptyState onRequestBooking={onRequestBooking} />
        ) : (
          <>
            {/* KPI sor */}
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
              {kpiCards.map((k) => (
                <article
                  key={k.label}
                  className="relative overflow-hidden rounded-xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  style={{ borderColor: k.border, background: k.bg }}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg,transparent,${k.color}60,transparent)` }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">{k.label}</p>
                  <p
                    className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-[clamp(1.5rem,4vw,2rem)] font-black leading-none tabular-nums"
                    style={{ color: k.color }}
                  >
                    {k.amount.toLocaleString("hu-HU")} Ft
                  </p>
                  <p className="mt-2 text-[11px] text-[#888888]">{k.count} számla</p>
                </article>
              ))}
            </div>

            {/* Tábla */}
            <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0e130d] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-[10px] font-black uppercase tracking-[0.14em] text-[#888888]">
                      <th className="px-5 py-4 font-bold">Számlaszám</th>
                      <th className="px-5 py-4 font-bold">Kampány</th>
                      <th className="px-5 py-4 font-bold">Kiállítás</th>
                      <th className="px-5 py-4 font-bold">Határidő</th>
                      <th className="px-5 py-4 font-bold">Összeg</th>
                      <th className="px-5 py-4 font-bold">Állapot</th>
                      <th className="px-5 py-4 font-bold text-right">Letöltés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-[#1a1a1a]/80 text-sm transition-colors last:border-0 hover:bg-[#111610]/60"
                      >
                        <td className="px-5 py-4 font-mono font-black text-[#d4ff00]">{inv.number}</td>
                        <td className="px-5 py-4 font-medium text-white">{inv.campaign}</td>
                        <td className="px-5 py-4 tabular-nums text-[#888888]">{fmtDate(inv.issued)}</td>
                        <td className="px-5 py-4 tabular-nums text-[#888888]">{fmtDate(inv.due)}</td>
                        <td className="px-5 py-4">
                          <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black tabular-nums text-[#d4ff00]">
                            {inv.amountFt.toLocaleString("hu-HU")} Ft
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={inv.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              toast.info("A számlák PDF letöltése hamarosan elérhető lesz.")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#555] transition hover:border-[#d4ff00]/20 hover:text-[#888]"
                            aria-label={`Számla ${inv.number} letöltése`}
                          >
                            <Download className="h-3.5 w-3.5" strokeWidth={2} />
                            Hamarosan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
