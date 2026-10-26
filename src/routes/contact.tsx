import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Rachna 2K26 | Team Kalki, Dhanbad" },
      {
        name: "description",
        content:
          "Reach Team Kalki for Rachna 2K26 sponsorships, participation and queries at teamkalki08@gmail.com and rachnafest@kkcemdhanbad.ac.in.",
      },
      { property: "og:title", content: "Contact Team Kalki — Rachna 2K26" },
      {
        property: "og:description",
        content: "Sponsorship, participation and press queries for Rachna 2K26.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell>
      <section className="px-5 pt-16 pb-10 md:px-10">
        <p className="meta text-muted-foreground">Reach / Team Kalki</p>
        <h1 className="display mt-4" style={{ fontSize: "13vw" }}>
          Contact
        </h1>
      </section>

      <div className="grid grid-cols-1 gap-10 border-t border-border px-5 py-16 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="meta">Email</p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href="mailto:teamkalki08@gmail.com"
              className="display block text-[clamp(1.2rem,2.8vw,2.4rem)] hover:text-primary break-all"
            >
              teamkalki08@gmail.com
            </a>
            <a
              href="mailto:rachnafest@kkcemdhanbad.ac.in"
              className="display block text-[clamp(1.2rem,2.8vw,2.4rem)] hover:text-primary break-all"
            >
              rachnafest@kkcemdhanbad.ac.in
            </a>
          </div>
        </div>
        <div className="md:col-span-4 md:mt-20">
          <p className="meta">Instagram</p>
          <a
            href="https://instagram.com/teamkalkiofficials"
            target="_blank"
            rel="noreferrer"
            className="nav-link mt-4 block"
          >
            @teamkalkiofficials
          </a>
          <a
            href="https://instagram.com/rachnafest"
            target="_blank"
            rel="noreferrer"
            className="nav-link mt-4 block"
          >
            @rachnafest
          </a>
        </div>
        <div className="md:col-span-3 md:mt-10">
          <p className="meta">Venue</p>
          <p className="mt-3 text-lg uppercase">
            K.K. Group of Institutions,
            <br />
            Dhanbad, Jharkhand
          </p>
        </div>
      </div>
    </PageShell>
  );
}
