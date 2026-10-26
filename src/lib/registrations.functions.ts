import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const memberSchema = z.object({
  name: z.string().trim().min(2).max(100),
  branch: z.string().trim().min(1).max(100),
  collegeName: z.string().trim().min(2).max(150),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/),
  email: z.string().trim().email().max(255),
});

const payloadSchema = z.object({
  eventId: z.string().uuid(),
  teamName: z.string().trim().max(80).nullable().optional(),
  members: z.array(memberSchema).min(1).max(25),
  source: z.enum(["public", "admin"]).default("public"),
  createdBy: z.string().uuid().nullable().optional(),
});

export const createRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => payloadSchema.parse(data))
  .handler(async ({ data }) => {
    const registrationId = crypto.randomUUID();

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL,
    );

    if (hasServiceKey) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: initialEvent, error: eventError } = await supabaseAdmin
        .from("events")
        .select("id, registrable")
        .eq("id", data.eventId)
        .maybeSingle();

      if (eventError) throw new Error(eventError.message);

      let event = initialEvent;

      // If event not found yet in database (e.g. EngiFusion), ensure it exists in events table
      if (!event) {
        const { DEFAULT_ENGIFUSION } = await import("./events");
        if (data.eventId === DEFAULT_ENGIFUSION.id) {
          const { data: upserted, error: upsertError } = await supabaseAdmin
            .from("events")
            .upsert(
              {
                id: DEFAULT_ENGIFUSION.id,
                name: DEFAULT_ENGIFUSION.name,
                slug: DEFAULT_ENGIFUSION.slug,
                day: DEFAULT_ENGIFUSION.day,
                participation_type: DEFAULT_ENGIFUSION.participation_type,
                category: DEFAULT_ENGIFUSION.category,
                registrable: DEFAULT_ENGIFUSION.registrable,
                sort_order: DEFAULT_ENGIFUSION.sort_order,
                description: DEFAULT_ENGIFUSION.description,
              },
              { onConflict: "slug" },
            )
            .select("id, registrable")
            .maybeSingle();

          if (upsertError) {
            console.error("Failed to auto-upsert EngiFusion", upsertError);
          } else if (upserted) {
            event = upserted;
            data.eventId = upserted.id;
          }
        }
      }

      if (!event || !event.registrable) throw new Error("Event is not open for registration");

      const { error: regError } = await supabaseAdmin.from("registrations").insert({
        id: registrationId,
        event_id: data.eventId,
        team_name: data.teamName || null,
        source: data.source,
        created_by: data.createdBy ?? null,
      });
      if (regError) throw new Error(regError.message);

      const { error: memberError } = await supabaseAdmin.from("registrants").insert(
        data.members.map((m) => ({
          registration_id: registrationId,
          name: m.name,
          branch: m.branch,
          college_name: m.collegeName,
          mobile: m.mobile,
          email: m.email,
        })),
      );
      if (memberError) throw new Error(memberError.message);

      return { id: registrationId };
    }

    // SUPABASE_SERVICE_ROLE_KEY is required for registrations to work.
    // In production (e.g. Vercel), the filesystem is read-only so the old
    // local-file fallback cannot work. Throw a clear error instead.
    throw new Error(
      "Registration failed: SUPABASE_SERVICE_ROLE_KEY is not configured. " +
      "Please set the SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL environment variables.",
    );
  });

export const listLocalRegistrations = createServerFn({ method: "GET" }).handler(async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const localFile = path.join(process.cwd(), "local-registrations.json");
  try {
    const content = await fs.readFile(localFile, "utf-8");
    const list = JSON.parse(content);
    if (Array.isArray(list)) return list;
  } catch {
    // file does not exist yet
  }
  return [];
});
