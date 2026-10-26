import { supabase } from "@/integrations/supabase/client";

export type ParticipationType = "individual" | "group";

export type EventRow = {
  id: string;
  name: string;
  slug: string;
  day: number;
  event_date: string | null;
  participation_type: ParticipationType;
  category: string | null;
  description: string | null;
  registrable: boolean;
  sort_order: number;
};

export const DAY_DATES: Record<number, string> = {
  1: "30 Nov",
  2: "1 Dec",
  3: "2 Dec",
  4: "4 Dec",
  5: "5 Dec",
};

export const DAYS = [
  { day: 1, label: "DAY 01", tag: "OPENING", date: "30 Nov" },
  { day: 2, label: "DAY 02", tag: "CULTURE / ESPORTS", date: "1 Dec" },
  { day: 3, label: "DAY 03", tag: "SPORTS", date: "2 Dec" },
  { day: 4, label: "DAY 04", tag: "CARNIVAL", date: "4 Dec" },
  { day: 5, label: "DAY 05", tag: "FINALE", date: "5 Dec" },
];

export const DEFAULT_ENGIFUSION: EventRow = {
  id: "e0111111-1111-4111-a111-111111111101",
  name: "EngiFusion",
  slug: "engifusion",
  day: 1,
  event_date: "30 Nov",
  participation_type: "group",
  category: "Creative",
  description: "Engineering fusion challenge.",
  registrable: true,
  sort_order: 3,
};

export async function fetchEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  let list = (data ?? []) as EventRow[];

  // Ensure EngiFusion is present on Day 1
  if (!list.some((e) => e.slug === "engifusion")) {
    list.push(DEFAULT_ENGIFUSION);
  }

  // Ensure BGMI Cup and Free Fire Cup are group events and dates are populated
  list = list.map((e) => {
    let item = e;
    if ((item.slug === "bgmi-cup" || item.slug === "free-fire-cup") && item.participation_type !== "group") {
      item = { ...item, participation_type: "group" as ParticipationType };
    }
    if (!item.event_date || item.event_date.toLowerCase() === "tba") {
      item = { ...item, event_date: DAY_DATES[item.day] ?? null };
    }
    return item;
  });

  return list.sort((a, b) => a.sort_order - b.sort_order);
}

export const eventsQuery = {
  queryKey: ["events"],
  queryFn: fetchEvents,
  staleTime: 60_000,
};

export type MemberInput = {
  name: string;
  branch: string;
  collegeName: string;
  mobile: string;
  email: string;
};

export async function submitRegistration(params: {
  eventId: string;
  teamName?: string | null;
  members: MemberInput[];
  source?: "public" | "admin";
  createdBy?: string | null;
}) {
  const { createRegistration } = await import("./registrations.functions");
  const result = await createRegistration({
    data: {
      eventId: params.eventId,
      teamName: params.teamName ?? null,
      members: params.members.map((m) => ({
        name: m.name.trim(),
        branch: m.branch.trim(),
        collegeName: m.collegeName.trim(),
        mobile: m.mobile.trim(),
        email: m.email.trim(),
      })),
      source: params.source ?? "public",
      createdBy: params.createdBy ?? null,
    },
  });
  return result.id;
}
