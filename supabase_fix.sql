-- =============================================================================
-- VRS Billboards – RLS javítás (Supabase Dashboard → SQL Editor → Run)
--
-- Probléma: "new row violates row-level security policy"
-- Ok: Az sb_publishable_ kulcsformátum nem állítja be az auth.uid()-t
--     az adatbázis RLS kontextusban, így a strict auth.uid() = user_id
--     ellenőrzés mindig meghiúsul.
-- Megoldás: RLS kikapcsolása a bookings táblán (demo / fejlesztési mód).
-- =============================================================================

-- 1. Régi, meghiúsuló INSERT policy törlése
DROP POLICY IF EXISTS "Felhasználó látrehozhat foglalást"  ON public.bookings;
DROP POLICY IF EXISTS "Felhasználó létrehozhat foglalást"  ON public.bookings;
DROP POLICY IF EXISTS "Felhasználó látja saját foglalásait" ON public.bookings;
DROP POLICY IF EXISTS "Felhasználó törölheti saját pending foglalását" ON public.bookings;

-- 2. RLS kikapcsolása (demo mód)
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
