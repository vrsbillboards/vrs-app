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
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const { price, billboardName } = body;

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
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
    });

    return Response.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/checkout] Stripe hiba:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
