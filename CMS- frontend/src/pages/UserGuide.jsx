import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDown,
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Flag,
  MessageSquare,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const tones = {
  green: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    fill: 'bg-emerald-600',
    text: 'text-emerald-700',
    soft: 'bg-emerald-100',
    line: '#059669',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    fill: 'bg-blue-600',
    text: 'text-blue-700',
    soft: 'bg-blue-100',
    line: '#2563eb',
  },
  gold: {
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    fill: 'bg-amber-500',
    text: 'text-amber-700',
    soft: 'bg-amber-100',
    line: '#d97706',
  },
  red: {
    border: 'border-red-500',
    bg: 'bg-red-50',
    fill: 'bg-red-500',
    text: 'text-red-700',
    soft: 'bg-red-100',
    line: '#dc2626',
  },
  purple: {
    border: 'border-violet-400',
    bg: 'bg-violet-50',
    fill: 'bg-violet-600',
    text: 'text-violet-700',
    soft: 'bg-violet-100',
    line: '#7c3aed',
  },
};

const screens = [
  ['Login', ShieldCheck],
  ['Manager Dashboard', BarChart2],
  ['Admin Dashboard', ClipboardCheck],
  ['Recruiters', UserCheck],
  ['Clients', Building2],
  ['Requirements', Briefcase],
  ['Candidate Database', Users],
  ['My Candidates', Users],
  ['Assignments', FileText],
  ['Schedules', Calendar],
  ['Reports', BarChart2],
  ['Messages', MessageSquare],
  ['Settings / Profile', Settings],
];

function IconBox({ icon: Icon, tone = tones.green, large = false }) {
  return (
    <span className={`${large ? 'h-16 w-16' : 'h-12 w-12'} ${tone.fill} flex shrink-0 items-center justify-center rounded-xl text-white shadow-sm`}>
      <Icon className={large ? 'h-8 w-8' : 'h-6 w-6'} />
    </span>
  );
}

function FlowNode({ title, text, icon, tone = tones.green }) {
  return (
    <div className={`relative z-10 mx-auto flex w-full max-w-[560px] items-start gap-4 rounded-xl border-2 ${tone.border} bg-white p-4 shadow-sm`}>
      <IconBox icon={icon} tone={tone} />
      <div className="min-w-0">
        <h3 className="text-base font-black leading-6 text-slate-950">{title}</h3>
        <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function Connector({ tone = tones.green }) {
  return (
    <div className="flex h-12 justify-center">
      <div className="relative h-full w-px" style={{ backgroundColor: tone.line }}>
        <ArrowDown className={`absolute -bottom-1 left-1/2 h-5 w-5 -translate-x-1/2 ${tone.text}`} />
      </div>
    </div>
  );
}

function DecisionNode({ text, tone = tones.green }) {
  return (
    <div className="relative z-10 mx-auto h-40 w-40 shrink-0">
      <div className={`absolute inset-4 rotate-45 border-2 ${tone.border} ${tone.bg} shadow-sm`} />
      <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
        <p className="break-words text-sm font-black leading-5 text-slate-950">{text}</p>
      </div>
    </div>
  );
}

function BranchCard({ label, title, text, icon, tone = tones.red }) {
  const Icon = icon;
  return (
    <div className={`relative z-10 rounded-xl border-2 ${tone.border} ${tone.bg} p-4 shadow-sm`}>
      <span className={`mb-3 inline-flex rounded-md border-2 ${tone.border} bg-white px-3 py-1 text-xs font-black ${tone.text}`}>
        {label}
      </span>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-7 w-7 shrink-0 ${tone.text}`} />
        <div className="min-w-0">
          <h4 className="text-sm font-black leading-5 text-slate-950">{title}</h4>
          <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-700">{text}</p>
        </div>
      </div>
    </div>
  );
}

function DecisionBranch({ decision, tone, no, yes, right }) {
  return (
    <>
      <div className="relative mx-auto grid w-full max-w-[900px] items-center gap-5 lg:grid-cols-[minmax(0,1fr)_170px_minmax(0,1fr)]">
        <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-slate-300 lg:block" />
        {no ? <BranchCard {...no} /> : <div className="hidden lg:block" />}
        <DecisionNode text={decision} tone={tone} />
        {right ? <BranchCard {...right} /> : <div className="hidden lg:block" />}
      </div>
      <div className="flex justify-center py-2">
        <span className={`${yes.tone.border} ${yes.tone.text} rounded-md border-2 bg-white px-4 py-1 text-xs font-black`}>
          {yes.label}
        </span>
      </div>
      <Connector tone={yes.tone} />
    </>
  );
}

function StartEnd({ label, tone = tones.green }) {
  return (
    <div className={`mx-auto flex h-12 w-64 items-center justify-center rounded-xl border-2 ${tone.border} ${tone.bg} text-base font-black text-slate-950 shadow-sm`}>
      {label}
    </div>
  );
}

function StagePanel({ step, title, icon, tone }) {
  return (
    <div className={`rounded-xl border-2 ${tone.border} ${tone.bg} p-5 text-center shadow-sm`}>
      <span className={`${tone.fill} inline-flex rounded-md px-3 py-1 text-sm font-black text-white`}>
        {step}
      </span>
      <h2 className="mx-auto mt-4 max-w-[12rem] text-xl font-black uppercase leading-7 text-slate-950">{title}</h2>
      <div className="mt-6 flex justify-center">
        <IconBox icon={icon} tone={tone} large />
      </div>
    </div>
  );
}

function InfoPanel({ title, items, tone }) {
  return (
    <aside className={`rounded-xl border-2 ${tone.border} bg-white p-5 shadow-sm`}>
      <h3 className={`text-center text-sm font-black uppercase ${tone.text}`}>{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item.title || item} className="text-sm leading-6 text-slate-700">
            {item.title ? (
              <>
                <p className="font-black text-slate-950">{index + 1}. {item.title}</p>
                <p className="mt-1 pl-4 font-medium">{item.text}</p>
              </>
            ) : (
              <div className="flex gap-2">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.fill}`} />
                <span className="break-words font-medium">{item}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function StageSection({ step, title, icon, tone, children, info }) {
  return (
    <section className="border-t border-slate-200 py-10 first:border-t-0 first:pt-0">
      <div className="grid gap-6 xl:grid-cols-[210px_minmax(0,1fr)_290px]">
        <StagePanel step={step} title={title} icon={icon} tone={tone} />
        <div className="min-w-0">{children}</div>
        <InfoPanel title="About This Step" items={info} tone={tone} />
      </div>
    </section>
  );
}

function RoleChain() {
  const roles = [
    ['Manager', 'Monitors dashboards, reports, progress, and outcomes.', BarChart2, tones.purple],
    ['Admin', 'Creates users, clients, requirements, and recruiter assignments.', ClipboardCheck, tones.blue],
    ['Recruiter', 'Adds candidates, submits profiles, schedules interviews, and updates results.', UserCheck, tones.green],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
      {roles.map(([role, text, Icon, tone], index) => (
        <React.Fragment key={role}>
          <div className={`rounded-xl border-2 ${tone.border} bg-white p-4 shadow-sm`}>
            <div className="flex items-start gap-3">
              <IconBox icon={Icon} tone={tone} />
              <div>
                <h3 className="text-base font-black text-slate-950">{role}</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{text}</p>
              </div>
            </div>
          </div>
          {index < roles.length - 1 && (
            <div className="hidden items-center justify-center lg:flex">
              <ChevronRight className="h-7 w-7 text-slate-400" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ScreensCovered() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-slate-700" />
        <h2 className="text-lg font-black text-slate-950">Important Screens Covered</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {screens.map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            <Icon className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="min-w-0 break-words">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function UserGuide() {
  const { userRole } = useAuth();
  const isRecruiter = userRole === 'recruiter';
  const homePath = isRecruiter ? '/recruiter' : '/admin';
  const candidatePath = isRecruiter ? '/recruiter/candidates' : '/admin/add-candidate';
  const assignmentPath = isRecruiter ? '/recruiter/assignments' : '/admin/requirements';
  const schedulePath = isRecruiter ? '/recruiter/schedules' : '/admin/schedules';
  const reportsPath = isRecruiter ? '/recruiter/reports' : '/admin/reports';

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="rounded-2xl bg-slate-100 p-3 shadow-sm ring-1 ring-slate-200">
        <div className="rounded-xl bg-white p-5 shadow-sm sm:p-7">
          <div className="relative flex flex-col items-center gap-4 pb-8">
            <Link
              to={homePath}
              className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <div className="rounded-xl bg-[#071f45] px-8 py-4 text-center text-2xl font-black tracking-tight text-white shadow-md sm:px-16 sm:text-3xl">
              VTS Tracker Flow
            </div>
            <p className="max-w-3xl text-center text-sm font-medium leading-6 text-slate-600">
              A new user can follow this flow from candidate add, to client submission, interviews, final selection, joining, rejection, hold, or backout.
            </p>
          </div>

          <RoleChain />

          <div className="my-10">
            <StartEnd label="START" tone={tones.green} />
            <Connector tone={tones.green} />
          </div>

          <StageSection
            step="STEP 1"
            title="Candidate Intake"
            icon={UserPlus}
            tone={tones.green}
            info={[
              'Candidate starts as Pipeline or Submitted.',
              'Duplicate email and phone checks help avoid repeated records.',
              'Candidate can be assigned to a recruiter.',
              'Saved profile becomes ready for client/job submission.',
            ]}
          >
            <FlowNode title="Open Candidate Database" text="Admin opens Candidate Database or Recruiter opens My Candidates." icon={Users} tone={tones.green} />
            <Connector tone={tones.green} />
            <FlowNode title="Add Candidate" text="Click Add Candidate and enter the basic candidate details." icon={UserPlus} tone={tones.green} />
            <Connector tone={tones.green} />
            <FlowNode title="Upload Resume or Fill Manually" text="Resume upload can auto-fill the form. User can also type details manually." icon={Upload} tone={tones.green} />
            <Connector tone={tones.green} />
            <FlowNode title="Check Required Details" text="Confirm name, email, phone, skills, experience, company, CTC, notice period, source, location, and remarks." icon={ClipboardCheck} tone={tones.green} />
            <Connector tone={tones.green} />
            <DecisionBranch
              decision="Candidate profile complete?"
              tone={tones.green}
              no={{
                label: 'NO',
                title: 'Complete Missing Details',
                text: 'If required data is missing, update the profile before submission.',
                icon: RefreshCw,
                tone: tones.red,
              }}
              yes={{ label: 'YES', tone: tones.green }}
            />
          </StageSection>

          <StageSection
            step="STEP 2"
            title="Client Submission"
            icon={Send}
            tone={tones.blue}
            info={[
              'Submission statuses: Submitted, Shared Profiles, Yet to attend, Turnups, No Show.',
              'Interview rounds: L1, L2, L3, L4, L5, Technical Round, HR Round.',
              'Candidate remains linked to the exact client and job.',
              'Schedules can be reviewed from Interview Calendar.',
            ]}
          >
            <FlowNode title="Create Client and Requirement" text="Admin creates client details and posts the job requirement." icon={Building2} tone={tones.blue} />
            <Connector tone={tones.blue} />
            <FlowNode title="Assign Recruiter" text="Admin assigns the job to a primary or secondary recruiter." icon={UserCheck} tone={tones.blue} />
            <Connector tone={tones.blue} />
            <FlowNode title="Recruiter Opens Assignments" text="Recruiter reviews job code, client, skills, location, and TAT." icon={Briefcase} tone={tones.blue} />
            <Connector tone={tones.blue} />
            <FlowNode title="Submit Candidate to Client/Job" text="Submission stores client name, job code, position, submission date, and pipeline status." icon={Send} tone={tones.blue} />
            <Connector tone={tones.blue} />
            <DecisionBranch
              decision="Client accepts profile?"
              tone={tones.blue}
              no={{
                label: 'NO',
                title: 'Hold or Rework Profile',
                text: 'Keep candidate in Pipeline or Hold, or improve the profile before trying again.',
                icon: AlertTriangle,
                tone: tones.red,
              }}
              yes={{ label: 'YES', tone: tones.blue }}
            />
            <FlowNode title="Schedule Interview" text="Add candidate, recruiter, date, time, mode, round, meeting link, notes, and status." icon={Calendar} tone={tones.blue} />
            <Connector tone={tones.blue} />
          </StageSection>

          <StageSection
            step="STEP 3"
            title="Final Selection"
            icon={Flag}
            tone={tones.gold}
            info={[
              'Selected candidates can move toward joining.',
              'Joined means the hiring cycle is successful.',
              'Rejected, Hold, No Show, and Backout are still tracked.',
              'Manager/Admin checks dashboard and reports.',
              'Recruiter reviews own performance.',
            ]}
          >
            <DecisionBranch
              decision="Final result after interview?"
              tone={tones.gold}
              no={{
                label: 'NO',
                title: 'Rejected / No Show / Backout',
                text: 'Close with the correct status when candidate does not move forward.',
                icon: XCircle,
                tone: tones.red,
              }}
              right={{
                label: 'HOLD',
                title: 'Hold Decision',
                text: 'Keep candidate on Hold while client or internal decision is pending.',
                icon: AlertTriangle,
                tone: tones.gold,
              }}
              yes={{ label: 'YES', tone: tones.green }}
            />
            <FlowNode title="Mark as Selected" text="Use Selected when the candidate clears the interview process." icon={CheckCircle2} tone={tones.gold} />
            <Connector tone={tones.gold} />
            <DecisionBranch
              decision="Candidate joined?"
              tone={tones.gold}
              no={{
                label: 'NO',
                title: 'Backout or Hold',
                text: 'If joining is delayed or cancelled, update status as Hold or Backout.',
                icon: RefreshCw,
                tone: tones.red,
              }}
              yes={{ label: 'YES', tone: tones.green }}
            />
            <FlowNode title="Mark as Joined" text="Joined means the recruitment cycle is successful." icon={UserCheck} tone={tones.gold} />
            <Connector tone={tones.gold} />
            <FlowNode title="Reports Updated" text="Manager, Admin, and Recruiter can review performance and outcome reports." icon={BarChart2} tone={tones.gold} />
            <Connector tone={tones.purple} />
            <StartEnd label="END" tone={tones.purple} />
          </StageSection>

          <ScreensCovered />

          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <Link to={candidatePath} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-100">Open Candidates</Link>
            <Link to={assignmentPath} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-100">Open Requirements</Link>
            <Link to={schedulePath} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 hover:bg-amber-100">Open Schedules</Link>
            <Link to={reportsPath} className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700 hover:bg-violet-100">Open Reports</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
