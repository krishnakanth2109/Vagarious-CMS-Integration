import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, Eye, Trash2, X, User, Mail, Phone,
  Briefcase, MapPin, Clock, Star, MessageSquare, Building2,
  Calendar, Layers, ChevronDown, Loader2, RefreshCw, Users,
  TrendingUp, CheckCircle2, AlertCircle
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  currentCompany?: string;
  currentRole?: string;
  appliedJob: string;
  appliedCompany?: string; // ✅ FIX: Added appliedCompany field
  skills: string[];
  preferredLocation?: string;
  noticePeriod?: string;
  message?: string;
  submittedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];

const getColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-blue-500" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

// ─── Candidate Modal ──────────────────────────────────────────────────────────
const CandidateModal = ({ candidate, onClose, onDelete }: {
  candidate: Candidate;
  onClose: () => void;
  onDelete: (id: string) => void;
}) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getColor(candidate.name)} p-6 pb-10`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {getInitials(candidate.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <p className="text-white/80 text-sm mt-0.5">{candidate.appliedJob}</p>
              {/* ✅ FIX: Show applied company in modal header */}
              {candidate.appliedCompany && (
                <p className="text-white/70 text-xs mt-0.5">@ {candidate.appliedCompany}</p>
              )}
              <p className="text-white/60 text-xs mt-1">Applied {formatDate(candidate.submittedAt)}</p>
            </div>
          </div>
        </div>

        {/* Skills Banner */}
        <div className="-mt-5 mx-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-0">
          <DetailRow icon={Mail} label="Email" value={candidate.email} />
          <DetailRow icon={Phone} label="Phone" value={candidate.phone} />
          <DetailRow icon={TrendingUp} label="Experience" value={`${candidate.experience} years`} />
          <DetailRow icon={Building2} label="Applied To Company" value={candidate.appliedCompany} /> {/* ✅ FIX */}
          <DetailRow icon={Building2} label="Current Company" value={candidate.currentCompany} />
          <DetailRow icon={Briefcase} label="Current Role" value={candidate.currentRole} />
          <DetailRow icon={MapPin} label="Preferred Location" value={candidate.preferredLocation} />
          <DetailRow icon={Clock} label="Notice Period" value={candidate.noticePeriod} />
          {candidate.message && (
            <div className="py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100">
                {candidate.message}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => { onDelete(candidate._id); onClose(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition border border-red-100"
          >
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch
  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/candidates`);
      setCandidates(res.data);
    } catch {
      setError("Failed to fetch candidates. Please check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  // Delete
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await axios.delete(`${API_URL}/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert("Failed to delete candidate.");
    } finally {
      setDeleting(null);
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Experience", "Applied Job", "Applied Company", "Current Company", "Current Role", "Skills", "Preferred Location", "Notice Period", "Message", "Submitted At"];
    const rows = candidates.map((c) => [
      c.name, c.email, c.phone, c.experience, c.appliedJob,
      c.appliedCompany || "", // ✅ FIX: Export applied company too
      c.currentCompany || "", c.currentRole || "",
      c.skills.join("; "), c.preferredLocation || "",
      c.noticePeriod || "", c.message || "",
      formatDate(c.submittedAt)
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates_${Date.now()}.csv`;
    a.click();
  };

  // ✅ FIX: Unique jobs now includes company name so filter dropdown shows "Role @ Company"
  const uniqueJobs = useMemo(() => {
    const jobSet = new Set<string>();
    candidates.forEach((c) => {
      const label = c.appliedCompany
        ? `${c.appliedJob} @ ${c.appliedCompany}`
        : c.appliedJob;
      jobSet.add(label);
    });
    return ["All", ...Array.from(jobSet)];
  }, [candidates]);

  // ✅ FIX: Filter matches against both appliedJob and appliedCompany
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.appliedJob.toLowerCase().includes(search.toLowerCase()) ||
        (c.appliedCompany || "").toLowerCase().includes(search.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const candidateLabel = c.appliedCompany
        ? `${c.appliedJob} @ ${c.appliedCompany}`
        : c.appliedJob;
      const matchesJob = jobFilter === "All" || candidateLabel === jobFilter;

      return matchesSearch && matchesJob;
    });
  }, [candidates, search, jobFilter]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <AdminLayout title="Candidates">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Candidates" value={candidates.length} color="bg-blue-500" />
          <StatCard icon={Briefcase} label="Unique Roles" value={uniqueJobs.length - 1} color="bg-violet-500" />
          <StatCard icon={Calendar} label="This Month" value={candidates.filter(c => new Date(c.submittedAt).getMonth() === new Date().getMonth()).length} color="bg-emerald-500" />
          <StatCard icon={TrendingUp} label="Avg Experience" value={candidates.length > 0 ? `${(candidates.reduce((a, c) => a + parseFloat(c.experience || "0"), 0) / candidates.length).toFixed(1)}y` : "—"} color="bg-amber-500" />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, skills, role, company..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Job Filter — now shows "Role @ Company" */}
            <div className="relative">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {uniqueJobs.map((j) => <option key={j}>{j}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchCandidates}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filter result count */}
          {(search || jobFilter !== "All") && (
            <p className="text-xs text-gray-400 mt-3">
              Showing {filtered.length} of {candidates.length} candidates
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 size={36} className="animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading candidates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-24">
            <div className="text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold mb-1">Connection Error</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button onClick={fetchCandidates} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Try Again
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-24">
            <div className="text-center">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">No candidates found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-6 py-4 text-left">Candidate</th>
                      <th className="px-6 py-4 text-left">Applied For</th>
                      <th className="px-6 py-4 text-left">Experience</th>
                      <th className="px-6 py-4 text-left">Skills</th>
                      <th className="px-6 py-4 text-left">Location</th>
                      <th className="px-6 py-4 text-left">Notice</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-gray-50"
                  >
                    {filtered.map((c) => (
                      <motion.tr
                        key={c._id}
                        variants={item}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* Candidate */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(c.name)} text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0`}>
                              {getInitials(c.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.email}</p>
                              <p className="text-xs text-gray-400">{c.phone}</p>
                            </div>
                          </div>
                        </td>

                        {/* ✅ FIX: Applied For now shows BOTH Role AND Company */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 max-w-[160px] truncate">{c.appliedJob}</p>
                            {/* ✅ Show applied company prominently */}
                            {c.appliedCompany && (
                              <p className="text-xs text-blue-500 font-medium mt-0.5">@ {c.appliedCompany}</p>
                            )}
                            {c.currentRole && (
                              <p className="text-xs text-gray-400 mt-0.5">Currently: {c.currentRole}</p>
                            )}
                            {c.currentCompany && (
                              <p className="text-xs text-gray-400">({c.currentCompany})</p>
                            )}
                          </div>
                        </td>

                        {/* Experience */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                            <TrendingUp size={11} />
                            {c.experience}y
                          </span>
                        </td>

                        {/* Skills */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {c.skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md font-medium">
                                {s}
                              </span>
                            ))}
                            {c.skills.length > 3 && (
                              <span className="text-[10px] text-gray-400 px-1">+{c.skills.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          {c.preferredLocation ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin size={12} className="text-gray-400" />
                              {c.preferredLocation}
                            </div>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>

                        {/* Notice */}
                        <td className="px-6 py-4">
                          {c.noticePeriod ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock size={12} className="text-gray-400" />
                              {c.noticePeriod}
                            </div>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar size={12} className="text-gray-400" />
                            {formatDate(c.submittedAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCandidate(c)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-100"
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              disabled={deleting === c._id}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                            >
                              {deleting === c._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                  {filtered.length} candidate{filtered.length !== 1 ? "s" : ""} · Last refreshed just now
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
};

export default AdminCandidates;