import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { EventCard } from "@/components/EventCard";
import { eventsQuery } from "@/lib/events";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Rachna 2K26 | Team Kalki" },
      {
        name: "description",
        content:
          "All competitions at Rachna 2K26: art, dance, music, fashion, BGMI, Free Fire, volleyball, basketball, chess, sprint and more.",
      },
      { property: "og:title", content: "Events — Rachna 2K26" },
      {
        property: "og:description",
        content: "Every competition at Rachna 2K26, individual and group entries.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading } = useQuery(eventsQuery);
  const cards = events.filter((e) => e.registrable);

  return (
    <PageShell>
      <section className="px-5 pt-16 pb-10 md:px-10">
        <p className="meta text-muted-foreground">Index / Competitions</p>
        <h1 className="display mt-4" style={{ fontSize: "13vw" }}>
          Events
        </h1>
      </section>

      <div className="grid grid-cols-1 gap-x-6 gap-y-14 border-t border-border px-5 pt-14 pb-24 md:grid-cols-12 md:px-10">
        <h2 className="meta md:col-span-12">All competitions</h2>
        {isLoading && <p className="meta md:col-span-12">Loading events…</p>}

        {cards.map((e) => {
          return <EventCard key={e.id} event={e} className="md:col-span-4" aspect="4/3" />;
        })}
      </div>
    </PageShell>
  );
}
