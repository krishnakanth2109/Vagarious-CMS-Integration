import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import { processMatchingCandidates } from '../services/groqMatchingService.js';

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

    const matchResult = await processMatchingCandidates(candidates, requirement, req.user);
    const scores = matchResult.candidates;

    return res.json({
      requirementId,
      success: true,
      totalEvaluated: matchResult.totalEvaluated,
      locallyRejected: matchResult.locallyRejected,
      aiScored: matchResult.aiScored,
      cached: matchResult.cached,
      failed: matchResult.failed,
      candidates: scores,
      scores
    });
  } catch (err) {
    console.error('[scoreMatch] bulk score failed:', err);
    return res.status(500).json({ message: err.message });
  }
};
