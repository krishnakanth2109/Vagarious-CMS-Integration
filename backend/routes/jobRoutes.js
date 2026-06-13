import express from 'express';
import { getJobs, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import Job from '../models/Job.js';

const router = express.Router();

// ── PUBLIC ─────────────────────────────────────────────────────────────────────
// GET /api/jobs/public  — Fetch active jobs for the public-facing frontend website
// Returns only essential fields needed by the Candidates form / job listings
router.get('/public', async (req, res) => {
  try {
    const jobs = await Job.find({ active: true })
      .select('jobCode position clientName location experience skills noticePeriod')
      .sort({ createdAt: -1 })
      .lean();

    // Map internal field names to what the frontend expects
    const mapped = jobs.map(job => ({
      _id:        job._id,
      title:      job.position,
      company:    job.clientName,
      location:   job.location,
      experience: job.experience,
      skills:     job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      noticePeriod: job.noticePeriod,
      jobCode:    job.jobCode,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PROTECTED ──────────────────────────────────────────────────────────────────
router.use(protect);
router.route('/').get(getJobs).post(createJob);
router.route('/:id').put(updateJob).delete(deleteJob);

export default router;