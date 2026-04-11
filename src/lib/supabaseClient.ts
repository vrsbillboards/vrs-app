import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy Supabase kliens — a createClient() CSAK az első tényleges API híváskor
 * fut le (böngészőben / runtime), soha nem a Vercel build lépés alatt.
 * Ez garantálja, hogy hiányzó / felcserélt env változók nem okoznak build hibát.
 *
 * Vercel → Settings → Environment Variables:
 *   NEXT_PUBLIC_SUPABASE_URL   = https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_...  (vagy eyJ...)
 */
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    _client = createClient(
      url.startsWith("https://") ? url : "https://placeholder.supabase.co",
      key && !key.startsWith("https://") ? key : "placeholder-anon-key",
    );
  }
  return _client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

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
