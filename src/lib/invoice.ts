/**
 * Számlázási modul — Billingo integráció (stub)
 *
 * A valós implementáció a Billingo API v3-at fogja hívni:
 * https://app.billingo.hu/api-key
 *
 * Szükséges env var (majd): BILLINGO_API_KEY
 */

export interface InvoiceDetails {
  amount?: number;
  customerEmail?: string;
  billboardId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Generál egy számlát a megadott foglaláshoz.
 * Jelenleg stub — a Billingo API hívás itt kerül majd implementálásra.
 */
export async function generateInvoice(
  bookingId: string,
  details: InvoiceDetails = {}
): Promise<void> {
  console.log(
    "Számla API hívás előkészítve a Billingo felé:",
    bookingId,
    details
  );

  // TODO: Implementálás a Billingo API v3-mal:
  //
  // const response = await fetch("https://api.billingo.hu/v3/documents", {
  //   method: "POST",
  //   headers: {
  //     "X-API-KEY": process.env.BILLINGO_API_KEY!,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     partner: { ... },
  //     block_id: ...,
  //     type: "invoice",
  //     items: [{ name: `VRS Kampány – ${bookingId}`, net_unit_price: details.amount, ... }],
  //   }),
  // });
}
