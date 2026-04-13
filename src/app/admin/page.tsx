import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { AdminClient } from "./AdminClient";

const ADMIN_EMAIL = "info@vrsbillboards.hu";

export type AdminBooking = {
  id: string;
  user_id: string;
  user_email: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  creative_url?: string | null;
};

export default async function AdminPage() {
  // 1. Session ellenőrzése szerver oldalon
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Szerver komponensben nem tudunk sütit beállítani (read-only)
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Admin jogosultság ellenőrzése
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // 3. Admin klienssel adatok lekérése (RLS megkerülése)
  const admin = getSupabaseAdmin();

  const [bookingsRes, usersRes] = await Promise.all([
    admin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // E-mail térkép: user_id → email
  const emailMap = new Map<string, string>(
    (usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? u.id])
  );

  const bookings: AdminBooking[] = (bookingsRes.data ?? []).map((b) => ({
    ...b,
    user_email: emailMap.get(b.user_id) ?? b.user_id,
  }));

  const totalRevenue = bookings.reduce((s, b) => s + (b.total_price ?? 0), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <AdminClient
      bookings={bookings}
      stats={{ total: bookings.length, pending: pendingCount, confirmed: confirmedCount, revenue: totalRevenue }}
      adminEmail={user.email!}
    />
  );
}
