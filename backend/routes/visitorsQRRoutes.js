import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  convertApplicationToCandidate,
  getPublicCampaign,
  submitPublicApplication,
} from '../controllers/visitorsQRController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Public routes (no auth needed, token checks performed by controller)
router.get('/public/visitors-qr/:token', getPublicCampaign);
router.post('/public/visitors-qr/:token/apply', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photoCopy', maxCount: 1 }
]), submitPublicApplication);

// Protected routes (JWT authentication & Tenant ownership validation)
router.post('/visitors-qr/campaigns', protect, createCampaign);
router.get('/visitors-qr/campaigns', protect, getCampaigns);
router.get('/visitors-qr/campaigns/:id', protect, getCampaignById);
router.patch('/visitors-qr/campaigns/:id', protect, updateCampaign);
router.delete('/visitors-qr/campaigns/:id', protect, deleteCampaign);

router.get('/visitors-qr/applications', protect, getApplications);
router.get('/visitors-qr/applications/:id', protect, getApplicationById);
router.patch('/visitors-qr/applications/:id/status', protect, updateApplicationStatus);
router.delete('/visitors-qr/applications/:id', protect, deleteApplication);
router.post('/visitors-qr/applications/:id/convert', protect, convertApplicationToCandidate);

export default router;
