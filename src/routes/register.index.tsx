import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { eventsQuery } from "@/lib/events";

export const Route = createFileRoute("/register/")({
  head: () => ({
    meta: [
      { title: "Register — Rachna 2K26 | Team Kalki" },
      {
        name: "description",
        content:
          "Pick your competition and register for Rachna 2K26 at K.K. Group of Institutions, Dhanbad. Individual and team entries open.",
      },
      { property: "og:title", content: "Register — Rachna 2K26" },
      {
        property: "og:description",
        content: "Individual and team entries are open for Rachna 2K26.",
      },
    ],
  }),
  component: RegisterIndex,
});

function RegisterIndex() {
  const { data: events = [], isLoading } = useQuery(eventsQuery);
  const open = events.filter((e) => e.registrable);

  return (
    <PageShell>
      <section className="px-5 pt-16 pb-10 md:px-10">
        <p className="meta text-muted-foreground">Entry / Select an event</p>
        <h1 className="display mt-4" style={{ fontSize: "13vw" }}>
          Register
        </h1>
      </section>

      <div className="grid grid-cols-1 gap-x-8 border-t border-border px-5 py-14 md:grid-cols-12 md:px-10">
        {isLoading && <p className="meta md:col-span-12">Loading…</p>}
        {open.map((e, i) => (
          <Link
            key={e.id}
            to="/register/$slug"
            params={{ slug: e.slug }}
            className={`group border-b border-border py-6 transition-colors duration-300 hover:border-primary ${
              i % 3 === 0
                ? "md:col-span-6"
                : i % 3 === 1
                  ? "md:col-span-4"
                  : "md:col-span-5 md:col-start-3"
            }`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="display text-[clamp(1.4rem,2.4vw,2.2rem)] group-hover:text-primary">
                {e.name}
              </span>
              <span className="meta text-muted-foreground">Day {e.day}</span>
            </div>
            <span className="meta mt-2 inline-block text-secondary">
              {e.participation_type === "group" ? "Team Entry" : "Solo Entry"}
            </span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
