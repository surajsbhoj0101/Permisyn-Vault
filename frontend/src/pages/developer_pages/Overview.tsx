import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";
import { Activity, CheckCircle2, Clock3, XCircle } from "lucide-react";

const metrics = [
  {
    label: "Requests Sent",
    value: "124",
    icon: Activity,
  },
  {
    label: "Approved",
    value: "72",
    icon: CheckCircle2,
  },
  { label: "Pending", value: "38", icon: Clock3 },
  {
    label: "Rejected",
    value: "14",
    icon: XCircle,
  },
];

function Overview() {
  return (
    <main className="saas-shell grid min-h-screen lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-auto">
        <DashboardNavbar
          sectionLabel="Company Console"
          title="Consent Request Operations"
          searchPlaceholder="Search users, requests..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 space-y-6 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ color: "var(--text)" }}
              >
                Overview
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Request user data access and monitor consent decisions in real
                time.
              </p>
            </div>
            <span className="neo-badge px-3 py-1 text-xs font-semibold">
              Last sync: 12s ago
            </span>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="saas-card saas-card-glow rounded-2xl p-5"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--muted)" }}
                    >
                      {metric.label}
                    </p>
                    <p
                      className="mt-2 text-3xl font-extrabold"
                      style={{ color: "var(--text)" }}
                    >
                      {metric.value}
                    </p>
                  </div>
                  <div className="neo-inset flex h-10 w-10 items-center justify-center">
                    <metric.icon
                      className="h-6 w-6"
                      style={{ color: "var(--brand-dark)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div
              className="saas-card col-span-2 rounded-2xl p-6"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Recent Request Activity
                </h2>
                <span className="neo-badge px-2.5 py-1 text-xs font-semibold">
                  Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  {
                    action: "Requested KYC scope from user #7A21",
                    time: "2m ago",
                  },
                  { action: "Consent approved by user #91B4", time: "15m ago" },
                  { action: "Request rejected by user #02CF", time: "32m ago" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="neo-inset flex items-center justify-between px-3 py-2.5"
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {item.action}
                    </span>
                    <span
                      className="neo-pill px-2 py-1 text-xs font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="saas-card rounded-2xl p-6"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Consent Pipeline
                </h2>
                <span
                  className="neo-pill inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold"
                  style={{ color: "var(--brand)" }}
                >
                  <span className="neo-dot" />
                  Healthy
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { label: "Pending Queue", value: 64 },
                  { label: "Approval Rate", value: 72 },
                  { label: "Hash Notarization", value: 88 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span style={{ color: "var(--muted)" }}>
                        {item.label}
                      </span>
                      <span
                        className="neo-pill px-2 py-0.5 font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(132,160,218,0.24)]">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-(--brand-dark) to-(--brand) transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Overview;
