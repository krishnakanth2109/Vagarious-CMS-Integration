import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import CandidateProfileLink from '@/components/CandidateProfileLink';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
  New:         { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  Reviewed:    { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Shortlisted: { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  Rejected:    { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
  Hired:       { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

const STATUS_OPTIONS = ['All', 'New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.New;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}

function DetailModal({ app, onClose, onStatusChange, canEdit }) {
  const [status, setStatus]     = useState(app.status);
  const [notes, setNotes]       = useState(app.adminNotes || '');
  const [saving, setSaving]     = useState(false);
  const { authHeaders }         = useAuth();
  const [promoting, setPromoting] = useState(false);
  const [promoteStep, setPromoteStep] = useState('idle'); // 'idle' | 'confirm' | 'success' | 'error'
  const [promoteResult, setPromoteResult] = useState(null);
  const promotedCandidateId = typeof app.promotedCandidateId === 'object'
    ? app.promotedCandidateId?._id || app.promotedCandidateId?.id
    : app.promotedCandidateId;

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers = await authHeaders();
      const res = await axios.patch(
        `${API_URL}/job-applications/${app._id}/status`,
        { status, adminNotes: notes },
        { headers }
      );
      onStatusChange(res.data);
      onClose();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePromote = async () => {
    setPromoting(true);
    setPromoteStep('idle');
    try {
      const headers = await authHeaders();
      const res = await axios.post(
        `${API_URL}/job-applications/${app._id}/promote`,
        {},
        { headers }
      );
      setPromoteResult(res.data);
      setPromoteStep('success');
      onStatusChange(res.data.application); // update table row immediately
    } catch (err) {
      const data = err.response?.data;
      const msg  = data?.details || data?.message || err.message || 'Promotion failed. Please try again.';
      setPromoteResult({ error: msg });
      setPromoteStep('error');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              <CandidateProfileLink candidateId={promotedCandidateId} className="text-slate-900">
                {app.name}
              </CandidateProfileLink>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{app.email} · {app.phone}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Info */}
          <div className="bg-[#f3f6fd] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#283086] uppercase tracking-wider mb-2">Applied For</p>
            <p className="font-bold text-slate-800 text-lg">{app.appliedJob}</p>
            {app.appliedCompany && <p className="text-slate-500 text-sm mt-0.5">{app.appliedCompany}</p>}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Experience',         value: `${app.experience} yrs` },
              { label: 'Current Company',    value: app.currentCompany || '—' },
              { label: 'Current Role',       value: app.currentRole    || '—' },
              { label: 'Preferred Location', value: app.preferredLocation },
              { label: 'Notice Period',      value: app.noticePeriod   || '—' },
              { label: 'Applied On',         value: new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-slate-700 font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {app.skills.split(',').map((s, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Message */}
          {app.message && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Message</p>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{app.message}</p>
            </div>
          )}

          {/* Status & Notes (editable for admin/manager) */}
          {canEdit ? (
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                        status === s
                          ? 'bg-[#283086] text-white border-[#283086] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#283086] hover:text-[#283086]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes about this applicant..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#283086]/30 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#283086] text-white font-bold py-3 rounded-xl hover:bg-[#1f2570] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            // Read-only status for recruiters
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Status</p>
              <StatusBadge status={app.status} />
              {app.adminNotes && (
                <p className="text-sm text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl">{app.adminNotes}</p>
              )}
            </div>
          )}\n
          {/* ── Move to Candidates DB ─────────────────────────────────── */}
          {canEdit && (
            <div className="border-t-2 border-dashed border-emerald-200 pt-5">
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Move to Candidates DB
              </p>

              {/* Already promoted */}
              {app.promotedCandidateId ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <svg width="18" height="18" className="text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <p className="text-sm text-emerald-700 font-semibold">
                    Already promoted to Candidate DB.
                  </p>
                </div>
              ) : promoteStep === 'success' ? (
                /* Success state */
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="16" height="16" className="text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p className="text-sm font-bold text-emerald-700">Promoted successfully!</p>
                  </div>
                  <p className="text-xs text-emerald-600">
                    Candidate ID: <span className="font-mono font-bold">{promoteResult?.candidate?.candidateId}</span>
                    {' — '}{promoteResult?.candidate?.name}
                  </p>
                </div>
              ) : promoteStep === 'error' ? (
                /* Error state */
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700">{promoteResult?.error}</p>
                  <button
                    onClick={() => setPromoteStep('idle')}
                    className="text-xs text-red-500 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              ) : promoteStep === 'confirm' ? (
                /* Confirmation step with field preview */
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-bold text-amber-800">Confirm: Move this applicant to the Candidate DB?</p>
                  <div className="text-xs text-amber-700 space-y-1 bg-white/60 rounded-lg p-3 border border-amber-100">
                    <p><span className="font-semibold">Name:</span> {app.name}</p>
                    <p><span className="font-semibold">Email:</span> {app.email}</p>
                    <p><span className="font-semibold">Phone:</span> {app.phone}</p>
                    <p><span className="font-semibold">Position:</span> {app.appliedJob}</p>
                    <p><span className="font-semibold">Client:</span> {app.appliedCompany || '—'}</p>
                    <p><span className="font-semibold">Experience:</span> {app.experience} yrs</p>
                    <p><span className="font-semibold">Skills:</span> {app.skills}</p>
                    <p><span className="font-semibold">Source:</span> Website</p>
                    <p><span className="font-semibold">Status:</span> Submitted</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPromoteStep('idle')}
                      className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePromote}
                      disabled={promoting}
                      className="flex-1 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {promoting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                          Promoting...
                        </>
                      ) : 'Yes, Move to Candidates'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Default: show the action button */
                <button
                  onClick={() => setPromoteStep('confirm')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 rounded-xl transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                  Move to Candidates DB
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobApplications() {
  const { authHeaders, userRole } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [selectedApp, setSelectedApp]   = useState(null);
  const [stats, setStats]               = useState({ total: 0, new: 0, shortlisted: 0, hired: 0 });

  const canEdit = userRole === 'admin' || userRole === 'manager';

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 200 };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const headers = await authHeaders();
      const res = await axios.get(`${API_URL}/job-applications`, {
        headers,
        params,
      });

      const apps = res.data.applications || [];
      setApplications(apps);
      setStats({
        total:       res.data.total || apps.length,
        new:         apps.filter(a => a.status === 'New').length,
        shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
        hired:       apps.filter(a => a.status === 'Hired').length,
      });
    } catch (err) {
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, statusFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Debounce search input
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application permanently?')) return;
    try {
      const headers = await authHeaders();
      await axios.delete(`${API_URL}/job-applications/${id}`, { headers });
      setApplications(prev => prev.filter(a => a._id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      alert('Failed to delete application.');
    }
  };

  const handleStatusChange = (updated) => {
    setApplications(prev => prev.map(a => (a._id === updated._id ? updated : a)));
  };

  return (
    <div className="min-h-screen bg-[#f3f6fd] p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Job Applications</h1>
        <p className="text-slate-500 mt-1">Manage candidates who applied from the public website.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',       value: stats.total,       color: 'text-[#283086]', bg: 'bg-[#283086]/10' },
          { label: 'New',         value: stats.new,         color: 'text-blue-600',  bg: 'bg-blue-50'      },
          { label: 'Shortlisted', value: stats.shortlisted, color: 'text-green-600', bg: 'bg-green-50'     },
          { label: 'Hired',       value: stats.hired,       color: 'text-purple-600',bg: 'bg-purple-50'    },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, job or company..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#283086]/30 transition"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? 'bg-[#283086] text-white border-[#283086]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#283086] hover:text-[#283086]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchApplications}
          className="flex items-center gap-1.5 text-sm text-[#283086] font-semibold hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-[#283086] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-24 text-red-500 font-semibold">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-32 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p className="font-semibold text-lg">No applications found</p>
          <p className="text-sm mt-1">Try changing the filters or wait for new submissions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/70">
                  {['Applicant', 'Applied For', 'Experience', 'Location', 'Skills', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Applicant */}
                    <td className="px-5 py-4 min-w-[180px]">
                      <p>
                        <CandidateProfileLink
                          candidateId={typeof app.promotedCandidateId === 'object' ? app.promotedCandidateId?._id || app.promotedCandidateId?.id : app.promotedCandidateId}
                          className="text-slate-800"
                        >
                          {app.name}
                        </CandidateProfileLink>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{app.email}</p>
                      <p className="text-xs text-slate-400">{app.phone}</p>
                    </td>

                    {/* Applied For */}
                    <td className="px-5 py-4 min-w-[160px]">
                      <p className="font-medium text-slate-800 line-clamp-1">{app.appliedJob}</p>
                      {app.appliedCompany && (
                        <p className="text-xs text-[#283086] mt-0.5 font-medium">{app.appliedCompany}</p>
                      )}
                    </td>

                    {/* Experience */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{app.experience} yrs</td>

                    {/* Location */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{app.preferredLocation}</td>

                    {/* Skills */}
                    <td className="px-5 py-4 min-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {app.skills.split(',').slice(0, 3).map((s, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                            {s.trim()}
                          </span>
                        ))}
                        {app.skills.split(',').length > 3 && (
                          <span className="text-[10px] text-slate-400">+{app.skills.split(',').length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-[#283086] hover:text-white hover:bg-[#283086] border border-[#283086]/20 hover:border-[#283086] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          {canEdit ? 'View & Edit' : 'View'}
                        </button>
                        {/* Quick promote button — only for admin/manager, only if not promoted yet */}
                        {canEdit && !app.promotedCandidateId && (
                          <button
                            onClick={() => setSelectedApp(app)}
                            title="Move to Candidates DB"
                            className="text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                          >
                            Move →
                          </button>
                        )}
                        {/* Promoted indicator */}
                        {app.promotedCandidateId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            In Candidates DB
                          </span>
                        )}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-slate-400 text-right">
            Showing {applications.length} of {stats.total} applications
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <DetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
