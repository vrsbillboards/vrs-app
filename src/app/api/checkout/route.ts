import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

let _stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) return null;
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** Derive the public-facing origin for Stripe redirect URLs. */
function resolveAppOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) {
    try {
      return new URL(origin).origin;
    } catch {
      /* noop */
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* noop */
    }
  }
  const pub = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (pub && /^https?:\/\//i.test(pub)) return pub;
  const vercel = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Verify a Supabase JWT and return the user, or null on failure. */
async function getUserFromToken(
  token: string
): Promise<{ id: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error,
  } = await db.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id };
}

type CheckoutBody = {
  /** Billboard display name (shown on Stripe invoice line). */
  billboard_name: string;
  /** Supabase billboard UUID — stored in Stripe metadata → used by webhook. */
  billboard_id: string;
  start_date: string;
  end_date: string;
  /** HUF amount (major units). */
  total_price: number;
  /** Public URL of the uploaded creative — forwarded to webhook metadata. */
  creative_url: string;
  campaign_name?: string;
};

export async function POST(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return Response.json(
      { error: "Hitelesítés szükséges. Kérjük, jelentkezz be újra!" },
      { status: 401 }
    );
  }
  const user = await getUserFromToken(token);
  if (!user) {
    return Response.json(
      { error: "Érvénytelen vagy lejárt session. Kérjük, lépj be újra!" },
      { status: 401 }
    );
  }

  // ── 2. Stripe availability ───────────────────────────────────────────────
  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      {
        error:
          "A fizetési kapu nincs konfigurálva: hiányzik a STRIPE_SECRET_KEY a szerver környezetéből (Vercel → Settings → Environment Variables). Teszthez sk_test_… kulcsot adj meg, majd redeploy.",
        code: "stripe_not_configured",
      },
      { status: 503 }
    );
  }

  // ── 3. Body validation ───────────────────────────────────────────────────
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "Érvénytelen kérés formátum." }, { status: 400 });
  }

  const {
    billboard_name,
    billboard_id,
    start_date,
    end_date,
    total_price,
    creative_url,
    campaign_name,
  } = body;

  if (
    !billboard_name?.trim() ||
    !billboard_id?.trim() ||
    !start_date?.trim() ||
    !end_date?.trim() ||
    !creative_url?.trim() ||
    typeof total_price !== "number" ||
    !Number.isFinite(total_price)
  ) {
    return Response.json(
      {
        error:
          "Hiányzó vagy érvénytelen adatok: billboard_name, billboard_id, start_date, end_date, creative_url és total_price kötelező.",
      },
      { status: 400 }
    );
  }

  // ── 3.5. Server-side price verification ─────────────────────────────────
  // Never trust client-sent total_price. Look up the billboard, calculate
  // weeks server-side from the requested dates, and compare.
  const supabaseUrl3 = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon3 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl3 || !supabaseAnon3) {
    return Response.json(
      { error: "Adatbázis konfiguráció hiányzik a szerveren." },
      { status: 500 }
    );
  }
  const dbAnon = createClient(supabaseUrl3, supabaseAnon3, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bb, error: bbErr } = await (dbAnon as any)
    .from("billboards")
    .select("price, status")
    .eq("id", billboard_id.trim())
    .maybeSingle();
  if (bbErr || !bb) {
    console.error("[/api/checkout] Billboard lookup error:", bbErr?.message);
    return Response.json(
      { error: "A választott felület nem található vagy nem érhető el." },
      { status: 404 }
    );
  }
  if (bb.status === "booked") {
    return Response.json(
      { error: "Ez a felület időközben lefoglalt lett. Válassz másikat!" },
      { status: 409 }
    );
  }
  const startMs = new Date(start_date).getTime();
  const endMs = new Date(end_date).getTime();
  if (
    Number.isNaN(startMs) ||
    Number.isNaN(endMs) ||
    endMs < startMs
  ) {
    return Response.json(
      { error: "Érvénytelen kezdő vagy záró dátum." },
      { status: 400 }
    );
  }
  const days = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
  const weeks = Math.max(1, Math.ceil(days / 7));
  const expectedPrice = Number(bb.price) * weeks;

  // Allow ±1 Ft rounding tolerance, but reject anything materially different.
  if (Math.abs(Math.round(total_price) - expectedPrice) > 1) {
    return Response.json(
      {
        error: `Az ár nem egyezik a felület alapárával. Kérjük, kezdd újra a foglalást. (Várt: ${expectedPrice.toLocaleString("hu-HU")} Ft)`,
      },
      { status: 400 }
    );
  }

  // Stripe minimum HUF (currently 175 Ft)
  const MIN_HUF = 175;
  const hufMajor = expectedPrice;
  if (hufMajor < MIN_HUF) {
    return Response.json(
      {
        error: `A fizetendő összegnek legalább ${MIN_HUF} Ft-nak kell lennie (Stripe minimum).`,
      },
      { status: 400 }
    );
  }

  // ── 4. Create Stripe Checkout Session ────────────────────────────────────
  try {
    const origin = resolveAppOrigin(req);
    const unitAmount = hufMajor * 100; // HUF: major × 100 for minor units

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "huf",
      line_items: [
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: `VRS Billboards – ${billboard_name.trim().slice(0, 200)}`,
              description: "Kültéri reklámfelület foglalás · 6ékony Reklám Kft.",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is replaced by Stripe with the actual session id
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/foglalas?checkout=cancelled`,
      // All booking data lives in metadata → consumed by /api/webhooks/stripe
      metadata: {
        user_id: user.id,
        billboard_id: billboard_id.trim(),
        start_date: start_date.trim(),
        end_date: end_date.trim(),
        total_price: String(hufMajor),
        // Stripe metadata values: max 500 chars
        creative_url: creative_url.trim().slice(0, 499),
        ...(campaign_name?.trim()
          ? { campaign_name: campaign_name.trim().slice(0, 499) }
          : {}),
      },
    });

    return Response.json({ url: session.url });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "type" in err &&
      typeof (err as { type?: string }).type === "string"
    ) {
      const stripeErr = err as { type: string; message?: string; code?: string };
      const isCardError =
        stripeErr.type === "StripeCardError" ||
        stripeErr.code === "card_declined" ||
        stripeErr.code === "insufficient_funds" ||
        stripeErr.code === "expired_card" ||
        stripeErr.code === "incorrect_cvc";

      console.error("[/api/checkout] Stripe hiba:", stripeErr.message, stripeErr.code);
      return Response.json(
        { error: stripeErr.message ?? "Stripe hiba", isCardError },
        { status: isCardError ? 402 : 500 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/checkout] Váratlan hiba:", message);
    const hint = /No API key|Invalid API Key|api_key/i.test(message)
      ? " Ellenőrizd a Vercelen a STRIPE_SECRET_KEY értékét (teszt: sk_test_…, éles: sk_live_…)."
      : "";
    return Response.json({ error: `${message}${hint}` }, { status: 500 });
  }
}
