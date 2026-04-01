import DashboardNavbar from "../../components/DashboardNavbar";
import { Activity, ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";

function Dashboard() {
  return (
    <main className="saas-shell min-h-screen" style={{ color: "var(--text)" }}>
      <DashboardNavbar />

      <section className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="saas-card saas-fade-up rounded-3xl p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
                Platform Health
              </p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Access Graph is Stable</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Monitor authorization performance, onboarding completion, and permission integrity.
              </p>
            </div>
            <a
              href="#"
              className="saas-btn-secondary inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
            >
              Open Activity Logs
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Active Policies", value: "27", icon: LockKeyhole },
              { label: "Verified Sessions", value: "8,413", icon: ShieldCheck },
              { label: "Latency p95", value: "182ms", icon: Activity },
            ].map((metric) => (
              <article key={metric.label} className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border)" }}>
                <metric.icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
                <p className="mt-2 text-2xl font-extrabold">{metric.value}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{metric.label}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="saas-card saas-fade-up saas-stagger-1 rounded-2xl p-5">
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Role Conversion Funnel</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Guest to user and guest to developer trends</p>
            <div className="mt-3 h-40 rounded-xl border border-dashed bg-white" style={{ borderColor: "var(--border)" }} />
          </section>

          <section className="saas-card saas-fade-up saas-stagger-2 rounded-2xl p-5">
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Access Policy Drift</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Flags policy mismatches between app and contract state</p>
            <div className="mt-3 h-40 rounded-xl border border-dashed bg-white" style={{ borderColor: "var(--border)" }} />
          </section>

          <section className="saas-card rounded-2xl p-5 md:col-span-2">
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Recent Events</h3>
            <div className="mt-4 space-y-2">
              {["SIWE verification completed", "OTP validated for onboarding", "Role updated to DEVELOPER"].map((event) => (
                <div
                  key={event}
                  className="flex items-center justify-between rounded-xl border bg-white px-3 py-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text)" }}>{event}</p>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>now</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;