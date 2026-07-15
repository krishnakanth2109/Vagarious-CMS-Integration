/**
 * submissionRoutes.js
 * Mounted at /api/submissions
 *
 * Handles all CandidateSubmission CRUD:
 *   GET    /api/submissions?candidateId=<id>   → all submissions for a candidate
 *   GET    /api/submissions/:id                → single submission
 *   POST   /api/submissions                    → create one submission
 *   PUT    /api/submissions/:id                → update stage/status/notes
 *   DELETE /api/submissions/:id                → remove a submission
 */

import express from 'express';
import mongoose from 'mongoose';
import CandidateSubmission, { PIPELINE_STAGES } from '../models/CandidateSubmission.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// ── Helper ────────────────────────────────────────────────────────────────────
const resolveUserName = (u) => {
  if (!u) return 'Unknown';
  const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return full || u.username || u.email || 'Unknown';
};

const normalizeName = (value) => String(value || '').trim().toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/submissions?candidateId=<id> or ?jobId=<id> or ?clientName=<name>
// Get submissions for a candidate, requirement or client name.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { candidateId, jobId, clientName } = req.query;
    if (!candidateId && !jobId && !clientName) {
      return res.status(400).json({ message: 'candidateId, jobId or clientName query param is required' });
    }

    const query = {};
    if (candidateId) query.candidateId = candidateId;
    if (jobId) query.jobId = jobId;
    if (clientName) {
      const escapedClientName = clientName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.clientName = { $regex: new RegExp(`^${escapedClientName}$`, 'i') };
    }

    const submissions = await CandidateSubmission.find(query)
      .populate('jobId', 'jobCode position clientName location')
      .populate('candidateId', 'candidateId name firstName lastName email contact position skills totalExperience education currentLocation preferredLocation')
      .populate('submittedBy', 'firstName lastName name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(submissions);
  } catch (error) {
    console.error('[submissionRoutes] GET /', error);
    return res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/submissions/:id
// Get a single submission
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const sub = await CandidateSubmission.findById(req.params.id)
      .populate('jobId', 'jobCode position clientName')
      .populate('candidateId', 'name candidateId')
      .populate('submittedBy', 'firstName lastName email')
      .lean();

    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    return res.json(sub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/submissions
// Create a single submission (used to add a submission to an existing candidate)
// Body: { candidateId, jobId, pipelineStage?, notes? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { candidateId, jobId, clientName, pipelineStage, status, notes } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({ message: 'candidateId and jobId are required' });
    }

    // Validate candidate exists
    const candidate = await Candidate.findById(candidateId).lean();
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // Validate job exists
    const job = await Job.findById(jobId).lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (clientName && normalizeName(clientName) !== normalizeName(job.clientName)) {
      return res.status(400).json({ message: 'Selected job does not belong to the selected client.' });
    }

    const tenantOwnerId = candidate.recruiterId || req.user._id;
    const nextStage = status || pipelineStage || 'Pipeline';

    // Check for duplicate
    const existing = await CandidateSubmission.findOne({ tenantOwnerId, candidateId, jobId }).lean();
    if (existing) {
      return res.status(409).json({
        message: 'Candidate already submitted to this job.',
        submissionId: existing._id,
      });
    }

    const submission = await CandidateSubmission.create({
      candidateId,
      tenantOwnerId,
      jobId,
      jobCode: job.jobCode,
      clientName: job.clientName,
      position: job.position,
      pipelineStage: nextStage,
      status: nextStage,
      submittedBy: req.user._id,
      submittedByName: resolveUserName(req.user),
      submittedAt: new Date(),
      notes: notes || '',
    });

    return res.status(201).json(submission);
  } catch (error) {
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Candidate already submitted to this job.' });
    }
    console.error('[submissionRoutes] POST /', error);
    return res.status(400).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/submissions/:id
// Update pipeline stage, status, or notes
// Body: { pipelineStage?, status?, notes? }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { pipelineStage, status, notes } = req.body;

    const updateData = {};
    if (pipelineStage && PIPELINE_STAGES.includes(pipelineStage)) {
      updateData.pipelineStage = pipelineStage;
      updateData.status = pipelineStage; // keep them in sync
    }
    if (status && PIPELINE_STAGES.includes(status)) {
      updateData.status = status;
      updateData.pipelineStage = status;
    }
    if (typeof notes === 'string') updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updated = await CandidateSubmission.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, lean: true }
    );

    if (!updated) return res.status(404).json({ message: 'Submission not found' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/submissions/:id
// Remove a submission record
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const sub = await CandidateSubmission.findByIdAndDelete(req.params.id).lean();
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    return res.json({ message: 'Submission removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
