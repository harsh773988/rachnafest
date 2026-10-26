import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { EventCard } from "@/components/EventCard";
import { DayRibbon } from "@/components/DayRibbon";
import { DAYS, eventsQuery } from "@/lib/events";
import hero from "@/assets/hero-crowd.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rachna 2K26 — Annual Fest of K.K. Group of Institutions" },
      {
        name: "description",
        content:
          "Rachna 2K26 by Team Kalki: five days of dance, music, sports, esports and art at K.K. Group of Institutions, Dhanbad. Register now.",
      },
      { property: "og:title", content: "Rachna 2K26 — Annual Fest by Team Kalki" },
      {
        property: "og:description",
        content:
          "Five days of dance, music, sports, esports and art at K.K. Group of Institutions, Dhanbad.",
      },
      { property: "og:url", content: "https://rachna2k26.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://rachna2k26.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Festival",
          name: "Rachna 2K26",
          description:
            "The annual fest of K.K. Group of Institutions, Dhanbad, organized by Team Kalki — five days of culture, sports, esports and art.",
          url: "https://rachna2k26.lovable.app/",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
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
            url: "https://rachna2k26.lovable.app/",
          },
        }),
      },
    ],
  }),
  component: Home,
});

const HIDDEN_HOME_SLUGS = new Set([
  "reel-making",
  "food-stall-zone",
  "photo-booth",
  "dance-and-singing-open",
]);

function isHiddenOnHome(event: { slug: string; name: string }) {
  if (HIDDEN_HOME_SLUGS.has(event.slug)) return true;
  const name = event.name.toLowerCase();
  return (
    name.includes("reel making") ||
    name.includes("food stall") ||
    name.includes("photo booth") ||
    name.includes("dance & singing") ||
    name.includes("dance and singing")
  );
}

function Home() {
  const { data: events = [] } = useQuery(eventsQuery);
  const visibleEvents = events.filter((e) => !isHiddenOnHome(e));
  const cards = visibleEvents.filter((e) => e.registrable);

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative -mt-[76px] flex h-screen flex-col justify-end overflow-hidden bg-ink">
        <img
          src={hero}
          alt="Rachna fest crowd at night"
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover opacity-70 saturate-150 contrast-110"
        />
        <div className="relative px-5 pb-6 md:px-10">
          <h1
            className="display text-background"
            style={{ lineHeight: 0.75, letterSpacing: "-0.05em" }}
          >
            <span className="block text-primary" style={{ fontSize: "clamp(4rem, 16vw, 13.5vw)" }}>
              Rachna
            </span>
            <span
              className="block"
              style={{ fontSize: "clamp(4rem, 16vw, 13.5vw)", marginLeft: "20vw" }}
            >
              2K26
            </span>
            <span className="sr-only">Annual Fest of K.K. Group of Institutions, Dhanbad</span>
          </h1>

          <div className="mt-8 flex flex-col gap-6 border border-background p-5 md:flex-row md:items-center md:justify-between">
            <p className="meta text-background">
              Team Kalki × K.K. Group of Institutions, Dhanbad — 5 Days / 30 Nov – 5 Dec
            </p>
            <Link to="/register" className="btn-brutal">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="grid grid-cols-1 gap-8 px-5 py-24 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <div className="border-t border-ink pt-3">
            <p className="meta">Manifesto</p>
          </div>
        </div>
        <div className="md:col-span-8">
          {/* PLACEHOLDER COPY — replace with Team Kalki's final theme statement */}
          <p className="text-[clamp(1.6rem,3vw,3rem)] leading-tight font-medium uppercase">
            <span className="inline-block w-[3rem]" />
            Rachna is not a schedule of events. It is five days where the campus stops behaving and
            starts <span className="text-secondary">creating</span>. Paint on walls, dust on the
            track, bass in the ground — <span className="text-secondary">ordered chaos</span>, built
            by students, for students. Team Kalki brings the frame; you bring the noise.
          </p>
        </div>
      </section>

      {/* DAY-WISE SCHEDULE + EVENT GRIDS */}
      {DAYS.map(({ day, tag }) => {
        const dayEvents = visibleEvents.filter((e) => e.day === day);
        if (dayEvents.length === 0) return null;
        return (
          <section key={day} className="mb-16">
            <DayRibbon day={day} tag={tag} date={dayEvents[0]?.event_date} />
            <div className="grid grid-cols-1 gap-x-6 gap-y-14 px-5 pt-14 md:grid-cols-12 md:px-10">
              {dayEvents.map((e) => {
                return <EventCard key={e.id} event={e} className="md:col-span-4" aspect="4/3" />;
              })}
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="border-t border-border px-5 py-24 md:px-10">
        <p className="meta text-muted-foreground">{cards.length} events open for registration</p>
        <h2 className="display mt-4" style={{ fontSize: "10vw" }}>
          Enter the fest
        </h2>
        <Link to="/register" className="btn-brutal mt-8">
          Register Now
        </Link>
      </section>
    </PageShell>
  );
}
