import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import VisitorsQRCampaign from '../models/VisitorsQRCampaign.js';
import VisitorsQRApplication from '../models/VisitorsQRApplication.js';
import Client from '../models/Client.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import CandidateSubmission from '../models/CandidateSubmission.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/; // flexible phone regex

const resolveUserName = (u) => {
  if (!u) return 'Unknown';
  const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return full || u.username || u.email || 'Unknown';
};

// ── Campaign APIs ─────────────────────────────────────────────────────────────

// Create Campaign (POST /api/visitors-qr/campaigns)
export const createCampaign = async (req, res) => {
  try {
    const { title, clientId, jobId, expiresAt } = req.body;

    if (!title || !clientId || !jobId || !expiresAt) {
      return res.status(400).json({ message: 'All fields (title, clientId, jobId, expiresAt) are required.' });
    }

    // Resolve tenant owner
    const tenantOwnerId = req.user._id;

    // Validate Client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    // Validate Job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex');

    // Create publicUrl
    const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
    const publicUrl = `${FRONTEND_URL}/apply/visitors-qr/${token}`;

    const campaign = await VisitorsQRCampaign.create({
      tenantOwnerId,
      title,
      token,
      publicUrl,
      clientId,
      clientName: client.companyName,
      jobId,
      jobTitle: job.position,
      jobCode: job.jobCode,
      expiresAt: new Date(expiresAt),
      createdBy: req.user._id,
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create Campaign Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Campaigns (GET /api/visitors-qr/campaigns)
export const getCampaigns = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.tenantOwnerId = req.user._id;
    }

    const campaigns = await VisitorsQRCampaign.find(query).sort({ createdAt: -1 }).lean();

    // Map counts of applications per campaign
    const campaignIds = campaigns.map(c => c._id);
    const counts = await VisitorsQRApplication.aggregate([
      { $match: { qrCampaignId: { $in: campaignIds } } },
      { $group: { _id: '$qrCampaignId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    campaigns.forEach(c => {
      c.applicationCount = countMap[c._id.toString()] || 0;
    });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Campaign By ID (GET /api/visitors-qr/campaigns/:id)
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await VisitorsQRCampaign.findById(req.params.id).lean();
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(campaign.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this campaign.' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Campaign (PATCH /api/visitors-qr/campaigns/:id)
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await VisitorsQRCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(campaign.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this campaign.' });
    }

    const { title, clientId, jobId, expiresAt, isActive } = req.body;

    if (title !== undefined) campaign.title = title;
    if (isActive !== undefined) campaign.isActive = isActive;
    if (expiresAt !== undefined) campaign.expiresAt = new Date(expiresAt);

    if (clientId !== undefined && String(clientId) !== String(campaign.clientId)) {
      const client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ message: 'Client not found.' });
      campaign.clientId = client._id;
      campaign.clientName = client.companyName;
    }

    if (jobId !== undefined && String(jobId) !== String(campaign.jobId)) {
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found.' });
      campaign.jobId = job._id;
      campaign.jobTitle = job.position;
      campaign.jobCode = job.jobCode;
    }

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Campaign (DELETE /api/visitors-qr/campaigns/:id)
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await VisitorsQRCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(campaign.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this campaign.' });
    }

    // Optional: Delete associated applications as well, or keep them. Let's delete the campaign.
    await VisitorsQRCampaign.findByIdAndDelete(req.params.id);

    res.json({ message: 'Campaign deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Application APIs ──────────────────────────────────────────────────────────

// Get Applications (GET /api/visitors-qr/applications)
export const getApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.tenantOwnerId = req.user._id;
    }

    // Filters
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    if (req.query.clientId) {
      query.clientId = req.query.clientId;
    }

    if (req.query.jobId) {
      query.jobId = req.query.jobId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      query.submittedAt = { $gte: start, $lte: end };
    }

    const totalDocs = await VisitorsQRApplication.countDocuments(query);
    const docs = await VisitorsQRApplication.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalDocs / limit);

    // Self-healing: Sync application states with the Candidate database collection
    for (const app of docs) {
      // 1. Reset if the candidate we converted this to was deleted
      if (app.status === 'Converted' && app.convertedCandidateId) {
        const candidateExists = await Candidate.exists({ _id: app.convertedCandidateId });
        if (!candidateExists) {
          const existingCand = await Candidate.findOne({
            $or: [{ email: app.email }, { contact: app.phone }]
          });

          await VisitorsQRApplication.updateOne(
            { _id: app._id },
            {
              $set: {
                status: existingCand ? 'Duplicate' : 'New',
                duplicateStatus: existingCand ? 'Duplicate' : 'Unique',
                convertedCandidateId: null
              }
            }
          );

          app.status = existingCand ? 'Duplicate' : 'New';
          app.duplicateStatus = existingCand ? 'Duplicate' : 'Unique';
          app.convertedCandidateId = null;
        }
      }

      // 2. Reset if flagged as duplicate but matching candidate has been deleted
      if (app.status === 'Duplicate' || app.duplicateStatus === 'Duplicate') {
        const candidateExists = await Candidate.exists({
          $or: [
            { email: app.email },
            { contact: app.phone }
          ]
        });

        if (!candidateExists) {
          await VisitorsQRApplication.updateOne(
            { _id: app._id },
            {
              $set: {
                status: 'New',
                duplicateStatus: 'Unique'
              }
            }
          );

          app.status = 'New';
          app.duplicateStatus = 'Unique';
        }
      }
    }

    res.json({
      docs,
      totalDocs,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Application By ID (GET /api/visitors-qr/applications/:id)
export const getApplicationById = async (req, res) => {
  try {
    const application = await VisitorsQRApplication.findById(req.params.id).lean();
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(application.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this application.' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Application Status (PATCH /api/visitors-qr/applications/:id/status)
export const updateApplicationStatus = async (req, res) => {
  try {
    const application = await VisitorsQRApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(application.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this application.' });
    }

    const { status } = req.body;
    if (!status || !['New', 'Duplicate', 'Converted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Application (DELETE /api/visitors-qr/applications/:id)
export const deleteApplication = async (req, res) => {
  try {
    const application = await VisitorsQRApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(application.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this application.' });
    }

    // Delete file from Cloudinary first
    if (application.resume && application.resume.publicId) {
      try {
        await cloudinary.uploader.destroy(application.resume.publicId, { resource_type: 'raw' });
      } catch (err) {
        console.error('Failed to destroy Cloudinary file:', err.message);
      }
    }
    if (application.photoCopy && application.photoCopy.publicId) {
      try {
        await cloudinary.uploader.destroy(application.photoCopy.publicId, { resource_type: 'image' });
      } catch (err) {
        console.error('Failed to destroy photocopy file from Cloudinary:', err.message);
      }
    }

    // Delete associated Candidate from Candidates collection if converted
    if (application.status === 'Converted' && application.convertedCandidateId) {
      try {
        await Candidate.findByIdAndDelete(application.convertedCandidateId);
      } catch (err) {
        console.error('Failed to delete associated Candidate:', err.message);
      }
    }

    await VisitorsQRApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Convert Application to Candidate (POST /api/visitors-qr/applications/:id/convert)
export const convertApplicationToCandidate = async (req, res) => {
  try {
    const application = await VisitorsQRApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Tenant check
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(application.tenantOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to this application.' });
    }

    // Check if already converted
    if (application.status === 'Converted' || application.convertedCandidateId) {
      return res.status(400).json({ message: 'Application has already been converted to a candidate.' });
    }

    const { force } = req.body;

    // Check if candidate with same email/phone already exists in Candidates
    const existingCandidate = await Candidate.findOne({
      $or: [
        { email: application.email },
        { contact: application.phone }
      ]
    }).lean();

    if (existingCandidate && !force) {
      return res.status(400).json({
        warning: 'duplicate_candidate',
        message: 'A candidate with the same email or phone number already exists.',
        candidate: {
          _id: existingCandidate._id,
          name: existingCandidate.name,
          email: existingCandidate.email,
          contact: existingCandidate.contact,
        }
      });
    }

    // Resolve Names
    const names = application.fullName.trim().split(/\s+/);
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '.';

    // Create Candidate using Candidate schema
    const candidateData = {
      firstName,
      lastName,
      name: application.fullName,
      email: application.email,
      contact: application.phone,
      currentLocation: application.currentLocation || '',
      education: application.qualification || '',
      totalExperience: application.experience || '',
      skills: application.skills || [],
      ctc: application.expectedSalary || '',
      noticePeriod: application.noticePeriod || '',
      resumeUrl: application.resume.url,
      resumeOriginalName: application.resume.fileName || 'Resume.pdf',
      source: 'Visitors QR',
      recruiterId: req.user._id,
      recruiterName: resolveUserName(req.user),
      client: application.clientName,
      position: application.jobTitle,
      status: ['Submitted'],
    };

    const newCandidate = new Candidate(candidateData);
    await newCandidate.save();

    // Verify Job exists and link
    const job = await Job.findById(application.jobId).lean();
    if (job) {
      // Create CandidateSubmission
      await CandidateSubmission.create({
        candidateId: newCandidate._id,
        tenantOwnerId: req.user._id,
        jobId: application.jobId,
        jobCode: job.jobCode,
        clientName: job.clientName,
        position: job.position,
        pipelineStage: 'Pipeline',
        status: 'Pipeline',
        submittedBy: req.user._id,
        submittedByName: resolveUserName(req.user),
        submittedAt: new Date(),
        notes: application.message || '',
      });
    }

    // Update Application status
    application.status = 'Converted';
    application.convertedCandidateId = newCandidate._id;
    await application.save();

    res.json({
      message: 'Application successfully converted to candidate.',
      candidateId: newCandidate._id,
    });
  } catch (error) {
    console.error('Convert Application Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Public APIs ───────────────────────────────────────────────────────────────

// Get Public Campaign Details (GET /api/public/visitors-qr/:token)
export const getPublicCampaign = async (req, res) => {
  try {
    const { token } = req.params;

    let campaign = await VisitorsQRCampaign.findOne({ token });
    if (campaign && token === 'default') {
      const job = await Job.findById(campaign.jobId).lean();
      if (!job || !job.active) {
        await VisitorsQRCampaign.deleteOne({ _id: campaign._id });
        campaign = null;
      }
    }
    if (!campaign && token === 'default') {
      // Dynamically create default campaign
      const client = await Client.findOne({ active: true });
      const job = await Job.findOne({ active: true });
      if (!client || !job) {
        return res.status(404).json({ message: 'No active clients or jobs configured to set up default campaign.' });
      }
      const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
      campaign = await VisitorsQRCampaign.create({
        tenantOwnerId: job.createdBy || client._id,
        title: 'Default Visitor Registration',
        token: 'default',
        publicUrl: `${FRONTEND_URL}/apply/visitors-qr/default`,
        clientId: client._id,
        clientName: client.companyName,
        jobId: job._id,
        jobTitle: job.position,
        jobCode: job.jobCode,
        expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
        createdBy: job.createdBy || client._id,
      });
    }

    if (!campaign || (!campaign.isActive && token !== 'default')) {
      return res.status(404).json({ message: 'Campaign not found or is inactive.' });
    }

    // Check expiry
    if (new Date() > new Date(campaign.expiresAt)) {
      return res.status(400).json({ message: 'This application campaign link has expired.' });
    }

    // Fetch Job to get safe details
    const job = await Job.findById(campaign.jobId).lean();
    if (!job || !job.active) {
      return res.status(404).json({ message: 'Associated job is no longer active.' });
    }

    // Return safe data only
    res.json({
      title: campaign.title,
      clientName: campaign.clientName,
      jobTitle: campaign.jobTitle,
      location: job.location,
      jobType: job.jobType,
      experience: job.experience,
      skills: job.skills,
      description: job.jobDescription,
      expiresAt: campaign.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Public Application (POST /api/public/visitors-qr/:token/apply)
export const submitPublicApplication = async (req, res) => {
  try {
    const { token } = req.params;

    // Validate campaign exists, is active, is not expired
    let campaign = await VisitorsQRCampaign.findOne({ token });
    if (campaign && token === 'default') {
      const job = await Job.findById(campaign.jobId).lean();
      if (!job || !job.active) {
        await VisitorsQRCampaign.deleteOne({ _id: campaign._id });
        campaign = null;
      }
    }
    if (!campaign && token === 'default') {
      // Dynamically create default campaign
      const client = await Client.findOne({ active: true });
      const job = await Job.findOne({ active: true });
      if (!client || !job) {
        return res.status(404).json({ message: 'No active clients or jobs configured to set up default campaign.' });
      }
      const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
      campaign = await VisitorsQRCampaign.create({
        tenantOwnerId: job.createdBy || client._id,
        title: 'Default Visitor Registration',
        token: 'default',
        publicUrl: `${FRONTEND_URL}/apply/visitors-qr/default`,
        clientId: client._id,
        clientName: client.companyName,
        jobId: job._id,
        jobTitle: job.position,
        jobCode: job.jobCode,
        expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
        createdBy: job.createdBy || client._id,
      });
    }

    if (!campaign || (!campaign.isActive && token !== 'default')) {
      return res.status(404).json({ message: 'Campaign not found or is inactive.' });
    }

    if (new Date() > new Date(campaign.expiresAt)) {
      return res.status(400).json({ message: 'This campaign link has expired.' });
    }

    const {
      fullName,
      email,
      phone,
      qualification,
      yearOfPassOut,
      reference,
      position,
      purpose,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !qualification || !reference || !position) {
      return res.status(400).json({ message: 'Required fields are missing: Full name, Email, Contact, Qualification, Reference, and Position are required.' });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number.' });
    }

    const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
    const photoFile = req.files && req.files['photoCopy'] ? req.files['photoCopy'][0] : null;

    if (!resumeFile) {
      return res.status(400).json({ message: 'Resume file is required.' });
    }

    // Cloudinary upload helper
    const uploadToCloudinary = (file, folder) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
          },
          (error, response) => {
            if (error) return reject(error);
            resolve(response);
          }
        );
        uploadStream.end(file.buffer);
      });
    };

    // Upload resume to Cloudinary (required)
    const resumeResult = await uploadToCloudinary(resumeFile, 'vts/visitors-qr/resumes');

    // Upload photoCopy to Cloudinary (optional)
    let photoResult = null;
    if (photoFile) {
      photoResult = await uploadToCloudinary(photoFile, 'vts/visitors-qr/photos');
    }

    // Check duplicate applications (same campaign AND same email/phone)
    const existingApp = await VisitorsQRApplication.findOne({
      qrCampaignId: campaign._id,
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    // Check duplicate Candidates (same email or phone in Candidate)
    const existingCand = await Candidate.findOne({
      $or: [{ email: email.toLowerCase() }, { contact: phone }]
    });

    const isDuplicate = !!(existingApp || existingCand);
    const duplicateStatus = isDuplicate ? 'Duplicate' : 'Unique';
    const status = isDuplicate ? 'Duplicate' : 'New';

    const application = await VisitorsQRApplication.create({
      tenantOwnerId: campaign.tenantOwnerId,
      qrCampaignId: campaign._id,
      token,
      clientId: campaign.clientId,
      clientName: campaign.clientName,
      jobId: campaign.jobId,
      jobTitle: campaign.jobTitle,
      fullName,
      email: email.toLowerCase(),
      phone,
      qualification,
      yearOfPassOut,
      reference,
      position,
      purpose,
      photoCopy: photoResult ? {
        url: photoResult.secure_url,
        publicId: photoResult.public_id,
        fileName: photoFile.originalname,
        mimeType: photoFile.mimetype,
        size: photoFile.size,
      } : undefined,
      resume: {
        url: resumeResult.secure_url,
        publicId: resumeResult.public_id,
        fileName: resumeFile.originalname,
        mimeType: resumeFile.mimetype,
        size: resumeFile.size,
      },
      source: 'Visitors QR',
      status,
      duplicateStatus,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Our recruitment team will contact you soon.',
      duplicate: isDuplicate,
    });
  } catch (error) {
    console.error('Submit Public Application Error:', error);
    res.status(500).json({ message: 'Unable to upload files or submit application. Please try again.' });
  }
};
