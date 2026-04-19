import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type Booking = {
  id: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  creative_url?: string | null;
  created_at: string;
  billboards?: { name: string; city: string; code: string | null } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

function fmt(n: number) {
  return n.toLocaleString("hu-HU");
}

type StatusMeta = { label: string; color: string; dot: string };

function statusMeta(s: string): StatusMeta {
  const map: Record<string, StatusMeta> = {
    pending:   { label: "Jóváhagyás alatt", color: "#fbbf24", dot: "#fbbf24" },
    confirmed: { label: "Aktív",            color: "#d4ff00", dot: "#d4ff00" },
    approved:  { label: "Aktív",            color: "#d4ff00", dot: "#d4ff00" },
    rejected:  { label: "Elutasítva",       color: "#ff6b6b", dot: "#ff6b6b" },
    cancelled: { label: "Megszakítva",      color: "#555555", dot: "#444444" },
  };
  return map[s] ?? { label: "Feldolgozás alatt", color: "#fbbf24", dot: "#fbbf24" };
}

// ─── Sub-components (server-renderable) ───────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
      style={{ color: m.color, background: `${m.color}12`, border: `1px solid ${m.color}28` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function CreativeThumb({ url }: { url: string | null | undefined }) {
  if (!url) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#0d0d0d]">
        <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m3 9 5-5 4 4 3-3 6 6" />
          <circle cx="8.5" cy="8.5" r="1.5" />
        </svg>
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="shrink-0 group/thumb">
      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[#1a1a1a] transition group-hover/thumb:border-[#d4ff00]/40">
        <Image
          src={url}
          alt="Kreatív előnézet"
          fill
          sizes="48px"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover/thumb:bg-black/40 group-hover/thumb:opacity-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="#d4ff00" strokeWidth="2" className="h-4 w-4" aria-hidden>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1a1a1a] bg-[#080808] px-6 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#d4ff00]/20 bg-[#d4ff00]/5 shadow-[0_0_40px_rgba(212,255,0,0.08)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="#d4ff00" strokeWidth="1.5" className="h-9 w-9 opacity-70" aria-hidden>
          <path d="M9 20H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-2" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      </div>
      <h3 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-wide text-white">
        Még nincs aktív kampányod
      </h3>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#555]">
        Foglalj egy prémium DOOH felületet most, és pár másodperc alatt elindíthatod hirdetésedet!
      </p>
      <Link
        href="/foglalas"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_28px_rgba(212,255,0,0.3)] transition hover:brightness-105 active:scale-[0.99]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Első kampányom indítása
      </Link>
    </div>
  );
}

// ─── Booking row (mobile card + desktop table row) ────────────────────────────

function BookingCard({ b }: { b: Booking }) {
  const m = statusMeta(b.status);
  return (
    <div className="flex items-start gap-4 border-b border-[#0d0d0d] px-5 py-4 transition last:border-0 hover:bg-[#080808] sm:hidden">
      <CreativeThumb url={b.creative_url} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#ccc]">
          {b.billboards?.name ?? b.billboard_id}
        </p>
        <p className="mt-0.5 text-[11px] text-[#555]">
          {b.billboards?.city && `${b.billboards.city} · `}
          {fmtDate(b.start_date)} – {fmtDate(b.end_date)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={b.status} />
          <span
            className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black"
            style={{ color: m.color }}
          >
            {fmt(b.total_price)} Ft
          </span>
        </div>
      </div>
    </div>
  );
}

function BookingTableRow({ b }: { b: Booking }) {
  return (
    <tr className="hidden border-b border-[#0d0d0d] transition-colors last:border-0 hover:bg-[#080808] sm:table-row">
      <td className="px-6 py-4">
        <CreativeThumb url={b.creative_url} />
      </td>
      <td className="px-6 py-4">
        <p className="text-[13px] font-semibold text-[#ccc]">
          {b.billboards?.name ?? b.billboard_id}
        </p>
        {b.billboards?.city && (
          <p className="mt-0.5 text-[11px] text-[#555]">{b.billboards.city}</p>
        )}
      </td>
      <td className="px-6 py-4 text-[12px] tabular-nums text-[#777]">
        {fmtDate(b.start_date)} – {fmtDate(b.end_date)}
      </td>
      <td className="px-6 py-4">
        <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-[#d4ff00]">
          {fmt(b.total_price)} Ft
        </span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={b.status} />
      </td>
      <td className="px-6 py-4 text-[11px] text-[#444]">{fmtDate(b.created_at)}</td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilPage() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) redirect("/");

  const sb = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {},
    },
  });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/");

  // ── Fetch bookings joined with billboard info ──────────────────────────────
  let bookings: Booking[] = [];
  let fetchError: string | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("bookings")
      .select("id, billboard_id, start_date, end_date, total_price, status, creative_url, created_at, billboards(name, city, code)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) as {
      data: Booking[] | null;
      error: { message: string } | null;
    };
    if (error) fetchError = error.message;
    bookings = data ?? [];
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Ismeretlen hiba";
  }

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const totalSpend = bookings.reduce((s, b) => s + b.total_price, 0);
  const activeCount = bookings.filter((b) =>
    ["approved", "confirmed"].includes(b.status)
  ).length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const firstName = user.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(" ")[0]
    : user.email?.split("@")[0] ?? "Partner";

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#020202] text-white">
      {/* subtle noise */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#0f0f0f] bg-[#020202]/90 px-5 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-widest text-white"
        >
          VRS <span className="text-[#d4ff00]">BILLBOARDS</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/foglalas"
            className="hidden rounded-lg border border-[#d4ff00]/25 bg-[#d4ff00]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#d4ff00] transition hover:bg-[#d4ff00]/12 sm:flex"
          >
            Foglalás
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0d0d0d] font-[family-name:var(--font-barlow-condensed)] text-[11px] font-black text-[#d4ff00]">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* ── Welcome ── */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#444]">
              Üdvözöllek
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-wide text-white sm:text-4xl">
              {firstName}
            </h1>
            <p className="mt-1 text-sm text-[#555]">{user.email}</p>
          </div>
          <Link
            href="/foglalas"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_28px_rgba(212,255,0,0.25)] transition hover:brightness-105 active:scale-[0.99] sm:self-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Új Kampány Indítása
          </Link>
        </div>

        {/* ── KPI bar ── */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "Összes kampány",  value: String(bookings.length), color: "#d4ff00" },
            { label: "Aktív kampányok", value: String(activeCount),     color: "#00ff87" },
            { label: "Jóváhagyás alatt", value: String(pendingCount),   color: "#fbbf24" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#141414] bg-[#0a0a0a] px-5 py-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#444]">
                {label}
              </p>
              <p
                className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black sm:text-3xl"
                style={{ color, textShadow: `0 0 24px ${color}30` }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Total spend banner */}
        {totalSpend > 0 && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-[#d4ff00]/12 bg-[#d4ff00]/[0.04] px-6 py-4">
            <p className="text-sm text-[#666]">Teljes reklámköltés</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-[#d4ff00]">
              {fmt(totalSpend)} Ft
            </p>
          </div>
        )}

        {/* ── Error banner ── */}
        {fetchError && (
          <div className="mb-6 rounded-xl border border-[#ff6b6b]/25 bg-[#ff6b6b]/5 px-5 py-3.5 text-sm text-[#ff6b6b]">
            Hiba a foglalások betöltésekor: {fetchError}
          </div>
        )}

        {/* ── Bookings ── */}
        <div className="rounded-2xl border border-[#141414] bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-[#111] px-5 py-4 sm:px-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#444]">
              Kampányelőzmények
            </h2>
            <span className="text-[10px] font-bold text-[#2a2a2a]">
              {bookings.length} foglalás
            </span>
          </div>

          {bookings.length === 0 && !fetchError ? (
            <div className="p-4 sm:p-6">
              <EmptyState />
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden">
                {bookings.map((b) => (
                  <BookingCard key={b.id} b={b} />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#111] text-[10px] font-black uppercase tracking-[0.14em] text-[#333]">
                      {["Kreatív", "Helyszín", "Időszak", "Összeg", "Státusz", "Foglalás dátuma"].map((h) => (
                        <th key={h} className="px-6 py-3 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <BookingTableRow key={b.id} b={b} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-[#1a1a1a]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a2a2a]">
            6ékony Reklám Kft. · VRS Billboards
          </span>
          <div className="h-px w-16 bg-[#1a1a1a]" />
        </div>
      </div>
    </div>
  );
}
