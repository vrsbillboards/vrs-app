import Stripe from "stripe";
import type { NextRequest } from "next/server";

/**
 * Stripe kliens lazy inicializálása — a v17+ ajánlott minta,
 * hogy build lépés során ne dobjon hibát a hiányzó kulcs.
 */
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY nincs beállítva a .env.local fájlban.");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

type CheckoutBody = {
  price: number;
  billboardName: string;
  bookingId?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const { price, billboardName, bookingId } = body;

    if (!price || !billboardName) {
      return Response.json(
        { error: "Hiányzó adatok: price és billboardName kötelező." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      currency: "huf",
      line_items: [
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: `VRS Billboards – ${billboardName}`,
              description: "Kültéri reklámfelület foglalás · 6ékony Reklám Kft.",
            },
            // HUF-ban küldött összeg; Stripe a legkisebb egységet várja.
            // HUF esetén 1 fillér = 1 HUF * 100, de fillér nem használatos,
            // ezért szorzunk 100-zal (Stripe standard konvenció).
            unit_amount: Math.round(price) * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success${bookingId ? `?booking_id=${bookingId}` : ""}`,
      cancel_url: `${origin}/`,
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
    return Response.json({ error: message }, { status: 500 });
  }
}
