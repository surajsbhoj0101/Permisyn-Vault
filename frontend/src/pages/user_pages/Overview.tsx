import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Database,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

interface OverviewResponse {
  stats: {
    vaultRecords: number;
    activeConsents: number;
    approvedToday: number;
    revokedToday: number;
  };
  recentActions: {
    id: string;
    action: string;
    createdAt: string;
  }[];
}

function UserOverview() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axios.get<OverviewResponse>(
        `${API_BASE_URL}/api/vault/overview`,
        { withCredentials: true }
      );

      setOverview(res.data);
    } catch (err) {
      console.error("loadPageData error", err);
      setError("Failed to load vault overview");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Vault Records",
        value: String(overview?.stats.vaultRecords || 0),
        icon: Database,
      },
      {
        label: "Active Consents",
        value: String(overview?.stats.activeConsents || 0),
        icon: ShieldCheck,
      },
      {
        label: "Approved Today",
        value: String(overview?.stats.approvedToday || 0),
        icon: CheckCircle2,
      },
      {
        label: "Revoked Today",
        value: String(overview?.stats.revokedToday || 0),
        icon: XCircle,
      },
    ],
    [overview]
  );

  const formatTime = (value: string) => {
    return new Date(value).toLocaleString();
  };

  return (
    <main className="saas-shell grid min-h-screen overflow-x-hidden lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="saas-scrollbar flex min-w-0 flex-col overflow-y-auto">
        <DashboardNavbar
          sectionLabel="User Console"
          title="My Data Vault"
          searchPlaceholder="Search records, consents..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 space-y-7 px-5 py-7 md:px-7">
          
          {/* Header */}
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ color: "var(--text)" }}
              >
                Vault Overview
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Monitor your data, track consent activity, and stay in control.
              </p>
            </div>

            <span
              className="neo-pill px-3 py-1 text-xs font-semibold"
              style={{ color: "var(--muted)" }}
            >
              {isLoading ? "Loading..." : "Live Data"}
            </span>
          </section>

          {/* Error */}
          {error && (
            <p
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: "rgba(255,150,170,0.4)",
                background: "var(--danger-soft)",
                color: "#ffd9e2",
              }}
            >
              {error}
            </p>
          )}

          {/* Stats */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article
                key={item.label}
                className="saas-card rounded-2xl p-5 transition hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--muted)" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="mt-2 text-3xl font-extrabold"
                      style={{ color: "var(--text)" }}
                    >
                      {item.value}
                    </p>
                  </div>

                  <span className="neo-inset inline-flex h-10 w-10 items-center justify-center">
                    <item.icon
                      className="h-5 w-5"
                      style={{ color: "var(--brand-dark)" }}
                    />
                  </span>
                </div>
              </article>
            ))}
          </section>

          {/* Content Grid */}
          <section className="grid gap-6 lg:grid-cols-3">

            {/* Recent Actions */}
            <article className="saas-card lg:col-span-2 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--text)" }}
                >
                  Recent Consent Activity
                </h2>

                <span className="neo-badge px-2.5 py-1 text-xs font-semibold">
                  Live
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {(overview?.recentActions || []).length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No recent activity.
                  </p>
                ) : (
                  overview?.recentActions.map((entry) => (
                    <div
                      key={entry.id}
                      className="neo-inset flex items-center justify-between px-3 py-2.5 transition hover:bg-white/5"
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {entry.action}
                      </span>

                      <span
                        className="neo-pill px-2 py-1 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {formatTime(entry.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </article>

            {/* Vault Health */}
            <article className="saas-card rounded-2xl p-6">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Vault Health
              </h2>

              <div className="mt-4 space-y-3">
                {[
                  "Data encrypted at rest",
                  "Consent trail recorded",
                  "Revocation controls active",
                ].map((label) => (
                  <div
                    key={label}
                    className="neo-inset flex items-center justify-between px-3 py-2.5"
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {label}
                    </span>

                    <span
                      className="neo-pill inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold"
                      style={{ color: "var(--brand)" }}
                    >
                      <span className="neo-dot" />
                      Healthy
                    </span>
                  </div>
                ))}
              </div>
            </article>

          </section>
        </div>
      </div>
    </main>
  );
}

export default UserOverview;