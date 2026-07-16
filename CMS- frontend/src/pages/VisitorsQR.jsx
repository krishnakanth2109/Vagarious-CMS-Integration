import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  QrCode, Plus, Search, Calendar, Check, Copy, Download, Trash2, Eye, FileText, CheckCircle2,
  AlertCircle, ShieldAlert, X, Power, RefreshCw, ChevronLeft, ChevronRight, UserCheck, ExternalLink, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

function getFirebaseToken() {
  try {
    const raw = sessionStorage.getItem('currentUser');
    return raw ? JSON.parse(raw)?.idToken : null;
  } catch { return null; }
}

const inputCls = "w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-zinc-900 dark:text-zinc-100 transition-shadow placeholder-zinc-400";
const selectCls = "w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-zinc-900 dark:text-zinc-100 transition-shadow";

export default function VisitorsQR() {
  const { toast } = useToast();
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState('applications'); // default to applications now

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [applications, setApplications] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingApps, setLoadingApps] = useState(false);

  // Lists for creation dropdowns
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null); // campaign details for QR preview modal
  const [selectedApp, setSelectedApp] = useState(null); // application details for profile modal
  
  // Conversion state
  const [convertAppId, setConvertAppId] = useState(null);
  const [duplicateCandidateInfo, setDuplicateCandidateInfo] = useState(null);
  const [isConvertWarningOpen, setIsConvertWarningOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  // Form State
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    clientId: '',
    jobId: '',
    expiresAt: ''
  });

  // Filters for Applications
  const [filters, setFilters] = useState({
    search: '',
    clientId: '',
    jobId: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getFirebaseToken()}`
  }), []);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoadingCampaigns(true);
      const res = await fetch(`${API_URL}/visitors-qr/campaigns`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to load campaigns.');
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingCampaigns(false);
    }
  }, [getHeaders, toast]);

  // Fetch applications
  const fetchApplications = useCallback(async (page = 1) => {
    try {
      setLoadingApps(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const res = await fetch(`${API_URL}/visitors-qr/applications?${queryParams.toString()}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to load applications.');
      const data = await res.json();

      setApplications(data.docs);
      setTotalDocs(data.totalDocs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingApps(false);
    }
  }, [filters, getHeaders, toast]);

  // Fetch metadata lists for form dropdowns
  const fetchMetadata = useCallback(async () => {
    try {
      // Fetch Clients
      const clientRes = await fetch(`${API_URL}/clients?view=lookup`, { headers: getHeaders() });
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClients(clientData.filter(c => c.active));
      }
      
      // Fetch Jobs
      const jobRes = await fetch(`${API_URL}/jobs?view=lookup`, { headers: getHeaders() });
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJobs(jobData.filter(j => j.active));
      }
    } catch (err) {
      console.error('Failed to load clients/jobs for lookup', err);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  // Filtered jobs dropdown during creation
  const filteredJobsForCampaign = useMemo(() => {
    if (!newCampaign.clientId) return jobs;
    const selectedClient = clients.find(c => c._id === newCampaign.clientId);
    if (!selectedClient) return jobs;
    
    // Filter jobs whose clientName matches companyName
    return jobs.filter(j => j.clientName.trim().toLowerCase() === selectedClient.companyName.trim().toLowerCase());
  }, [newCampaign.clientId, jobs, clients]);

  // Create Campaign Submit
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.clientId || !newCampaign.jobId || !newCampaign.expiresAt) {
      toast({ title: 'Validation Error', description: 'Please fill in all campaign fields.', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/visitors-qr/campaigns`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newCampaign)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create campaign.');

      toast({ title: 'Success', description: 'Campaign created successfully!' });
      setIsCreateModalOpen(false);
      setNewCampaign({ title: '', clientId: '', jobId: '', expiresAt: '' });
      fetchCampaigns();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Toggle Active state
  const handleToggleActive = async (campaign) => {
    try {
      const res = await fetch(`${API_URL}/visitors-qr/campaigns/${campaign._id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: !campaign.isActive })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      toast({ title: 'Status Updated', description: `Campaign ${!campaign.isActive ? 'activated' : 'deactivated'} successfully.` });
      fetchCampaigns();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/visitors-qr/campaigns/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete campaign.');
      toast({ title: 'Success', description: 'Campaign deleted.' });
      fetchCampaigns();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Toggle Application Status (e.g. Reject / Delete)
  const handleUpdateAppStatus = async (appId, status) => {
    try {
      const res = await fetch(`${API_URL}/visitors-qr/applications/${appId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      toast({ title: 'Status Updated', description: `Application status updated to ${status}.` });
      fetchApplications(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Delete Application
  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const res = await fetch(`${API_URL}/visitors-qr/applications/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete application.');
      toast({ title: 'Success', description: 'Submission deleted.' });
      fetchApplications(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Convert application logic
  const handleConvertApplication = async (id, force = false) => {
    try {
      setConverting(true);
      const res = await fetch(`${API_URL}/visitors-qr/applications/${id}/convert`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ force })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.warning === 'duplicate_candidate') {
          // Open duplicate warning modal
          setConvertAppId(id);
          setDuplicateCandidateInfo(data.candidate);
          setIsConvertWarningOpen(true);
        } else {
          throw new Error(data.message || 'Conversion failed.');
        }
        return;
      }

      toast({ title: 'Converted!', description: 'Application successfully converted to Candidate profile.' });
      setIsConvertWarningOpen(false);
      setConvertAppId(null);
      setDuplicateCandidateInfo(null);
      fetchApplications(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setConverting(false);
    }
  };

  // Copy Link helper
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Public link copied to clipboard.' });
  };

  // Download QR Code
  const handleDownloadQR = async (url, title) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast({ title: 'Downloaded', description: 'QR Code image saved successfully.' });
    } catch (error) {
      toast({ title: 'Download Failed', description: 'Could not download QR code.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
            <QrCode className="h-7 w-7 text-blue-600" />
            Visitors QR Application System
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create tenant-scoped QR campaigns and collect candidates details directly into VTS Tracker.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedQR({
              title: "General Walk-in Registration",
              clientName: "VTS General",
              jobTitle: "Walk-in Application",
              publicUrl: `${window.location.origin}/apply/visitors-qr/default`
            })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
          >
            <QrCode className="w-4 h-4" /> Show QR Code
          </button>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* Applications Search */}
        <div className="flex gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name/email..."
              className={`${inputCls} pl-9`}
              value={filters.search}
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

          {/* Applications Table */}
          {loadingApps ? (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <FileText className="h-16 w-16 text-zinc-300 mb-4" />
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-bold">No visitor applications received yet.</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mt-1 text-sm">
                Share or print the QR code to start collecting applications directly from visitors.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-2xs font-extrabold uppercase tracking-wider text-zinc-500">
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Position</th>
                      <th className="px-6 py-4">Qualification</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Resume</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-sm">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-zinc-800 dark:text-zinc-150">{app.fullName}</div>
                          <div className="text-2xs text-zinc-400">Submitted: {new Date(app.submittedAt).toLocaleDateString()}</div>
                          <div className="text-2xs text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">Ref: {app.reference || 'None'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-700 dark:text-zinc-300">{app.email}</div>
                          <div className="text-xs text-zinc-400">{app.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">{app.position || app.jobTitle}</div>
                          <div className="text-xs text-zinc-400">Campaign: {app.jobTitle}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-850 dark:text-white">{app.qualification || 'N/A'}</div>
                          {app.yearOfPassOut && <div className="text-xs text-zinc-455 dark:text-zinc-500">Pass out: {app.yearOfPassOut}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wide ${
                              app.status === 'Converted' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                              app.status === 'Duplicate' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                              app.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                              'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {app.resume?.url && (
                            <a
                              href={app.resume.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" /> Resume
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 bg-zinc-50 hover:bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg transition-all"
                              title="View Profile Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {app.status !== 'Converted' && (
                              <button
                                onClick={() => handleConvertApplication(app._id)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg transition-all"
                                title="Convert to Candidate"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            {app.status !== 'Rejected' && app.status !== 'Converted' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app._id, 'Rejected')}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg transition-all"
                                title="Reject Application"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteApplication(app._id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-650 rounded-lg transition-all"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-xs text-zinc-550">
                    Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> ({totalDocs} entries)
                  </div>
                  <div className="flex gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => fetchApplications(currentPage - 1)}
                      className="p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 disabled:opacity-50 rounded-lg text-zinc-650"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => fetchApplications(currentPage + 1)}
                      className="p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 disabled:opacity-50 rounded-lg text-zinc-650"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


      {/* ── QR CODE PREVIEW MODAL ─────────────────────────────────────────── */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedQR(null)}
              className="absolute right-4 top-4 h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{selectedQR.title}</h3>
              <p className="text-xs text-zinc-400">{selectedQR.clientName} • {selectedQR.jobTitle}</p>
            </div>

            {/* QR Image */}
            <div className="bg-white p-4 border border-zinc-200 dark:border-zinc-850 rounded-2xl inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedQR.publicUrl)}`}
                alt="QR Code"
                className="w-48 h-48 block"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-2xs font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Public Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedQR.publicUrl}
                  className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs text-zinc-650 dark:text-zinc-350 select-all outline-none"
                />
                <button
                  onClick={() => handleCopyLink(selectedQR.publicUrl)}
                  className="p-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-semibold"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => handleDownloadQR(selectedQR.publicUrl, selectedQR.title)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-blue-500/10 transition-all"
            >
              <Download className="w-4 h-4" /> Download QR Image
            </button>
          </div>
        </div>
      )}

      {/* ── APPLICATION DETAILS MODAL ────────────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-3xs bg-zinc-100 text-zinc-550 dark:bg-zinc-800 px-2 py-0.5 rounded font-extrabold uppercase">
                  Application Profile
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                  {selectedApp.fullName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Email Address</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Contact Number</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.phone}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Qualification</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.qualification || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Year of Pass Out</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.yearOfPassOut || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Reference</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.reference || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Position</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.position || selectedApp.jobTitle}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Purpose</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.purpose || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">General Campaign Job</div>
                <div className="font-semibold text-zinc-850 dark:text-white">{selectedApp.jobTitle} ({selectedApp.clientName})</div>
              </div>
            </div>

            {selectedApp.skills?.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Candidate Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.skills.map((skill, index) => (
                    <span key={index} className="text-xs bg-zinc-100 text-zinc-750 dark:bg-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedApp.message && (
              <div className="space-y-1.5">
                <div className="text-xs text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Cover Note / Message</div>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 text-zinc-650 dark:text-zinc-350 whitespace-pre-line text-sm">
                  {selectedApp.message}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                {selectedApp.resume?.url && (
                  <a
                    href={selectedApp.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Open Resume
                  </a>
                )}
                {selectedApp.photoCopy?.url && (
                  <a
                    href={selectedApp.photoCopy.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#5b36f4]/20 hover:border-[#5b36f4] rounded-xl text-xs font-bold text-[#5b36f4] hover:bg-[#5b36f4]/5 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> View Photo Copy
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
                {selectedApp.status !== 'Converted' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(null);
                      handleConvertApplication(selectedApp._id);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10"
                  >
                    <UserCheck className="w-4 h-4" /> Convert to Candidate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONVERT DUPLICATE WARNING MODAL ──────────────────────────────── */}
      {isConvertWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-14 w-14 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Duplicate Candidate Warning</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                A candidate profile with matching credentials already exists in the system.
              </p>
            </div>

            {duplicateCandidateInfo && (
              <div className="bg-amber-50/40 dark:bg-amber-950/5 border border-amber-200/50 dark:border-amber-900/10 rounded-2xl p-4 text-left space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div>Name: <strong className="text-zinc-900 dark:text-white">{duplicateCandidateInfo.name}</strong></div>
                <div>Email: <strong className="text-zinc-900 dark:text-white">{duplicateCandidateInfo.email}</strong></div>
                <div>Phone: <strong className="text-zinc-900 dark:text-white">{duplicateCandidateInfo.contact}</strong></div>
                {duplicateCandidateInfo._id && (
                  <div className="pt-2 border-t border-amber-200/30">
                    <a
                      href={`/admin/candidates/${duplicateCandidateInfo._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      View existing candidate profile <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsConvertWarningOpen(false);
                  setConvertAppId(null);
                  setDuplicateCandidateInfo(null);
                }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={converting}
                onClick={() => handleConvertApplication(convertAppId, true)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/10"
              >
                {converting ? 'Converting...' : 'Force Convert'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
