-- ============================================================================
-- RACHNA 2K26 - COMPLETE DATABASE SETUP SCRIPT
-- Paste and run this entire script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ebourouwvncwebiztwvw/sql/new
-- ============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'teacher');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.participation_type AS ENUM ('individual', 'group');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 3. Create events Table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  day int NOT NULL,
  event_date date,
  participation_type public.participation_type NOT NULL DEFAULT 'individual',
  category text,
  description text,
  registrable boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events public read" ON public.events;
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admins manage events" ON public.events;
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- 4. Create registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_name text,
  created_by uuid,
  source text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read registrations" ON public.registrations;
CREATE POLICY "admins read registrations" ON public.registrations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "admins delete registrations" ON public.registrations;
CREATE POLICY "admins delete registrations" ON public.registrations FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- 5. Create registrants Table
CREATE TABLE IF NOT EXISTS public.registrants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  name text NOT NULL,
  branch text NOT NULL,
  college_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.registrants TO service_role;
ALTER TABLE public.registrants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read registrants" ON public.registrants;
CREATE POLICY "admins read registrants" ON public.registrants FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "admins delete registrants" ON public.registrants;
CREATE POLICY "admins delete registrants" ON public.registrants FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- 6. Create audit_logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  summary text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read audit logs" ON public.audit_logs;
CREATE POLICY "admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

-- 7. Insert All Rachna 2K26 Fest Events
INSERT INTO public.events (name, slug, day, participation_type, category, registrable, sort_order, description) VALUES
('Hawan', 'hawan', 1, 'individual', 'Ceremony', false, 1, 'Opening ritual of Rachna 2K26.'),
('Poster Launch', 'poster-launch', 1, 'individual', 'Ceremony', false, 2, 'Official poster unveiling of the fest.'),
('EngiFusion', 'engifusion', 1, 'group', 'Creative', true, 2, 'Engineering fusion challenge.'),
('Art & Craft', 'art-and-craft', 1, 'individual', 'Creative', true, 3, 'Showcase your handmade craft and artwork.'),
('Tug of War', 'tug-of-war', 1, 'group', 'Sports', true, 4, 'Raw strength, pure team grit.'),
('College Fashion Fiesta', 'fashion-fiesta', 2, 'group', 'Cultural', true, 5, 'Ramp walk showdown between squads.'),
('Dance Competition', 'dance-competition', 2, 'group', 'Cultural', true, 6, 'Solo energy, group chaos, one stage.'),
('Singing Competition', 'singing-competition', 2, 'group', 'Cultural', true, 7, 'Voices of the campus.'),
('Campus BGMI Cup', 'bgmi-cup', 2, 'group', 'Esports', true, 8, 'Battlegrounds Mobile India campus tournament.'),
('Campus Free Fire Cup', 'free-fire-cup', 2, 'group', 'Esports', true, 9, 'Free Fire campus tournament.'),
('Road Art Competition', 'road-art', 2, 'individual', 'Creative', true, 10, 'Street canvas, chalk and colour.'),
('Creative Wall Art Challenge', 'wall-art', 2, 'individual', 'Creative', true, 11, 'Paint the campus walls with your vision.'),
('Campus Treasure Hunt', 'treasure-hunt', 2, 'group', 'Fun', true, 12, 'Clues across campus. Beat the clock.'),
('Volleyball League', 'volleyball-league', 3, 'group', 'Sports', true, 13, 'Campus volleyball championship.'),
('Basketball League', 'basketball-league', 3, 'group', 'Sports', true, 14, 'Campus basketball championship.'),
('Badminton League', 'badminton-league', 3, 'individual', 'Sports', true, 15, 'Singles badminton knockout.'),
('Sprint Competition (100m/200m)', 'sprint', 3, 'individual', 'Sports', true, 16, '100m and 200m track sprint.'),
('Campus Chess Championship', 'chess-championship', 3, 'individual', 'Sports', true, 17, 'Board battles across the campus.'),
('Reel Making', 'reel-making', 3, 'group', 'Creative', true, 18, 'Shoot, cut and post the fest.'),
('Food Stall Zone', 'food-stall-zone', 4, 'individual', 'Fun', false, 19, 'Street food across the ground.'),
('Photo Booth Corner', 'photo-booth', 4, 'individual', 'Fun', false, 20, 'Frames and memories.'),
('Dance & Singing', 'dance-and-singing-open', 4, 'group', 'Cultural', false, 21, 'Open stage performances.'),
('DJ Night', 'dj-night', 4, 'individual', 'Cultural', false, 22, 'Bass, lights, campus.'),
('Celebrity Night', 'celebrity-night', 5, 'individual', 'Cultural', false, 23, 'The headline night of Rachna 2K26.'),
('Rangoli Competition', 'rangoli-competition', 1, 'individual', 'Creative', true, 24, 'Colourful rangoli designs on the fest floor.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  day = EXCLUDED.day,
  participation_type = EXCLUDED.participation_type,
  category = EXCLUDED.category,
  registrable = EXCLUDED.registrable,
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description;
