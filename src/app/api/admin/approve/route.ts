import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_EMAIL = "info@vrsbillboards.hu";

type ApproveBody = {
  bookingId: string;
  action: "approve" | "reject";
};

export async function POST(req: NextRequest) {
  try {
    // 1. Admin email hitelesítése JWT-ből
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return Response.json({ error: "Hitelesítés szükséges." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await admin.auth.getUser(token);

    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: "Nincs jogosultságod ehhez a művelethez." }, { status: 403 });
    }

    // 2. Body validálása
    const body = (await req.json()) as ApproveBody;
    const { bookingId, action } = body;

    if (!bookingId || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "Érvénytelen kérés." }, { status: 400 });
    }

    // 3. Status frissítése — a DB check constraintnek megfelelően
    const newStatus = action === "approve" ? "confirmed" : "cancelled";

    const { error: updateError } = await admin
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (updateError) {
      console.error("[/api/admin/approve] DB hiba:", updateError.message);
      return Response.json({ error: "Az állapot frissítése sikertelen." }, { status: 500 });
    }

    return Response.json({ success: true, status: newStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/admin/approve] Váratlan hiba:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
