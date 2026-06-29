import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import CandidateSubmission from '../models/CandidateSubmission.js';
import { parseResume } from './resumeParser.js';
import { protect } from '../middleware/authMiddleware.js';
import { bulkImportCandidates } from '../controllers/bulkImportController.js';
import { updateCandidateStatus, updateCandidateRemarks, inlineUpdateCandidate } from '../controllers/candidateStatusController.js';
import { sendJobInvitationEmail } from '../services/email.js';
import { getMatchingJobsCountForCandidates, isJobMatchingCandidate } from '../services/matchingService.js';
import { processDetailedMatchingForCandidate } from '../services/groqMatchingService.js';

const router = express.Router();

const CANDIDATE_VIEWS = {
  dashboard: 'candidateId name firstName lastName email position skills status recruiterId recruiterName client currentCompany dateAdded createdAt',
  recruiters: 'candidateId name firstName lastName email contact position skills totalExperience status recruiterId recruiterName client currentCompany dateAdded createdAt active',
  reports: 'candidateId name firstName lastName email contact position skills client source status recruiterId recruiterName dateAdded createdAt updatedAt remarks notes',
  schedule: 'candidateId name firstName lastName email contact position skills status recruiterId recruiterName active',
  invoice: 'candidateId name firstName lastName email position skills client ctc status recruiterId recruiterName dateAdded createdAt',
  matching: 'candidateId name firstName lastName email contact alternateNumber currentLocation preferredLocation position skills totalExperience relevantExperience education ctc ectc noticePeriod linkedin source status recruiterId recruiterName client currentCompany remarks dateAdded createdAt active',
};

// ─── Shared helper — defined ONCE at module level ─────────────────────────────
// FIX 4: Was copy-pasted 3× inside POST /, PUT /bulk-assign, and PUT /:id.
//         A single module-level function guarantees consistency everywhere.
const resolveUserName = (u) => {
  if (!u) return 'Unknown';
  const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return full || u.username || u.email || 'Unknown';
};

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const MAX_JOB_INVITE_RECIPIENTS = Number(process.env.MAX_JOB_INVITE_RECIPIENTS || 100);
const JOB_INVITE_BATCH_SIZE = Math.min(Math.max(Number(process.env.JOB_INVITE_BATCH_SIZE || 10), 1), 20);
const JOB_INVITE_BATCH_DELAY_MS = Math.max(Number(process.env.JOB_INVITE_BATCH_DELAY_MS || 300), 0);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stripUnsafeHtml = (html = '') => String(html)
  .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
  .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
  .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]*)/gi, '');

const isHtmlEmpty = (html = '') => !String(html)
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/gi, ' ')
  .trim();

const getUserLookupValues = (user) => [
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null,
  user?.name,
  user?.fullName,
  user?.username,
  user?.email,
].filter(Boolean);

const recruiterCanUseJob = (job, user) => {
  if (!job || !user) return false;
  if (user.role === 'admin' || user.role === 'manager') return true;
  const names = new Set(getUserLookupValues(user).map(normalizeName));
  return names.has(normalizeName(job.primaryRecruiter)) || names.has(normalizeName(job.secondaryRecruiter));
};

const canAccessCandidate = (candidate, user) => {
  if (!candidate || !user) return false;
  if (user.role === 'admin' || user.role === 'manager') return true;
  return String(candidate.recruiterId) === String(user._id);
};

const personalizeInviteHtml = (html, candidate) => {
  const firstName = String(candidate.firstName || candidate.name || '').trim().split(/\s+/)[0] || 'Candidate';
  const safeName = firstName.replace(/[<>&"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[ch]));
  const personalized = String(html || '').replace(
    /Dear\s+(Candidate|\{Candidate First Name\}|\{firstName\}|\{\{firstName\}\})/i,
    `Dear ${safeName}`
  );
  return personalized === html && !/Dear\s+/i.test(html)
    ? `<p>Dear ${safeName},</p>${html}`
    : personalized;
};

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const UPLOAD_DIR = 'uploads/';

// FIX 3: Replaced synchronous fs.existsSync + fs.mkdirSync with fs.mkdirSync
//         using the { recursive: true } flag. This is a one-liner that:
//         - Does nothing if the directory already exists (idempotent)
//         - Still synchronous but only runs ONCE at module load time,
//           NOT on every file upload request (which was the real problem).
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file type. Only PDF and Docx allowed.'));
  },
});

// ─── Auth ────────────────────────────────────────────────────────────────────
router.use(protect);

// ─── Helper: sanitize FormData (Multer converts everything to strings) ────────
const sanitizeBody = (body) => {
  const data = { ...body };
  if (typeof data.skills === 'string') {
    data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  // status may arrive as a JSON string from FormData
  if (typeof data.status === 'string') {
    try { data.status = JSON.parse(data.status); } catch (_) {
      data.status = data.status ? [data.status] : ['Submitted'];
    }
  }
  // customFields may arrive as a JSON string from FormData
  if (typeof data.customFields === 'string') {
    try { data.customFields = JSON.parse(data.customFields); } catch (_) {
      data.customFields = {};
    }
  }
  if (data.offersInHand      === 'true')  data.offersInHand      = true;
  if (data.offersInHand      === 'false') data.offersInHand      = false;
  if (data.servingNoticePeriod === 'true')  data.servingNoticePeriod = true;
  if (data.servingNoticePeriod === 'false') data.servingNoticePeriod = false;
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES — ORDER MATTERS IN EXPRESS
// Static paths (/parse-resume, /check-email, /check-phone) MUST come before
// parameterised paths (/:id) so Express doesn't swallow them as id values.
// ─────────────────────────────────────────────────────────────────────────────

// ── Parse Resume ──────────────────────────────────────────────────────────────
router.post('/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileBuffer  = fs.readFileSync(req.file.path);
    const parsedResult = await parseResume(fileBuffer, req.file.mimetype);

    try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Failed to delete temp file:', e); }

    if (parsedResult.success) {
      return res.json({
        success: true,
        data: {
          name:             parsedResult.data.name            || '',
          email:            parsedResult.data.email           || '',
          contact:          parsedResult.data.contact         || '',
          skills:           parsedResult.data.skills          || '',
          totalExperience:  parsedResult.data.totalExperience || '',
        },
      });
    }
    res.json({ success: false, message: 'Could not parse resume', data: {} });
  } catch (error) {
    console.error('Resume parsing error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    res.status(500).json({ success: false, message: 'Error parsing resume', error: error.message });
  }
});

// ── GET ALL (with date filtering) ─────────────────────────────────────────────
// FIX 2: Added .lean() — returns plain JS objects instead of full Mongoose
//         documents. For a large candidate list this is ~3× faster to serialise
//         and send, because Mongoose doesn't attach getters/setters/virtuals.
router.post('/bulk-import', express.json({ limit: '10mb' }), bulkImportCandidates);

router.get('/', async (req, res) => {
  try {
    const query = {};

    // Recruiters always see only their own candidates (enforced server-side)
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.recruiterId = req.user._id;
    }

    // Admin/manager can pass ?recruiterId=<id> to filter to a specific recruiter's candidates.
    // This is used when an admin is on the RecruiterCandidates page (their own personal view)
    // so they only see candidates they personally added, not the entire database.
    if (req.query.recruiterId && (req.user.role === 'admin' || req.user.role === 'manager')) {
      query.recruiterId = req.query.recruiterId;
    }

    if (req.query.date) {
      // FIX: Parse YYYY-MM-DD manually to treat as LOCAL date, not UTC.
      // Pad by +/- 1 day to make it safe for timezone offsets.
      const [yyyy, mm, dd] = req.query.date.split('-').map(Number);
      const start = new Date(yyyy, mm - 1, dd - 1, 0, 0, 0, 0);
      const end   = new Date(yyyy, mm - 1, dd + 1, 23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    } else if (req.query.startDate && req.query.endDate) {
      // Pad by +/- 1 day to make it safe for timezone offsets.
      const [sy, sm, sd] = req.query.startDate.split('-').map(Number);
      const [ey, em, ed] = req.query.endDate.split('-').map(Number);
      const start = new Date(sy, sm - 1, sd - 1, 0, 0, 0, 0);
      const end   = new Date(ey, em - 1, ed + 1, 23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const candidates = await Candidate.find(query)
      .populate('recruiterId', 'name firstName lastName email')
      .sort({ createdAt: -1 })
      .select(CANDIDATE_VIEWS[req.query.view] || '')
      .lean(); // FIX 2: plain objects — faster serialisation on large lists

    if (candidates.length > 0) {
      const counts = await getMatchingJobsCountForCandidates(candidates, req.user);
      candidates.forEach((candidate) => {
        candidate.matchingJobsCount = counts[candidate._id.toString()] || 0;
      });
    }

    if (req.query.includeSubmissions === 'true' && candidates.length > 0) {
      const candidateIds = candidates.map((candidate) => candidate._id);
      const submissions = await CandidateSubmission.find({ candidateId: { $in: candidateIds } })
        .select('candidateId jobId jobCode clientName position pipelineStage status submittedBy submittedByName submittedAt createdAt updatedAt')
        .populate('submittedBy', 'name firstName lastName email')
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      const submissionsByCandidate = submissions.reduce((map, submission) => {
        const key = String(submission.candidateId);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(submission);
        return map;
      }, new Map());

      candidates.forEach((candidate) => {
        candidate.submissions = submissionsByCandidate.get(String(candidate._id)) || [];
      });
    }

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Check email duplicate ──────────────────────────────────────────────────────
router.get('/check-email', async (req, res) => {
  try {
    const { email, excludeId } = req.query;
    if (!email) return res.json({ exists: false });

    const query = { email: email.trim().toLowerCase() };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Candidate.findOne(query).select('_id name candidateId').lean();
    if (existing) {
      const id = existing.candidateId || existing._id.toString().slice(-6).toUpperCase();
      return res.json({ exists: true, candidateId: id, name: existing.name || '' });
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Check phone duplicate ──────────────────────────────────────────────────────
router.get('/check-phone', async (req, res) => {
  try {
    const { phone, excludeId } = req.query;
    if (!phone) return res.json({ exists: false });

    const digits = phone.trim().replace(/\D/g, '').replace(/^91/, '').slice(-10);
    if (digits.length !== 10) return res.json({ exists: false });

    const query = { contact: digits };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Candidate.findOne(query).select('_id name candidateId').lean();
    if (existing) {
      const id = existing.candidateId || existing._id.toString().slice(-6).toUpperCase();
      return res.json({ exists: true, candidateId: id, name: existing.name || '' });
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Create Candidate ──────────────────────────────────────────────────────────
router.post('/send-job-invite', express.json({ limit: '1mb' }), async (req, res) => {
  try {
    const { candidateIds, jobId, subject, htmlBody } = req.body || {};
    const uniqueCandidateIds = [...new Set(Array.isArray(candidateIds) ? candidateIds.map(String) : [])];
    const cleanSubject = String(subject || '').trim();
    const cleanHtmlBody = stripUnsafeHtml(htmlBody);

    if (uniqueCandidateIds.length === 0) {
      return res.status(400).json({ message: 'Select at least one candidate.' });
    }
    if (uniqueCandidateIds.length > MAX_JOB_INVITE_RECIPIENTS) {
      return res.status(400).json({ message: `You can send up to ${MAX_JOB_INVITE_RECIPIENTS} invitations at a time.` });
    }
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Select a job requirement.' });
    }
    if (!cleanSubject) {
      return res.status(400).json({ message: 'Email subject is required.' });
    }
    if (isHtmlEmpty(cleanHtmlBody)) {
      return res.status(400).json({ message: 'Email body is required.' });
    }

    const invalidIds = uniqueCandidateIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: 'One or more candidate IDs are invalid.' });
    }

    const job = await Job.findById(jobId).lean();
    if (!job || job.active === false || !recruiterCanUseJob(job, req.user)) {
      return res.status(404).json({ message: 'Job requirement not found or not available for this user.' });
    }

    const candidates = await Candidate.find({ _id: { $in: uniqueCandidateIds } })
      .select('_id firstName lastName name email recruiterId')
      .lean();

    const candidatesById = new Map(candidates.map((candidate) => [String(candidate._id), candidate]));
    const results = [];
    const sendableCandidates = [];

    for (const candidateId of uniqueCandidateIds) {
      const candidate = candidatesById.get(candidateId);
      if (!candidate) {
        results.push({ candidateId, email: '', status: 'skipped', error: 'Candidate not found.' });
        continue;
      }
      if (!canAccessCandidate(candidate, req.user)) {
        results.push({ candidateId, email: '', status: 'skipped', error: 'Candidate is outside your allowed scope.' });
        continue;
      }

      const email = String(candidate.email || '').trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        results.push({ candidateId, email, status: 'skipped', error: 'Candidate email is unavailable.' });
        continue;
      }

      sendableCandidates.push({ ...candidate, email });
    }

    for (let i = 0; i < sendableCandidates.length; i += JOB_INVITE_BATCH_SIZE) {
      const batch = sendableCandidates.slice(i, i + JOB_INVITE_BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(async (candidate) => {
        try {
          const result = await sendJobInvitationEmail({
            recipientEmail: candidate.email,
            candidateName: candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate',
            subject: cleanSubject,
            htmlBody: personalizeInviteHtml(cleanHtmlBody, candidate),
          });

          if (result.status === 'success') {
            return {
              candidateId: String(candidate._id),
              email: candidate.email,
              status: 'sent',
              provider: result.provider || '',
              providerMessageId: result.providerMessageId || '',
              message: result.message || '',
            };
          }

          return {
            candidateId: String(candidate._id),
            email: candidate.email,
            status: 'failed',
            error: result.message || 'Failed to send email.',
          };
        } catch (error) {
          return {
            candidateId: String(candidate._id),
            email: candidate.email,
            status: 'failed',
            error: error.message || 'Failed to send email.',
          };
        }
      }));

      results.push(...batchResults);
      if (i + JOB_INVITE_BATCH_SIZE < sendableCandidates.length && JOB_INVITE_BATCH_DELAY_MS > 0) {
        await sleep(JOB_INVITE_BATCH_DELAY_MS);
      }
    }

    const sent = results.filter((item) => item.status === 'sent').length;
    const failed = results.filter((item) => item.status === 'failed').length;
    const skipped = results.filter((item) => item.status === 'skipped').length;

    return res.json({
      success: failed === 0,
      total: uniqueCandidateIds.length,
      sent,
      failed,
      skipped,
      results,
    });
  } catch (error) {
    console.error('Send job invite error:', error);
    res.status(500).json({ message: error.message || 'Failed to send job invitations.' });
  }
});

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    let candidateData = sanitizeBody(req.body);

    // ── Extract and remove submissions from candidateData before saving ────────
    let submissionsPayload = [];
    if (candidateData.submissions) {
      try {
        submissionsPayload = typeof candidateData.submissions === 'string'
          ? JSON.parse(candidateData.submissions)
          : candidateData.submissions;
      } catch (_) {
        submissionsPayload = [];
      }
      delete candidateData.submissions;
    }

    if (req.file) {
      candidateData.resumeUrl          = `/uploads/${req.file.filename}`;
      candidateData.resumeOriginalName = req.file.originalname;
    }

    let targetRecruiterId   = req.user._id;
    let targetRecruiterName = resolveUserName(req.user);

    if ((req.user.role === 'admin' || req.user.role === 'manager') && candidateData.recruiterId) {
      const assignedRecruiter = await User.findById(candidateData.recruiterId);
      if (assignedRecruiter) {
        targetRecruiterId   = assignedRecruiter._id;
        targetRecruiterName = resolveUserName(assignedRecruiter);
      }
    }

    candidateData.recruiterId   = targetRecruiterId;
    candidateData.recruiterName = targetRecruiterName;

    const newCandidate = new Candidate(candidateData);
    await newCandidate.save();

    // ── Create CandidateSubmission records for each client/job row ─────────────
    const submissionResults = [];
    const submissionErrors  = [];

    if (Array.isArray(submissionsPayload) && submissionsPayload.length > 0) {
      // Deduplicate inside payload before saving (same jobId cannot appear twice)
      const seenJobIds = new Set();

      for (const sub of submissionsPayload) {
        if (!sub.jobId) {
          submissionErrors.push({ jobId: sub.jobId, error: 'jobId is required' });
          continue;
        }

        if (seenJobIds.has(String(sub.jobId))) {
          submissionErrors.push({ jobId: sub.jobId, error: 'Duplicate jobId in request — skipped' });
          continue;
        }
        seenJobIds.add(String(sub.jobId));

        try {
          const job = await Job.findById(sub.jobId).lean();
          if (!job) {
            submissionErrors.push({ jobId: sub.jobId, error: 'Job not found' });
            continue;
          }

          if (sub.clientName && normalizeName(sub.clientName) !== normalizeName(job.clientName)) {
            submissionErrors.push({ jobId: sub.jobId, error: 'Selected job does not belong to the selected client.' });
            continue;
          }

          // Check for duplicate in DB (shouldn't happen on new candidate, but be safe)
          const existing = await CandidateSubmission.findOne({
            tenantOwnerId: targetRecruiterId,
            candidateId: newCandidate._id,
            jobId: sub.jobId,
          }).lean();

          if (existing) {
            submissionErrors.push({ jobId: sub.jobId, error: 'Candidate already submitted to this job.' });
            continue;
          }

          const created = await CandidateSubmission.create({
            candidateId:     newCandidate._id,
            tenantOwnerId:   targetRecruiterId,
            jobId:           sub.jobId,
            jobCode:         job.jobCode,
            clientName:      job.clientName,
            position:        job.position,
            pipelineStage:   sub.pipelineStage || 'Pipeline',
            status:          sub.status || sub.pipelineStage || 'Pipeline',
            submittedBy:     targetRecruiterId,
            submittedByName: targetRecruiterName,
            submittedAt:     new Date(),
            notes:           sub.notes || '',
          });

          submissionResults.push(created);
        } catch (subErr) {
          console.error('[candidateRoutes] Submission create error:', subErr.message);
          submissionErrors.push({ jobId: sub.jobId, error: subErr.message });
        }
      }
    }

    return res.status(201).json({
      ...newCandidate.toObject(),
      submissions:       submissionResults,
      submissionErrors,
    });
  } catch (error) {
    console.error('Create Error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Candidate already submitted to this job.' });
    }
    res.status(400).json({ message: error.message });
  }
});

// ── Bulk Assign ───────────────────────────────────────────────────────────────
// FIX 1: CRITICAL — Moved PUT /bulk-assign to BEFORE PUT /:id.
//
// WHY THIS WAS BREAKING:
//   Express matches routes top-to-bottom. The original code had:
//     router.put('/:id', ...)       ← defined FIRST
//     router.put('/bulk-assign', .) ← defined SECOND (never reached)
//
//   When the frontend called PUT /bulk-assign, Express saw "bulk-assign" as a
//   valid :id value and hit the single-candidate update handler instead.
//   The result: either a 404 (no candidate with id "bulk-assign") or, worse,
//   a corrupt update on a candidate whose _id happened to partially match.
//
// THE FIX: Static paths (exact strings) must always be declared before
//   parameterised paths (/:id) in the same HTTP method group.
router.put('/bulk-assign', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to bulk assign candidates' });
    }

    const { candidateIds, recruiterId } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one candidate ID' });
    }
    if (!recruiterId) {
      return res.status(400).json({ message: 'Please provide a recruiter/user ID to assign to' });
    }

    const targetUser = await User.findById(recruiterId);
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

    const recruiterName = resolveUserName(targetUser); // FIX 4: shared helper

    const result = await Candidate.updateMany(
      { _id: { $in: candidateIds } },
      { $set: { recruiterId: targetUser._id, recruiterName } }
    );

    res.json({
      message:       `Successfully assigned ${result.modifiedCount} candidate(s) to ${recruiterName}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bulk assign error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ── GET matching jobs for a candidate (detailed scoring) ──────────────────────────
router.get('/:candidateId/matching-jobs', async (req, res) => {
  try {
    const { candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: 'Invalid candidate ID' });
    }

    const candidate = await Candidate.findById(candidateId).lean();
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      const ownerIdStr = candidate.recruiterId?._id?.toString() || candidate.recruiterId?.toString();
      if (ownerIdStr !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this candidate' });
      }
    }

    // Fetch active accessible jobs
    const jobQuery = { active: true };
    if (req.user && req.user.role === 'recruiter') {
      const possibleNames = [
        (req.user.firstName && req.user.lastName) ? `${req.user.firstName} ${req.user.lastName}` : null,
        req.user.name, req.user.fullName, req.user.username, req.user.email
      ].filter(Boolean);

      jobQuery.$or = [
        { primaryRecruiter: { $in: possibleNames } },
        { secondaryRecruiter: { $in: possibleNames } }
      ];
    }
    const jobs = await Job.find(jobQuery).lean();

    // Filter qualifying jobs
    const qualifyingJobs = jobs.filter(job => isJobMatchingCandidate(candidate, job));

    if (qualifyingJobs.length === 0) {
      return res.json({
        success: true,
        candidateName: candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
        jobs: []
      });
    }

    // Run detailed scoring
    const detailedMatches = await processDetailedMatchingForCandidate(candidate, qualifyingJobs, req.user);

    return res.json({
      success: true,
      candidateName: candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
      jobs: detailedMatches
    });
  } catch (error) {
    console.error('Detailed candidate matching error:', error);
    res.status(500).json({ message: error.message || 'Failed to calculate matching jobs.' });
  }
});

// ── Get Single ────────────────────────────────────────────────────────────────
// FIX 5: The original code did candidate.recruiterId._id.toString() without
//         checking if recruiterId was populated. If the populate failed or the
//         field was a raw ObjectId (not a document), ._id would be undefined
//         and .toString() would throw a TypeError, crashing the request with
//         a 500 instead of returning a clean error.
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('recruiterId', 'name firstName lastName email');

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // FIX 5: Safe ownership check — handles both populated object and raw ObjectId
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      const ownerIdStr = candidate.recruiterId?._id?.toString()
                       || candidate.recruiterId?.toString();
      if (ownerIdStr !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this candidate' });
      }
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Specialised status / remarks / inline-update ───────────────────────────────
// These are more specific paths (/:id/status etc.) so they must come BEFORE
// the generic PUT /:id below, which would otherwise match first.
router.put('/:id/status',        updateCandidateStatus);
router.put('/:id/remarks',       updateCandidateRemarks);
router.put('/:id/inline-update', inlineUpdateCandidate);

// ── Update Candidate ──────────────────────────────────────────────────────────
router.put('/:id', upload.single('resume'), async (req, res) => {
  try {
    let updateData = sanitizeBody(req.body);

    // Never overwrite timestamps
    delete updateData.dateAdded;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // findByIdAndUpdate bypasses pre-save hooks — rebuild name explicitly
    if (updateData.firstName || updateData.lastName) {
      updateData.name = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
    }

    const existingCandidate = await Candidate.findById(req.params.id);
    if (!existingCandidate) return res.status(404).json({ message: 'Candidate not found' });

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (existingCandidate.recruiterId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (req.file) {
      updateData.resumeUrl          = `/uploads/${req.file.filename}`;
      updateData.resumeOriginalName = req.file.originalname;
    }

    if ((req.user.role === 'admin' || req.user.role === 'manager') && updateData.recruiterId) {
      const assignedRecruiter = await User.findById(updateData.recruiterId);
      if (assignedRecruiter) {
        updateData.recruiterName = resolveUserName(assignedRecruiter); // FIX 4: shared helper
      }
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    res.json(updatedCandidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Delete Candidate ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (candidate.recruiterId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (candidate.resumeUrl) {
      const filePath = path.join(process.cwd(), candidate.resumeUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error('File delete error:', e); }
      }
    }

    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
