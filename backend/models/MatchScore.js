import mongoose from 'mongoose';

const matchScoreSchema = new mongoose.Schema(
  {
    tenantOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateUpdatedAt: Date,
    requirementUpdatedAt: Date,
    source: { type: String, default: 'fallback' },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

matchScoreSchema.index(
  { tenantOwnerId: 1, candidateId: 1, requirementId: 1 },
  { name: 'match_score_candidate_requirement' }
);

const MatchScore = mongoose.models.MatchScore || mongoose.model('MatchScore', matchScoreSchema);

export default MatchScore;
