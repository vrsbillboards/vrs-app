import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
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
  if (c.includes("ügynök") || c.includes("agency") || c.includes("media") || c.includes("kommunikáció")) {
    return "agency";
  }
  return "direct";
}

export default async function AdminPage() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const admin = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = admin as any;

  const [bookingsRes, profilesRes, billboardsRes, usersRes] = await Promise.all([
    any.from("bookings").select("*").order("created_at", { ascending: false }) as Promise<{
      data: AdminBooking[] | null; error: unknown;
    }>,
    any.from("profiles").select("*") as Promise<{
      data: Array<{ id: string; role: string; full_name: string | null; company: string | null; created_at: string }> | null;
      error: unknown;
    }>,
    any.from("billboards").select("*").order("city", { ascending: true }) as Promise<{
      data: AdminBillboard[] | null; error: unknown;
    }>,
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Build email + profile maps
  const emailMap = new Map<string, string>(
    (usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? u.id])
  );

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );

  const rawBookings = (bookingsRes.data ?? []) as AdminBooking[];

  // Enrich bookings with user context
  const bookings: AdminBooking[] = rawBookings.map((b) => {
    const profile = profileMap.get(b.user_id);
    const email = emailMap.get(b.user_id) ?? b.user_id;
    return {
      ...b,
      user_email: email,
      client_name: profile?.full_name ?? null,
      client_company: profile?.company ?? null,
      client_type: deriveClientType(profile?.company ?? null),
    };
  });

  // Build per-client stats for profile view
  const clientSpending = new Map<string, { total: number; count: number }>();
  for (const b of bookings) {
    const prev = clientSpending.get(b.user_id) ?? { total: 0, count: 0 };
    clientSpending.set(b.user_id, {
      total: prev.total + (b.total_price ?? 0),
      count: prev.count + 1,
    });
  }

  const profiles: AdminProfile[] = (usersRes.data?.users ?? [])
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

  const billboards = (billboardsRes.data ?? []) as AdminBillboard[];

  // Occupancy: how many confirmed bookings each billboard has
  const billboardBookingCount = new Map<string, number>();
  for (const b of bookings) {
    if (b.status === "confirmed") {
      billboardBookingCount.set(b.billboard_id, (billboardBookingCount.get(b.billboard_id) ?? 0) + 1);
    }
  }

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
      billboardBookingCount={Object.fromEntries(billboardBookingCount)}
    />
  );
}
