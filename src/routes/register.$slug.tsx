import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { RegistrationForm } from "@/components/RegistrationForm";
import { DAY_DATES, eventsQuery, fetchEvents } from "@/lib/events";
import { EVENT_COORDINATORS } from "@/lib/event-coordinators";

function formatWhatsapp(whatsapp: string) {
  return `+${whatsapp.slice(0, 2)} ${whatsapp.slice(2)}`;
}

const SITE = "https://rachna2k26.lovable.app";

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/register/$slug")({
  loader: async ({ params, context }) => {
    let name = titleCase(params.slug);
    let description: string | null = null;
    let eventDate: string | null = null;
    let event = null;
    try {
      const events = await context.queryClient.ensureQueryData({
        ...eventsQuery,
        queryFn: fetchEvents,
      });
      const match = events.find((e) => e.slug === params.slug);
      if (match) {
        event = match;
        name = match.name;
        description = match.description;
        eventDate = match.event_date;
      }
    } catch (error) {
      console.error("register/$slug loader", error);
    }
    return { name, description, eventDate, slug: params.slug, event };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Event";
    const url = `${SITE}/register/${loaderData?.slug ?? ""}`;
    const title = `Register: ${name} — Rachna 2K26`;
    const description =
      loaderData?.description?.trim() ||
      `Enter ${name} at Rachna 2K26, the annual fest of K.K. Group of Institutions, Dhanbad. Solo and team entries handled here.`;

    return {
      meta: [
        { title: title.slice(0, 60) },
        { name: "description", content: description.slice(0, 160) },
        { property: "og:title", content: `Register: ${name} — Rachna 2K26` },
        { property: "og:description", content: description.slice(0, 160) },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: `${name} — Rachna 2K26`,
            ...(loaderData?.eventDate ? { startDate: loaderData.eventDate } : {}),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            url,
            location: {
              "@type": "Place",
              name: "K.K. Group of Institutions",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dhanbad",
                addressRegion: "Jharkhand",
                addressCountry: "IN",
              },
            },
            organizer: {
              "@type": "Organization",
              name: "Team Kalki",
              url: SITE,
            },
            ...(description ? { description } : {}),
          }),
        },
      ],
    };
  },
  component: RegisterEvent,
});

function RegisterEvent() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data: events = [], isLoading } = useQuery(eventsQuery);
  const event = events.find((e) => e.slug === slug) ?? loaderData.event;

  return (
    <PageShell>
      <section className="px-5 pt-16 pb-8 md:px-10">
        <Link to="/register" className="nav-link text-muted-foreground">
          ← All events
        </Link>
        <h1 className="display mt-6" style={{ fontSize: "clamp(3rem,9vw,8rem)" }}>
          {event?.name ?? (isLoading ? "Loading" : "Not found")}
        </h1>
        {event?.description && (
          <p className="mt-4 max-w-2xl text-lg uppercase">{event.description}</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 px-5 pb-24 md:grid-cols-12 md:px-10">
        <div className="md:col-span-8">
          <h2 className="meta mb-4 text-muted-foreground">Entry form</h2>

          {event ? (
            <RegistrationForm event={event} />
          ) : (
            !isLoading && <p className="meta text-primary">This event does not exist.</p>
          )}
        </div>
        <aside className="md:col-span-4 md:mt-16">
          <div className="border-t border-ink pt-4">
            <p className="meta">Info</p>
            <ul className="mt-4 flex flex-col gap-3 font-mono text-xs uppercase tracking-widest">
              <li>Day {event?.day ?? "—"}</li>
              <li>Date: {event?.event_date || (event?.day ? DAY_DATES[event.day] : null) || "TBA"}</li>
              <li>Type: {event?.participation_type === "group" ? "Group / Team" : "Individual"}</li>
              <li>Venue: K.K. Group of Institutions, Dhanbad</li>
              <li>
                Queries:
                <div className="mt-1 flex flex-col gap-1">
                  <a className="text-primary hover:underline" href="mailto:teamkalki08@gmail.com">
                    teamkalki08@gmail.com
                  </a>
                  <a
                    className="text-primary hover:underline break-all"
                    href="mailto:rachnafest@kkcemdhanbad.ac.in"
                  >
                    rachnafest@kkcemdhanbad.ac.in
                  </a>
                </div>
              </li>
            </ul>
          </div>
          {(EVENT_COORDINATORS[slug] ?? []).length > 0 && (
            <div className="mt-8 border-t border-ink pt-4">
              <p className="meta">Coordinators</p>
              <ul className="mt-4 flex flex-col gap-3 font-mono text-xs uppercase tracking-widest">
                {(EVENT_COORDINATORS[slug] ?? []).map((coordinator) => (
                  <li key={coordinator.name}>
                    <p>{coordinator.name}</p>
                    {coordinator.whatsapp ? (
                      <a
                        className="text-primary"
                        href={`https://wa.me/${coordinator.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {formatWhatsapp(coordinator.whatsapp)}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">WhatsApp: TBA</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
