import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/job-applications   (PUBLIC — no auth required)
// Called by the frontend Candidates form
// ─────────────────────────────────────────────────────────────────────────────
export const createJobApplication = async (req, res) => {
  try {
    const {
      name, email, phone, experience,
      currentCompany, currentRole,
      appliedJob, appliedCompany,
      skills, preferredLocation, noticePeriod, message,
    } = req.body;

    // Basic required field check (frontend validates too, but double-check)
    if (!name || !email || !phone || !experience || !skills || !preferredLocation || !appliedJob) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Optionally resolve a Job document reference by matching position + clientName
    let jobRef = null;
    if (appliedJob && appliedJob !== 'General Application') {
      const escapedJob = appliedJob.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedCompany = appliedCompany ? appliedCompany.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
      const matchedJob = await Job.findOne({
        position: { $regex: new RegExp(`^${escapedJob}$`, 'i') },
        ...(appliedCompany ? { clientName: { $regex: new RegExp(`^${escapedCompany}$`, 'i') } } : {}),
      }).select('_id').lean();
      if (matchedJob) jobRef = matchedJob._id;
    }

    const application = await JobApplication.create({
      name,
      email,
      phone,
      experience,
      currentCompany: currentCompany || '',
      currentRole:    currentRole    || '',
      appliedJob,
      appliedCompany: appliedCompany || '',
      jobRef,
      skills,
      preferredLocation,
      noticePeriod: noticePeriod || '',
      message:      message      || '',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data:    application,
    });
  } catch (error) {
    console.error('[JobApplication] createJobApplication error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/job-applications   (PROTECTED — admin / manager / recruiter)
// Returns all applications with optional filters
// ─────────────────────────────────────────────────────────────────────────────
export const getJobApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name:         regex },
        { email:        regex },
        { appliedJob:   regex },
        { appliedCompany: regex },
        { skills:       regex },
      ];
    }

    const total        = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate({ path: 'promotedCandidateId', select: '_id' })
      .lean();

    res.json({
      total,
      page:         Number(page),
      totalPages:   Math.ceil(total / limit),
      applications,
    });
  } catch (error) {
    console.error('[JobApplication] getJobApplications error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/job-applications/:id   (PROTECTED)
// ─────────────────────────────────────────────────────────────────────────────
export const getJobApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('jobRef', 'jobCode position clientName location')
      .lean();
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/job-applications/:id/status   (PROTECTED — admin / manager)
// ─────────────────────────────────────────────────────────────────────────────
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = {};
    if (status)     update.status     = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const updated = await JobApplication.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Application not found.' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/job-applications/:id   (PROTECTED — admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteJobApplication = async (req, res) => {
  try {
    const deleted = await JobApplication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Application not found.' });
    res.json({ message: 'Application deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/job-applications/:id/promote   (PROTECTED — admin / manager)
// Converts a JobApplication into a full Candidate record in the Candidate DB.
// ─────────────────────────────────────────────────────────────────────────────
export const promoteToCandidate = async (req, res) => {
  try {
    console.log('[promote] Starting promotion for application:', req.params.id);
    console.log('[promote] Acting user:', req.user?._id, 'role:', req.user?.role);

    const application = await JobApplication.findById(req.params.id).lean();
    if (!application) {
      console.log('[promote] Application not found');
      return res.status(404).json({ message: 'Application not found.' });
    }

    console.log('[promote] Application found:', application.name, application.email);

    // ── Guard: already promoted? ─────────────────────────────────────────────
    if (application.promotedCandidateId) {
      const candidateExists = await Candidate.exists({ _id: application.promotedCandidateId });
      if (candidateExists) {
        return res.status(409).json({
          message: 'This application has already been promoted to a Candidate.',
          candidateId: application.promotedCandidateId,
        });
      } else {
        await JobApplication.findByIdAndUpdate(req.params.id, { promotedCandidateId: null });
        application.promotedCandidateId = null;
      }
    }

    // ── Duplicate email guard ─────────────────────────────────────────────────
    const emailExists = await Candidate.findOne({ email: application.email.toLowerCase() })
      .select('candidateId name').lean();
    if (emailExists) {
      return res.status(409).json({
        message: `A candidate with this email already exists (${emailExists.candidateId || emailExists._id}).`,
        existingId: emailExists.candidateId || emailExists._id,
      });
    }

    // ── Duplicate phone guard ─────────────────────────────────────────────────
    const phoneExists = await Candidate.findOne({ contact: application.phone })
      .select('candidateId name').lean();
    if (phoneExists) {
      return res.status(409).json({
        message: `A candidate with this phone already exists (${phoneExists.candidateId || phoneExists._id}).`,
        existingId: phoneExists.candidateId || phoneExists._id,
      });
    }

    // ── Split name into firstName / lastName ──────────────────────────────────
    const nameParts = (application.name || '').trim().split(/\s+/);
    const firstName = nameParts[0]  || 'Unknown';
    const lastName  = nameParts.slice(1).join(' ') || 'N/A';

    // ── Skills: string → array ────────────────────────────────────────────────
    const skillsArray = application.skills
      ? application.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // ── Recruiter: use current logged-in user ─────────────────────────────────
    const recruiterId   = req.user._id;
    const recruiterName = [req.user.firstName, req.user.lastName].filter(Boolean).join(' ')
                        || req.user.username || req.user.email || 'Unknown';

    console.log('[promote] Building candidate payload...');

    // ── Build Candidate payload ───────────────────────────────────────────────
    // NOTE: do NOT set status — let the model default handle it (['Submitted'])
    // NOTE: source has no enum restriction, 'Website' is valid
    const candidatePayload = {
      firstName,
      lastName,
      email:             application.email,
      contact:           application.phone,
      currentCompany:    application.currentCompany || '',
      position:          application.appliedJob     || '',
      client:            application.appliedCompany || '',
      totalExperience:   application.experience     || '',
      skills:            skillsArray,
      preferredLocation: application.preferredLocation || '',
      noticePeriod:      application.noticePeriod   || '',
      remarks:           application.message        || '',
      source:            'Website',
      recruiterId,
      recruiterName,
    };

    console.log('[promote] Saving candidate...');
    const newCandidate = new Candidate(candidatePayload);
    await newCandidate.save(); // triggers pre-save hook → generates candidateId

    console.log('[promote] Candidate saved:', newCandidate.candidateId);

    // ── Update JobApplication: mark as promoted ───────────────────────────────
    const updatedApp = await JobApplication.findByIdAndUpdate(
      req.params.id,
      {
        status:              'Shortlisted',
        promotedCandidateId: newCandidate._id,
        adminNotes:          `Promoted to Candidate ${newCandidate.candidateId} on ${new Date().toLocaleDateString('en-IN')}.`,
      },
      { new: true }
    ).lean();

    console.log('[promote] JobApplication updated successfully');

    res.status(201).json({
      message:   `Successfully promoted to Candidate ${newCandidate.candidateId}.`,
      candidate: {
        _id:         newCandidate._id,
        candidateId: newCandidate.candidateId,
        name:        newCandidate.name,
      },
      application: updatedApp,
    });
  } catch (error) {
    // Log full error to server console so it's visible in backend terminal
    console.error('[promote] FULL ERROR:', error);
    // Send the real error message back so the frontend can display it
    res.status(500).json({
      message: error.message || 'Internal server error during promotion.',
      details: error.errors
        ? Object.values(error.errors).map(e => e.message).join('; ')
        : undefined,
    });
  }
};
