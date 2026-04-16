import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type ConsentRequest = {
  id: string;
  companyName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  requestedFields: string[];
  purpose: string | null;
  requestedAt: string;
};

const statusLabel: Record<ConsentRequest["status"], string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVOKED: "Revoked",
};

const formatRequestedAt = (value: string) => new Date(value).toLocaleString();

function UserSessions() {
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setError(null);
      const response = await axios.get<{ requests: ConsentRequest[] }>(
        `${API_BASE_URL}/api/vault/consent-requests`,
        { withCredentials: true },
      );
      setConsentRequests(response.data.requests);
    } catch (caughtError) {
      setError("Failed to load consent requests");
      console.error("loadRequests error", caughtError);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const pendingCount = useMemo(
    () =>
      consentRequests.filter((request) => request.status === "PENDING").length,
    [consentRequests],
  );
  const approvedCount = useMemo(
    () =>
      consentRequests.filter((request) => request.status === "APPROVED").length,
    [consentRequests],
  );
  const rejectedCount = useMemo(
    () =>
      consentRequests.filter((request) => request.status === "REJECTED").length,
    [consentRequests],
  );

  const handleDecision = async (
    requestId: string,
    decision: "APPROVED" | "REJECTED",
  ) => {
    try {
      setError(null);
      await axios.post(
        `${API_BASE_URL}/api/vault/consent-requests/${requestId}/decision`,
        { decision },
        { withCredentials: true },
      );
      await loadRequests();
    } catch (caughtError) {
      setError("Failed to submit decision");
      console.error("handleDecision error", caughtError);
    }
  };

  const handleRevoke = async (requestId: string) => {
    try {
      setError(null);
      await axios.post(
        `${API_BASE_URL}/api/vault/consent-requests/${requestId}/revoke`,
        {},
        { withCredentials: true },
      );
      await loadRequests();
    } catch (caughtError) {
      setError("Failed to revoke consent");
      console.error("handleRevoke error", caughtError);
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
          title="Consent Requests"
          searchPlaceholder="Search companies, statuses..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Consent Inbox
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Review every company request for your vault data and decide
                access explicitly.
              </p>
            </div>
            <span
              className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
              style={{ color: "var(--brand)" }}
            >
              <span className="neo-dot" />
              {consentRequests.length} Requests tracked
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
                Pending Requests
              </p>
              <p className="mt-2 text-3xl font-extrabold">{pendingCount}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Approved Today
              </p>
              <p className="mt-2 text-3xl font-extrabold">{approvedCount}</p>
            </article>
            <article className="saas-card rounded-2xl p-5">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Rejected Today
              </p>
              <p className="mt-2 text-3xl font-extrabold">{rejectedCount}</p>
            </article>
          </section>

          <section className="saas-card mt-5 rounded-2xl p-6">
            <h2
              className="text-2xl font-extrabold"
              style={{ color: "var(--text)" }}
            >
              Request Queue
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Track whether each data request is pending, approved, or rejected.
            </p>
            <div className="mt-5 space-y-3">
              {consentRequests.map((request) => (
                <div
                  key={request.id}
                  className="neo-inset flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {request.companyName}
                    </p>
                    <p style={{ color: "var(--muted)" }}>
                      fields: {request.requestedFields.join(", ") || "-"}
                    </p>
                    {request.purpose ? (
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        purpose: {request.purpose}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span
                      className="neo-pill px-2.5 py-1 text-xs font-semibold"
                      style={{ color: "var(--muted)" }}
                    >
                      {formatRequestedAt(request.requestedAt)}
                    </span>
                    <span className="neo-badge px-2.5 py-1 text-xs font-semibold">
                      {statusLabel[request.status]}
                    </span>
                    {request.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDecision(request.id, "APPROVED")}
                          className="rounded-lg border border-[rgba(165,231,206,0.5)] bg-[rgba(56,227,176,0.16)] px-2 py-1 text-xs font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(request.id, "REJECTED")}
                          className="rounded-lg border border-[rgba(255,162,179,0.45)] bg-[rgba(255,112,141,0.18)] px-2 py-1 text-xs font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                    {request.status === "APPROVED" ? (
                      <button
                        type="button"
                        onClick={() => handleRevoke(request.id)}
                        className="rounded-lg border border-[rgba(247,212,148,0.55)] bg-[rgba(232,180,85,0.18)] px-2 py-1 text-xs font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Revoke
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {consentRequests.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  No consent requests yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default UserSessions;
