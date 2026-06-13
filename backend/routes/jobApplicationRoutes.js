import express from 'express';
import {
  createJobApplication,
  getJobApplications,
  getJobApplicationById,
  updateApplicationStatus,
  deleteJobApplication,
  promoteToCandidate,
} from '../controllers/jobApplicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── PUBLIC ─────────────────────────────────────────────────────────────────────
// POST /api/job-applications  — Submit application from frontend website (no login)
router.post('/', createJobApplication);

// ── PROTECTED ──────────────────────────────────────────────────────────────────
// GET /api/job-applications   — View all submissions (admin, manager, recruiter)
router.get('/', protect, getJobApplications);

// GET /api/job-applications/:id
router.get('/:id', protect, getJobApplicationById);

// POST /api/job-applications/:id/promote  — Promote to Candidate DB (admin, manager)
// ⚠️ Must be BEFORE /:id/status so Express doesn't treat "promote" as a status value
router.post('/:id/promote', protect, authorize('admin', 'manager'), promoteToCandidate);

// PATCH /api/job-applications/:id/status  — Update status & notes (admin, manager)
router.patch('/:id/status', protect, authorize('admin', 'manager'), updateApplicationStatus);

// DELETE /api/job-applications/:id  (admin only)
router.delete('/:id', protect, authorize('admin'), deleteJobApplication);

export default router;
