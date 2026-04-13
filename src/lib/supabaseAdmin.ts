import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin kliens — csak szerver oldali használatra (API routes).
 * A service role key megkerüli az RLS-t, ezért SOHA ne kerüljön kliens oldali kódba.
 */
let _admin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY nincs beállítva."
      );
    }
    _admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _admin;
}
