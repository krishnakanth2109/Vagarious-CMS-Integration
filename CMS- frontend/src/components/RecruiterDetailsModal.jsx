import React, { useState } from 'react';
import { Mail, Phone, Shield, UserRound, X } from 'lucide-react';

const getRecruiterName = (recruiter = {}) => {
  if (typeof recruiter === 'string') return recruiter;
  return (
    recruiter.name ||
    recruiter.fullName ||
    `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() ||
    recruiter.username ||
    recruiter.email ||
    'Unknown Recruiter'
  );
};

const getRecruiterId = (recruiter = {}) => (
  recruiter.recruiterId || recruiter.employeeId || recruiter.userId || recruiter._id || recruiter.id || '-'
);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{value || '-'}</p>
  </div>
);

export function RecruiterDetailsModal({ recruiter, onClose }) {
  if (!recruiter) return null;

  const data = typeof recruiter === 'string' ? { name: recruiter } : recruiter;
  const name = getRecruiterName(data);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'R';
  const active = data.active !== false && data.status !== 'inactive';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-[#f8faff] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#283086] text-white flex items-center justify-center text-xl font-black shadow-sm">
              {data.profilePicture
                ? <img src={data.profilePicture} alt={name} className="h-full w-full object-cover" />
                : initials}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#283086]">
                  <Shield className="h-3.5 w-3.5" />
                  {(data.role || 'Recruiter').toString()}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white p-2 text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem label="Recruiter ID" value={getRecruiterId(data)} />
            <DetailItem label="Username" value={data.username} />
            <DetailItem label="Email" value={data.email} />
            <DetailItem label="Phone" value={data.phone || data.contact || data.mobile} />
            <DetailItem label="Joined Date" value={formatDate(data.createdAt || data.dateAdded)} />
            <DetailItem label="Last Updated" value={formatDate(data.updatedAt)} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <Mail className="h-4 w-4 text-[#283086]" />
              <span className="text-sm font-medium text-slate-700">{data.email || '-'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <Phone className="h-4 w-4 text-[#283086]" />
              <span className="text-sm font-medium text-slate-700">{data.phone || data.contact || data.mobile || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecruiterDetailsTrigger({ recruiter, children, className = '', disabled = false }) {
  const [open, setOpen] = useState(false);
  const canOpen = !disabled && recruiter;

  return (
    <>
      <button
        type="button"
        onClick={() => canOpen && setOpen(true)}
        className={`inline-flex items-center text-left underline-offset-4 ${canOpen ? 'cursor-pointer hover:underline' : 'cursor-default'} ${className}`}
        disabled={!canOpen}
      >
        <UserRound className="mr-1.5 h-3.5 w-3.5 opacity-70" />
        {children || getRecruiterName(recruiter)}
      </button>
      {open && <RecruiterDetailsModal recruiter={recruiter} onClose={() => setOpen(false)} />}
    </>
  );
}

export default RecruiterDetailsModal;
