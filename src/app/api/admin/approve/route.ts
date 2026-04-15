import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendStatusEmail } from "@/lib/email";
import { generateInvoice } from "@/lib/invoice";

const ADMIN_EMAIL = "info@vrsbillboards.hu";

type ApproveBody = {
  bookingId: string;
  action: "approve" | "reject";
};

interface BookingRow {
  id: string;
  user_id: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
}

interface BillboardRow {
  id: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. JWT hitelesítés ────────────────────────────────────────────────────
    const token = req.headers.get("Authorization")?.slice(7) ?? null;
    if (!token) {
      return Response.json({ error: "Hitelesítés szükséges." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: "Nincs jogosultságod ehhez a művelethez." }, { status: 403 });
    }

    // ── 2. Body validálás ─────────────────────────────────────────────────────
    const body = (await req.json()) as ApproveBody;
    const { bookingId, action } = body;
    if (!bookingId || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "Érvénytelen kérés." }, { status: 400 });
    }

    const newStatus = action === "approve" ? "confirmed" : "cancelled";

    // ── 3. Booking lekérése (user_id, összeg, dátumok) ────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const { data: booking, error: fetchErr } = await db
      .from("bookings")
      .select("id, user_id, billboard_id, start_date, end_date, total_price, status")
      .eq("id", bookingId)
      .single() as { data: BookingRow | null; error: { message: string } | null };

    if (fetchErr || !booking) {
      console.error("[approve] Booking nem található:", fetchErr?.message);
      return Response.json({ error: "A foglalás nem található." }, { status: 404 });
    }

    // ── 4. Status frissítése ──────────────────────────────────────────────────
    const { error: updateErr } = await db
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (updateErr) {
      console.error("[approve] DB update hiba:", updateErr.message);
      return Response.json({ error: "Az állapot frissítése sikertelen." }, { status: 500 });
    }

    // ── 5. Ügyfél e-mail lekérése az auth.users-ből ───────────────────────────
    // A bookings táblában nincs email mező — a user_id alapján kérdezzük le.
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(booking.user_id);
    const customerEmail = userData?.user?.email ?? null;

    if (userErr || !customerEmail) {
      console.warn("[approve] Ügyfél email nem lekérhető:", userErr?.message);
    }

    // ── 6. Billboard neve (optional, for nicer email) ─────────────────────────
    let billboardName: string | undefined;
    try {
      const { data: bb } = await db
        .from("billboards")
        .select("id, name")
        .eq("id", booking.billboard_id)
        .single() as { data: BillboardRow | null; error: unknown };
      billboardName = bb?.name;
    } catch {
      // nem kritikus, folytatjuk billboardName nélkül
    }

    // ── 7. Értesítő email (non-blocking) ─────────────────────────────────────
    if (customerEmail) {
      try {
        await sendStatusEmail(
          customerEmail,
          action === "approve" ? "approved" : "rejected",
          {
            bookingId:    booking.id,
            billboardName,
            startDate:    booking.start_date,
            endDate:      booking.end_date,
            amount:       booking.total_price,
          }
        );
        console.log(`[approve] Email elküldve → ${customerEmail} (${newStatus})`);
      } catch (emailErr) {
        // Email hiba nem blokkolja a választ — a DB update már sikeres volt.
        console.error("[approve] Email küldési hiba:", emailErr);
      }
    }

    // ── 8. Számlázás (stub, non-blocking) ─────────────────────────────────────
    if (action === "approve") {
      try {
        await generateInvoice(booking.id, {
          amount:        booking.total_price,
          customerEmail: customerEmail ?? undefined,
          billboardId:   booking.billboard_id,
          startDate:     booking.start_date,
          endDate:       booking.end_date,
        });
      } catch (invoiceErr) {
        console.error("[approve] Számlázási hiba:", invoiceErr);
      }
    }

    return Response.json({ success: true, status: newStatus });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[approve] Váratlan hiba:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
