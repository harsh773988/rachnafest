import { Link } from "@tanstack/react-router";
import type { EventRow } from "@/lib/events";
import sports from "@/assets/cat-sports.jpg";
import cultural from "@/assets/cat-cultural.jpg";
import creative from "@/assets/cat-creative.jpg";
import esports from "@/assets/cat-esports.jpg";
import crowd from "@/assets/hero-crowd.jpg";
import engifusion from "@/assets/events/engifusion.jpg";
import hawan from "@/assets/events/hawan.jpg";
import posterLaunch from "@/assets/events/poster-launch.png";
import artAndCraft from "@/assets/events/art-and-craft.png";
import tugOfWar from "@/assets/events/tug-of-war.jpg";
import fashionFiesta from "@/assets/events/fashion-fiesta.jpg";
import danceCompetition from "@/assets/events/dance-competition.png";
import singingCompetition from "@/assets/events/singing-competition.webp";
import bgmiCup from "@/assets/events/bgmi-cup.jpg";
import freeFireCup from "@/assets/events/free-fire-cup.png";
import roadArt from "@/assets/events/road-art.jpg";
import wallArt from "@/assets/events/wall-art.jpg";
import treasureHunt from "@/assets/events/treasure-hunt.jpg";
import volleyballLeague from "@/assets/events/volleyball-league.jpg";
import basketballLeague from "@/assets/events/basketball-league.jpg";
import badmintonLeague from "@/assets/events/badminton-league.jpg";
import sprint from "@/assets/events/sprint.jpg";
import chessChampionship from "@/assets/events/chess-championship.jpg";
import djNight from "@/assets/events/dj-night.jpg";
import celebrityNight from "@/assets/events/celebrity-night.jpg";
import rangoli from "@/assets/events/rangoli.jpg";

const IMAGES: Record<string, string> = {
  Sports: sports,
  Cultural: cultural,
  Creative: creative,
  Esports: esports,
  Fun: crowd,
  Ceremony: crowd,
};

const EVENT_IMAGES: Record<string, string> = {
  engifusion: engifusion,
  hawan: hawan,
  "poster-launch": posterLaunch,
  "art-and-craft": artAndCraft,
  "tug-of-war": tugOfWar,
  "fashion-fiesta": fashionFiesta,
  "dance-competition": danceCompetition,
  "singing-competition": singingCompetition,
  "bgmi-cup": bgmiCup,
  "free-fire-cup": freeFireCup,
  "road-art": roadArt,
  "wall-art": wallArt,
  "treasure-hunt": treasureHunt,
  "volleyball-league": volleyballLeague,
  "basketball-league": basketballLeague,
  "badminton-league": badmintonLeague,
  sprint: sprint,
  "chess-championship": chessChampionship,
  "dj-night": djNight,
  "celebrity-night": celebrityNight,
  "rangoli-competition": rangoli,
};

export function EventCard({
  event,
  className = "",
  aspect = "4/5",
}: {
  event: EventRow;
  className?: string;
  aspect?: string;
}) {
  const img = EVENT_IMAGES[event.slug] ?? IMAGES[event.category ?? ""] ?? crowd;

  return (
    <article className={`group relative ${className}`}>
      <div className="card-media relative border border-ink" style={{ aspectRatio: aspect }}>
        <img src={img} alt={event.name} loading="lazy" width={800} height={1000} />
        {event.registrable && (
          <Link
            to="/register/$slug"
            params={{ slug: event.slug }}
            className="absolute top-0 right-0 bg-neon px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
          >
            Register
          </Link>
        )}
      </div>

      <div className="mt-4 border-b border-border pb-3 transition-colors duration-300 group-hover:border-primary">
        <h3 className="display text-[clamp(1.3rem,2.2vw,2rem)]">{event.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="meta text-muted-foreground">
            {event.participation_type === "group" ? "Group" : "Individual"}
          </span>
          <span className="meta text-secondary">
            Day {event.day} / {event.category ?? "Fest"}
          </span>
        </div>
      </div>
    </article>
  );
}
