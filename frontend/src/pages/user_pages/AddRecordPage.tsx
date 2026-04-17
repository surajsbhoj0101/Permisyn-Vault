import React, { useEffect, useRef, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import axios from "axios";
import { Trash2, Pencil, Plus, Lock, Unlock, X, Eye, EyeOff } from "lucide-react";
import gsap from "gsap";
import { encryptData, decryptData } from "../../utils/encryption";
import Toast from "../../components/Toast";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

interface EncryptedValue {
  encryptedData: string;
  iv: string;
}

interface VaultRecord {
  id: string;
  key: string;
  value: string | EncryptedValue;
  isEncrypted: boolean;
  updatedAt: string;
}

interface FieldInput {
  key: string;
  value: string;
  encrypted: boolean;
}


const AddRecordPage: React.FC = () => {
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [fields, setFields] = useState<FieldInput[]>([
    { key: "", value: "", encrypted: false },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [redNotice, setRedNotice] = useState<string | null>(null);
  const [keyErrors, setKeyErrors] = useState<Record<number, string | null>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  const listRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/vault/records`, {
      withCredentials: true,
    });
    const normalized = (res.data.records || []).map((r: unknown) => {
      if (typeof r !== "object" || r === null) {
        return r as VaultRecord;
      }

      const rec = r as Record<string, unknown>;
      const base: VaultRecord = {
        id: String(rec.id ?? ""),
        key: String(rec.key ?? ""),
        value: (rec.value as VaultRecord["value"]) ?? "",
        isEncrypted: Boolean(rec.isEncrypted),
        updatedAt: String(rec.updatedAt ?? ""),
      };

      if (base.isEncrypted && typeof base.value === "string") {
        try {
          const parsed = JSON.parse(base.value as string);
          base.value = parsed as VaultRecord["value"];
        } catch {
          // leave value as-is if parsing fails
        }
      }

      return base;
    });

    setVaultRecords(normalized);
  };

  const existingKeys = useMemo(() => new Set((vaultRecords || []).map((r) => (r.key || "").trim().toLowerCase())), [vaultRecords]);

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return vaultRecords;
    return vaultRecords.filter((r) => (r.key || "").toLowerCase().includes(q));
  }, [vaultRecords, searchQuery]);

  useEffect(() => {
    if (!listRef.current) return;
    gsap.fromTo(
      listRef.current.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }
    );
  }, [filteredRecords]);

  type EthereumProvider = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };

  const getSignature = async (): Promise<string> => {
    const provider = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
    if (!provider) throw new Error("Wallet not found");

    const accountsRaw = await provider.request({ method: "eth_requestAccounts" });
    const accounts = Array.isArray(accountsRaw) ? (accountsRaw as string[]) : [String(accountsRaw)];
    const address = accounts[0];

    const sigRaw = await provider.request({ method: "personal_sign", params: ["Permisyn Encryption Module", address] });
    return String(sigRaw);
  };

  const handleReveal = async (record: VaultRecord) => {
    try {
      // Accept both parsed object and JSON-string (parsed on load), but
      // be defensive and attempt to parse if needed.
      let enc: EncryptedValue | null = null;

      if (
        typeof record.value === "object" &&
        record.value !== null &&
        "encryptedData" in record.value &&
        "iv" in record.value
      ) {
        enc = record.value as EncryptedValue;
      } else if (typeof record.value === "string" && record.isEncrypted) {
        try {
          const parsed = JSON.parse(record.value);
          if (
            parsed &&
            typeof parsed === "object" &&
            "encryptedData" in parsed &&
            "iv" in parsed
          ) {
            enc = parsed as EncryptedValue;
          }
        } catch {
            // ignore parse error
          }
      }

      if (!enc) return;

      const signature = await getSignature();
      const decrypted = await decryptData(enc.encryptedData, enc.iv, signature);

      setRevealed((prev) => ({ ...prev, [record.id]: decrypted }));
    } catch (err) {
      console.error(err);
    }
  };

  // realtime validate keys: uniqueness (against existing records and within form)
  useEffect(() => {
    const errors: Record<number, string | null> = {};
    const localSeen = new Map<string, number>();
    const currentRecordKeyNormalized = editingId ? (vaultRecords.find((r) => r.id === editingId)?.key || "").trim().toLowerCase() : null;

    fields.forEach((f, i) => {
      const normalized = (f.key || "").trim().toLowerCase();
      if (!normalized) {
        return;
      }

      if (localSeen.has(normalized)) {
        errors[i] = "Duplicate key in form";
        errors[localSeen.get(normalized)!] = "Duplicate key in form";
        return;
      }
      localSeen.set(normalized, i);

      if (existingKeys.has(normalized)) {
        if (!(editingId && currentRecordKeyNormalized === normalized)) {
          errors[i] = "Key already exists";
        }
      }
    });

    setKeyErrors(errors);
  }, [fields, vaultRecords, editingId, existingKeys]);

  const extractErrorMessage = (err: unknown, fallback = "Failed to save record") => {
    if (!err || typeof err !== "object") return fallback;
    const resp = (err as Record<string, unknown>).response;
    if (!resp || typeof resp !== "object") return fallback;
    const data = (resp as Record<string, unknown>).data;
    if (!data || typeof data !== "object") return fallback;
    const msg = (data as Record<string, unknown>).error;
    return typeof msg === "string" ? msg : fallback;
  };

  const handleSave = async () => {
    const filtered = fields.filter((f) => f.key.trim());
    // prevent save if any key errors exist
    if (Object.values(keyErrors).some((v) => !!v)) {
      setRedNotice("Fix key errors before saving");
      return;
    }

    const isUpdate = !!editingId;
    if (!filtered.length) return;

    try {
      setIsSaving(true);

      const signature = await getSignature();

      const processed = await Promise.all(
        filtered.map(async (f) => {
          const shouldEncrypt =
            f.encrypted === true &&
            typeof f.value === "string" &&
            f.value.trim() !== "";

          let value: string | EncryptedValue = f.value;

          if (shouldEncrypt) {
            value = await encryptData(f.value, signature);
          }

          return {
            // normalize key to trimmed lowercase
            key: f.key.trim().toLowerCase(),
            value,
            encrypted: shouldEncrypt,
          };
        })
      );

      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/api/vault/records/${editingId}`,
          { fields: processed },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/vault/records`,
          { fields: processed },
          { withCredentials: true }
        );
      }

      setFields([{ key: "", value: "", encrypted: false }]);
      setEditingId(null);
      await loadData();
      setNotice(isUpdate ? "Record updated" : "Record saved");
    } catch (err: unknown) {
      console.error(err);
      const msg = extractErrorMessage(err, "Failed to save record");
      setRedNotice(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);

      await axios.delete(
        `${API_BASE_URL}/api/vault/records/${deleteId}`,
        { withCredentials: true }
      );

      setDeleteId(null);
      await loadData();
        setNotice("Record deleted");
    } catch (err: unknown) {
      console.error(err);
      const msg = extractErrorMessage(err, "Failed to delete record");
      setRedNotice(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (record: VaultRecord) => {
    setEditingId(record.id);

    const isEncrypted = record.isEncrypted === true;

    setFields([
      {
        key: record.key,
        value: isEncrypted ? "" : String(record.value ?? ""),
        encrypted: isEncrypted,
      },
    ]);
  };

  const updateField = (i: number, patch: Partial<FieldInput>) => {
    const next = [...fields];
    next[i] = { ...next[i], ...patch };
    setFields(next);
  };

  const addField = () => {
    setFields([...fields, { key: "", value: "", encrypted: false }]);
  };

  const removeField = (i: number) => {
    const next = fields.filter((_, idx) => idx !== i);
    setFields(
      next.length ? next : [{ key: "", value: "", encrypted: false }]
    );
  };

  return (
    <main className="saas-shell grid min-h-screen lg:grid-cols-[280px_1fr]">
      <Sidebar />
            <Toast
              notice={notice}
              redNotice={redNotice}
              onClearNotice={() => setNotice(null)}
              onClearRedNotice={() => setRedNotice(null)}
            />

      <div className="saas-scrollbar flex flex-col overflow-y-auto space-y-6">
        <DashboardNavbar
          sectionLabel="Records Vault"
          title="Encrypt and manage your sensitive data"
          searchPlaceholder="Search keys..."
          onSearch={(q) => setSearchQuery(q)}
        />

        <div className="gap-6 p-3 flex flex-col">
          <div className="saas-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Record" : "New Record"}
              </h2>

              {editingId && (
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={i}>
                  <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                  <input
                    className="saas-input"
                    placeholder="Key"
                    value={f.key}
                    onChange={(e) =>
                      updateField(i, { key: e.target.value })
                    }
                  />

                  <input
                    className="saas-input"
                    placeholder="Value"
                    value={f.value}
                    onChange={(e) =>
                      updateField(i, { value: e.target.value })
                    }
                  />

                  <button
                    onClick={() =>
                      updateField(i, { encrypted: !f.encrypted })
                    }
                    className={`p-2 rounded-md transition ${
                      f.encrypted
                        ? "bg-green-500/20 text-green-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {f.encrypted ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>

                  <button
                    onClick={() => removeField(i)}
                    className="text-red-400 hover:scale-110 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                  </div>
                  {keyErrors[i] ? (
                    <p className="text-xs text-red-400 mt-1">{keyErrors[i]}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              onClick={addField}
              className="mt-4 text-sm text-blue-400 hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Add Field
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || Object.values(keyErrors).some((v) => !!v)}
              className="mt-5 w-full bg-blue-500 hover:bg-blue-600 transition text-white rounded-xl py-2.5 font-medium"
            >
              {isSaving ? "Saving..." : "Save Record"}
            </button>
          </div>

          <div ref={listRef} className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="saas-card p-8 text-center text-gray-400 rounded-2xl">
                {searchQuery ? "No matching records" : "No records yet"}
              </div>
            ) : (
              filteredRecords.map((record) => {
                const isEncrypted = record.isEncrypted === true;

                const isRevealed = revealed[record.id];

                const displayValue = isEncrypted
                  ? isRevealed || "••••••••"
                  : String(record.value ?? "");

                return (
                  <div
                    key={record.id}
                    className="saas-card p-4 rounded-xl hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium flex items-center gap-2">
                        {isEncrypted ? (
                          <Lock size={14} className="text-green-400" />
                        ) : (
                          <Unlock size={14} className="text-gray-400" />
                        )}

                        {record.key}: {displayValue}
                      </h3>

                      <div className="flex gap-3 items-center">
                        {isEncrypted && (
                          <button
                            onClick={async () => {
                              if (revealed[record.id]) {
                                setRevealed((prev) => {
                                  const copy = { ...prev };
                                  delete copy[record.id];
                                  return copy;
                                });
                              } else {
                                await handleReveal(record);
                              }
                            }}
                            className="text-yellow-400 hover:scale-110 transition"
                          >
                            {isRevealed ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-400 hover:scale-110 transition"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteId(record.id)}
                          className="text-red-400 hover:scale-110 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(record.updatedAt).toLocaleString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {deleteId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="saas-card p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-red-400 font-semibold flex items-center gap-2">
                <Trash2 size={16} /> Delete Record
              </h2>

              <p className="mt-3 text-sm text-gray-400">
                This will permanently delete your data.
                <br />
                <span className="text-red-400">This cannot be undone.</span>
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AddRecordPage;