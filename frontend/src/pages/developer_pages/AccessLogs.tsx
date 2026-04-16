import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

type RequestStatus = "ACCEPTED" | "REJECTED" | "PENDING";

type LogItem = {
  id: string;
  user: string;
  scope: string;
  app: string;
  status: RequestStatus;
  at: string;
};

const seedLogs: LogItem[] = [
  {
    id: "log-1",
    user: "@anika",
    scope: "kyc_profile, identity_number",
    app: "FinFlow",
    status: "ACCEPTED",
    at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "log-2",
    user: "@dev_rahul",
    scope: "marketing_preferences",
    app: "AdPulse",
    status: "REJECTED",
    at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
  },
  {
    id: "log-3",
    user: "0x79f2...ab10",
    scope: "employment_history",
    app: "PeopleStack",
    status: "PENDING",
    at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
];

const randomStatus = (): RequestStatus => {
  const items: RequestStatus[] = ["ACCEPTED", "REJECTED", "PENDING"];
  return items[Math.floor(Math.random() * items.length)] || "PENDING";
};

const statusStyles: Record<RequestStatus, string> = {
  ACCEPTED:
    "border-[rgba(165,231,206,0.5)] bg-[rgba(56,227,176,0.16)] text-(--text)",
  REJECTED:
    "border-[rgba(255,162,179,0.45)] bg-[rgba(255,112,141,0.18)] text-(--text)",
  PENDING:
    "border-[rgba(247,212,148,0.55)] bg-[rgba(232,180,85,0.18)] text-(--text)",
};

const formatAgo = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
};

function DeveloperAccessLogs() {
  const [logs, setLogs] = useState<LogItem[]>(seedLogs);
  const [lastTick, setLastTick] = useState(Date.now());

  useEffect(() => {
    const ticker = window.setInterval(() => {
      setLastTick(Date.now());
    }, 15000);

    const simulator = window.setInterval(() => {
      setLogs((prev) => {
        const next: LogItem = {
          id: `log-${Date.now()}`,
          user:
            ["@anika", "@vikram", "0x4af2...991a"][
              Math.floor(Math.random() * 3)
            ] || "@user",
          scope:
            [
              "kyc_profile",
              "salary_range",
              "policy_id, claim_history",
              "email, phone",
            ][Math.floor(Math.random() * 4)] || "profile",
          app:
            ["FinFlow", "HealthAxis", "AdPulse", "PeopleStack"][
              Math.floor(Math.random() * 4)
            ] || "Permisyn App",
          status: randomStatus(),
          at: new Date().toISOString(),
        };
        return [next, ...prev].slice(0, 20);
      });
    }, 18000);

    return () => {
      window.clearInterval(ticker);
      window.clearInterval(simulator);
    };
  }, []);

  const accepted = useMemo(
    () => logs.filter((item) => item.status === "ACCEPTED").length,
    [logs],
  );
  const rejected = useMemo(
    () => logs.filter((item) => item.status === "REJECTED").length,
    [logs],
  );
  const pending = useMemo(
    () => logs.filter((item) => item.status === "PENDING").length,
    [logs],
  );

  return (
    <main className="saas-shell grid min-h-screen lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-auto">
        <DashboardNavbar
          sectionLabel="Company Console"
          title="Developer Access Logs"
          searchPlaceholder="Search user request events..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 space-y-6 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ color: "var(--text)" }}
              >
                Real-Time Request Feed
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                UI preview of incoming consent responses from users.
              </p>
            </div>
            <span
              className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
              style={{ color: "var(--brand)" }}
            >
              <span className="neo-dot" />
              Live mock updates
            </span>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Accepted
              </p>
              <p className="mt-2 text-3xl font-extrabold">{accepted}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Rejected
              </p>
              <p className="mt-2 text-3xl font-extrabold">{rejected}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Pending
              </p>
              <p className="mt-2 text-3xl font-extrabold">{pending}</p>
            </article>
          </section>

          <section
            className="saas-card rounded-2xl p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                className="text-xl font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Consent Decision Stream
              </h2>
              <span className="neo-badge px-3 py-1 text-xs font-semibold">
                Refreshed {formatAgo(new Date(lastTick).toISOString())}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="neo-inset flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {log.user} responded to {log.app}
                    </p>
                    <p style={{ color: "var(--muted)" }}>scope: {log.scope}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="neo-pill px-2.5 py-1 text-xs font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      {formatAgo(log.at)}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[log.status]}`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DeveloperAccessLogs;
