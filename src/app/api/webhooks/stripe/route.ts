import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Stripe webhooks send the raw body — do NOT use NextRequest here,
// which would buffer through Next.js middleware and potentially alter encoding.
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!webhookSecret || !stripeKey) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET vagy STRIPE_SECRET_KEY hiányzik");
    return new Response("Webhook not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = new Stripe(stripeKey).webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe-webhook] Signature verification failed:", msg);
    return new Response(`Webhook signature error: ${msg}`, { status: 400 });
  }

  // Only handle completed checkout sessions
  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const { user_id, billboard_id, start_date, end_date, creative_url, campaign_name } = meta;

  if (!user_id || !billboard_id || !start_date || !end_date) {
    // Bad metadata = config issue, return 200 so Stripe doesn't retry endlessly
    console.error("[stripe-webhook] Hiányzó metadata mezők", {
      meta,
      sessionId: session.id,
    });
    return new Response("Missing metadata — booking not created", { status: 200 });
  }

  // HUF: amount_total is in minor units (×100), so divide back
  const total_price =
    session.amount_total != null
      ? Math.round(session.amount_total / 100)
      : Number(meta.total_price ?? 0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[stripe-webhook] Supabase nincs konfigurálva");
    // Return 500 so Stripe retries — this is recoverable
    return new Response("Database not configured", { status: 500 });
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const insertRow: Record<string, unknown> = {
    user_id,
    billboard_id,
    start_date,
    end_date,
    total_price,
    status: "pending",
  };
  if (creative_url) insertRow.creative_url = creative_url;
  if (campaign_name) insertRow.campaign_name = campaign_name;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (db as any).from("bookings").insert(insertRow);

  if (dbError) {
    console.error("[stripe-webhook] DB insert hiba:", dbError.message, {
      sessionId: session.id,
    });
    // Return 500 → Stripe retries (idempotency handled by Stripe's retry logic)
    return new Response("Database error", { status: 500 });
  }

  console.log(
    `[stripe-webhook] Foglalás létrehozva | user=${user_id} billboard=${billboard_id} amount=${total_price} Ft`
  );
  return new Response("OK", { status: 200 });
}
