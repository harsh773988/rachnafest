import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-background pt-20">
      <div className="grid grid-cols-1 gap-12 px-5 md:grid-cols-4 md:px-10">
        <div>
          <h3 className="display mb-4 text-[20px]">Team Kalki</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {/* PLACEHOLDER COPY — replace with the official Team Kalki blurb */}
            The student collective behind Rachna 2K26 at K.K. Group of Institutions, Dhanbad.
          </p>
        </div>

        <div>
          <h3 className="display mb-4 text-[20px]">Quick Links</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <Link to="/events" className="nav-link">
                Events
              </Link>
            </li>
            <li>
              <Link to="/schedule" className="nav-link">
                Schedule
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </li>
            <li>
              <Link to="/admin" className="nav-link">
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="display mb-4 text-[20px]">Contact</h3>
          <div className="flex flex-col gap-2">
            <a href="mailto:teamkalki08@gmail.com" className="nav-link">
              teamkalki08@gmail.com
            </a>
            <a href="mailto:rachnafest@kkcemdhanbad.ac.in" className="nav-link break-all">
              rachnafest@kkcemdhanbad.ac.in
            </a>
          </div>
          <p className="meta mt-4 text-muted-foreground">K.K. Group of Institutions, Dhanbad</p>
        </div>

        <div>
          <h3 className="display mb-4 text-[20px]">Follow</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="https://instagram.com/teamkalkiofficials"
                target="_blank"
                rel="noreferrer"
                className="nav-link"
              >
                @teamkalkiofficials
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/rachnafest"
                target="_blank"
                rel="noreferrer"
                className="nav-link"
              >
                @rachnafest
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 bg-ink px-5 py-12 md:px-10">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="meta text-background/70">Newsletter</p>
            <h4 className="display mt-2 text-[32px] text-background">Get the drop</h4>
          </div>
          <form
            className="flex items-end gap-4 md:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                toast.error("Enter a valid email");
                return;
              }
              toast.success("You're on the list.");
              setEmail("");
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address for the Rachna 2K26 newsletter
            </label>
            <input
              id="newsletter-email"
              name="newsletter-email"
              type="email"
              aria-label="Email address for the Rachna 2K26 newsletter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="YOUR EMAIL"
              className="w-full border-0 border-b border-background/40 bg-transparent pb-2 font-mono text-sm uppercase tracking-widest text-background outline-none placeholder:text-background/40 focus:border-neon"
            />

            <button
              type="submit"
              className="bg-neon px-6 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden px-5 pt-10 pb-4 md:px-10">
        <p className="display leading-none text-border" style={{ fontSize: "8vw" }}>
          Rachna
        </p>
        <p className="meta pb-6 text-muted-foreground">
          © {new Date().getFullYear()} Team Kalki — All rights reserved
        </p>
      </div>
    </footer>
  );
}
