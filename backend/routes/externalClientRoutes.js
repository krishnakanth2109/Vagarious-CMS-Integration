import express from 'express';
import asyncHandler from 'express-async-handler';
import ExternalClient from '../models/ExternalClient.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoint: receive employer requirement submissions directly from Vagarious frontend.
router.post('/', asyncHandler(async (req, res) => {
  const {
    companyName,
    contactPerson,
    email,
    phone,
    positions,
    location,
    requirements,
    source,
  } = req.body;

  if (!companyName || !contactPerson || !email || !phone || !requirements) {
    return res.status(400).json({ message: 'Company name, contact person, email, phone and requirements are required' });
  }

  const client = new ExternalClient({
    companyName,
    contactPerson,
    email,
    phone,
    positions,
    location,
    requirements,
    source: source || 'Vagarious',
  });

  const savedClient = await client.save();

  res.status(201).json({
    success: true,
    message: 'Requirement submitted successfully',
    data: savedClient,
  });
}));

// Protected: list external clients for admin/manager review.
router.get('/', protect, asyncHandler(async (_req, res) => {
  const list = await ExternalClient.find({}).sort({ createdAt: -1 }).lean();
  res.json(list);
}));

// Protected: update external client (status etc.)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const client = await ExternalClient.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'External client not found' });

  const updated = await ExternalClient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
}));

// Protected: delete external client
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const client = await ExternalClient.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'External client not found' });

  await client.deleteOne();
  res.json({ message: 'External client removed' });
}));

export default router;
