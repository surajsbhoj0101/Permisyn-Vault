import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

type AppSummary = {
  id: string;
  name: string;
  description: string | null;
};

type AppTable = {
  id: string;
  name: string;
  slug: string;
};

type DeveloperConsentRequest = {
  id: string;
  applicationId: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  requestedFields: string[];
  purpose: string | null;
  onChainHash: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    walletAddress: string;
  };
  applicationName: string | null;
  tableName: string | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function AppConsentRequests() {
  const { appId = "" } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<AppSummary | null>(null);
  const [tables, setTables] = useState<AppTable[]>([]);
  const [requests, setRequests] = useState<DeveloperConsentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [requestedFields, setRequestedFields] = useState("");
  const [purpose, setPurpose] = useState("");

  const loadData = async () => {
    if (!appId) return;

    try {
      setIsLoading(true);
      setError(null);
      const [appsResponse, tablesResponse, requestsResponse] =
        await Promise.all([
          axios.get<{ apps: AppSummary[] }>(`${API_BASE_URL}/api/apps`, {
            withCredentials: true,
          }),
          axios.get<{ tables: AppTable[] }>(
            `${API_BASE_URL}/api/apps/${appId}/tables`,
            {
              withCredentials: true,
            },
          ),
          axios.get<{ requests: DeveloperConsentRequest[] }>(
            `${API_BASE_URL}/api/consents/requests?appId=${appId}`,
            { withCredentials: true },
          ),
        ]);

      setApp(appsResponse.data.apps.find((item) => item.id === appId) || null);
      setTables(tablesResponse.data.tables);
      setRequests(requestsResponse.data.requests);
      setSelectedTableId(
        (prev) => prev || tablesResponse.data.tables[0]?.id || "",
      );
    } catch (caughtError) {
      setError("Failed to load request page");
      console.error("loadData error", caughtError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [appId]);

  const metrics = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "PENDING")
        .length,
      approved: requests.filter((request) => request.status === "APPROVED")
        .length,
      rejected: requests.filter((request) => request.status === "REJECTED")
        .length,
    }),
    [requests],
  );

  const handleSubmit = async () => {
    if (!appId || !walletAddress.trim() || !requestedFields.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await axios.post(
        `${API_BASE_URL}/api/consents/requests`,
        {
          userWalletAddress: walletAddress.trim(),
          appId,
          tableId: selectedTableId || undefined,
          requestedFields: requestedFields
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean),
          purpose: purpose.trim() || undefined,
        },
        { withCredentials: true },
      );
      setWalletAddress("");
      setRequestedFields("");
      setPurpose("");
      await loadData();
    } catch (caughtError) {
      setError("Failed to send consent request");
      console.error("handleSubmit error", caughtError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="saas-shell grid min-h-screen overflow-x-hidden lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-x-hidden overflow-y-auto">
        <DashboardNavbar
          sectionLabel="Company Console"
          title="Send Consent Requests"
          searchPlaceholder="Search request history..."
        />

        <div className="mx-auto w-full max-w-325 min-w-0 flex-1 space-y-6 px-5 py-7 md:px-7">
          <section className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/developer/manage-apps")}
                className="saas-btn-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Apps
              </button>
              <h1
                className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ color: "var(--text)" }}
              >
                {app?.name || "Application"} Requests
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Send consent requests only to users of this app and track the
                status in one dedicated page.
              </p>
            </div>
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

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Total
              </p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.total}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Pending
              </p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.pending}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Approved
              </p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.approved}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Rejected
              </p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.rejected}</p>
            </article>
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <article
              className="saas-card rounded-2xl p-6"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="text-xl font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Send New Request
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Pick a user, app table, and requested fields.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  className="saas-input"
                  placeholder="User wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />

                <select
                  className="saas-input"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  disabled={tables.length === 0}
                >
                  {tables.length === 0 ? (
                    <option value="">No tables available</option>
                  ) : (
                    tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))
                  )}
                </select>

                <input
                  className="saas-input"
                  placeholder="Requested fields separated by commas"
                  value={requestedFields}
                  onChange={(e) => setRequestedFields(e.target.value)}
                />

                <textarea
                  className="saas-input min-h-32"
                  placeholder="Purpose of access"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="saas-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  disabled={
                    isSubmitting ||
                    !walletAddress.trim() ||
                    !requestedFields.trim()
                  }
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </article>

            <article
              className="saas-card rounded-2xl p-6"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    className="text-xl font-extrabold"
                    style={{ color: "var(--text)" }}
                  >
                    Recent Requests
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Only requests for this app are shown here.
                  </p>
                </div>
                <span className="neo-badge px-3 py-1 text-xs font-semibold">
                  {requests.length} total
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Loading requests...
                  </p>
                ) : requests.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No requests sent for this app yet.
                  </p>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className="neo-inset rounded-xl px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className="font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {request.user.username || request.user.walletAddress}
                        </p>
                        <span
                          className="neo-pill px-2 py-1 text-xs font-semibold"
                          style={{ color: "var(--muted)" }}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        fields: {request.requestedFields.join(", ") || "-"}
                      </p>
                      {request.purpose ? (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: "var(--muted)" }}
                        >
                          purpose: {request.purpose}
                        </p>
                      ) : null}
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        table: {request.tableName || "-"}
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        hash: {request.onChainHash || "Not notarized"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AppConsentRequests;
