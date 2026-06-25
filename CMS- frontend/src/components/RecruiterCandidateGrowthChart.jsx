import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_VISIBLE_RECRUITERS = 5;
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const getRecruiterName = (recruiter = {}) => (
  recruiter.name ||
  `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() ||
  recruiter.username ||
  recruiter.email ||
  'Unnamed Recruiter'
);

const getFirstName = (name = '') => String(name).trim().split(/\s+/)[0] || name;

const getCandidateRecruiterId = (candidate = {}) => {
  const recruiter = candidate.recruiterId;
  if (!recruiter) return '';
  if (typeof recruiter === 'object') return String(recruiter._id || recruiter.id || '');
  return String(recruiter);
};

const getCandidateDate = (candidate = {}) => {
  const rawDate = candidate.createdAt || candidate.dateAdded;
  if (!rawDate) return null;
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const getMonthLabel = (date) => MONTH_LABELS[date.getMonth()];
const getMonthTooltipLabel = (date) => `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

const buildMonthPeriods = (year) => {
  const periods = [];

  for (let month = 0; month < 12; month += 1) {
    const periodDate = new Date(year, month, 1);
    periods.push({
      key: getMonthKey(periodDate),
      label: getMonthLabel(periodDate),
      tooltipLabel: getMonthTooltipLabel(periodDate),
      sortValue: periodDate.getFullYear() * 100 + periodDate.getMonth(),
    });
  }

  return periods;
};

const buildYearPeriods = (candidateDates) => {
  if (candidateDates.length === 0) {
    const currentYear = new Date().getFullYear();
    return [{ key: String(currentYear), label: String(currentYear), sortValue: currentYear }];
  }

  const years = candidateDates.map((date) => date.getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years, new Date().getFullYear());
  const periods = [];

  for (let year = minYear; year <= maxYear; year += 1) {
    periods.push({ key: String(year), label: String(year), sortValue: year });
  }

  return periods;
};

const pluralizeCandidate = (count) => `${count} candidate${count === 1 ? '' : 's'}`;

const addUniqueChartKeys = (recruiters) => {
  const nameCounts = new Map();

  return recruiters.map((recruiter) => {
    const count = nameCounts.get(recruiter.name) || 0;
    nameCounts.set(recruiter.name, count + 1);

    return {
      ...recruiter,
      chartKey: count === 0 ? recruiter.name : `${recruiter.name} (${count + 1})`,
    };
  });
};

const RecruiterCandidateTooltip = ({ active, label, payload }) => {
  if (!active || !payload?.length) return null;
  const periodLabel = payload[0]?.payload?.tooltipPeriod || label;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900">
      <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Period: {periodLabel}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.name}</span>
            <span className="font-bold" style={{ color: entry.color }}>
              {pluralizeCandidate(Number(entry.value) || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RecruiterCandidateGrowthChart({
  candidates = [],
  recruiters = [],
  loading = false,
}) {
  const [groupBy, setGroupBy] = useState('month');
  const [selectedRecruiterId, setSelectedRecruiterId] = useState('all');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const availableYears = useMemo(() => {
    const years = new Set();

    candidates.forEach((candidate) => {
      const date = getCandidateDate(candidate);
      if (date) years.add(date.getFullYear());
    });

    if (years.size === 0) years.add(new Date().getFullYear());

    return Array.from(years).sort((a, b) => b - a);
  }, [candidates]);

  useEffect(() => {
    if (!availableYears.includes(Number(selectedYear))) {
      setSelectedYear(String(availableYears[0] || new Date().getFullYear()));
    }
  }, [availableYears, selectedYear]);

  const trend = useMemo(() => {
    const recruiterMap = new Map(
      recruiters
        .filter((recruiter) => recruiter._id || recruiter.id)
        .map((recruiter) => {
          const id = String(recruiter._id || recruiter.id);
          return [id, { id, name: getRecruiterName(recruiter), total: 0 }];
        })
    );

    const candidateDates = [];
    const uniqueCandidateIds = new Set();
    const countsByPeriod = new Map();

    const incrementCount = (periodKey, recruiterId) => {
      if (!countsByPeriod.has(periodKey)) countsByPeriod.set(periodKey, new Map());
      const periodCounts = countsByPeriod.get(periodKey);
      periodCounts.set(recruiterId, (periodCounts.get(recruiterId) || 0) + 1);
    };

    candidates.forEach((candidate, index) => {
      const candidateId = String(candidate._id || candidate.id || candidate.candidateId || index);
      if (uniqueCandidateIds.has(candidateId)) return;
      uniqueCandidateIds.add(candidateId);

      const recruiterId = getCandidateRecruiterId(candidate);
      const date = getCandidateDate(candidate);
      if (!recruiterId || !date) return;

      if (!recruiterMap.has(recruiterId)) {
        const recruiter = typeof candidate.recruiterId === 'object' ? candidate.recruiterId : {};
        recruiterMap.set(recruiterId, {
          id: recruiterId,
          name: candidate.recruiterName || getRecruiterName(recruiter),
          total: 0,
        });
      }

      candidateDates.push(date);
      recruiterMap.get(recruiterId).total += 1;
      incrementCount(getMonthKey(date), recruiterId);
      incrementCount(String(date.getFullYear()), recruiterId);
    });

    const allRecruiters = addUniqueChartKeys(
      Array.from(recruiterMap.values())
        .filter((recruiter) => recruiter.name.trim() !== '')
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    );

    const selectedRecruiter = allRecruiters.find((recruiter) => recruiter.id === selectedRecruiterId);
    const visibleRecruiters = selectedRecruiterId === 'all'
      ? allRecruiters.slice(0, MAX_VISIBLE_RECRUITERS)
      : selectedRecruiter ? [selectedRecruiter] : [];

    const periods = groupBy === 'month'
      ? buildMonthPeriods(Number(selectedYear))
      : buildYearPeriods(candidateDates);

    const data = periods
      .sort((a, b) => a.sortValue - b.sortValue)
      .map((period) => {
        const row = { period: period.label, tooltipPeriod: period.tooltipLabel || period.label };
        const periodCounts = countsByPeriod.get(period.key) || new Map();
        visibleRecruiters.forEach((recruiter) => {
          row[recruiter.chartKey] = periodCounts.get(recruiter.id) || 0;
        });
        return row;
      });

    const visibleTotal = data.reduce((sum, row) => (
      sum + visibleRecruiters.reduce((rowSum, recruiter) => rowSum + (Number(row[recruiter.chartKey]) || 0), 0)
    ), 0);

    return { allRecruiters, visibleRecruiters, data, visibleTotal };
  }, [candidates, recruiters, groupBy, selectedRecruiterId, selectedYear]);

  const showRecruiterLimitNote = (
    selectedRecruiterId === 'all' &&
    trend.allRecruiters.length > MAX_VISIBLE_RECRUITERS
  );

  return (
    <div className="flex h-full min-h-[460px] flex-col rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Recruiter Candidate Growth</h3>
          <p className="mt-1 text-xs font-medium text-gray-400">Candidate registrations by recruiter over time</p>
          {showRecruiterLimitNote && (
            <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Showing top {MAX_VISIBLE_RECRUITERS} recruiters. Select a recruiter to view anyone else.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedRecruiterId}
            onChange={(event) => setSelectedRecruiterId(event.target.value)}
            className="min-w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#283086] shadow-sm outline-none transition focus:border-[#283086] focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Recruiters</option>
            {trend.allRecruiters.map((recruiter) => (
              <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>
            ))}
          </select>
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value)}
            className="min-w-36 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#283086] shadow-sm outline-none transition focus:border-[#283086] focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          >
            <option value="month">Month-wise</option>
            <option value="year">Year-wise</option>
          </select>
          {groupBy === 'month' && (
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="min-w-28 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#283086] shadow-sm outline-none transition focus:border-[#283086] focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex min-h-80 flex-1 items-center justify-center">
        {loading ? (
          <p className="text-sm font-semibold text-slate-500">Loading recruiter candidate data...</p>
        ) : trend.visibleRecruiters.length === 0 || trend.visibleTotal === 0 ? (
          <p className="max-w-sm text-center text-sm font-semibold text-slate-500">
            No candidate registration data available for the selected period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trend.data} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip content={<RecruiterCandidateTooltip />} />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: 20, lineHeight: '22px' }}
                formatter={(value) => getFirstName(value)}
              />
              {trend.visibleRecruiters.map((recruiter, index) => (
                <Line
                  key={recruiter.id}
                  type="monotone"
                  dataKey={recruiter.chartKey}
                  name={recruiter.name}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
