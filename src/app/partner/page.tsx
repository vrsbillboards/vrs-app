import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { PartnerShell } from "./PartnerShell";
import type { BookingRow, BillboardRow } from "./PartnerShell";

export default async function PartnerPage() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) redirect("/");

  const sb = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // read-only: cookies are set by the proxy
      },
    },
  });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/");

  // ── Role ──────────────────────────────────────────────────────────────────
  let initialRole: "agency" | "owner" = "agency";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (sb as any)
      .from("profiles")
      .select("client_type")
      .eq("id", user.id)
      .single() as { data: { client_type?: string } | null };
    if (profile?.client_type === "owner") initialRole = "owner";
  } catch {
    // profiles table may not have client_type — default stays 'agency'
  }

  // ── Agency: own bookings joined with billboard details ────────────────────
  let bookings: BookingRow[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("bookings")
      .select(
        "id, billboard_id, start_date, end_date, total_price, status, created_at, creative_url, billboards(name, city, code, type)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) as {
      data: BookingRow[] | null;
      error: { message: string } | null;
    };
    if (error) console.error("[partner] bookings:", error.message);
    bookings = data ?? [];
  } catch (e) {
    console.error("[partner] bookings fetch failed:", e);
  }

  // ── Owner: all billboards for the network view ────────────────────────────
  let billboards: BillboardRow[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("billboards")
      .select("id, code, name, city, type, price, status")
      .order("name") as {
      data: BillboardRow[] | null;
      error: { message: string } | null;
    };
    if (error) console.error("[partner] billboards:", error.message);
    billboards = data ?? [];
  } catch (e) {
    console.error("[partner] billboards fetch failed:", e);
  }

  return (
    <PartnerShell
      user={{ id: user.id, email: user.email ?? "" }}
      initialRole={initialRole}
      bookings={bookings}
      billboards={billboards}
    />
  );
}
