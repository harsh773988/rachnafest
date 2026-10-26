import { Link } from "@tanstack/react-router";
import { Instagram, Ticket } from "lucide-react";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Schedule", to: "/schedule" },
  { label: "Register", to: "/register" },
  { label: "Contact", to: "/contact" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full" style={{ mixBlendMode: "difference" }}>
      <nav className="flex items-center justify-between px-5 py-5 md:px-10">
        <Link to="/" className="display text-[24px] leading-none text-background">
          Rachna 2K26
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="nav-link text-background">
              {l.label}
            </Link>
          ))}
          <a
            href="https://instagram.com/rachnafest"
            target="_blank"
            rel="noreferrer"
            className="nav-link text-background"
          >
            Gallery
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/rachnafest"
            target="_blank"
            rel="noreferrer"
            aria-label="Rachna Fest on Instagram"
            className="text-background transition-transform duration-300 hover:scale-110"
          >
            <Instagram size={20} />
          </a>
          <Link
            to="/register"
            className="nav-link flex items-center gap-2 border border-background px-3 py-2 text-background"
          >
            <Ticket size={14} /> Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
