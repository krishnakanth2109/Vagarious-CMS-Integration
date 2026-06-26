import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Building2, User, X, Eye, Pencil, Plus, CheckCircle, Ban, SlidersHorizontal, DollarSign
} from "lucide-react";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

// Sleek Grey Input Styling
const inputCls = "w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-zinc-900 dark:text-zinc-100 transition-shadow placeholder-zinc-400";

const DEFAULT_CLIENT_FIELD_CONFIG = [
  { fieldName: "companyName", label: "Company Name", fieldType: "text", visible: true, isDefault: true },
  { fieldName: "contactPerson", label: "Contact Person", fieldType: "text", visible: true, isDefault: true },
  { fieldName: "email", label: "Email", fieldType: "email", visible: true, isDefault: true },
  { fieldName: "phone", label: "Phone", fieldType: "tel", visible: true, isDefault: true },
  { fieldName: "website", label: "Website", fieldType: "url", visible: true, isDefault: true },
  { fieldName: "industry", label: "Industry", fieldType: "text", visible: true, isDefault: true },
  { fieldName: "clientLocation", label: "Client Location", fieldType: "text", visible: true, isDefault: true },
  { fieldName: "gstNumber", label: "GST Number", fieldType: "text", visible: true, isDefault: true },
  { fieldName: "address", label: "Address", fieldType: "textarea", visible: true, isDefault: true },
  { fieldName: "locationLink", label: "Location Link", fieldType: "url", visible: true, isDefault: true },
  { fieldName: "percentage", label: "Commission %", fieldType: "number", visible: true, isDefault: true },
  { fieldName: "candidatePeriod", label: "Candidate Period", fieldType: "number", visible: true, isDefault: true },
  { fieldName: "replacementPeriod", label: "Replacement Period", fieldType: "number", visible: true, isDefault: true },
  { fieldName: "lockingPeriod", label: "Locking Period", fieldType: "number", visible: true, isDefault: true },
  { fieldName: "paymentMode", label: "Payment Mode", fieldType: "text", visible: true, isDefault: true },
  { fieldName: "terms", label: "Terms & Conditions", fieldType: "textarea", visible: true, isDefault: true },
  { fieldName: "notes", label: "Notes", fieldType: "textarea", visible: true, isDefault: true },
];

const REQUIRED_CLIENT_FIELD_NAMES = new Set(["companyName"]);

const normalizeClientFieldConfig = (config = {}) => {
  const storedFields = Array.isArray(config.fields) ? config.fields : [];
  const storedCustomFields = Array.isArray(config.customFields) ? config.customFields : [];
  return {
    fields: DEFAULT_CLIENT_FIELD_CONFIG.map(field => {
      const stored = storedFields.find(item => item.fieldName === field.fieldName) || {};
      const isMandatory = REQUIRED_CLIENT_FIELD_NAMES.has(field.fieldName) || Boolean(stored.isMandatory);
      return { ...field, ...stored, isDefault: true, isMandatory, visible: isMandatory ? true : stored.visible !== false };
    }),
    customFields: storedCustomFields.map(field => ({
      ...field,
      isDefault: false,
      isMandatory: Boolean(field.isMandatory),
      visible: field.visible !== false,
    })),
  };
};

const getClientFieldConfig = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    return normalizeClientFieldConfig(user?.clientSettings || { fields: DEFAULT_CLIENT_FIELD_CONFIG, customFields: [] });
  } catch {
    return normalizeClientFieldConfig({ fields: DEFAULT_CLIENT_FIELD_CONFIG, customFields: [] });
  }
};

const saveClientFieldConfig = (config) => {
  try {
    const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    sessionStorage.setItem("currentUser", JSON.stringify({ ...user, clientSettings: config }));
  } catch (_) {}
};

const ClientCustomFieldInput = ({ field, value, onChange }) => {
  const common = { value: value ?? "", onChange: e => onChange(field.fieldName, e.target.value) };
  if (field.fieldType === "textarea") {
    return <textarea {...common} rows={3} className={`${inputCls} resize-none`} />;
  }
  if (field.fieldType === "select") {
    return (
      <select value={value ?? ""} onChange={e => onChange(field.fieldName, e.target.value)} className={inputCls}>
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    );
  }
  if (field.fieldType === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(field.fieldName, e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-zinc-900" />
        Enabled
      </label>
    );
  }
  return <input type={field.fieldType || "text"} {...common} className={inputCls} />;
};

const ClientFormControlModal = ({ isOpen, onClose, config, onConfigChange }) => {
  const [draftField, setDraftField] = useState({ label: "", fieldType: "text", visible: true });
  if (!isOpen) return null;

  const toggleDefault = (fieldName) => {
    onConfigChange({
      ...config,
      fields: config.fields.map(field => field.fieldName === fieldName && !field.isMandatory ? { ...field, visible: !field.visible } : field),
    });
  };
  const toggleCustom = (index) => {
    const updated = { ...config, customFields: [...config.customFields] };
    updated.customFields[index] = { ...updated.customFields[index], visible: !updated.customFields[index].visible };
    onConfigChange(updated);
  };
  const updateCustomLabel = (index, value) => {
    const updated = { ...config, customFields: [...config.customFields] };
    updated.customFields[index] = { ...updated.customFields[index], label: value };
    onConfigChange(updated);
  };
  const deleteCustom = (index) => onConfigChange({ ...config, customFields: config.customFields.filter((_, idx) => idx !== index) });
  const addCustom = () => {
    const label = draftField.label.trim();
    if (!label) return;
    const baseName = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `custom_${Date.now()}`;
    const existing = new Set([...config.fields, ...config.customFields].map(field => field.fieldName));
    let fieldName = baseName;
    let counter = 2;
    while (existing.has(fieldName)) fieldName = `${baseName}_${counter++}`;
    onConfigChange({
      ...config,
      customFields: [...config.customFields, { ...draftField, label, fieldName, isDefault: false, isMandatory: false }],
    });
    setDraftField({ label: "", fieldType: "text", visible: true });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto lg:overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Client Form Control</p>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Manage client fields</h2>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-lg text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white text-xl leading-none">x</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] lg:h-[calc(92vh-82px)] h-auto min-h-0 flex-1 lg:overflow-hidden">
          <div className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 lg:overflow-y-auto overflow-visible">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 space-y-3">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Create additional field</p>
              <input value={draftField.label} onChange={e => setDraftField(prev => ({ ...prev, label: e.target.value }))} placeholder="Field label" className={inputCls} />
              <select value={draftField.fieldType} onChange={e => setDraftField(prev => ({ ...prev, fieldType: e.target.value }))} className={inputCls}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
                <option value="url">URL</option>
                <option value="textarea">Long Text</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <button onClick={addCustom} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>
          </div>
          <div className="p-5 lg:overflow-y-auto overflow-visible bg-zinc-50 dark:bg-zinc-950 space-y-5">
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Standard Fields</p>
                <span className="text-xs text-zinc-400">{config.fields.filter(field => field.visible).length}/{config.fields.length} visible</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.fields.map(field => (
                  <button key={field.fieldName} onClick={() => toggleDefault(field.fieldName)} disabled={field.isMandatory} className={`text-left rounded-xl border p-3 transition ${field.visible ? "border-zinc-300 bg-white dark:bg-zinc-900 shadow-sm" : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/40 opacity-70"} ${field.isMandatory ? "cursor-not-allowed" : "hover:border-zinc-400"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{field.label}</span>
                      <span className={`h-5 w-9 rounded-full p-0.5 transition ${field.visible ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"}`}>
                        <span className={`block h-4 w-4 rounded-full transition ${field.visible ? "translate-x-4 bg-white dark:bg-zinc-900" : "bg-white"}`} />
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{field.isMandatory ? "Required" : field.fieldType}</p>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Additional Fields</p>
                <span className="text-xs text-zinc-400">{config.customFields.length} fields</span>
              </div>
              {config.customFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 text-center">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">No additional fields yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.customFields.map((field, index) => (
                    <div key={field.fieldName} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
                      <input value={field.label} onChange={e => updateCustomLabel(index, e.target.value)} className={`${inputCls} sm:flex-1`} />
                      <span className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">{field.fieldType}</span>
                      <button onClick={() => toggleCustom(index)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${field.visible ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>{field.visible ? "Visible" : "Hidden"}</button>
                      <button onClick={() => deleteCustom(index)} className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-sm font-medium">Done</button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- DETAIL MODAL ---------------- */
const ClientDetailCard = ({ client, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Grey Gradient Header */}
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-950 text-white p-6 rounded-t-2xl border-b border-zinc-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{client.companyName}</h2>
                <div className="flex items-center gap-3 mt-2 text-zinc-300 text-sm">
                  <span className="bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700 text-xs font-mono">
                    {client.clientId}
                  </span>
                  {client.industry && <span>• {client.industry}</span>}
                  {client.clientLocation && <span>• {client.clientLocation}</span>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 text-zinc-800 dark:text-zinc-300">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info Card */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <User className="w-5 h-5 text-zinc-500" /> Contact Details
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between"><span className="text-zinc-500">Contact Person:</span> <span className="font-medium">{client.contactPerson || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Email:</span> <span className="font-medium">{client.email || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Phone:</span> <span className="font-medium">{client.phone || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Website:</span> <span className="font-medium">{client.website || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Location:</span> <span className="font-medium">{client.clientLocation || "-"}</span></p>
                  <div className="pt-2"><span className="text-zinc-500 block mb-1">Address:</span> <p className="font-medium text-xs leading-relaxed">{client.address || "-"}</p></div>
                </div>
              </div>

              {/* Business Terms Card */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <Building2 className="w-5 h-5 text-zinc-500" /> Business Terms
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between"><span className="text-zinc-500">Commission Rate:</span> <span className="font-medium">{client.percentage ? `${client.percentage}%` : "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Candidate Period:</span> <span className="font-medium">{client.candidatePeriod ? `${client.candidatePeriod} months` : "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Replacement:</span> <span className="font-medium">{client.replacementPeriod ? `${client.replacementPeriod} days` : "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Locking Period:</span> <span className="font-medium">{client.lockingPeriod || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Payment Mode:</span> <span className="font-medium">{client.paymentMode || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">GST Number:</span> <span className="font-medium font-mono text-xs">{client.gstNumber || "-"}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${client.active ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {client.active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {client.terms && (
              <div className="bg-zinc-100 dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h4 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Terms & Conditions</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">{client.terms}</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN DASHBOARD ---------------- */
export default function AdminClientInfo() {
  const { toast } = useToast();
  const { authHeaders } = useAuth();

  const getAuthHeader = useCallback(async () => ({
    "Content-Type": "application/json",
    ...(await authHeaders()),
  }), [authHeaders]);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [errors, setErrors] = useState({});

  // ADDED NEW FIELDS TO INITIAL STATE
  const initialFormState = {
    companyName: "", contactPerson: "", email: "", phone: "", website: "",
    address: "", locationLink: "", industry: "", gstNumber: "", notes: "",
    clientId: "", percentage: "", candidatePeriod: "", replacementPeriod: "",
    lockingPeriod: "", paymentMode: "", clientLocation: "", // New Fields
    terms: "", customFields: {}, active: true,
  };
  const [form, setForm] = useState(initialFormState);
  const [clientFieldConfig, setClientFieldConfig] = useState(getClientFieldConfig);
  const [clientFormControlOpen, setClientFormControlOpen] = useState(false);

  const handleClientConfigChange = (updated) => {
    const normalized = normalizeClientFieldConfig(updated);
    setClientFieldConfig(normalized);
    saveClientFieldConfig(normalized);
  };

  const isClientFieldVisible = (fieldName) => {
    const field = clientFieldConfig.fields.find(item => item.fieldName === fieldName);
    return field ? field.visible !== false : true;
  };

  const visibleCustomClientFields = useMemo(
    () => clientFieldConfig.customFields.filter(field => field.visible),
    [clientFieldConfig]
  );

  const handleCustomClientFieldChange = (fieldName, value) => {
    setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [fieldName]: value } }));
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/clients`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClients(data.map((c) => ({ ...c, id: c._id })));
    } catch {
      toast({ title: "Error", description: "Failed to load clients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => { fetchClients(); }, []);

  const validateForm = () => {
    const e = {};

    // ── Company Name: required, letters/spaces/punctuation only, 2–100 chars
    if (!form.companyName.trim()) {
      e.companyName = "Company name is required";
    } else if (!/^[a-zA-Z\s'.,&()\-]{2,100}$/.test(form.companyName.trim())) {
      e.companyName = "Company name must contain letters only (no numbers)";
    }

    // ── Contact Person: optional, letters/spaces only if filled ──────────────
    if (form.contactPerson.trim() && !/^[a-zA-Z\s'.'\-]{2,80}$/.test(form.contactPerson.trim())) {
      e.contactPerson = "Contact person must be letters only (2–80 chars)";
    }

    // ── Email: optional, valid format if filled ───────────────────────────────
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      e.email = "Enter a valid email address (e.g. name@company.com)";
    }

    // ── Phone: optional, exactly 10 digits starting with 6-9 if filled ───────
    if (form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[\s\-+]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        e.phone = "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
      }
    }

    // ── Industry: optional, letters/spaces only if filled ────────────────────
    if (form.industry.trim() && !/^[a-zA-Z\s&\/\-,]{2,80}$/.test(form.industry.trim())) {
      e.industry = "Industry must be letters only (2–80 chars)";
    }

    // ── Website: optional, must look like a URL if filled ────────────────────
    if (form.website.trim() && !/^(https?:\/\/)?(www\.)?[\w\-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(form.website.trim())) {
      e.website = "Enter a valid website URL (e.g. https://company.com)";
    }

    // ── GST Number: optional, standard 15-char Indian GST format if filled ───
    if (form.gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim().toUpperCase())) {
      e.gstNumber = "Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5)";
    }

    // ── Commission %: optional, must be a number 0–100 if filled ─────────────
    if (form.percentage.toString().trim() !== "") {
      const pct = Number(form.percentage);
      if (isNaN(pct) || !/^\d+(\.\d+)?$/.test(form.percentage.toString().trim())) {
        e.percentage = "Commission must be a number (e.g. 15 or 15.5)";
      } else if (pct < 0 || pct > 100) {
        e.percentage = "Commission % must be between 0 and 100";
      }
    }

    // ── Candidate Period: optional, must be a positive integer (months) ───────
    if (form.candidatePeriod.toString().trim() !== "") {
      const cp = Number(form.candidatePeriod);
      if (!Number.isInteger(cp) || cp < 1 || cp > 120) {
        e.candidatePeriod = "Must be a whole number of months (1–120)";
      }
    }

    // ── Replacement Period: optional, must be a positive integer (days) ───────
    if (form.replacementPeriod.toString().trim() !== "") {
      const rp = Number(form.replacementPeriod);
      if (!Number.isInteger(rp) || rp < 1 || rp > 365) {
        e.replacementPeriod = "Must be a whole number of days (1–365)";
      }
    }

    // ── Locking Period: optional, must be a positive integer (days) ────────────
    if (form.lockingPeriod.toString().trim() !== "") {
      const lp = Number(form.lockingPeriod);
      if (!Number.isInteger(lp) || lp < 1 || lp > 365) {
        e.lockingPeriod = "Locking period must be a whole number of days (1–365)";
      }
    }

    // ── Payment Mode: optional, letters/numbers/hyphens if filled ────────────
    if (form.paymentMode.trim() && !/^[a-zA-Z0-9\s\-\/]{2,50}$/.test(form.paymentMode.trim())) {
      e.paymentMode = "Payment mode must be 2–50 alphanumeric characters (e.g. Net-30)";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone" && /[^0-9]/.test(value)) return;
    if (name === "phone" && value.length > 10) return;
    if (name === "lockingPeriod" && value !== "" && /[^0-9]/.test(value)) return;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) {
      const copy = { ...errors };
      delete copy[name];
      setErrors(copy);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const url = editingClient ? `${API_URL}/clients/${editingClient.id}` : `${API_URL}/clients`;
      const headers = await getAuthHeader();
      const res = await fetch(url, {
        method: editingClient ? "PUT" : "POST",
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      const normalized = { ...saved, id: saved._id };

      // Update local state directly — no full refetch needed
      if (editingClient) {
        setClients(prev => prev.map(c => c.id === editingClient.id ? normalized : c));
      } else {
        setClients(prev => [normalized, ...prev]);
      }

      toast({ title: "Success", description: "Client saved successfully" });
      setShowForm(false);
      setEditingClient(null);
      setForm(initialFormState);
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    }
  };

  const handleEditClient = (client) => {
    setErrors({});
    setEditingClient(client);
    setForm({
      ...initialFormState, ...client,
      percentage: client.percentage?.toString() || "",
      candidatePeriod: client.candidatePeriod?.toString() || "",
      replacementPeriod: client.replacementPeriod?.toString() || "",
      lockingPeriod: client.lockingPeriod || "", // Handle new field
      paymentMode: client.paymentMode || "", // Handle new field
      clientLocation: client.clientLocation || "", // Handle new field
      customFields: client.customFields || {},
      active: client.active !== false,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (client) => {
    try {
      const headers = await getAuthHeader();
      await fetch(`${API_URL}/clients/${client.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ active: nextActive }),
      });
      // Update local state directly — no full refetch
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: nextActive } : c));
    } catch { }
  };

  const uniqueIndustries = useMemo(() => Array.from(new Set(clients.map((c) => c.industry).filter(Boolean))), [clients]);

  const filteredClients = useMemo(() => clients.filter((c) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = c.companyName.toLowerCase().includes(s) || (c.email || "").toLowerCase().includes(s);
    const matchIndustry = industryFilter === "all" || c.industry === industryFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? c.active !== false : c.active === false);
    return matchSearch && matchIndustry && matchStatus;
  }), [clients, searchTerm, industryFilter, statusFilter]);

  const renderClientField = (name, label, options = {}) => {
    if (!isClientFieldVisible(name)) return null;
    const { type = "text", placeholder = "", required = false, textarea = false, span = "" } = options;
    return (
      <div className={span}>
        <label className="block text-xs font-medium text-zinc-500 mb-1">{label}{required ? " *" : ""}</label>
        {textarea ? (
          <textarea
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            rows={3}
            className={`${inputCls} resize-none ${errors[name] ? "border-red-500" : ""}`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            className={`${inputCls} ${errors[name] ? "border-red-500" : ""}`}
          />
        )}
        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100">

      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Clients</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage client profiles and business terms</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setClientFormControlOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Form Settings
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditingClient(null);
                setShowForm(true);
                setForm(initialFormState);
                setErrors({});
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add Client
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            placeholder="Search by company or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500"
          />
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-700 sm:w-44"
          >
            <option value="all">All Industries</option>
            {uniqueIndustries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-700 sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-xl text-zinc-900 dark:text-white">
                  {editingClient ? "Edit Client Profile" : "Create New Client"}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">Client details, commercial terms, and additional fields</p>
              </div>
              <div className="flex items-center gap-2">
                {!editingClient && (
                  <button onClick={() => setClientFormControlOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <SlidersHorizontal className="w-4 h-4" /> Form Control
                  </button>
                )}
                <button
                  onClick={() => { setShowForm(false); setEditingClient(null); setErrors({}); }}
                  className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-zinc-500" />
                  <h4 className="font-semibold text-zinc-900 dark:text-white">Company Details</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {renderClientField("companyName", "Company Name", { required: true, placeholder: "Company name" })}
                  {renderClientField("industry", "Industry", { placeholder: "e.g. IT Services" })}
                  {renderClientField("clientLocation", "Client Location", { placeholder: "City, State" })}
                  {renderClientField("website", "Website", { type: "url", placeholder: "https://company.com" })}
                  {renderClientField("gstNumber", "GST Number", { placeholder: "e.g. 22AAAAA0000A1Z5" })}
                  {renderClientField("locationLink", "Location Link", { type: "url", placeholder: "Google Maps URL" })}
                  {renderClientField("address", "Address", { textarea: true, span: "md:col-span-3", placeholder: "Full address..." })}
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-zinc-500" />
                  <h4 className="font-semibold text-zinc-900 dark:text-white">Contact Details</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {renderClientField("contactPerson", "Contact Person", { placeholder: "Contact person" })}
                  {renderClientField("email", "Email", { type: "email", placeholder: "name@company.com" })}
                  {renderClientField("phone", "Phone (10 digits)", { type: "tel", placeholder: "9876543210" })}
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                  <h4 className="font-semibold text-zinc-900 dark:text-white">Business Terms</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {renderClientField("percentage", "Commission %", { placeholder: "e.g. 15" })}
                  {renderClientField("candidatePeriod", "Candidate Period", { placeholder: "Months" })}
                  {renderClientField("replacementPeriod", "Replacement Period", { placeholder: "Days" })}
                  {renderClientField("lockingPeriod", "Locking Period", { placeholder: "Days" })}
                  {renderClientField("paymentMode", "Payment Mode", { placeholder: "e.g. Net-30" })}
                  {renderClientField("terms", "Terms & Conditions", { textarea: true, span: "md:col-span-3", placeholder: "Commercial terms..." })}
                  {renderClientField("notes", "Notes", { textarea: true, span: "md:col-span-3", placeholder: "Internal notes..." })}
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Additional Fields</p>
                    <h4 className="font-semibold text-zinc-900 dark:text-white mt-1">Custom client inputs</h4>
                  </div>
                  {!editingClient && (
                    <button onClick={() => setClientFormControlOpen(true)} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <SlidersHorizontal className="w-4 h-4" /> Manage Fields
                    </button>
                  )}
                </div>
                {visibleCustomClientFields.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-5">
                    {visibleCustomClientFields.map(field => (
                      <div key={field.fieldName} className={field.fieldType === "textarea" ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">{field.label}</label>
                        <ClientCustomFieldInput field={field} value={form.customFields?.[field.fieldName]} onChange={handleCustomClientFieldChange} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 text-center">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">No additional fields enabled</p>
                    <p className="text-xs text-zinc-500 mt-1">Use Form Control to add or show custom fields here.</p>
                  </div>
                )}
              </section>
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setEditingClient(null); setErrors({}); }}
                className="px-5 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
              >
                {editingClient ? "Update Client" : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Area */}
      {loading ? (
        <div className="text-center p-12 text-zinc-500 flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mb-4"></div>
          Loading clients...
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left whitespace-nowrap">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredClients.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm font-medium text-zinc-400">No clients found matching criteria.</td></tr>
                ) : filteredClients.map((client) => {
                  const clientCode = client.clientCode || client.code || client.shortCode || (client.companyName || "CLI")
                    .replace(/[^a-zA-Z]/g, "")
                    .slice(0, 3)
                    .toUpperCase() || "CLI";
                  return (
                  <tr key={client.id} className="transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold leading-tight text-zinc-950 dark:text-white">{client.companyName}</div>
                      <div className="mt-1 text-xs font-medium text-zinc-500">{client.clientId || "-"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex min-w-[58px] items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold leading-none text-white">
                        {clientCode}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold leading-tight text-zinc-800 dark:text-zinc-100">{client.contactPerson || "-"}</div>
                      <div className="mt-1 text-xs font-medium text-zinc-500">{client.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {client.email || "-"}
                    </td>

                    <td className="px-6 py-5">
                      <span className={`inline-flex min-w-[74px] items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold leading-none ${client.active !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                        {client.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedClient(client)}
                          title="View Details"
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          title="Edit"
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(client)}
                          title={client.active !== false ? "Deactivate" : "Activate"}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          {client.active !== false
                            ? <Ban className="w-4 h-4" />
                            : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClientFormControlModal
        isOpen={clientFormControlOpen}
        onClose={() => setClientFormControlOpen(false)}
        config={clientFieldConfig}
        onConfigChange={handleClientConfigChange}
      />

      {/* Render Modal */}
      {selectedClient && <ClientDetailCard client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
}
