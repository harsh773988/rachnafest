
CREATE TYPE public.app_role AS ENUM ('admin','teacher');
CREATE TYPE public.participation_type AS ENUM ('individual','group');

CREATE TABLE public.user_roles (
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

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- first signup becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE TABLE public.events (
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
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_name text,
  created_by uuid,
  source text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can register" ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read registrations" ON public.registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete registrations" ON public.registrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.registrants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  name text NOT NULL,
  branch text NOT NULL,
  college_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.registrants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrants TO authenticated;
GRANT ALL ON public.registrants TO service_role;
ALTER TABLE public.registrants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can add registrants" ON public.registrants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read registrants" ON public.registrants FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete registrants" ON public.registrants FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.events (name, slug, day, participation_type, category, registrable, sort_order, description) VALUES
('Hawan','hawan',1,'individual','Ceremony',false,1,'Opening ritual of Rachna 2K26.'),
('Poster Launch','poster-launch',1,'individual','Ceremony',false,2,'Official poster unveiling of the fest.'),
('EngiFusion','engifusion',1,'group','Creative',true,3,'Engineering fusion challenge.'),
('Art & Craft','art-and-craft',1,'individual','Creative',true,3,'Showcase your handmade craft and artwork.'),
('Tug of War','tug-of-war',1,'group','Sports',true,4,'Raw strength, pure team grit.'),
('College Fashion Fiesta','fashion-fiesta',2,'group','Cultural',true,5,'Ramp walk showdown between squads.'),
('Dance Competition','dance-competition',2,'group','Cultural',true,6,'Solo energy, group chaos, one stage.'),
('Singing Competition','singing-competition',2,'group','Cultural',true,7,'Voices of the campus.'),
('Campus BGMI Cup','bgmi-cup',2,'group','Esports',true,8,'Battlegrounds Mobile India campus tournament.'),
('Campus Free Fire Cup','free-fire-cup',2,'group','Esports',true,9,'Free Fire campus tournament.'),
('Road Art Competition','road-art',2,'individual','Creative',true,10,'Street canvas, chalk and colour.'),
('Creative Wall Art Challenge','wall-art',2,'individual','Creative',true,11,'Paint the campus walls with your vision.'),
('Campus Treasure Hunt','treasure-hunt',2,'group','Fun',true,12,'Clues across campus. Beat the clock.'),
('Volleyball League','volleyball-league',3,'group','Sports',true,13,'Campus volleyball championship.'),
('Basketball League','basketball-league',3,'group','Sports',true,14,'Campus basketball championship.'),
('Badminton League','badminton-league',3,'individual','Sports',true,15,'Singles badminton knockout.'),
('Sprint Competition (100m/200m)','sprint',3,'individual','Sports',true,16,'100m and 200m track sprint.'),
('Campus Chess Championship','chess-championship',3,'individual','Sports',true,17,'Board battles across the campus.'),
('Reel Making','reel-making',3,'group','Creative',true,18,'Shoot, cut and post the fest.'),
('Food Stall Zone','food-stall-zone',4,'individual','Fun',false,19,'Street food across the ground.'),
('Photo Booth Corner','photo-booth',4,'individual','Fun',false,20,'Frames and memories.'),
('Dance & Singing','dance-and-singing-open',4,'group','Cultural',false,21,'Open stage performances.'),
('DJ Night','dj-night',4,'individual','Cultural',false,22,'Bass, lights, campus.'),
('Celebrity Night','celebrity-night',5,'individual','Cultural',false,23,'The headline night of Rachna 2K26.');
