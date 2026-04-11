-- =============================================================================
-- VRS Billboards – Supabase adatbázis séma + seed adatok
-- Projekt: https://gpwjfewhyatmcsqgkxrk.supabase.co
--
-- Futtatás: Supabase Dashboard → SQL Editor → Run
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. Előfeltételek (uuid generáláshoz)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ---------------------------------------------------------------------------
-- 1. profiles
--    Kiterjeszti az auth.users táblát. A Supabase Auth automatikusan létrehozza
--    a bejegyzést egy trigger segítségével (lásd lentebb).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'advertiser',   -- 'advertiser' | 'admin'
  full_name   TEXT,
  company     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) engedélyezése
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Saját profil olvasható
CREATE POLICY "Felhasználó látja saját profilját"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Saját profil módosítható
CREATE POLICY "Felhasználó szerkeszti saját profilját"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: új auth.users sor létrejöttekor automatikusan létrehoz profiles sort
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 2. billboards
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billboards (
  id          TEXT PRIMARY KEY,                         -- pl. 'GY-OP-04'
  code        TEXT,                                     -- rövid kód / régi ID
  name        TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  type        TEXT        NOT NULL,                     -- 'Óriásplakát' | 'Óriás felület' | 'Kis felület'
  ots         TEXT,                                     -- becsült napi OTS, pl. '45 000'
  price       NUMERIC     NOT NULL,                     -- heti listaár Ft-ban
  lat         NUMERIC     NOT NULL,
  lng         NUMERIC     NOT NULL,
  image_url   TEXT,
  status      TEXT        NOT NULL DEFAULT 'free'       -- 'free' | 'booked'
                          CHECK (status IN ('free', 'booked'))
);

-- Bárki olvashatja a hirdetőhelyeket (publikus katalógus)
ALTER TABLE public.billboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bárki olvashatja a billboards táblát"
  ON public.billboards FOR SELECT
  USING (true);

-- Csak admin írhat (service_role-lal, vagy admin policy-val bővíthető)
CREATE POLICY "Admin módosíthatja a billboards táblát"
  ON public.billboards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ---------------------------------------------------------------------------
-- 3. bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billboard_id  TEXT        NOT NULL REFERENCES public.billboards(id),
  start_date    DATE        NOT NULL,
  end_date      DATE        NOT NULL,
  total_price   NUMERIC     NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_dates_check CHECK (end_date >= start_date)
);

-- RLS kikapcsolva a bookings táblán (demo / fejlesztési mód).
-- Az új Supabase "sb_publishable_" kulcsformátum nem csatolja az auth JWT-t
-- az adatbázis RLS kontextushoz, ezért az auth.uid() alapú ellenőrzés elbukna.
-- Éles környezetben: kapcsold be az RLS-t, és adj hozzá service_role alapú
-- szerver oldali API route-ot a foglalások mentéséhez.
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 4. Seed: 4 alap hirdetőhely (az eredeti MapComponent mock adatokból)
-- ---------------------------------------------------------------------------

INSERT INTO public.billboards
  (id,        code,       name,                            city,              type,           ots,       price,  lat,       lng,       image_url,                                                                                            status)
VALUES
  ('GY-OP-04','GYOP05',   'ETO Park – Mártírok útja',      'Győr',            'Óriásplakát',  '45 000',  62000,  47.6879,   17.6502,  'https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=1200&q=85&auto=format&fit=crop',    'free'),
  ('SF-OP-06','SZFP01',   'Palotai út – Koronás Park',     'Székesfehérvár',  'Óriásplakát',  '38 000',  56000,  47.1952,   18.4102,  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85&auto=format&fit=crop',    'free'),
  ('GY-OP-10','GYOP12',   'Szent Imre út – körforgalom',   'Győr',            'Óriásplakát',  '48 000',  60000,  47.6888,   17.6453,  'https://images.unsplash.com/photo-1540960149937-f5b868f8f6d1?w=1200&q=85&auto=format&fit=crop',    'free'),
  ('KC-OP-01','KEC01',    'Izsáki út (52-es) – bevezető',  'Kecskemét',       'Óriásplakát',  '41 000',  58000,  46.9175,   19.6760,  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=85&auto=format&fit=crop',    'free')
ON CONFLICT (id) DO NOTHING;
