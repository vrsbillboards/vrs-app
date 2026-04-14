import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { AdminShell } from "./AdminShell";
import type {
  AdminBooking,
  AdminBillboard,
  AdminProfile,
  AdminStats,
  ClientType,
} from "./types";

const ADMIN_EMAIL = "info@vrsbillboards.hu";

function deriveClientType(company: string | null): ClientType {
  if (!company) return "direct";
  const c = company.toLowerCase();
  if (
    c.includes("ügynök") ||
    c.includes("agency") ||
    c.includes("media") ||
    c.includes("kommunikáció")
  ) {
    return "agency";
  }
  return "direct";
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020202] px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/8">
        <svg className="h-7 w-7 text-[#ff6b6b]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-wide text-white">
        Szerver hiba
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#555]">{message}</p>
      <a
        href="/admin"
        className="mt-6 rounded-xl bg-[#d4ff00] px-5 py-2.5 text-sm font-black uppercase tracking-wide text-black transition hover:brightness-110"
      >
        Újrapróbálás
      </a>
    </div>
  );
}

export default async function AdminPage() {
  // ── 1. Session check ────────────────────────────────────────────────────────
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  // ── 2. Require service role key ──────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return (
      <ErrorPage message="A SUPABASE_SERVICE_ROLE_KEY környezeti változó nincs beállítva a Vercel projektben. Adj hozzá a Settings → Environment Variables menüpontban, majd telepítsd újra." />
    );
  }

  // ── 3. Admin client (inline, no singleton to avoid edge-runtime issues) ─────
  let adminClient: ReturnType<typeof import("@supabase/supabase-js").createClient>;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.error("[admin] Failed to create admin client:", err);
    return <ErrorPage message="Az admin Supabase kliens létrehozása sikertelen. Ellenőrizd a naplókat." />;
  }

  // ── 4. Fetch all data (each independently, never throws) ────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = adminClient as any;

  const [bookingsResult, profilesResult, billboardsResult, usersResult] = await Promise.allSettled([
    db.from("bookings").select("*").order("created_at", { ascending: false }),
    db.from("profiles").select("id, role, full_name, company, created_at"),
    db.from("billboards").select("*").order("city", { ascending: true }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Safely extract data (fall back to empty arrays on error)
  const rawBookings: AdminBooking[] =
    bookingsResult.status === "fulfilled" ? (bookingsResult.value.data ?? []) : [];
  const rawProfiles: Array<{
    id: string; role: string; full_name: string | null; company: string | null; created_at: string;
  }> =
    profilesResult.status === "fulfilled" ? (profilesResult.value.data ?? []) : [];
  const rawBillboards: AdminBillboard[] =
    billboardsResult.status === "fulfilled" ? (billboardsResult.value.data ?? []) : [];
  const rawUsers =
    usersResult.status === "fulfilled" ? (usersResult.value.data?.users ?? []) : [];

  if (bookingsResult.status === "rejected") {
    console.error("[admin] bookings fetch failed:", bookingsResult.reason);
  }
  if (profilesResult.status === "rejected") {
    console.error("[admin] profiles fetch failed:", profilesResult.reason);
  }
  if (billboardsResult.status === "rejected") {
    console.error("[admin] billboards fetch failed:", billboardsResult.reason);
  }
  if (usersResult.status === "rejected") {
    console.error("[admin] listUsers failed:", usersResult.reason);
  }

  // ── 5. Build lookup maps ─────────────────────────────────────────────────────
  const emailMap = new Map<string, string>(
    rawUsers.map((u) => [u.id, u.email ?? u.id])
  );
  const profileMap = new Map(rawProfiles.map((p) => [p.id, p]));

  // ── 6. Enrich bookings ───────────────────────────────────────────────────────
  const bookings: AdminBooking[] = rawBookings.map((b) => {
    const profile = profileMap.get(b.user_id);
    return {
      ...b,
      user_email: emailMap.get(b.user_id) ?? b.user_id,
      client_name: profile?.full_name ?? null,
      client_company: profile?.company ?? null,
      client_type: deriveClientType(profile?.company ?? null),
    };
  });

  // ── 7. Per-client spending ───────────────────────────────────────────────────
  const clientSpending = new Map<string, { total: number; count: number }>();
  for (const b of bookings) {
    const prev = clientSpending.get(b.user_id) ?? { total: 0, count: 0 };
    clientSpending.set(b.user_id, {
      total: prev.total + (b.total_price ?? 0),
      count: prev.count + 1,
    });
  }

  const profiles: AdminProfile[] = rawUsers
    .filter((u) => u.email !== ADMIN_EMAIL)
    .map((u) => {
      const p = profileMap.get(u.id);
      const spending = clientSpending.get(u.id) ?? { total: 0, count: 0 };
      return {
        id: u.id,
        email: u.email ?? u.id,
        full_name: p?.full_name ?? null,
        company: p?.company ?? null,
        role: p?.role ?? "advertiser",
        client_type: deriveClientType(p?.company ?? null),
        created_at: u.created_at ?? "",
        total_spent: spending.total,
        booking_count: spending.count,
      };
    });

  const billboards = rawBillboards as AdminBillboard[];

  // ── 8. Billboard occupancy ───────────────────────────────────────────────────
  const billboardBookingCount: Record<string, number> = {};
  for (const b of bookings) {
    if (b.status === "confirmed") {
      billboardBookingCount[b.billboard_id] = (billboardBookingCount[b.billboard_id] ?? 0) + 1;
    }
  }

  // ── 9. Stats ─────────────────────────────────────────────────────────────────
  const stats: AdminStats = {
    totalRevenue: bookings.reduce((s, b) => s + (b.total_price ?? 0), 0),
    pendingCount: bookings.filter((b) => b.status === "pending").length,
    confirmedCount: bookings.filter((b) => b.status === "confirmed").length,
    totalBookings: bookings.length,
    activeScreens: billboards.filter((bb) => bb.status === "booked").length,
    totalClients: profiles.length,
  };

  return (
    <AdminShell
      bookings={bookings}
      billboards={billboards}
      profiles={profiles}
      stats={stats}
      adminEmail={user.email!}
      billboardBookingCount={billboardBookingCount}
    />
  );
}
