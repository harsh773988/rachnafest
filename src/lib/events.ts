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
  4: "3 Dec",
  5: "4 Dec",
  6: "5 Dec",
};

export const DAYS = [
  { day: 1, label: "DAY 01", tag: "OPENING", date: "30 Nov" },
  { day: 2, label: "DAY 02", tag: "CULTURE / ESPORTS", date: "1 Dec" },
  { day: 3, label: "DAY 03", tag: "SPORTS", date: "2 Dec" },
  { day: 4, label: "DAY 04", tag: "CULTURAL", date: "3 Dec" },
  { day: 5, label: "DAY 05", tag: "CARNIVAL", date: "4 Dec" },
  { day: 6, label: "DAY 06", tag: "FINALE", date: "5 Dec" },
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

/**
 * Canonical day assignments for every event slug.
 * This overrides whatever the DB says so the schedule page always
 * reflects the latest plan.
 */
const SLUG_DAY: Record<string, number> = {
  // Day 1 — Opening (30 Nov)
  hawan: 1,
  "poster-launch": 1,
  engifusion: 1,
  "art-and-craft": 1,
  "tug-of-war": 1,
  "rangoli-competition": 1,

  // Day 2 — Culture / Esports (1 Dec)
  "road-art": 2,
  "bgmi-cup": 2,
  "free-fire-cup": 2,
  "real-cricket": 2,
  "wall-art": 2,
  "treasure-hunt": 2,

  // Day 3 — Sports (2 Dec)
  sprint: 3,
  "badminton-league": 3,
  "basketball-league": 3,
  "volleyball-league": 3,
  "chess-championship": 3,

  // Day 4 — Cultural (3 Dec)
  "fashion-fiesta": 4,
  "singing-competition": 4,
  "dance-competition": 4,
  "cube-competition": 4,
  "kabaddi-competition": 4,

  // Day 5 — Carnival (4 Dec)
  "food-stall-zone": 5,
  "photo-booth": 5,
  "dance-and-singing-open": 5,
  "dj-night": 5,

  // Day 6 — Finale (5 Dec)
  "celebrity-night": 6,
};

/** New events that might not exist in the DB yet */
export const FALLBACK_EVENTS: EventRow[] = [
  {
    id: "e0222222-2222-4222-a222-222222222201",
    name: "Real Cricket",
    slug: "real-cricket",
    day: 2,
    event_date: "1 Dec",
    participation_type: "individual",
    category: "Esports",
    description: "Real Cricket mobile gaming tournament.",
    registrable: true,
    sort_order: 206,
  },
  {
    id: "e0333333-3333-4333-a333-333333333301",
    name: "Cube Competition",
    slug: "cube-competition",
    day: 4,
    event_date: "3 Dec",
    participation_type: "individual",
    category: "Creative",
    description: "Rubik's Cube speed-solving competition.",
    registrable: true,
    sort_order: 405,
  },
  {
    id: "e0444444-4444-4444-a444-444444444401",
    name: "Kabaddi Competition",
    slug: "kabaddi-competition",
    day: 4,
    event_date: "3 Dec",
    participation_type: "group",
    category: "Sports",
    description: "Inter-college Kabaddi tournament.",
    registrable: true,
    sort_order: 406,
  },
];

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

  // Add any fallback events that aren't already in the DB
  for (const fb of FALLBACK_EVENTS) {
    if (!list.some((e) => e.slug === fb.slug)) {
      list.push(fb);
    }
  }

  // Apply canonical day assignments & fix participation types / dates
  list = list.map((e) => {
    let item = e;

    // Override day if we have a canonical mapping
    const canonicalDay = SLUG_DAY[item.slug];
    if (canonicalDay !== undefined && item.day !== canonicalDay) {
      item = { ...item, day: canonicalDay };
    }

    // Ensure BGMI Cup and Free Fire Cup are group events
    if ((item.slug === "bgmi-cup" || item.slug === "free-fire-cup") && item.participation_type !== "group") {
      item = { ...item, participation_type: "group" as ParticipationType };
    }

    // Fill missing dates from DAY_DATES
    if (!item.event_date || item.event_date.toLowerCase() === "tba") {
      item = { ...item, event_date: DAY_DATES[item.day] ?? null };
    } else {
      // Also update event_date to match the new day
      const correctDate = DAY_DATES[item.day];
      if (correctDate && item.event_date !== correctDate) {
        item = { ...item, event_date: correctDate };
      }
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
