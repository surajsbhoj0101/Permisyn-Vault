import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

function UserSettings() {
  return (
    <main className="saas-shell grid min-h-screen lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-auto">
        <DashboardNavbar
          sectionLabel="User Console"
          title="Vault Preferences"
          searchPlaceholder="Search consent preferences..."
        />

        <div className="mx-auto w-full max-w-325 flex-1 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="text-3xl font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Consent Controls
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Configure defaults for request approvals, revocation alerts, and
                audit visibility.
              </p>
            </div>
            <span
              className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
              style={{ color: "var(--brand)" }}
            >
              <span className="neo-dot" />
              Security profile active
            </span>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <article className="saas-card rounded-2xl p-6">
              <h2
                className="text-2xl font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Vault Preferences
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Set how your data can be requested and how consent events are
                tracked.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  className="saas-input"
                  placeholder="Default request expiry (days)"
                />
                <input
                  className="saas-input"
                  placeholder="Revocation alert email"
                />
                <input
                  className="saas-input"
                  placeholder="Auto-deny unknown companies (yes/no)"
                />
                <input
                  className="saas-input"
                  placeholder="On-chain hash preference (always/optional)"
                />
                <button className="saas-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold sm:col-span-2">
                  Save Changes
                </button>
              </div>
            </article>

            <article className="saas-card rounded-2xl p-6">
              <h2
                className="text-lg font-extrabold"
                style={{ color: "var(--text)" }}
              >
                Quick Controls
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  "Require explicit approval for every request",
                  "Allow one-click revoke on all active consents",
                  "Keep consent actions in audit logs",
                ].map((item) => (
                  <div
                    key={item}
                    className="neo-inset flex items-center justify-between px-3 py-2.5"
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {item}
                    </span>
                    <span className="neo-badge px-2.5 py-1 text-xs font-semibold">
                      Enabled
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

export default UserSettings;
