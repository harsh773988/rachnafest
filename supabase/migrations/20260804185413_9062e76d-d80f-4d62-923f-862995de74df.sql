-- 1) Drop permissive public INSERT policies (writes go through server fn with service role)
DROP POLICY IF EXISTS "anyone can register" ON public.registrations;
DROP POLICY IF EXISTS "anyone can add registrants" ON public.registrants;

REVOKE INSERT ON public.registrations FROM anon, authenticated;
REVOKE INSERT ON public.registrants FROM anon, authenticated;
GRANT ALL ON public.registrations TO service_role;
GRANT ALL ON public.registrants TO service_role;

-- 2) Replace has_role() usage in policies with inline role lookups so EXECUTE can be revoked
DROP POLICY IF EXISTS "admins read registrations" ON public.registrations;
DROP POLICY IF EXISTS "admins delete registrations" ON public.registrations;
DROP POLICY IF EXISTS "admins read registrants" ON public.registrants;
DROP POLICY IF EXISTS "admins delete registrants" ON public.registrants;
DROP POLICY IF EXISTS "admins manage events" ON public.events;

CREATE POLICY "admins read registrations" ON public.registrations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins delete registrations" ON public.registrations FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins read registrants" ON public.registrants FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins delete registrants" ON public.registrants FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- 3) Revoke EXECUTE on SECURITY DEFINER functions from API roles
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
