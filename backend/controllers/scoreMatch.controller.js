import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import MatchScore from '../models/MatchScore.js';
import { buildFallbackMatchResult } from '../services/matchingService.js';

export const scoreMatchesForRequirement = async (req, res) => {
  try {
    const { candidateIds = [], requirementId } = req.body;

    if (!requirementId) {
      return res.status(400).json({ message: 'requirementId is required' });
    }

    const requirement = await Job.findById(requirementId).lean();
    if (!requirement) {
      return res.status(404).json({ message: 'Job requirement not found' });
    }

    const ids = Array.isArray(candidateIds) ? candidateIds.filter(Boolean) : [];
    if (!ids.length) {
      return res.json({ requirementId, scores: [] });
    }

    const query = { _id: { $in: ids } };
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.recruiterId = req.user._id;
    }

    const candidates = await Candidate.find(query).lean();
    const tenantOwnerId = requirement.createdBy || req.user?._id;

    const scores = candidates.map((candidate) => {
      const score = buildFallbackMatchResult(candidate, requirement);
      return {
        candidateId: candidate._id,
        ...score,
      };
    });

    scores.sort((a, b) => b.matchPercentage - a.matchPercentage);

    await Promise.all(scores.map((score) => MatchScore.findOneAndUpdate(
      {
        tenantOwnerId,
        candidateId: score.candidateId,
        requirementId: requirement._id,
      },
      {
        tenantOwnerId,
        candidateId: score.candidateId,
        requirementId: requirement._id,
        candidateUpdatedAt: candidates.find((candidate) => String(candidate._id) === String(score.candidateId))?.updatedAt,
        requirementUpdatedAt: requirement.updatedAt,
        source: score.source,
        result: score,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )));

    return res.json({ requirementId, scores });
  } catch (err) {
    console.error('[scoreMatch] bulk score failed:', err);
    return res.status(500).json({ message: err.message });
  }
};
