import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Database,
  ShieldCheck,
  XCircle,
  Trash2,
} from "lucide-react";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type OverviewResponse = {
  stats: {
    vaultRecords: number;
    activeConsents: number;
    approvedToday: number;
    revokedToday: number;
  };
  recentActions: Array<{
    id: string;
    action: string;
    createdAt: string;
  }>;
};

type VaultRecord = {
  id: string;
  label: string;
  data: unknown;
  updatedAt: string;
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString();
};

function UserOverview() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [recordLabel, setRecordLabel] = useState("");
  const [recordData, setRecordData] = useState('{\n  "key": "value"\n}');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [overviewResponse, recordsResponse] = await Promise.all([
        axios.get<OverviewResponse>(`${API_BASE_URL}/api/vault/overview`, {
          withCredentials: true,
        }),
        axios.get<{ records: VaultRecord[] }>(
          `${API_BASE_URL}/api/vault/records`,
          {
            withCredentials: true,
          },
        ),
      ]);

      setOverview(overviewResponse.data);
      setVaultRecords(recordsResponse.data.records);
    } catch (caughtError) {
      setError("Failed to load vault overview");
      console.error("loadPageData error", caughtError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
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
        label: "Approved",
        value: String(overview?.stats.approvedToday || 0),
        icon: CheckCircle2,
      },
      {
        label: "Revoked",
        value: String(overview?.stats.revokedToday || 0),
        icon: XCircle,
      },
    ],
    [overview],
  );

  const handleCreateRecord = async () => {
    if (!recordLabel.trim()) return;

    try {
      let parsed: unknown = recordData;
      try {
        parsed = JSON.parse(recordData);
      } catch {
        parsed = recordData;
      }

      await axios.post(
        `${API_BASE_URL}/api/vault/records`,
        {
          label: recordLabel.trim(),
          data: parsed,
        },
        { withCredentials: true },
      );

      setRecordLabel("");
      setRecordData('{\n  "key": "value"\n}');
      await loadPageData();
    } catch (caughtError) {
      setError("Failed to create vault record");
      console.error("handleCreateRecord error", caughtError);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/vault/records/${recordId}`, {
        withCredentials: true,
      });
      await loadPageData();
    } catch (caughtError) {
      setError("Failed to delete vault record");
      console.error("handleDeleteRecord error", caughtError);
    }
  };

  return (
    <main className="saas-shell grid min-h-screen lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-auto">
        <DashboardNavbar
          sectionLabel="User Console"
          title="My Data Vault"
          searchPlaceholder="Search records, consents..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 space-y-6 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ color: "var(--text)" }}
              >
                Vault Overview
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Your personal data stays under your control. Approve, reject, or
                revoke company access any time.
              </p>
            </div>
            <span
              className="neo-pill px-3 py-1 text-xs font-semibold"
              style={{ color: "var(--muted)" }}
            >
              {isLoading ? "Loading..." : "Live Data"}
            </span>
          </section>

          {error ? (
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
          ) : null}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="saas-card rounded-2xl p-5">
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

          <section className="grid gap-6 lg:grid-cols-3">
            <article className="saas-card lg:col-span-2 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--text)" }}
                >
                  Recent Consent Actions
                </h2>
                <span className="neo-badge px-2.5 py-1 text-xs font-semibold">
                  Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {(overview?.recentActions || []).map((entry) => (
                  <div
                    key={entry.id}
                    className="neo-inset flex items-center justify-between px-3 py-2.5"
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
                ))}
                {(overview?.recentActions || []).length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No consent actions yet.
                  </p>
                ) : null}
              </div>
            </article>

            <article className="saas-card rounded-2xl p-6">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Vault Health
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Data encrypted at rest", ok: true },
                  { label: "Consent trail recorded", ok: true },
                  { label: "Revocation controls active", ok: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="neo-inset flex items-center justify-between px-3 py-2.5"
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {item.label}
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

          <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <article className="saas-card rounded-2xl p-6">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Add Vault Record
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Store personal data as text or JSON.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  className="saas-input"
                  placeholder="Record label (e.g. KYC Profile)"
                  value={recordLabel}
                  onChange={(e) => setRecordLabel(e.target.value)}
                />
                <textarea
                  className="saas-input min-h-32"
                  value={recordData}
                  onChange={(e) => setRecordData(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCreateRecord}
                  className="saas-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
                  disabled={!recordLabel.trim()}
                >
                  Save Record
                </button>
              </div>
            </article>

            <article className="saas-card rounded-2xl p-6">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Vault Records
              </h2>
              <div className="mt-4 space-y-3">
                {vaultRecords.map((record) => (
                  <div
                    key={record.id}
                    className="neo-inset flex items-start justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {record.label}
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {formatTime(record.updatedAt)}
                      </p>
                      <pre
                        className="mt-2 max-h-24 overflow-auto text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {typeof record.data === "string"
                          ? record.data
                          : JSON.stringify(record.data, null, 2)}
                      </pre>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(record.id)}
                      className="rounded-lg border border-red-300/35 bg-red-100/75 p-2 text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {vaultRecords.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No records stored yet.
                  </p>
                ) : null}
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

export default UserOverview;
