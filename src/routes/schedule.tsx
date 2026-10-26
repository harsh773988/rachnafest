import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { DayRibbon } from "@/components/DayRibbon";
import { DAYS, eventsQuery } from "@/lib/events";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Rachna 2K26 | 5 Days at K.K. Group, Dhanbad" },
      {
        name: "description",
        content:
          "Day-wise schedule of Rachna 2K26: opening hawan, cultural nights, esports cups, sports leagues, carnival and celebrity night.",
      },
      { property: "og:title", content: "Schedule — Rachna 2K26" },
      {
        property: "og:description",
        content: "Day-wise line-up for the five days of Rachna 2K26.",
      },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { data: events = [] } = useQuery(eventsQuery);

  return (
    <PageShell>
      <section className="px-5 pt-16 pb-10 md:px-10">
        <p className="meta text-muted-foreground">
          Timeline / 30 Nov – 5 Dec 2026
        </p>
        <h1 className="display mt-4" style={{ fontSize: "13vw" }}>
          Schedule
        </h1>
      </section>

      {DAYS.map(({ day, tag }) => {
        const dayEvents = events.filter((e) => e.day === day);
        return (
          <section key={day} className="mb-10">
            <DayRibbon day={day} tag={tag} date={dayEvents[0]?.event_date} />
            <ul className="grid grid-cols-1 gap-x-8 px-5 py-10 md:grid-cols-12 md:px-10">
              {dayEvents.map((e, i) => (
                <li
                  key={e.id}
                  className={`group border-b border-border py-4 ${
                    i % 2 === 0 ? "md:col-span-7" : "md:col-span-5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4 transition-colors duration-300 group-hover:border-primary">
                    <span className="display text-[clamp(1.2rem,2vw,1.8rem)]">{e.name}</span>
                    <span className="meta text-muted-foreground">
                      {e.participation_type === "group" ? "Group" : "Individual"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="meta text-secondary">{e.event_date ?? "Date TBA"}</span>
                    {e.registrable && (
                      <Link
                        to="/register/$slug"
                        params={{ slug: e.slug }}
                        className="nav-link text-primary"
                      >
                        Register
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </PageShell>
  );
}
