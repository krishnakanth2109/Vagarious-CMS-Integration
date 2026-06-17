import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  IndianRupee,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CandidatePipelinePanel from '@/components/CandidatePipelinePanel';
import { RecruiterDetailsTrigger } from '@/components/RecruiterDetailsModal';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const hiddenFields = new Set([
  '_id',
  'id',
  '__v',
  'candidateId',
  'name',
  'firstName',
  'lastName',
  'email',
  'contact',
  'phone',
  'alternateNumber',
  'dateOfBirth',
  'gender',
  'linkedin',
  'currentLocation',
  'preferredLocation',
  'position',
  'client',
  'currentCompany',
  'industry',
  'skills',
  'education',
  'totalExperience',
  'relevantExperience',
  'ctc',
  'ectc',
  'currentTakeHome',
  'expectedTakeHome',
  'noticePeriod',
  'servingNoticePeriod',
  'lwd',
  'reasonForChange',
  'offersInHand',
  'offerPackage',
  'source',
  'status',
  'rating',
  'dateAdded',
  'createdAt',
  'updatedAt',
  'remarks',
  'recruiterId',
  'recruiter',
  'recruiterName',
  'customFields',
  'active',
]);

const labelFromKey = (key = '') => (
  String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

const fullName = (candidate = {}) => (
  candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown Candidate'
);

const candidateCode = (candidate = {}) => (
  candidate.candidateId || candidate._id?.slice(-6)?.toUpperCase() || 'N/A'
);

const statusList = (candidate = {}) => {
  if (Array.isArray(candidate.status)) return candidate.status.filter(Boolean);
  return candidate.status ? [candidate.status] : ['Submitted'];
};

const recruiterName = (candidate = {}) => {
  const recruiter = candidate.recruiterId || candidate.recruiter;
  if (recruiter && typeof recruiter === 'object') {
    return recruiter.name || `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() || recruiter.email || '-';
  }
  return candidate.recruiterName || recruiter || '-';
};

const recruiterDetails = (candidate = {}) => {
  const recruiter = candidate.recruiterId || candidate.recruiter;
  return recruiter && typeof recruiter === 'object' ? recruiter : { name: recruiterName(candidate) };
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatBoolean = (value) => {
  if (value === true || value === 'true') return 'Yes';
  if (value === false || value === 'false') return 'No';
  return value || '-';
};

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === 'string') return skills.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const formatValue = (value, key = '') => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return formatBoolean(value);
  if (key.toLowerCase().includes('date') || key === 'lwd') return formatDate(value);
  if (Array.isArray(value)) return value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const statusTone = (status = '') => {
  const text = status.toLowerCase();
  if (text.includes('join') || text.includes('select')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (text.includes('reject') || text.includes('no show') || text.includes('backout')) return 'bg-red-50 text-red-700 border-red-200';
  if (text.includes('hold')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (text.includes('turn')) return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const DetailCard = ({ icon: Icon, label, value, action }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <div className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value || '-'}</div>
      </div>
      {action}
    </div>
  </div>
);

const Section = ({ title, subtitle, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export default function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCandidate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = await authHeaders();
      let found = null;
      const response = await fetch(`${API_URL}/candidates/${encodeURIComponent(candidateId)}`, { headers });
      if (response.ok) {
        found = await response.json();
      } else {
        const listResponse = await fetch(`${API_URL}/candidates`, { headers });
        if (listResponse.ok) {
          const list = await listResponse.json();
          found = list.find((item) => (
            item._id === candidateId || item.id === candidateId || item.candidateId === candidateId
          ));
        }
      }

      if (!found) throw new Error('Candidate profile was not found.');
      setCandidate(found);
    } catch (err) {
      setError(err.message || 'Unable to load candidate profile.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, candidateId]);

  useEffect(() => {
    loadCandidate();
  }, [loadCandidate]);

  const skills = useMemo(() => normalizeSkills(candidate?.skills), [candidate]);
  const additionalDetails = useMemo(() => {
    if (!candidate) return [];
    const directFields = Object.entries(candidate)
      .filter(([key, value]) => !hiddenFields.has(key) && value !== null && value !== undefined && value !== '')
      .map(([key, value]) => [labelFromKey(key), formatValue(value, key)]);

    const customFields = candidate.customFields && typeof candidate.customFields === 'object'
      ? Object.entries(candidate.customFields)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => [labelFromKey(key), formatValue(value, key)])
      : [];

    return [...customFields, ...directFields];
  }, [candidate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading candidate profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold">Candidate profile unavailable</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-6 text-white dark:border-slate-800 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-slate-900 shadow-sm">
                  {fullName(candidate).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Candidate Profile</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{fullName(candidate)}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-200">
                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono">{candidateCode(candidate)}</span>
                    <span>{candidate.position || 'Role not added'}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-400 sm:block" />
                    <span>{candidate.client || 'Client not added'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusList(candidate).map((status) => (
                  <span key={status} className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(status)}`}>
                    {status}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard icon={Mail} label="Email" value={candidate.email} action={candidate.email ? (
              <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:text-blue-700"><ExternalLink className="h-4 w-4" /></a>
            ) : null} />
            <DetailCard icon={Phone} label="Phone" value={candidate.contact || candidate.phone} action={(candidate.contact || candidate.phone) ? (
              <a href={`tel:${candidate.contact || candidate.phone}`} className="text-blue-600 hover:text-blue-700"><ExternalLink className="h-4 w-4" /></a>
            ) : null} />
            <DetailCard icon={Building2} label="Current Company" value={candidate.currentCompany} />
            <DetailCard
              icon={UserRound}
              label="Recruiter"
              value={(
                <RecruiterDetailsTrigger recruiter={recruiterDetails(candidate)} className="text-slate-900 dark:text-white font-semibold">
                  {recruiterName(candidate)}
                </RecruiterDetailsTrigger>
              )}
            />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Section title="Personal Details" subtitle="Core contact and location information.">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard icon={CalendarDays} label="Date of Birth" value={formatDate(candidate.dateOfBirth)} />
                <DetailCard icon={UserRound} label="Gender" value={candidate.gender} />
                <DetailCard icon={MapPin} label="Current Location" value={candidate.currentLocation} />
                <DetailCard icon={MapPin} label="Preferred Location" value={candidate.preferredLocation} />
                <DetailCard icon={Phone} label="Alternate Number" value={candidate.alternateNumber} />
                <DetailCard icon={Linkedin} label="LinkedIn" value={candidate.linkedin ? (
                  <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                    Open LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : '-'} />
              </div>
            </Section>

            <Section title="Professional Details" subtitle="Role, client, skills, qualification, and experience.">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard icon={BriefcaseBusiness} label="Current Role" value={candidate.position} />
                <DetailCard icon={Building2} label="Client" value={candidate.client} />
                <DetailCard icon={Building2} label="Industry" value={candidate.industry} />
                <DetailCard icon={GraduationCap} label="Qualification" value={candidate.education} />
                <DetailCard icon={Award} label="Total Experience" value={candidate.totalExperience ? `${candidate.totalExperience} Years` : '-'} />
                <DetailCard icon={Award} label="Relevant Experience" value={candidate.relevantExperience ? `${candidate.relevantExperience} Years` : '-'} />
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.length ? skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{skill}</span>
                  )) : <span className="text-sm text-slate-500">No skills added</span>}
                </div>
              </div>
            </Section>
          </div>

          <div className="space-y-5">
            <Section title="Compensation & Availability" subtitle="Salary expectations and joining readiness.">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <DetailCard icon={IndianRupee} label="Current CTC" value={candidate.ctc} />
                <DetailCard icon={IndianRupee} label="Expected CTC" value={candidate.ectc} />
                <DetailCard icon={IndianRupee} label="Current Take Home" value={candidate.currentTakeHome} />
                <DetailCard icon={IndianRupee} label="Expected Take Home" value={candidate.expectedTakeHome} />
                <DetailCard icon={Clock3} label="Notice Period" value={candidate.noticePeriod} />
                <DetailCard icon={CheckCircle2} label="Serving Notice" value={formatBoolean(candidate.servingNoticePeriod)} />
                <DetailCard icon={CalendarDays} label="Last Working Day" value={formatDate(candidate.lwd)} />
                <DetailCard icon={CheckCircle2} label="Offers in Hand" value={candidate.offersInHand ? `Yes${candidate.offerPackage ? ` - ${candidate.offerPackage}` : ''}` : 'No'} />
              </div>
            </Section>

            <Section title="Recruitment Tracking" subtitle="Source, rating, report date, and notes.">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <DetailCard icon={FileText} label="Source" value={candidate.source} />
                <DetailCard icon={Star} label="Rating" value={candidate.rating ? `${candidate.rating} Stars` : '-'} />
                <DetailCard icon={CalendarDays} label="Date Added" value={formatDate(candidate.dateAdded || candidate.createdAt)} />
                <DetailCard icon={FileText} label="Reason For Change" value={candidate.reasonForChange} />
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarks</p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-800 dark:text-slate-200">{candidate.remarks || '-'}</p>
              </div>
            </Section>
          </div>
        </div>

        {additionalDetails.length > 0 && (
          <Section title="Additional Details" subtitle="Extra candidate fields captured from the form configuration or imports.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {additionalDetails.map(([label, value]) => (
                <div key={`${label}-${value}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Client-wise Pipeline */}
        {candidate?._id && (
          <Section title="Client-wise Pipeline" subtitle="All client and job submissions for this candidate with individual pipeline tracking.">
            <CandidatePipelinePanel
              candidateId={candidate._id}
              apiUrl={API_URL}
              authHeaders={authHeaders}
            />
          </Section>
        )}
      </div>
    </main>
  );
}
