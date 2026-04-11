import { createClient } from "@supabase/supabase-js";

/**
 * Egyetlen Supabase kliens a teljes app számára.
 *
 * A placeholder fallback értékek azért szükségesek, hogy a Vercel build lépés
 * során — amikor a NEXT_PUBLIC_ változók még nem érhetők el — a createClient()
 * ne dobjon URL-validációs hibát. Valódi API hívások csak böngészőben futnak,
 * ahol a változók már rendelkezésre állnak.
 *
 * Vercel-en állítsd be:
 *   Settings → Environment Variables →
 *   NEXT_PUBLIC_SUPABASE_URL és NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
);

/**
 * TypeScript típusok a Supabase adatbázis tábláihoz.
 * Később a `supabase gen types typescript` paranccsal automatikusan generálható.
 */
export type DbProfile = {
  id: string;            // uuid
  role: string | null;
  full_name: string | null;
  company: string | null;
  created_at: string;
};

export type DbBillboard = {
  id: string;            // text (pl. "GY-OP-04")
  code: string | null;
  name: string;
  city: string;
  type: string;
  ots: string | null;
  price: number;
  lat: number;
  lng: number;
  image_url: string | null;
  status: "free" | "booked";
};

export type DbBooking = {
  id: string;            // uuid
  user_id: string;       // uuid → auth.users
  billboard_id: string;  // → billboards.id
  start_date: string;    // ISO date string
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};
