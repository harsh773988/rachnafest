import { DAY_DATES } from "@/lib/events";

export function DayRibbon({ day, tag, date }: { day: number; tag: string; date?: string | null }) {
  const displayDate = date || DAY_DATES[day] || "DATE TBA";

  return (
    <div className="border-y border-border py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 md:px-10">
        <h2
          className="display text-secondary"
          style={{ fontSize: "12vw", letterSpacing: "-0.05em" }}
        >
          Day {String(day).padStart(2, "0")}
        </h2>
        <span className="meta text-muted-foreground">
          {tag} — {displayDate}
        </span>
      </div>
    </div>
  );
}
