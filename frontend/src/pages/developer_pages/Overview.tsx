import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";
import { Activity, ArrowUpRight, Shield, Users } from "lucide-react";

const metrics = [
  {
    label: "Active Sessions",
    value: "392",
    icon: Activity,
    color: "text-blue-600",
  },
  {
    label: "Policies Enforced",
    value: "1,248",
    icon: Shield,
    color: "text-emerald-600",
  },
  { label: "Users Today", value: "89", icon: Users, color: "text-purple-600" },
  {
    label: "Trend",
    value: "+18%",
    icon: ArrowUpRight,
    color: "text-orange-600",
  },
];

function Overview() {
  return (
    <main className="saas-shell flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="w-[20%]">
        <Sidebar />
      </div>
      <div className="w-[80%] flex flex-col overflow-auto">
        <DashboardNavbar />

        <div className="flex-1 space-y-6 px-8 py-8">
          <section>
            <h1
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Overview
            </h1>
            <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
              Monitor your permission infrastructure and security posture
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="saas-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-sm font-medium uppercase tracking-wider transition-colors duration-200 group-hover:text-blue-600"
                      style={{ color: "var(--muted)" }}
                    >
                      {metric.label}
                    </p>
                    <p
                      className="mt-3 text-3xl font-extrabold transition-all duration-200 group-hover:scale-110 origin-left"
                      style={{ color: "var(--text)" }}
                    >
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-lg p-2 transition-all duration-200 group-hover:scale-125 flex items-center justify-center ${metric.color} bg-opacity-10`}
                  >
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div
              className="saas-card col-span-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Recent Activity
                </h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { action: "Role escalation approved", time: "2m ago" },
                  { action: "Policy update deployed", time: "15m ago" },
                  { action: "New session created", time: "32m ago" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 transition-all hover:shadow-md hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {item.action}
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100"
                      style={{ color: "var(--muted)" }}
                    >
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="saas-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  System Health
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  Healthy
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { label: "API Health", value: 98 },
                  { label: "Database", value: 99 },
                  { label: "Cache", value: 95 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span style={{ color: "var(--muted)" }}>
                        {item.label}
                      </span>
                      <span
                        className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-emerald-400 to-green-500 transition-all duration-500"
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
