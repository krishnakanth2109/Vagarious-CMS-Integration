import mongoose from 'mongoose';

const PIPELINE_STAGES = [
  'Pipeline',
  'Submitted',
  'Shared Profiles',
  'Yet to attend',
  'Turnups',
  'Selected',
  'Rejected',
  'Hold',
  'Joined',
  'Backout',
];

const candidateSubmissionSchema = new mongoose.Schema(
  {
    // ── Who ────────────────────────────────────────────────────────────────────
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    tenantOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Which Job / Client ─────────────────────────────────────────────────────
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobCode: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },   // job position title

    // ── Pipeline ───────────────────────────────────────────────────────────────
    pipelineStage: {
      type: String,
      enum: PIPELINE_STAGES,
      default: 'Pipeline',
    },
    status: {
      type: String,
      enum: PIPELINE_STAGES,
      default: 'Pipeline',
    },

    // ── Meta ───────────────────────────────────────────────────────────────────
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedByName: { type: String, default: '' },
    submittedAt: { type: Date, default: () => new Date() },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// ── Uniqueness: one candidate cannot be submitted to the same job twice ────────
candidateSubmissionSchema.index(
  { tenantOwnerId: 1, candidateId: 1, jobId: 1 },
  { unique: true, name: 'unique_tenant_candidate_job' }
);

// ── Other useful indexes ───────────────────────────────────────────────────────
candidateSubmissionSchema.index({ candidateId: 1 });
candidateSubmissionSchema.index({ jobId: 1 });
candidateSubmissionSchema.index({ submittedBy: 1 });
candidateSubmissionSchema.index({ clientName: 1 });
candidateSubmissionSchema.index({ pipelineStage: 1 });
candidateSubmissionSchema.index({ createdAt: -1 });

const CandidateSubmission =
  mongoose.models.CandidateSubmission ||
  mongoose.model('CandidateSubmission', candidateSubmissionSchema);

export { PIPELINE_STAGES };
export default CandidateSubmission;
