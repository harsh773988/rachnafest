INSERT INTO public.events
  (name, slug, day, participation_type, category, registrable, sort_order, description)
VALUES
  ('Real Cricket', 'real-cricket', 2, 'individual', 'Esports', true, 206, 'Real Cricket mobile gaming tournament.'),
  ('Cube Competition', 'cube-competition', 4, 'individual', 'Creative', true, 405, 'Rubik''s Cube speed-solving competition.'),
  ('Kabaddi Competition', 'kabaddi-competition', 4, 'group', 'Sports', true, 406, 'Inter-college Kabaddi tournament.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  day = EXCLUDED.day,
  participation_type = EXCLUDED.participation_type,
  category = EXCLUDED.category,
  registrable = EXCLUDED.registrable,
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description;

-- Keep the open-stage Dance & Singing entry configurable and registration-enabled.
INSERT INTO public.events
  (name, slug, day, participation_type, category, registrable, sort_order, description)
VALUES
  ('Dance & Singing', 'dance-and-singing-open', 5, 'group', 'Cultural', true, 501, 'Open stage performances.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  day = EXCLUDED.day,
  participation_type = EXCLUDED.participation_type,
  category = EXCLUDED.category,
  registrable = EXCLUDED.registrable,
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description;