import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type BookingBody = {
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  creative_url?: string;
};

export async function POST(req: NextRequest) {
  try {
    // 1. JWT kinyerése az Authorization fejlécből
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return Response.json(
        { error: "Hiányzó hitelesítési token. Kérjük, jelentkezz be!" },
        { status: 401 }
      );
    }

    // 2. Token ellenőrzése admin klienssel
    const admin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await admin.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: "Érvénytelen session. Kérjük, jelentkezz be újra!" },
        { status: 401 }
      );
    }

    // 3. Body validálása
    const body = (await req.json()) as BookingBody;
    const { billboard_id, start_date, end_date, total_price, creative_url } = body;

    if (!billboard_id || !start_date || !end_date || !total_price) {
      return Response.json(
        { error: "Hiányzó kötelező mezők a foglaláshoz." },
        { status: 400 }
      );
    }

    if (total_price <= 0 || !Number.isFinite(total_price)) {
      return Response.json(
        { error: "Érvénytelen ár." },
        { status: 400 }
      );
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return Response.json(
        { error: "Érvénytelen dátumok." },
        { status: 400 }
      );
    }

    // 4. Foglalás mentése service role kulccsal (RLS megkerülése)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (admin as any)
      .from("bookings")
      .insert({
        user_id: user.id,
        billboard_id,
        start_date,
        end_date,
        total_price,
        status: "pending",
        ...(creative_url ? { creative_url } : {}),
      })
      .select("id")
      .single() as { data: { id: string } | null; error: { message: string } | null };

    if (insertError) {
      console.error("[/api/bookings] DB insert hiba:", insertError.message);
      return Response.json(
        { error: "A foglalás mentése sikertelen. Kérjük, próbáld újra!" },
        { status: 500 }
      );
    }

    return Response.json({ id: data!.id }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/bookings] Váratlan hiba:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
