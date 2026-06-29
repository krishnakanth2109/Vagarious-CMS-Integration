import React from 'react';

export const ScoreBadge = ({ score = 0 }) => {
  let colorCls = 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'; // Default gray
  if (score >= 85) {
    colorCls = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50';
  } else if (score >= 70) {
    colorCls = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/50';
  } else if (score >= 55) {
    colorCls = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/50';
  } else if (score > 0) {
    colorCls = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold border ${colorCls}`}>
      {score}%
    </span>
  );
};

export const MatchBreakdownBar = ({ breakdown }) => {
  const items = [
    { label: 'Skills (55)', value: breakdown?.skills || 0, max: 55, color: 'bg-blue-500' },
    { label: 'Role Relevance (25)', value: breakdown?.role || 0, max: 25, color: 'bg-indigo-500' },
    { label: 'Experience (10)', value: breakdown?.experience || 0, max: 10, color: 'bg-teal-500' },
    { label: 'Education (5)', value: breakdown?.education || 0, max: 5, color: 'bg-purple-500' },
    { label: 'Location/Other (5)', value: breakdown?.location || 0, max: 5, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-2.5 mt-3">
      {items.map((item) => {
        const percentage = item.max ? Math.round((item.value / item.max) * 100) : 0;
        return (
          <div key={item.label} className="text-xs">
            <div className="flex justify-between text-zinc-500 mb-1 font-medium">
              <span>{item.label}</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
              <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SkillChips = ({
  matchedMandatory = [],
  missingMandatory = [],
  matchedPreferred = [],
  missingPreferred = [],
}) => (
  <div className="space-y-3">
    <div>
      <div className="text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wide">Mandatory Skills</div>
      <div className="flex flex-wrap gap-1.5">
        {matchedMandatory.map((skill) => (
          <span key={`matched-${skill}`} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-md font-medium">
            {skill} (Match)
          </span>
        ))}
        {missingMandatory.map((skill) => (
          <span key={`missing-${skill}`} className="bg-red-50 text-red-600 border border-red-200 text-xs px-2 py-0.5 rounded-md font-medium">
            {skill} (Missing)
          </span>
        ))}
        {!matchedMandatory.length && !missingMandatory.length && (
          <span className="text-xs text-zinc-400">No mandatory skills listed.</span>
        )}
      </div>
    </div>

    {(matchedPreferred.length > 0 || missingPreferred.length > 0) && (
      <div>
        <div className="text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wide">Preferred Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {matchedPreferred.map((skill) => (
            <span key={`pref-matched-${skill}`} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-md font-medium">
              {skill} (Match)
            </span>
          ))}
          {missingPreferred.map((skill) => (
            <span key={`pref-missing-${skill}`} className="bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs px-2 py-0.5 rounded-md font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);
