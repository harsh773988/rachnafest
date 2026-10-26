import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const logSchema = z.object({
  action: z.enum(["registrations.export", "registration.create"]),
  entityType: z.string().trim().max(50).nullable().optional(),
  entityId: z.string().trim().max(100).nullable().optional(),
  summary: z.string().trim().max(300).nullable().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const logAdminAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => logSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      action: data.action,
      entity_type: data.entityType ?? null,
      entity_id: data.entityId ?? null,
      summary: data.summary ?? null,
      details: (data.details ?? {}) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRegistrationAsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("registrations")
      .select("id, team_name, event_id, registrants(name, email)")
      .eq("id", data.id)
      .maybeSingle();

    const { error: delMembers } = await supabaseAdmin
      .from("registrants")
      .delete()
      .eq("registration_id", data.id);
    if (delMembers) throw new Error(delMembers.message);

    const { error } = await supabaseAdmin.from("registrations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      action: "registration.delete",
      entity_type: "registration",
      entity_id: data.id,
      summary: `Deleted registration${existing?.team_name ? ` "${existing.team_name}"` : ""}`,
      details: (existing ?? {}) as never,
    });

    return { ok: true };
  });

export const updateRegistrationAsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        teamName: z.string().trim().max(80).nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: before } = await supabaseAdmin
      .from("registrations")
      .select("team_name")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("registrations")
      .update({ team_name: data.teamName || null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      action: "registration.update",
      entity_type: "registration",
      entity_id: data.id,
      summary: `Renamed team "${before?.team_name ?? "—"}" → "${data.teamName || "—"}"`,
      details: { before: before?.team_name ?? null, after: data.teamName || null } as never,
    });

    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("audit_logs")
      .select("id, actor_email, action, entity_type, entity_id, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
