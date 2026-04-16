import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Copy, Settings, Trash2, Database, Send } from "lucide-react";
import DashboardNavbar from "../../components/DashboardNavbar";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

interface App {
  id: string;
  name: string;
  description: string | null;
  keyPrefix: string | null;
  status: "active" | "inactive";
  createdAt: string;
  lastUsedAt: string | null;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type AppListResponse = {
  apps: Array<{
    id: string;
    name: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    keyPrefix: string | null;
    lastUsedAt: string | null;
  }>;
};

const toRelativeTime = (value: string | null) => {
  if (!value) return "Never";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatApiKeyForDisplay = (app: App) => {
  if (!app.keyPrefix) {
    return "No key yet";
  }

  return `${app.keyPrefix}••••••••••••••••`;
};

function ManageApps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [keyModal, setKeyModal] = useState<{
    isOpen: boolean;
    appName: string;
    apiKey: string;
  }>({
    isOpen: false,
    appName: "",
    apiKey: "",
  });
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<AppListResponse>(
        `${API_BASE_URL}/api/apps`,
        { withCredentials: true },
      );

      const normalizedApps: App[] = response.data.apps.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        keyPrefix: app.keyPrefix,
        status: app.status === "ACTIVE" ? "active" : "inactive",
        createdAt:
          new Date(app.createdAt).toISOString().split("T")[0] || app.createdAt,
        lastUsedAt: app.lastUsedAt,
      }));

      setApps(normalizedApps);
      if (normalizedApps.length > 0) {
        setSelectedAppId((prev) => prev || normalizedApps[0].id);
      }
    } catch (caughtError) {
      setError("Failed to load apps");
      console.error("Failed to load apps", caughtError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApps();
  }, []);

  const sortedApps = useMemo(() => apps, [apps]);
  const activeAppCount = useMemo(
    () => sortedApps.filter((app) => app.status === "active").length,
    [sortedApps],
  );
  const handleCreateApp = async () => {
    if (!newAppName.trim()) return;

    try {
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/api/apps`,
        {
          name: newAppName.trim(),
          description: newAppDesc.trim() || null,
        },
        { withCredentials: true },
      );

      const created = response.data.app as {
        id: string;
        name: string;
        description: string | null;
        status: "ACTIVE" | "INACTIVE";
        createdAt: string;
        keyPrefix: string | null;
      };

      const app: App = {
        id: created.id,
        name: created.name,
        description: created.description,
        keyPrefix: created.keyPrefix,
        status: created.status === "ACTIVE" ? "active" : "inactive",
        createdAt:
          new Date(created.createdAt).toISOString().split("T")[0] ||
          created.createdAt,
        lastUsedAt: null,
      };

      setApps((prev) => [app, ...prev]);
      setSelectedAppId((prev) => prev || app.id);
      setKeyModal({
        isOpen: true,
        appName: app.name,
        apiKey: response.data.apiKey as string,
      });
      setIsKeyCopied(false);
      setNewAppName("");
      setNewAppDesc("");
      setShowCreateModal(false);
    } catch (caughtError) {
      setError("Failed to create app");
      console.error("Failed to create app", caughtError);
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      setError(null);
      await axios.delete(`${API_BASE_URL}/api/apps/${id}`, {
        withCredentials: true,
      });
      setApps((prev) => prev.filter((app) => app.id !== id));
      if (selectedAppId === id) {
        const remaining = apps.filter((app) => app.id !== id);
        setSelectedAppId(remaining[0]?.id || "");
      }
    } catch (caughtError) {
      setError("Failed to delete app");
      console.error("Failed to delete app", caughtError);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRotateKey = async (id: string) => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_BASE_URL}/api/apps/${id}/keys`,
        {},
        { withCredentials: true },
      );

      const apiKey = response.data.apiKey as string;
      const keyPrefix = response.data.keyPrefix as string;
      const appName = apps.find((app) => app.id === id)?.name || "Application";

      setApps((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                keyPrefix,
              }
            : app,
        ),
      );
      setKeyModal({
        isOpen: true,
        appName,
        apiKey,
      });
      setIsKeyCopied(false);
    } catch (caughtError) {
      setError("Failed to rotate key");
      console.error("Failed to rotate key", caughtError);
    }
  };

  const handleOpenDatabaseManager = (appId: string) => {
    navigate(`/developer/manage-apps/${appId}/schema`);
  };

  return (
    <main className="saas-shell grid min-h-screen overflow-x-hidden lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="saas-scrollbar flex min-w-0 flex-col overflow-x-hidden overflow-y-auto">
        <DashboardNavbar
          sectionLabel="Company Console"
          title="Vault Schema & Request Setup"
          searchPlaceholder="Search apps, tables, fields..."
        />

        <div className="mx-auto w-full max-w-325 min-w-0 flex-1 space-y-6 px-5 py-7 md:px-7">
          <section className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ color: "var(--text)" }}
              >
                Company Workspace
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Manage your applications, then open schema or consent request
                pages per app.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="neo-badge px-3 py-1 text-xs font-semibold">
                  {sortedApps.length} Total Apps
                </span>
                <span
                  className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
                  style={{ color: "var(--brand)" }}
                >
                  <span className="neo-dot" />
                  {activeAppCount} Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="saas-btn-primary inline-flex max-w-full items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-5 w-5" />
              Create App
            </button>
          </section>

          <section>
            <div className="grid gap-4">
              {isLoading ? (
                <div
                  className="saas-card rounded-2xl border p-8 text-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--muted)" }}
                  >
                    Loading applications...
                  </p>
                </div>
              ) : sortedApps.length === 0 ? (
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
                sortedApps.map((app) => (
                  <div
                    key={app.id}
                    className="saas-card saas-card-glow rounded-2xl p-6"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="grid gap-4 md:grid-cols-3 md:items-center">
                      <div className="min-w-0 md:col-span-1">
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
                              {app.description || "No description"}
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
                                className="transition-colors hover:opacity-80"
                                style={{ color: "var(--brand)" }}
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              app.status === "active"
                                ? "border-[rgba(176,204,255,0.42)] bg-[rgba(128,172,250,0.2)] text-(--text)"
                                : "border-[rgba(165,183,219,0.45)] bg-[rgba(122,143,181,0.18)] text-(--muted)"
                            }`}
                          >
                            {app.status === "active"
                              ? "✓ Active"
                              : "○ Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 md:col-span-1">
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "var(--muted)" }}
                        >
                          API Key
                        </p>
                        <div className="neo-inset mt-2 flex items-center gap-2 px-3 py-2">
                          <code
                            className="text-xs font-mono"
                            style={{ color: "var(--text)" }}
                          >
                            {formatApiKeyForDisplay(app)}
                          </code>
                          <button
                            onClick={() => {
                              if (app.keyPrefix) {
                                copyToClipboard(app.keyPrefix);
                              }
                            }}
                            className="transition-colors hover:opacity-80"
                            style={{ color: "var(--brand)" }}
                            title="Copy key prefix"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p
                          className="mt-2 text-xs"
                          style={{ color: "var(--muted)" }}
                        >
                          Full keys are shown once in a secure modal after
                          create/rotate.
                        </p>
                      </div>

                      <div className="min-w-0 md:col-span-1">
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
                              {toRelativeTime(app.lastUsedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              handleOpenDatabaseManager(app.id);
                            }}
                            className="saas-btn-secondary flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                          >
                            <Database className="h-4 w-4" />
                            Manage Database
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/developer/manage-apps/${app.id}/requests`,
                              )
                            }
                            className="saas-btn-secondary flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                          >
                            <Send className="h-4 w-4" />
                            Send Request
                          </button>
                          <button
                            onClick={() => handleRotateKey(app.id)}
                            className="saas-btn-secondary flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                          >
                            <Settings className="h-4 w-4" />
                            Rotate Key
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="flex min-w-0 items-center gap-2 rounded-lg border border-red-300/35 bg-red-100/75 px-3 py-2 text-sm font-semibold text-red-700 transition-all hover:bg-red-100"
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
            {error ? (
              <p
                className="mt-3 rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(255,150,170,0.4)",
                  background: "var(--danger-soft)",
                  color: "#ffd9e2",
                }}
              >
                {error}
              </p>
            ) : null}
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
                  className="saas-input mt-2"
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
                  className="saas-input mt-2"
                  placeholder="What does this app do?"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="saas-btn-secondary flex-1 rounded-lg px-4 py-2 font-semibold"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApp}
                className="saas-btn-primary flex-1 rounded-lg px-4 py-2 font-semibold transition disabled:opacity-50"
                disabled={!newAppName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {keyModal.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div
            className="saas-card w-full max-w-lg rounded-2xl p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Save API Key Now
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {keyModal.appName}: this key will not be shown again after you
              close this modal.
            </p>

            <div className="neo-inset mt-4 p-3">
              <code
                className="block overflow-x-auto text-xs font-mono"
                style={{ color: "var(--text)" }}
              >
                {keyModal.apiKey}
              </code>
            </div>

            <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
              Recommendation: store this key in your secrets manager before
              closing.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(keyModal.apiKey);
                  setIsKeyCopied(true);
                }}
                className="saas-btn-primary flex-1 rounded-lg px-4 py-2 font-semibold transition"
              >
                {isKeyCopied ? "Copied" : "Copy Key"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setKeyModal({ isOpen: false, appName: "", apiKey: "" });
                  setIsKeyCopied(false);
                }}
                className="saas-btn-secondary flex-1 rounded-lg px-4 py-2 font-semibold"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                I Stored It
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default ManageApps;
