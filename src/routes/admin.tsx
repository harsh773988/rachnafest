import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { RegistrationForm } from "@/components/RegistrationForm";
import { eventsQuery, type EventRow } from "@/lib/events";
import {
  deleteRegistrationAsAdmin,
  listAuditLogs,
  logAdminAction,
  updateRegistrationAsAdmin,
} from "@/lib/audit.functions";

import { listLocalRegistrations } from "@/lib/registrations.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Rachna 2K26 Registrations" },
      {
        name: "description",
        content:
          "Team Kalki admin panel: register students, browse, filter and export all Rachna 2K26 entries.",
      },
      { property: "og:title", content: "Admin Panel — Rachna 2K26" },
      {
        property: "og:description",
        content: "Manage and export Rachna 2K26 registrations.",
      },
    ],
  }),
  component: AdminPage,
});

type RegistrantRow = {
  id: string;
  name: string;
  branch: string;
  college_name: string;
  mobile: string;
  email: string;
};

type RegistrationRow = {
  id: string;
  event_id: string;
  team_name: string | null;
  source: string;
  created_at: string;
  registrants: RegistrantRow[];
};

type PanelSession = {
  user: {
    id: string;
    email?: string | null;
  };
};

async function fetchRegistrations(): Promise<RegistrationRow[]> {
  let cloudRows: RegistrationRow[] = [];
  try {
    const { data, error } = await supabase
      .from("registrations")
      .select("id, event_id, team_name, source, created_at, registrants(*)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      cloudRows = data as unknown as RegistrationRow[];
    }
  } catch {
    // Cloud fetch failure is non-blocking for local fallback
  }

  let localRows: RegistrationRow[] = [];
  try {
    const local = await listLocalRegistrations();
    if (Array.isArray(local)) {
      localRows = local.map(
        (r: {
          id: string;
          eventId: string;
          teamName: string | null;
          source?: string;
          createdAt?: string;
          members?: {
            name: string;
            branch: string;
            collegeName: string;
            mobile: string;
            email: string;
          }[];
        }) => ({
          id: r.id,
          event_id: r.eventId,
          team_name: r.teamName,
          source: r.source || "local",
          created_at: r.createdAt || new Date().toISOString(),
          registrants: (r.members || []).map((m, idx) => ({
            id: `${r.id}-${idx}`,
            name: m.name,
            branch: m.branch,
            college_name: m.collegeName,
            mobile: m.mobile,
            email: m.email,
          })),
        }),
      );
    }
  } catch {
    // Local list failure is non-blocking
  }

  const seen = new Set<string>();
  const combined: RegistrationRow[] = [];
  for (const row of [...cloudRows, ...localRows]) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      combined.push(row);
    }
  }

  return combined.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function AdminPage() {
  const [session, setSession] = useState<PanelSession | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local"));

    if (isLocalhost) {
      const devAdmin = localStorage.getItem("rachna_dev_admin");
      if (devAdmin) {
        try {
          const parsed = JSON.parse(devAdmin);
          setSession({
            user: {
              id: parsed.id || "dev-admin-id",
              email: parsed.email || "admin@kkgroup.org",
            },
          });
          setIsAdmin(true);
          setReady(true);
          return;
        } catch {
          localStorage.removeItem("rachna_dev_admin");
        }
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setSession(s);
      } else if (!localStorage.getItem("rachna_dev_admin")) {
        setSession(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }

    // If local dev admin
    if (localStorage.getItem("rachna_dev_admin")) {
      setIsAdmin(true);
      return;
    }

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) {
    return (
      <PageShell>
        <div className="px-5 py-32 md:px-10">
          <p className="meta">Checking access…</p>
        </div>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell>
        <div className="px-5 py-32 md:px-10">
          <h1 className="display" style={{ fontSize: "10vw" }}>
            Locked
          </h1>
          <p className="meta mt-4 text-muted-foreground">
            Sign in with an existing account or create a new teacher account.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/auth" search={{ mode: "signin" }} className="btn-brutal">
              Teacher Sign In
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-outline-brutal">
              Create Account
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <AdminDashboard
      session={session}
      isAdmin={isAdmin}
      onSignOut={() => {
        localStorage.removeItem("rachna_dev_admin");
        setSession(null);
        setIsAdmin(false);
      }}
    />
  );
}

function AdminDashboard({
  session,
  isAdmin,
  onSignOut,
}: {
  session: PanelSession;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  const { data: events = [] } = useQuery(eventsQuery);
  const {
    data: registrations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrations,
    enabled: isAdmin,
  });

  const logAction = useServerFn(logAdminAction);
  const deleteRegistration = useServerFn(deleteRegistrationAsAdmin);
  const updateRegistration = useServerFn(updateRegistrationAsAdmin);
  const fetchAuditLogs = useServerFn(listAuditLogs);

  const { data: auditLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchAuditLogs(),
    enabled: isAdmin,
  });

  const [filterEvent, setFilterEvent] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [addSlug, setAddSlug] = useState("");

  const eventById = useMemo(
    () => Object.fromEntries(events.map((e) => [e.id, e])) as Record<string, EventRow>,
    [events],
  );

  const rows = registrations.filter((r) => {
    const ev = eventById[r.event_id];
    if (filterEvent !== "all" && r.event_id !== filterEvent) return false;
    if (filterDay !== "all" && String(ev?.day) !== filterDay) return false;
    return true;
  });

  async function exportCsv() {
    const header = [
      "Event",
      "Day",
      "Type",
      "Team",
      "Name",
      "Branch",
      "College",
      "Mobile",
      "Email",
      "Source",
      "Registered At",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      const ev = eventById[r.event_id];
      for (const m of r.registrants) {
        lines.push(
          [
            ev?.name ?? "",
            ev?.day ?? "",
            ev?.participation_type ?? "",
            r.team_name ?? "",
            m.name,
            m.branch,
            m.college_name,
            m.mobile,
            m.email,
            r.source,
            new Date(r.created_at).toISOString(),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        );
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rachna-2k26-registrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    try {
      await logAction({
        data: {
          action: "registrations.export",
          entityType: "registrations",
          summary: `Exported CSV — ${rows.length} entries / ${rows.reduce((n, r) => n + r.registrants.length, 0)} people`,
          details: { entries: rows.length, filterEvent, filterDay },
        },
      });
      refetchLogs();
    } catch {
      /* export already delivered; logging failure is non-blocking */
    }
  }

  async function remove(id: string) {
    try {
      await deleteRegistration({ data: { id } });
    } catch {
      toast.error("Could not delete");
      return;
    }
    toast.success("Registration removed");
    refetch();
    refetchLogs();
  }

  async function renameTeam(id: string, current: string | null) {
    const next = window.prompt("Team name", current ?? "");
    if (next === null || next.trim() === (current ?? "")) return;
    try {
      await updateRegistration({ data: { id, teamName: next.trim() || null } });
    } catch {
      toast.error("Could not update");
      return;
    }
    toast.success("Registration updated");
    refetch();
    refetchLogs();
  }

  const addEvent = events.find((e) => e.slug === addSlug);
  const totalPeople = rows.reduce((n, r) => n + r.registrants.length, 0);

  return (
    <PageShell>
      <section className="flex flex-wrap items-end justify-between gap-6 px-5 pt-16 pb-8 md:px-10">
        <div>
          <p className="meta text-muted-foreground">{session.user.email}</p>
          <h1 className="display mt-3" style={{ fontSize: "11vw" }}>
            Panel
          </h1>
        </div>
        <button
          className="btn-outline-brutal"
          onClick={async () => {
            onSignOut();
            await supabase.auth.signOut();
            toast.success("Signed out");
          }}
        >
          Sign out
        </button>
      </section>

      {!isAdmin ? (
        <div className="border-t border-border px-5 py-24 md:px-10">
          <p className="meta text-primary">
            This account has no admin access yet. Ask an existing admin to grant it.
          </p>
        </div>
      ) : (
        <>
          {/* Register a student */}
          <section className="border-t border-border px-5 py-14 md:px-10">
            <p className="meta text-muted-foreground">01 / Register on behalf</p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,3.5rem)]">Add entries</h2>
            <div className="mt-6 max-w-md">
              <label className="meta mb-2 block">Event</label>
              <select
                className="brutal-input"
                value={addSlug}
                onChange={(e) => setAddSlug(e.target.value)}
              >
                <option value="">Select an event…</option>
                {events
                  .filter((e) => e.registrable)
                  .map((e) => (
                    <option key={e.id} value={e.slug}>
                      Day {e.day} — {e.name}
                    </option>
                  ))}
              </select>
            </div>
            {addEvent && (
              <div className="mt-8 max-w-4xl">
                <RegistrationForm
                  key={addEvent.id}
                  event={addEvent}
                  source="admin"
                  createdBy={session.user.id}
                  onDone={async () => {
                    try {
                      await logAction({
                        data: {
                          action: "registration.create",
                          entityType: "registration",
                          summary: `Registered an entry for ${addEvent.name}`,
                          details: { eventId: addEvent.id, eventName: addEvent.name },
                        },
                      });
                    } catch {
                      /* non-blocking */
                    }
                    refetch();
                    refetchLogs();
                  }}
                />
              </div>
            )}
          </section>

          {/* Registrations table */}
          <section className="border-t border-border px-5 py-14 md:px-10">
            <p className="meta text-muted-foreground">02 / All registrations</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <h2 className="display text-[clamp(2rem,5vw,3.5rem)]">
                {rows.length} entries / {totalPeople} people
              </h2>
              <button className="btn-brutal" onClick={exportCsv}>
                Export CSV
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6">
              <div>
                <label className="meta mb-2 block">Filter by event</label>
                <select
                  className="brutal-input"
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  <option value="all">All events</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="meta mb-2 block">Filter by day</label>
                <select
                  className="brutal-input"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                >
                  <option value="all">All days</option>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={String(d)}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-6">
              {isLoading && <p className="meta">Loading registrations…</p>}
              {!isLoading && rows.length === 0 && (
                <p className="meta text-muted-foreground">No registrations yet.</p>
              )}
              {rows.map((r) => {
                const ev = eventById[r.event_id];
                return (
                  <div key={r.id} className="border border-ink p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                      <h3 className="display text-[1.4rem]">
                        {ev?.name ?? "Event"}
                        {r.team_name ? ` — ${r.team_name}` : ""}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="meta text-secondary">
                          Day {ev?.day} / {r.source} / {new Date(r.created_at).toLocaleDateString()}
                        </span>
                        <button
                          className="meta hover:text-secondary"
                          onClick={() => renameTeam(r.id, r.team_name)}
                        >
                          Edit
                        </button>
                        <button
                          className="meta text-primary hover:text-secondary"
                          onClick={() => remove(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="text-muted-foreground uppercase">
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Branch</th>
                            <th className="py-2 pr-4">College</th>
                            <th className="py-2 pr-4">Mobile</th>
                            <th className="py-2">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.registrants.map((m) => (
                            <tr key={m.id} className="border-t border-border">
                              <td className="py-2 pr-4">{m.name}</td>
                              <td className="py-2 pr-4">{m.branch}</td>
                              <td className="py-2 pr-4">{m.college_name}</td>
                              <td className="py-2 pr-4">{m.mobile}</td>
                              <td className="py-2">{m.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Audit log */}
          <section className="border-t border-border px-5 py-14 md:px-10">
            <p className="meta text-muted-foreground">03 / Audit log</p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,3.5rem)]">Admin activity</h2>
            <p className="meta mt-3 text-muted-foreground">
              Deletes, edits, exports and manual entries — last 200 actions.
            </p>
            <div className="mt-8 overflow-x-auto border border-ink">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-muted-foreground uppercase">
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 && (
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 text-muted-foreground" colSpan={4}>
                        No admin actions recorded yet.
                      </td>
                    </tr>
                  )}
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-t border-border align-top">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{log.actor_email ?? "—"}</td>
                      <td className="px-4 py-3 text-primary uppercase">{log.action}</td>
                      <td className="px-4 py-3">{log.summary ?? log.entity_id ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}
