import { useState } from "react";
import { Plus, Copy, Settings, Trash2, Eye, EyeOff } from "lucide-react";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";

interface App {
  id: string;
  name: string;
  description: string;
  apiKey: string;
  status: "active" | "inactive";
  createdAt: string;
  lastUsed: string;
}

const mockApps: App[] = [
  {
    id: "app_001",
    name: "Frontend Dashboard",
    description: "Main application for user management",
    apiKey: "sk_live_51234567890abcdef",
    status: "active",
    createdAt: "2025-12-15",
    lastUsed: "2 hours ago",
  },
  {
    id: "app_002",
    name: "Mobile App",
    description: "iOS and Android companion app",
    apiKey: "sk_live_98765432100fedcba",
    status: "active",
    createdAt: "2025-11-20",
    lastUsed: "30 minutes ago",
  },
  {
    id: "app_003",
    name: "Legacy System",
    description: "Old integration that needs migration",
    apiKey: "sk_live_abcdefghijklmnop",
    status: "inactive",
    createdAt: "2025-10-01",
    lastUsed: "5 days ago",
  },
];

function ManageApps() {
  const [apps, setApps] = useState<App[]>(mockApps);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");

  const handleCreateApp = () => {
    if (!newAppName.trim()) return;

    const newApp: App = {
      id: `app_${Date.now()}`,
      name: newAppName,
      description: newAppDesc,
      apiKey: `sk_live_${Math.random().toString(36).substring(2, 32)}`,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Just now",
    };

    setApps([newApp, ...apps]);
    setNewAppName("");
    setNewAppDesc("");
    setShowCreateModal(false);
  };

  const handleDeleteApp = (id: string) => {
    setApps(apps.filter((app) => app.id !== id));
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="saas-shell flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="w-[20%]">
        <Sidebar />
      </div>
      <div className="w-[80%] flex flex-col overflow-auto">
        <DashboardNavbar />

        <div className="flex-1 space-y-6 px-8 py-8">
          <section className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl font-extrabold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                Manage Apps
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Create and manage your applications
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Create App
            </button>
          </section>

          <section>
            <div className="grid gap-4">
              {apps.length === 0 ? (
                <div
                  className="saas-card rounded-2xl border-2 border-dashed p-8 text-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p
                    className="text-base font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    No apps yet
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                    Create your first app to get started
                  </p>
                </div>
              ) : (
                apps.map((app) => (
                  <div
                    key={app.id}
                    className="saas-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="grid gap-4 md:grid-cols-3 md:items-center">
                      <div className="md:col-span-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className="text-lg font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {app.name}
                            </h3>
                            <p
                              className="mt-1 text-sm"
                              style={{ color: "var(--muted)" }}
                            >
                              {app.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className="text-xs font-mono"
                                style={{ color: "var(--muted)" }}
                              >
                                ID: {app.id}
                              </span>
                              <button
                                onClick={() => copyToClipboard(app.id)}
                                className="transition-colors hover:text-blue-600"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              app.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {app.status === "active"
                              ? "✓ Active"
                              : "○ Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "var(--muted)" }}
                        >
                          API Key
                        </p>
                        <div
                          className="mt-2 flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <code
                            className="text-xs font-mono"
                            style={{ color: "var(--text)" }}
                          >
                            {showApiKey[app.id]
                              ? app.apiKey
                              : app.apiKey.slice(0, 8) + "••••••••••••••••"}
                          </code>
                          <button
                            onClick={() => toggleApiKeyVisibility(app.id)}
                            className="transition-colors hover:text-blue-600"
                          >
                            {showApiKey[app.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(app.apiKey)}
                            className="transition-colors hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <div className="space-y-2 text-sm">
                          <div>
                            <p style={{ color: "var(--muted)" }}>Created</p>
                            <p
                              style={{ color: "var(--text)" }}
                              className="font-medium"
                            >
                              {app.createdAt}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "var(--muted)" }}>Last Used</p>
                            <p
                              style={{ color: "var(--text)" }}
                              className="font-medium"
                            >
                              {app.lastUsed}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:bg-blue-50 hover:border-blue-200"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text)",
                            }}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="saas-card w-full max-w-md rounded-2xl p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Create New App
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Add a new application to your workspace
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="appName"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  App Name
                </label>
                <input
                  id="appName"
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  placeholder="My Awesome App"
                />
              </div>

              <div>
                <label
                  htmlFor="appDesc"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Description
                </label>
                <textarea
                  id="appDesc"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  placeholder="What does this app do?"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg border px-4 py-2 font-semibold transition-all hover:bg-slate-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApp}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                disabled={!newAppName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManageApps;
