import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    // ── Personal Info ──────────────────────────────────────────────────────────
    name:              { type: String, required: true, trim: true },
    email:             { type: String, required: true, trim: true, lowercase: true },
    phone:             { type: String, required: true, trim: true },

    // ── Professional Info ──────────────────────────────────────────────────────
    experience:        { type: String, required: true, trim: true },
    currentCompany:    { type: String, trim: true, default: '' },
    currentRole:       { type: String, trim: true, default: '' },
    skills:            { type: String, required: true, trim: true },

    // ── Job Details (from the frontend form) ──────────────────────────────────
    appliedJob:        { type: String, required: true, trim: true },   // Job title or "General Application"
    appliedCompany:    { type: String, trim: true, default: '' },       // Company name the job belongs to
    // Optional: also store the MongoDB Job reference if found
    jobRef:            { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },

    // ── Preferences ───────────────────────────────────────────────────────────
    preferredLocation: { type: String, required: true, trim: true },
    noticePeriod:      { type: String, trim: true, default: '' },

    // ── Additional ────────────────────────────────────────────────────────────
    message:           { type: String, trim: true, default: '' },

    // ── Status (for CMS tracking) ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
      default: 'New',
    },

    // ── Admin Notes ───────────────────────────────────────────────────────────
    adminNotes:        { type: String, default: '' },

    // ── Promotion tracking ────────────────────────────────────────────────────
    // Set when this application has been promoted to the Candidate DB
    promotedCandidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedJob: 1 });

const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
