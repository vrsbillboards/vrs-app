import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Hiányzó Supabase környezeti változók. " +
    "Ellenőrizd a NEXT_PUBLIC_SUPABASE_URL és NEXT_PUBLIC_SUPABASE_ANON_KEY értékeket a .env.local fájlban."
  );
}

/**
 * Egyetlen Supabase kliens a teljes app számára.
 *
 * Kliens komponensekben (böngésző): az anon kulcsot használja, RLS-re támaszkodik.
 * Szerver Actions / Route Handler-ekben: ugyanez, amíg service_role key nincs szükség.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
