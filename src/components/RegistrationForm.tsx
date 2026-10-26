import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { submitRegistration, type EventRow, type MemberInput } from "@/lib/events";
import { getEventCoordinators } from "@/lib/event-coordinators";

const memberSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  branch: z.string().trim().min(1, "Branch is required").max(100),
  collegeName: z.string().trim().min(2, "College is required").max(150),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255),
});

const emptyMember = (college = ""): MemberInput => ({
  name: "",
  branch: "",
  collegeName: college,
  mobile: "",
  email: "",
});

const FIELDS: { key: keyof MemberInput; label: string; type?: string }[] = [
  { key: "name", label: "Full Name" },
  { key: "branch", label: "Branch" },
  { key: "collegeName", label: "College Name" },
  { key: "mobile", label: "Mobile Number", type: "tel" },
  { key: "email", label: "Email", type: "email" },
];

export function RegistrationForm({
  event,
  source = "public",
  createdBy = null,
  onDone,
}: {
  event: EventRow;
  source?: "public" | "admin";
  createdBy?: string | null;
  onDone?: () => void;
}) {
  const isGroup = event.participation_type === "group";
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<MemberInput[]>([emptyMember()]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<{
    teamName: string | null;
    members: MemberInput[];
  } | null>(null);
  const coordinators = getEventCoordinators(event.slug);

  function update(i: number, key: keyof MemberInput, value: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isGroup && teamName.trim().length < 2) {
      toast.error("Team name is required");
      return;
    }
    for (const [i, m] of members.entries()) {
      const parsed = memberSchema.safeParse(m);
      if (!parsed.success) {
        toast.error(`Member ${i + 1}: ${parsed.error.issues[0].message}`);
        return;
      }
    }
    setSaving(true);
    try {
      await submitRegistration({
        eventId: event.id,
        teamName: isGroup ? teamName : null,
        members,
        source,
        createdBy,
      });
      toast.success("Registration recorded");
      setSubmitted({
        teamName: isGroup ? teamName.trim() : null,
        members: members.map((member) => ({ ...member })),
      });
      setTeamName("");
      setMembers([emptyMember()]);
      onDone?.();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message ? err.message : "Could not submit. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    const whatsappMessage = [
      `Rachna 2K26 Registration — ${event.name}`,
      submitted.teamName ? `Team: ${submitted.teamName}` : "Entry: Individual",
      "",
      ...submitted.members.flatMap((member, index) => [
        `${isGroup ? `Member ${index + 1}` : "Participant"}: ${member.name}`,
        `Branch: ${member.branch}`,
        `College: ${member.collegeName}`,
        `Mobile: ${member.mobile}`,
        `Email: ${member.email}`,
        "",
      ]),
    ].join("\n");

    return (
      <div className="border border-ink bg-neon p-8 shadow-[8px_8px_0_var(--ink)]">
        <p className="meta text-ink">Status / Confirmed</p>
        <h3 className="display mt-3 text-[clamp(2rem,6vw,4rem)] text-ink">You're in.</h3>
        <p className="mt-4 max-w-xl font-mono text-xs uppercase tracking-widest text-ink">
          {event.name} — {isGroup ? "Team" : "Individual"} entry saved in the admin panel.
        </p>
        {source === "public" && coordinators.length > 0 && (
          <div className="mt-6 border-t border-ink/30 pt-6">
            <p className="meta text-ink">Send details to a coordinator</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {coordinators.map((coordinator) => (
                <a
                  key={`${coordinator.name}-${coordinator.whatsapp}`}
                  className="btn-outline-brutal"
                  href={`https://wa.me/${coordinator.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp {coordinator.name}
                </a>
              ))}
            </div>
          </div>
        )}
        <button className="btn-outline-brutal mt-6" onClick={() => setSubmitted(null)}>
          Register another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-ink p-6 md:p-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <h3 className="display text-[clamp(1.6rem,4vw,2.6rem)]">{event.name}</h3>
        <span className="meta text-primary">
          {isGroup ? "Group Entry" : "Individual Entry"} / Day {event.day}
        </span>
      </div>

      {isGroup && (
        <div className="mt-6">
          <label htmlFor="team-name" className="meta mb-2 block">
            Team Name
          </label>
          <input
            id="team-name"
            name="team-name"
            className="brutal-input"
            value={teamName}
            maxLength={80}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="TEAM NAME"
          />
        </div>
      )}

      {members.map((m, i) => (
        <div key={i} className="mt-8">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <span className="meta text-secondary">
              {isGroup ? `Member ${String(i + 1).padStart(2, "0")}` : "Participant"}
            </span>
            {isGroup && members.length > 1 && (
              <button
                type="button"
                onClick={() => setMembers((p) => p.filter((_, idx) => idx !== i))}
                className="meta text-primary hover:text-secondary"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.key === "collegeName" ? "md:col-span-2" : ""}>
                <label htmlFor={`${f.key}-${i}`} className="meta mb-2 block">
                  {f.label}
                </label>
                <input
                  id={`${f.key}-${i}`}
                  name={`${f.key}-${i}`}
                  className="brutal-input"
                  type={f.type ?? "text"}
                  value={m[f.key]}
                  maxLength={255}
                  onChange={(e) => update(i, f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 flex flex-wrap gap-4">
        {isGroup && (
          <button
            type="button"
            className="btn-outline-brutal"
            onClick={() => setMembers((p) => [...p, emptyMember(p[0]?.collegeName ?? "")])}
          >
            + Add Member
          </button>
        )}
        <button type="submit" className="btn-brutal" disabled={saving}>
          {saving ? "Submitting…" : "Submit Registration"}
        </button>
      </div>
    </form>
  );
}
