-- Profiles table for user public profile
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  age INTEGER,
  gender TEXT,
  favorite_sports TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 

-- Tabela za sledenje pridružitev uporabnikov dogodkom
CREATE TABLE IF NOT EXISTS public.event_participants (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Indeksi (hitrejše poizvedbe po user_id in event_id)
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
-- PK že pokriva (event_id, user_id), zato je iskanje po event_id učinkovito

-- RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Politike RLS
DROP POLICY IF EXISTS "Everyone can read joins" ON public.event_participants;
CREATE POLICY "Everyone can read joins"
  ON public.event_participants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "User can join" ON public.event_participants;
CREATE POLICY "User can join"
  ON public.event_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can leave" ON public.event_participants;
CREATE POLICY "User can leave"
  ON public.event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- (Neobvezno) lastnik dogodka lahko upravlja udeležence (npr. odstrani nekoga)
DROP POLICY IF EXISTS "Owner can manage participants" ON public.event_participants;
CREATE POLICY "Owner can manage participants"
  ON public.event_participants FOR DELETE
  USING (
    auth.uid() = (SELECT e.user_id FROM public.events e WHERE e.id = event_id)
  );

-- (Priporočeno) Dovoli vloge do sheme in tabele (RLS še vedno ščiti vrstice)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.event_participants TO anon, authenticated; 