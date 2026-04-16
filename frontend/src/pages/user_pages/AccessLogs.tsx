import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type AccessLog = {
  id: string;
  action: "REQUESTED" | "APPROVED" | "REJECTED" | "REVOKED";
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  onChainHash: string | null;
  createdAt: string;
  companyName: string;
};

const actionLabel: Record<AccessLog["action"], string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVOKED: "Revoked",
};

const timeLabel = (value: string) => new Date(value).toLocaleString();

function UserAccessLogs() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setError(null);
      const response = await axios.get<{ logs: AccessLog[] }>(
        `${API_BASE_URL}/api/vault/access-logs`,
        { withCredentials: true },
      );
      setLogs(response.data.logs);
    } catch (caughtError) {
      setError("Failed to load access logs");
      console.error("loadLogs error", caughtError);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const approvedCount = useMemo(
    () => logs.filter((log) => log.action === "APPROVED").length,
    [logs],
  );
  const rejectedCount = useMemo(
    () => logs.filter((log) => log.action === "REJECTED").length,
    [logs],
  );
  const hashedCount = useMemo(
    () => logs.filter((log) => Boolean(log.onChainHash)).length,
    [logs],
  );

  return (
    <main className="saas-shell grid min-h-screen lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-auto">
        <DashboardNavbar
          sectionLabel="User Console"
          title="Access Logs"
          searchPlaceholder="Search approvals, revokes, hashes..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Consent Audit Trail
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Complete timeline of each approval, rejection, and revocation
                event.
              </p>
            </div>
            <span
              className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
              style={{ color: "var(--brand)" }}
            >
              <span className="neo-dot" />
              100% traceable events
            </span>
          </section>

          {error ? (
            <p
              className="mt-4 rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: "rgba(255,150,170,0.4)",
                background: "var(--danger-soft)",
                color: "#ffd9e2",
              }}
            >
              {error}
            </p>
          ) : null}

          <section className="mt-5 grid gap-4 lg:grid-cols-3">
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Approvals Today
              </p>
              <p className="mt-2 text-3xl font-extrabold">{approvedCount}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Rejections Today
              </p>
              <p className="mt-2 text-3xl font-extrabold">{rejectedCount}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                On-Chain Hashes
              </p>
              <p className="mt-2 text-3xl font-extrabold">{hashedCount}</p>
            </article>
          </section>

          <section className="saas-card mt-5 rounded-2xl p-6">
            <h2
              className="text-2xl font-extrabold"
              style={{ color: "var(--text)" }}
            >
              Consent Events
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Immutable-style record of every consent decision made in your
              vault.
            </p>
            <div className="mt-5 space-y-3">
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
                      {actionLabel[log.action]}: {log.companyName}
                    </p>
                    <p style={{ color: "var(--muted)" }}>{log.companyName}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      hash: {log.onChainHash || "Not notarized"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="neo-pill px-2.5 py-1 text-xs font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      {timeLabel(log.createdAt)}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        log.status === "APPROVED"
                          ? "border-[rgba(165,231,206,0.5)] bg-[rgba(56,227,176,0.16)]"
                          : log.status === "REJECTED"
                            ? "border-[rgba(255,162,179,0.45)] bg-[rgba(255,112,141,0.18)]"
                            : "border-[rgba(247,212,148,0.55)] bg-[rgba(232,180,85,0.18)]"
                      }`}
                      style={{ color: "var(--text)" }}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
              {logs.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  No audit events yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default UserAccessLogs;
