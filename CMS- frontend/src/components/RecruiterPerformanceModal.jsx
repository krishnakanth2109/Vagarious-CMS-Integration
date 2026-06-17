import React from 'react';
import { ClipboardList, X } from 'lucide-react';
import CandidateProfileLink from '@/components/CandidateProfileLink';
import { RecruiterDetailsTrigger } from '@/components/RecruiterDetailsModal';

const getRecruiterName = (candidate) => {
  const rec = candidate.recruiterId;
  if (!rec) return candidate.recruiterName || 'Unknown';
  if (typeof rec !== 'object') return candidate.recruiterName || 'Unknown';
  return `${rec.firstName || rec.name || ''} ${rec.lastName || ''}`.trim() || rec.username || 'Unknown';
};

const getCandidateName = (candidate) => (
  candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown Candidate'
);

const getRecruiterDetails = (candidate) => (
  candidate.recruiterId && typeof candidate.recruiterId === 'object'
    ? candidate.recruiterId
    : { name: getRecruiterName(candidate) }
);

export default function RecruiterPerformanceModal({ detail, onClose }) {
  if (!detail) return null;

  const rows = Array.isArray(detail.rows) ? detail.rows : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center gap-4 bg-[#f8faff]">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              {detail.title || 'Recruiter Performance Details'}
            </h2>
            {detail.subtitle && (
              <p className="text-xs text-gray-500 font-medium mt-1">{detail.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-slate-800 font-bold">No candidates found</h3>
              <p className="text-sm text-gray-500 mt-1">There are no candidates for this count.</p>
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
                {rows.map((candidate) => {
                  const status = Array.isArray(candidate.status) ? candidate.status[0] : candidate.status;
                  return (
                    <tr key={candidate._id || candidate.candidateId} className="hover:bg-purple-50/30">
                      <td className="px-6 py-4 font-bold text-[#283086]">{candidate.candidateId || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <CandidateProfileLink candidate={candidate} className="text-slate-800">
                          {getCandidateName(candidate)}
                        </CandidateProfileLink>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        <RecruiterDetailsTrigger recruiter={getRecruiterDetails(candidate)} className="text-gray-600 font-medium">
                          {getRecruiterName(candidate)}
                        </RecruiterDetailsTrigger>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{candidate.position || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{candidate.client || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {status || 'Submitted'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs font-medium text-gray-500">
          <p>Showing {rows.length} candidate(s)</p>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-700 hover:text-[#283086] font-bold uppercase tracking-wider"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
