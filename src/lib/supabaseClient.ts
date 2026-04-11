import { createClient } from "@supabase/supabase-js";

/**
 * Supabase kliens — build-safe inicializálás.
 *
 * A guard logika megakadályozza, hogy felcserélt vagy hiányzó env változók
 * "Invalid supabaseUrl" hibát okozzanak build időben.
 *
 * Vercel → Settings → Environment Variables:
 *   NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_...  (vagy eyJ...)
 */
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabaseUrl = rawUrl.startsWith("https://")
  ? rawUrl
  : "https://placeholder.supabase.co";

const supabaseKey =
  rawKey && !rawKey.startsWith("https://") ? rawKey : "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * TypeScript típusok a Supabase adatbázis tábláihoz.
 */
export type DbProfile = {
  id: string;
  role: string | null;
  full_name: string | null;
  company: string | null;
  created_at: string;
};

export type DbBillboard = {
  id: string;
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
  id: string;
  user_id: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};
