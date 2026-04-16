import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey || anonKey;
  if (!url || !key) {
    throw new Error("Supabase konfigurációs hiba.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Sikeres Stripe Checkout után: foglalás „confirmed” — csak a tulajdonos JWT-je engedélyezett.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.slice(7) ?? null;
    if (!token) {
      return Response.json({ error: "Hiányzó hitelesítés." }, { status: 401 });
    }

    const db = getDbClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: "Érvénytelen session." }, { status: 401 });
    }

    const body = (await req.json()) as { bookingId?: string };
    const bookingId = body.bookingId?.trim();
    if (!bookingId) {
      return Response.json({ error: "Hiányzó bookingId." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error: fetchErr } = await (db as any)
      .from("bookings")
      .select("id, user_id, status")
      .eq("id", bookingId)
      .single() as {
      data: { id: string; user_id: string; status: string } | null;
      error: { message: string } | null;
    };

    if (fetchErr || !row) {
      return Response.json({ error: "A foglalás nem található." }, { status: 404 });
    }
    if (row.user_id !== user.id) {
      return Response.json({ error: "Nincs jogosultságod ehhez a foglaláshoz." }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (db as any)
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (updErr) {
      console.error("[confirm-payment] update:", updErr.message);
      return Response.json(
        { error: "A státusz frissítése sikertelen. Próbáld újra, vagy jelezd ügyfélszolgálatunknak." },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, status: "confirmed" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[confirm-payment]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
