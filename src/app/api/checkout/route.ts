import Stripe from "stripe";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Stripe kliens lazy inicializálása — a v17+ ajánlott minta,
 * hogy build lépés során ne dobjon hibát a hiányzó kulcs.
 */
let _stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) return null;
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** Checkout redirect URL-ekhez: böngésző Origin, majd publikus app URL, majd Vercel. */
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

type CheckoutBody = {
  price: number;
  billboardName: string;
  bookingId?: string | null;
};

export async function POST(req: NextRequest) {
  try {
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

    const body = (await req.json()) as CheckoutBody;
    const { price, billboardName, bookingId } = body;

    if (typeof price !== "number" || !Number.isFinite(price) || !billboardName?.trim()) {
      return Response.json(
        { error: "Hiányzó vagy érvénytelen adatok: price és billboardName kötelező." },
        { status: 400 }
      );
    }

    // Stripe minimum HUF díj (dokumentáció szerint jelenleg 175 Ft)
    const MIN_HUF = 175;
    const hufMajor = Math.round(price);
    if (hufMajor < MIN_HUF) {
      return Response.json(
        { error: `A fizetendő összegnek legalább ${MIN_HUF} Ft-nak kell lennie (Stripe minimum).` },
        { status: 400 }
      );
    }

    const origin = resolveAppOrigin(req);

    // HUF: Stripe a „fillér-szerű” két tizedes jegyet használja → egész Ft × 100
    const unitAmount = hufMajor * 100;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "huf",
      line_items: [
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: `VRS Billboards – ${billboardName.trim().slice(0, 200)}`,
              description: "Kültéri reklámfelület foglalás · 6ékony Reklám Kft.",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success${bookingId ? `?booking_id=${encodeURIComponent(bookingId)}` : ""}`,
      cancel_url: `${origin}/foglalas?checkout=cancelled`,
      metadata: bookingId ? { booking_id: String(bookingId) } : undefined,
    });

    return Response.json({ url: session.url });
  } catch (err: unknown) {
    // Stripe-specifikus hibák strukturált kezelése
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
    const hint =
      /No API key|Invalid API Key|api_key/i.test(message)
        ? " Ellenőrizd a Vercelen a STRIPE_SECRET_KEY értékét (teszt: sk_test_…, éles: sk_live_…)."
        : "";
    return Response.json({ error: `${message}${hint}` }, { status: 500 });
  }
}
