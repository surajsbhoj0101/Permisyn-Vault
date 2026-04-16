import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";

type AppColumnType = "TEXT" | "NUMBER" | "BOOLEAN" | "DATE_TIME" | "JSON";

type AppSummary = {
  id: string;
  name: string;
  description: string | null;
};

type AppTableColumn = {
  id: string;
  name: string;
  key: string;
  type: AppColumnType;
  isRequired: boolean;
  isUnique: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencesTableId: string | null;
  referencesColumnId: string | null;
};

type AppTable = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  columns: AppTableColumn[];
};

type TableColumnDraft = {
  name: string;
  key: string;
  type: AppColumnType;
  isRequired: boolean;
  isUnique: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencesTableId: string;
  referencesColumnId: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const defaultColumnDraft = (): TableColumnDraft => ({
  name: "",
  key: "",
  type: "TEXT",
  isRequired: false,
  isUnique: false,
  isPrimaryKey: false,
  isForeignKey: false,
  referencesTableId: "",
  referencesColumnId: "",
});

function AppSchemaManager() {
  const { appId = "" } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<AppSummary | null>(null);
  const [tables, setTables] = useState<AppTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState("");
  const [newTableSlug, setNewTableSlug] = useState("");
  const [newTableDescription, setNewTableDescription] = useState("");
  const [columnDraftByTable, setColumnDraftByTable] = useState<
    Record<string, TableColumnDraft>
  >({});

  const loadSchema = async () => {
    if (!appId) return;

    try {
      setIsLoading(true);
      setError(null);
      const [appsResponse, tablesResponse] = await Promise.all([
        axios.get<{
          apps: Array<{ id: string; name: string; description: string | null }>;
        }>(`${API_BASE_URL}/api/apps`, { withCredentials: true }),
        axios.get<{ tables: AppTable[] }>(
          `${API_BASE_URL}/api/apps/${appId}/tables`,
          {
            withCredentials: true,
          },
        ),
      ]);

      const selected =
        appsResponse.data.apps.find((item) => item.id === appId) || null;
      setApp(selected);
      setTables(tablesResponse.data.tables);
    } catch (caughtError) {
      setError("Failed to load app schema");
      console.error("loadSchema error", caughtError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSchema();
  }, [appId]);

  const tableCount = tables.length;
  const columnCount = useMemo(
    () => tables.reduce((sum, table) => sum + table.columns.length, 0),
    [tables],
  );

  const getColumnDraft = (tableId: string) => {
    return columnDraftByTable[tableId] || defaultColumnDraft();
  };

  const updateColumnDraft = (
    tableId: string,
    patch: Partial<TableColumnDraft>,
  ) => {
    setColumnDraftByTable((prev) => ({
      ...prev,
      [tableId]: {
        ...getColumnDraft(tableId),
        ...patch,
      },
    }));
  };

  const handleCreateTable = async () => {
    if (!appId || !newTableName.trim()) return;

    try {
      setError(null);
      await axios.post(
        `${API_BASE_URL}/api/apps/${appId}/tables`,
        {
          name: newTableName.trim(),
          slug: newTableSlug.trim() || undefined,
          description: newTableDescription.trim() || null,
        },
        { withCredentials: true },
      );
      setNewTableName("");
      setNewTableSlug("");
      setNewTableDescription("");
      await loadSchema();
    } catch (caughtError) {
      setError("Failed to create table");
      console.error("handleCreateTable error", caughtError);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!appId) return;

    try {
      setError(null);
      await axios.delete(
        `${API_BASE_URL}/api/apps/${appId}/tables/${tableId}`,
        {
          withCredentials: true,
        },
      );
      await loadSchema();
    } catch (caughtError) {
      setError("Failed to delete table");
      console.error("handleDeleteTable error", caughtError);
    }
  };

  const handleCreateColumn = async (tableId: string) => {
    if (!appId) return;
    const draft = getColumnDraft(tableId);
    if (!draft.name.trim()) return;

    try {
      setError(null);
      await axios.post(
        `${API_BASE_URL}/api/apps/${appId}/tables/${tableId}/columns`,
        {
          name: draft.name.trim(),
          key: draft.key.trim() || undefined,
          type: draft.type,
          isRequired: draft.isRequired,
          isUnique: draft.isUnique,
          isPrimaryKey: draft.isPrimaryKey,
          isForeignKey: draft.isForeignKey,
          referencesTableId: draft.isForeignKey
            ? draft.referencesTableId || undefined
            : undefined,
          referencesColumnId: draft.isForeignKey
            ? draft.referencesColumnId || undefined
            : undefined,
        },
        { withCredentials: true },
      );

      setColumnDraftByTable((prev) => ({
        ...prev,
        [tableId]: defaultColumnDraft(),
      }));
      await loadSchema();
    } catch (caughtError) {
      setError("Failed to create column");
      console.error("handleCreateColumn error", caughtError);
    }
  };

  const handleDeleteColumn = async (tableId: string, columnId: string) => {
    if (!appId) return;

    try {
      setError(null);
      await axios.delete(
        `${API_BASE_URL}/api/apps/${appId}/tables/${tableId}/columns/${columnId}`,
        { withCredentials: true },
      );
      await loadSchema();
    } catch (caughtError) {
      setError("Failed to delete column");
      console.error("handleDeleteColumn error", caughtError);
    }
  };

  return (
    <main className="saas-shell min-h-screen overflow-x-hidden">
      <div className="saas-scrollbar flex min-h-screen min-w-0 flex-col overflow-x-hidden overflow-y-auto">
        <div className="mx-auto w-full max-w-325 flex-1 space-y-6 px-5 py-7 md:px-7">
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
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
                {app?.name || "Application"} Schema
              </h1>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
                Separate page for managing this app database.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="neo-badge px-3 py-1 text-xs font-semibold">
                  {tableCount} Tables
                </span>
                <span
                  className="neo-pill px-3 py-1 text-xs font-semibold"
                  style={{ color: "var(--brand)" }}
                >
                  {columnCount} Columns
                </span>
              </div>
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

          <section
            className="saas-card rounded-2xl p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="neo-surface grid gap-3 p-4 md:grid-cols-4">
              <div>
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--muted)" }}
                >
                  Table Name
                </p>
                <input
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="saas-input"
                  placeholder="Customers"
                />
              </div>
              <div>
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--muted)" }}
                >
                  Slug
                </p>
                <input
                  value={newTableSlug}
                  onChange={(e) => setNewTableSlug(e.target.value)}
                  className="saas-input"
                  placeholder="customers"
                />
              </div>
              <div>
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--muted)" }}
                >
                  Description
                </p>
                <input
                  value={newTableDescription}
                  onChange={(e) => setNewTableDescription(e.target.value)}
                  className="saas-input"
                  placeholder="Description (optional)"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCreateTable}
                  className="saas-btn-primary w-full rounded-lg px-3 py-2 text-sm font-semibold"
                  disabled={!newTableName.trim()}
                >
                  Add Table
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {isLoading ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Loading schema...
                </p>
              ) : tables.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  No tables yet for this app.
                </p>
              ) : (
                tables.map((table) => {
                  const draft = getColumnDraft(table.id);
                  const referenceTables = tables;
                  const selectedReferenceTableId =
                    draft.referencesTableId || referenceTables[0]?.id || "";
                  const referenceColumns =
                    referenceTables.find(
                      (item) => item.id === selectedReferenceTableId,
                    )?.columns || [];

                  return (
                    <div key={table.id} className="neo-surface rounded-xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3
                            className="text-base font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {table.name}
                          </h3>
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted)" }}
                          >
                            slug: {table.slug}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTable(table.id)}
                          className="rounded-lg border border-red-300/35 bg-red-100/75 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          Delete Table
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {table.columns.map((column) => (
                          <div
                            key={column.id}
                            className="neo-inset flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className="font-semibold"
                                style={{ color: "var(--text)" }}
                              >
                                {column.name}
                              </span>
                              <span
                                className="rounded bg-[rgba(132,160,218,0.2)] px-2 py-0.5"
                                style={{ color: "var(--muted)" }}
                              >
                                {column.key}
                              </span>
                              <span className="neo-badge px-2 py-0.5">
                                {column.type}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteColumn(table.id, column.id)
                              }
                              className="rounded border border-red-300/35 bg-red-100/75 px-2 py-1 text-xs font-semibold text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div
                        className="saas-card mt-4 rounded-xl p-4"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.12em]"
                          style={{ color: "var(--muted)" }}
                        >
                          Add Column
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <input
                            value={draft.name}
                            onChange={(e) =>
                              updateColumnDraft(table.id, {
                                name: e.target.value,
                              })
                            }
                            className="saas-input text-sm"
                            placeholder="Column Name"
                          />
                          <input
                            value={draft.key}
                            onChange={(e) =>
                              updateColumnDraft(table.id, {
                                key: e.target.value,
                              })
                            }
                            className="saas-input text-sm"
                            placeholder="column_key"
                          />
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-end">
                          <select
                            value={draft.type}
                            onChange={(e) =>
                              updateColumnDraft(table.id, {
                                type: e.target.value as AppColumnType,
                              })
                            }
                            className="saas-input text-sm"
                          >
                            <option value="TEXT">TEXT</option>
                            <option value="NUMBER">NUMBER</option>
                            <option value="BOOLEAN">BOOLEAN</option>
                            <option value="DATE_TIME">DATE_TIME</option>
                            <option value="JSON">JSON</option>
                          </select>
                          <label
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={draft.isRequired}
                              onChange={(e) =>
                                updateColumnDraft(table.id, {
                                  isRequired: e.target.checked,
                                })
                              }
                            />
                            Required
                          </label>
                          <label
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={draft.isUnique}
                              onChange={(e) =>
                                updateColumnDraft(table.id, {
                                  isUnique: e.target.checked,
                                })
                              }
                            />
                            Unique
                          </label>
                          <label
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={draft.isPrimaryKey}
                              onChange={(e) =>
                                updateColumnDraft(table.id, {
                                  isPrimaryKey: e.target.checked,
                                  isRequired: e.target.checked
                                    ? true
                                    : draft.isRequired,
                                  isUnique: e.target.checked
                                    ? true
                                    : draft.isUnique,
                                })
                              }
                            />
                            PK
                          </label>
                          <label
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={draft.isForeignKey}
                              onChange={(e) =>
                                updateColumnDraft(table.id, {
                                  isForeignKey: e.target.checked,
                                  referencesTableId: e.target.checked
                                    ? selectedReferenceTableId
                                    : "",
                                  referencesColumnId: e.target.checked
                                    ? referenceColumns[0]?.id || ""
                                    : "",
                                })
                              }
                            />
                            FK
                          </label>
                        </div>

                        {draft.isForeignKey ? (
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <select
                              value={selectedReferenceTableId}
                              onChange={(e) => {
                                const nextTableId = e.target.value;
                                const nextColumns =
                                  tables.find((item) => item.id === nextTableId)
                                    ?.columns || [];
                                updateColumnDraft(table.id, {
                                  referencesTableId: nextTableId,
                                  referencesColumnId: nextColumns[0]?.id || "",
                                });
                              }}
                              className="saas-input text-sm"
                            >
                              {tables.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={draft.referencesColumnId}
                              onChange={(e) =>
                                updateColumnDraft(table.id, {
                                  referencesColumnId: e.target.value,
                                })
                              }
                              className="saas-input text-sm"
                            >
                              {referenceColumns.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.key})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleCreateColumn(table.id)}
                          className="saas-btn-primary mt-3 rounded-lg px-4 py-2.5 text-sm font-semibold"
                          disabled={!draft.name.trim()}
                        >
                          Add Column
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AppSchemaManager;
