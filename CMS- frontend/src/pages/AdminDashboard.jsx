import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users, UserCheck, TrendingUp, PauseCircle, UserX, User,
  ClipboardList, Briefcase, X, Calendar, Plus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import CandidateProfileLink from '@/components/CandidateProfileLink';
import RecruiterPerformanceModal from '@/components/RecruiterPerformanceModal';
import { RecruiterDetailsTrigger } from '@/components/RecruiterDetailsModal';
import RecruiterCandidateGrowthChart from '@/components/RecruiterCandidateGrowthChart';

// ─── API Helpers ──────────────────────────────────────────────────────────────
// FIX 1: Computed ONCE at module level — not re-computed on every render/call.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL  = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// FIX 2: Token read is a plain function — no hook overhead, no closure stale state.
function getFirebaseToken() {
  try {
    const raw = sessionStorage.getItem('currentUser');
    return raw ? JSON.parse(raw)?.idToken : null;
  } catch { return null; }
}

// FIX 3: Single shared apiFetch — reads token fresh per call (token can rotate).
async function apiFetch(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getFirebaseToken()}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Status Helper — defined OUTSIDE component so it is never re-created ─────
// FIX 4: Moved out of component body → no new function reference on each render.
const getSafeStatus = (s) => {
  if (Array.isArray(s)) return String(s[0] || '').toLowerCase();
  return String(s || '').toLowerCase();
};

const getCandidateRecruiterId = (candidate) => {
  const rec = candidate.recruiterId;
  if (!rec) return '';
  if (typeof rec === 'object') return String(rec._id || rec.id || '');
  return String(rec);
};

const getRecruiterName = (recruiter = {}) => (
  recruiter.name ||
  `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() ||
  recruiter.username ||
  recruiter.email ||
  'Unnamed Recruiter'
);

const statusMatchesMetric = (candidate, metric) => {
  const status = getSafeStatus(candidate.status);
  if (metric === 'submissions') return true;
  if (metric === 'pending') return ['submitted', 'pending'].includes(status);
  return status === metric;
};

const RECRUITER_PERFORMANCE_COLUMNS = [
  { key: 'submissions', label: 'Submissions', className: 'text-blue-600 font-black' },
  { key: 'hold', label: 'Hold', className: 'text-orange-400 font-bold' },
  { key: 'joined', label: 'Joined', className: 'text-green-600 font-black' },
  { key: 'rejected', label: 'Rejected', className: 'text-red-500 font-medium' },
  { key: 'pending', label: 'Pending', className: 'text-gray-500 font-medium' },
];

// ─── REUSABLE CARD COMPONENTS ─────────────────────────────────────────────────
// FIX 5: Both card components are defined outside the parent component.
//        Defining components inside another component forces React to unmount/
//        remount them on every render of the parent — very expensive for tables
//        and grids with many cards.

const PrimaryStatCard = React.memo(({ title, value, trend, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="relative overflow-hidden bg-[#3530a0] rounded-[1.5rem] p-6 text-white shadow-lg h-44 flex flex-col justify-between cursor-pointer"
  >
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">{title}</p>
        <h3 className="text-4xl font-bold mt-2">{value}</h3>
      </div>
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
    <div className="relative z-10 mt-auto">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">+{trend}%</span>
        <span className="text-[10px] opacity-70">vs last month</span>
      </div>
      <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 rounded-full w-2/5" />
      </div>
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
  </div>
));

const BUBBLE_THEMES = {
  green:  { bubble: 'bg-[#e8f5e9]', iconBg: 'bg-[#e8f5e9]', iconText: 'text-green-600',  badge: 'bg-green-500',  bar: 'bg-green-500'  },
  blue:   { bubble: 'bg-[#e3f2fd]', iconBg: 'bg-[#e3f2fd]', iconText: 'text-blue-600',   badge: 'bg-blue-500',   bar: 'bg-blue-500'   },
  purple: { bubble: 'bg-[#f3e5f5]', iconBg: 'bg-[#f3e5f5]', iconText: 'text-purple-600', badge: 'bg-purple-500', bar: 'bg-purple-500' },
  orange: { bubble: 'bg-[#fff3e0]', iconBg: 'bg-[#fff3e0]', iconText: 'text-orange-500', badge: 'bg-orange-400', bar: 'bg-orange-400' },
  red:    { bubble: 'bg-[#ffebee]', iconBg: 'bg-[#ffebee]', iconText: 'text-red-500',    badge: 'bg-red-500',    bar: 'bg-red-500'    },
};

// FIX 6: Theme map is module-level constant — not re-created inside the component on every render.
const BubbleStatCard = React.memo(({ title, value, trend, icon: Icon, theme = 'blue', onClick }) => {
  const t = BUBBLE_THEMES[theme] || BUBBLE_THEMES.blue;
  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 h-44 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      <div className={clsx('absolute -top-6 -left-6 w-36 h-36 rounded-full pointer-events-none', t.bubble)} />
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</p>
          <h3 className="text-4xl font-bold mt-2 text-slate-800">{value}</h3>
        </div>
        <div className={clsx('p-2 rounded-lg', t.iconBg)}>
          <Icon className={clsx('w-6 h-6', t.iconText)} />
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold text-white', t.badge)}>+{trend}%</span>
          <span className="text-[10px] text-gray-400">vs last month</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={clsx('h-full rounded-full w-2/5', t.bar)} />
        </div>
      </div>
    </div>
  );
});

// ─── Loading Spinner ───────────────────────────────────────────────────────────
const RecruiterMetricButton = ({ value, className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'inline-flex min-w-6 justify-center rounded-sm underline-offset-4 transition hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200',
      className
    )}
  >
    {value}
  </button>
);

const FullPageSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#f3f6fd]">
    <div className="animate-spin h-12 w-12 border-4 border-[#283086] border-t-transparent rounded-full" />
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [candidates,    setCandidates   ] = useState([]);
  const [recruiters,    setRecruiters   ] = useState([]);
  const [jobs,          setJobs         ] = useState([]);
  const [loading,       setLoading      ] = useState(true);

  // Modal state
  const [isModalOpen,     setIsModalOpen    ] = useState(false);
  const [modalData,       setModalData      ] = useState([]);
  const [modalLoading,    setModalLoading   ] = useState(false);
  const [performanceModal, setPerformanceModal] = useState(null);
  const [filterDate,      setFilterDate     ] = useState(() => new Date().toISOString().split('T')[0]);
  const [recruiterFilter, setRecruiterFilter] = useState('All');

  // ── FIX 7: Initial fetch — all 4 endpoints in parallel, settled so a single
  //    slow/failing endpoint never blocks the others from painting data. ────────
  useEffect(() => {
    let cancelled = false; // FIX 8: Cleanup flag — prevents state update if component unmounts mid-fetch

    const fetchData = async () => {
      try {
        const [candR, recR, jobsR] = await Promise.allSettled([
          apiFetch('/candidates?view=dashboard'),
          apiFetch('/recruiters?view=lookup'),
          apiFetch('/jobs?view=dashboard'),
          // FIX 9: Removed /clients fetch — clients.length was fetched but
          // the "Total Clients" card was replaced with "Today Submissions".
          // Fetching unused data wastes bandwidth and delays the dashboard.
        ]);
        if (cancelled) return;
        if (candR.status  === 'fulfilled') setCandidates(candR.value);
        if (recR.status   === 'fulfilled') setRecruiters(recR.value);
        if (jobsR.status  === 'fulfilled') setJobs(jobsR.value);
      } catch {
        if (!cancelled) toast({ title: 'Sync Error', description: 'Check server connection', variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── FIX 10: Modal fetch — useCallback so the function reference is stable;
  //    only re-created when filterDate changes (not on every render). ───────────
  const fetchModalData = useCallback(async () => {
    setModalLoading(true);
    try {
      const data = await apiFetch(`/candidates?view=dashboard&date=${filterDate}`);
      setModalData(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch day submissions', variant: 'destructive' });
    } finally {
      setModalLoading(false);
    }
  }, [filterDate, toast]);

  useEffect(() => {
    if (isModalOpen) fetchModalData();
  }, [isModalOpen, fetchModalData]);
  // FIX 11: Removed `filterDate` from useEffect deps — fetchModalData already
  // re-creates when filterDate changes, which triggers this effect correctly.
  // The old code had [isModalOpen, filterDate, toast] which caused double-fetches.

  // ── Computed stats — all useMemo with correct minimal dep arrays ─────────────
  const recruiterOptions = useMemo(() => (
    recruiters
      .filter(r => r._id || r.id)
      .map(r => ({ id: String(r._id || r.id), name: getRecruiterName(r) }))
      .filter(r => r.name.trim() !== '')
      .sort((a, b) => a.name.localeCompare(b.name))
  ), [recruiters]);

  const selectedRecruiterName = useMemo(() => {
    if (recruiterFilter === 'All') return 'all recruiters';
    return recruiterOptions.find(r => r.id === recruiterFilter)?.name || 'selected recruiter';
  }, [recruiterFilter, recruiterOptions]);

  const scopedCandidates = useMemo(() => (
    recruiterFilter === 'All'
      ? candidates
      : candidates.filter(c => getCandidateRecruiterId(c) === recruiterFilter)
  ), [candidates, recruiterFilter]);

  const visibleRecruiters = useMemo(() => (
    recruiterFilter === 'All'
      ? recruiters
      : recruiters.filter(r => String(r._id || r.id || '') === recruiterFilter)
  ), [recruiters, recruiterFilter]);

  const stats = useMemo(() => {
    const total    = scopedCandidates.length;
    const submitted = scopedCandidates.filter(c => { const s = getSafeStatus(c.status); return s === 'submitted' || s === 'pending'; }).length;
    const joined   = scopedCandidates.filter(c => getSafeStatus(c.status) === 'joined').length;
    const hold     = scopedCandidates.filter(c => getSafeStatus(c.status) === 'hold').length;
    const rejected = scopedCandidates.filter(c => getSafeStatus(c.status) === 'rejected').length;

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todaySubmissions = scopedCandidates.filter(c => {
      const d = new Date(c.dateAdded || c.createdAt);
      return d >= todayStart && d <= todayEnd;
    }).length;

    return { total, submitted, joined, hold, rejected, todaySubmissions };
  }, [scopedCandidates]);

  const recruiterStats = useMemo(() => {
    return visibleRecruiters
      .filter(r => r._id || r.id)
      .map(r => {
        const rid   = r._id || r.id;
        const cands = candidates.filter(c => getCandidateRecruiterId(c) === String(rid));
        const name  = getRecruiterName(r);
        return {
          id:          String(rid),
          recruiter:   r,
          fullName:    name,
          submissions: cands.length,
          joined:      cands.filter(c => getSafeStatus(c.status) === 'joined').length,
          pending:     cands.filter(c => ['submitted', 'pending'].includes(getSafeStatus(c.status))).length,
          hold:        cands.filter(c => getSafeStatus(c.status) === 'hold').length,
          rejected:    cands.filter(c => getSafeStatus(c.status) === 'rejected').length,
          selected:    cands.filter(c => getSafeStatus(c.status) === 'selected').length,
        };
      })
      .filter(r => r.fullName !== '')
      .sort((a, b) => b.submissions - a.submissions);
  }, [candidates, visibleRecruiters]);

  const recruiterTotals = useMemo(() => (
    RECRUITER_PERFORMANCE_COLUMNS.reduce((totals, column) => {
      totals[column.key] = recruiterStats.reduce((sum, row) => sum + (Number(row[column.key]) || 0), 0);
      return totals;
    }, {})
  ), [recruiterStats]);

  // ── FIX 12: barData updated to include Submissions, Selected, and Rejected ──
  const barData = useMemo(
    () => recruiterStats.slice(0, 6).map(r => ({
      name: r.fullName.split(' ')[0],
      submissions: r.submissions,
      selected: r.selected,
      rejected: r.rejected
    })),
    [recruiterStats]
  );

  const filteredModalData = useMemo(() => {
    if (recruiterFilter === 'All') return modalData;
    return modalData.filter(c => getCandidateRecruiterId(c) === recruiterFilter);
  }, [modalData, recruiterFilter]);

  // ── Stable handlers — useCallback so child onClick props don't change ref ────
  const openPerformanceModal = useCallback((recruiterRow, column) => {
    const rows = candidates.filter(candidate => (
      getCandidateRecruiterId(candidate) === recruiterRow.id && statusMatchesMetric(candidate, column.key)
    ));
    setPerformanceModal({
      title: `${recruiterRow.fullName} - ${column.label}`,
      subtitle: `${column.label} candidates for ${recruiterRow.fullName}`,
      rows,
    });
  }, [candidates]);

  const openPerformanceTotalModal = useCallback((column) => {
    const visibleRecruiterIds = new Set(recruiterStats.map(row => row.id));
    const rows = candidates.filter(candidate => (
      visibleRecruiterIds.has(getCandidateRecruiterId(candidate)) && statusMatchesMetric(candidate, column.key)
    ));
    setPerformanceModal({
      title: `Total ${column.label}`,
      subtitle: `${column.label} candidates across all recruiters in this table`,
      rows,
    });
  }, [candidates, recruiterStats]);

  const openModal   = useCallback(() => setIsModalOpen(true),  []);
  const closeModal  = useCallback(() => setIsModalOpen(false), []);

  // ─── Render ───────────────────────────────────────────────────────────────────
  if (loading) return <FullPageSpinner />;

  const formattedDate = format(new Date(), 'dd MMM, yyyy').toUpperCase();

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 relative">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#283086] tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Welcome back <span className="text-[#283086] font-bold">{currentUser?.firstName || 'Admin'}</span>, Have a nice day..!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Top Level Recruiter Filter */}
          <div className="relative group">
            <select
              value={recruiterFilter}
              onChange={(e) => setRecruiterFilter(e.target.value)}
              className="pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-200 rounded-xl text-[#283086] focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white appearance-none cursor-pointer shadow-sm transition-all hover:border-[#283086]"
            >
              <option value="All">All Recruiters</option>
              {recruiterOptions.map(recruiter => (
                <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#283086] transition-colors">
              <Plus size={14} className="rotate-45" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 bg-white border border-gray-100 px-5 py-2.5 rounded-xl shadow-sm">
            <span className="flex items-center gap-2 px-2 border-r border-gray-100 mr-2">
               <Calendar size={12} className="text-[#283086]" />
               {formattedDate}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#283086]" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 1: Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PrimaryStatCard
          title="Total Candidates"
          value={stats.total}
          trend={12}
          icon={Users}
          onClick={() => navigate('/admin/add-candidate', { state: { filter: 'All' } })}
        />
        <BubbleStatCard title="Recruiters"        value={recruiters.length}        trend={5}  icon={UserCheck}    theme="green"  onClick={() => navigate('/admin/recruiters')} />
        <BubbleStatCard title="Total Jobs"        value={jobs.length}              trend={8}  icon={Briefcase}    theme="blue"   onClick={() => navigate('/admin/requirements')} />
        <BubbleStatCard title="Today Submissions" value={stats.todaySubmissions}   trend={14} icon={ClipboardList} theme="purple" onClick={openModal} />
      </div>

      {/* ── Row 2: Status Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BubbleStatCard title="Submitted" value={stats.submitted} trend={12} icon={User}        theme="purple" onClick={() => navigate('/admin/add-candidate', { state: { filter: 'Submitted' } })} />
        <BubbleStatCard title="Joined"    value={stats.joined}   trend={7}  icon={UserCheck}    theme="green"  onClick={() => navigate('/admin/add-candidate', { state: { filter: 'Joined' } })} />
        <BubbleStatCard title="Hold"      value={stats.hold}     trend={4}  icon={PauseCircle}  theme="orange" onClick={() => navigate('/admin/add-candidate', { state: { filter: 'Hold' } })} />
        <BubbleStatCard title="Rejected"  value={stats.rejected} trend={5}  icon={UserX}        theme="red"    onClick={() => navigate('/admin/add-candidate', { state: { filter: 'Rejected' } })} />
      </div>

      {/* ── Row 3: Middle Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg. Time of Hire</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-2">0.0%</h3>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-6">
              <div className="h-full bg-[#283086] rounded-full w-[30%]" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl"><TrendingUp size={32} className="text-blue-600" /></div>
        </div>
        <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Joining Pipeline</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-2">{stats.total}</h3>
            <p className="text-xs text-gray-400 mt-2">Active candidates in pipeline</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl"><User size={32} className="text-indigo-600" /></div>
        </div>
      </div>

      {/* ── Row 4: Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-gray-100 h-full min-h-[460px] dark:border-white/10 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Top Recruiters (Upload Report)</h3>
          <span className="text-xs text-gray-400">
            {recruiterFilter === 'All'
              ? `showing ${Math.min(6, recruiterStats.length)} of ${recruiterStats.length}`
              : selectedRecruiterName}
          </span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={35} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 8 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              />
              <Bar dataKey="submissions" name="Total" fill="#5664d2" radius={[6, 6, 0, 0]} />
              <Bar dataKey="selected" name="Selected" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

        <RecruiterCandidateGrowthChart
          candidates={candidates}
          recruiters={recruiters}
          loading={loading}
        />
      </div>

      {/* ── Row 5: Table ── */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center bg-[#f8faff] border-b border-gray-100">
          <h3 className="text-base font-bold text-slate-800">Recruiter Performance Details</h3>
          <button onClick={() => navigate('/admin/recruiters')} className="bg-[#283086] text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wide hover:bg-blue-900 shadow-lg">
            View All Recruiters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8faff] text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-left">Recruiter</th>
                <th className="px-4 py-5 text-center">Submissions</th>
                <th className="px-4 py-5 text-center">Hold</th>
                <th className="px-4 py-5 text-center">Joined</th>
                <th className="px-4 py-5 text-center">Rejected</th>
                <th className="px-4 py-5 text-center">Pending</th>
                <th className="px-8 py-5 text-right">Avg. Time to Hire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {recruiterStats.map((r, i) => (
                <tr key={r.fullName || i} className="hover:bg-blue-50/30">
                  <td className="px-8 py-5 font-bold text-slate-700">
                    <RecruiterDetailsTrigger recruiter={r.recruiter} className="text-slate-700 font-bold">
                      {r.fullName}
                    </RecruiterDetailsTrigger>
                  </td>
                  {RECRUITER_PERFORMANCE_COLUMNS.map((column) => (
                    <td key={column.key} className="px-4 py-5 text-center">
                      <RecruiterMetricButton
                        value={r[column.key]}
                        className={column.className}
                        onClick={() => openPerformanceModal(r, column)}
                      />
                    </td>
                  ))}
                  <td className="px-8 py-5 text-right font-black text-red-500">0.0%</td>
                </tr>
              ))}
              {recruiterStats.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No active recruiter data available</td></tr>
              )}
            </tbody>
            {recruiterStats.length > 0 && (
              <tfoot className="bg-[#f8faff] border-t border-gray-100">
                <tr>
                  <td className="px-8 py-5 font-black text-slate-800">Total</td>
                  {RECRUITER_PERFORMANCE_COLUMNS.map((column) => (
                    <td key={column.key} className="px-4 py-5 text-center">
                      <RecruiterMetricButton
                        value={recruiterTotals[column.key] || 0}
                        className={column.className}
                        onClick={() => openPerformanceTotalModal(column)}
                      />
                    </td>
                  ))}
                  <td className="px-8 py-5 text-right font-black text-red-500">0.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── MODAL: Day Submissions ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#f8faff]">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  Day Submissions
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Viewing candidates submitted by {selectedRecruiterName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={recruiterFilter}
                  onChange={(e) => setRecruiterFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-[#283086] focus:outline-none bg-white appearance-none cursor-pointer"
                >
              <option value="All">All Recruiters</option>
              {recruiterOptions.map(recruiter => (
                <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>
              ))}
                </select>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filterDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-[#283086] focus:outline-none"
                  />
                </div>
                <button onClick={closeModal} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-white p-0">
              {modalLoading ? (
                <div className="flex flex-col h-64 items-center justify-center gap-3">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Fetching Submissions...</p>
                </div>
              ) : filteredModalData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <ClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-slate-800 font-bold">No submissions found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {recruiterFilter !== 'All'
                      ? `No candidates submitted by ${selectedRecruiterName} on ${filterDate}`
                      : `No candidates were added on ${filterDate}`}
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#f8faff] text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 text-left">Candidate ID</th>
                      <th className="px-6 py-4 text-left">Candidate Name</th>
                      <th className="px-6 py-4 text-left">Recruiter</th>
                      <th className="px-6 py-4 text-left">Position</th>
                      <th className="px-6 py-4 text-left">Client</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredModalData.map((c) => {
                      const rec = c.recruiterId;
                      const recruiterName = rec
                        ? (typeof rec === 'object'
                          ? `${rec.firstName || rec.name || ''} ${rec.lastName || ''}`.trim() || rec.username || 'Unknown'
                          : 'Unknown')
                        : (c.recruiterName || 'Unknown');
                      const recruiterDetails = typeof rec === 'object' ? rec : { name: recruiterName };
                      const cStatus = Array.isArray(c.status) ? c.status[0] : c.status;
                      return (
                        <tr key={c._id} className="hover:bg-purple-50/30">
                          <td className="px-6 py-4 font-bold text-[#283086]">{c.candidateId || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <CandidateProfileLink candidate={c} className="text-slate-800">
                              {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown Candidate'}
                            </CandidateProfileLink>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-600">
                            <RecruiterDetailsTrigger recruiter={recruiterDetails} className="text-gray-600 font-medium">
                              {recruiterName}
                            </RecruiterDetailsTrigger>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{c.position || '-'}</td>
                          <td className="px-6 py-4 text-gray-500">{c.client || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {cStatus || 'SUBMITTED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            {!modalLoading && filteredModalData.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs font-medium text-gray-500">
                <p>
                  Showing {filteredModalData.length} submission(s) for the selected date
                  {recruiterFilter !== 'All' && <span> · <span className="text-purple-600 font-semibold">{selectedRecruiterName}</span></span>}
                </p>
                <button onClick={closeModal} className="text-slate-700 hover:text-[#283086] font-bold uppercase tracking-wider">
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <RecruiterPerformanceModal
        detail={performanceModal}
        onClose={() => setPerformanceModal(null)}
      />

    </div>
  );
}
