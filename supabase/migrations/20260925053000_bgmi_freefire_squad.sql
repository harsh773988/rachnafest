-- Change BGMI Cup and Free Fire Cup from individual (solo) to group (squad)
UPDATE public.events
SET participation_type = 'group'
WHERE slug IN ('bgmi-cup', 'free-fire-cup');

-- Add EngiFusion event on Day 1
INSERT INTO public.events (name, slug, day, participation_type, category, registrable, sort_order, description)
VALUES ('EngiFusion', 'engifusion', 1, 'group', 'Creative', true, 2, 'Engineering fusion challenge.');
