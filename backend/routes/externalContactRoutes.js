import express from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import ExternalContact from '../models/ExternalContact.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const IMPORT_TYPES = new Set(['external_contacts', 'external_clients']);

const normalizeImportType = (value) => {
  if (!value) return 'external_contacts';
  const normalized = String(value).trim().toLowerCase();
  return IMPORT_TYPES.has(normalized) ? normalized : null;
};

// Public endpoint: receive contact submissions directly from Vagarious frontend.
router.post('/', asyncHandler(async (req, res) => {
  console.log('[ExternalContacts][POST] Received submission', {
    hasName: Boolean(req.body?.name),
    hasEmail: Boolean(req.body?.email),
    hasPhone: Boolean(req.body?.phone),
    hasSubject: Boolean(req.body?.subject),
    hasMessage: Boolean(req.body?.message),
    source: req.body?.source,
    importType: req.body?.importType,
    dbName: mongoose.connection.db?.databaseName,
    readyState: mongoose.connection.readyState,
    collection: ExternalContact.collection?.name,
  });

  const {
    name,
    email,
    phone,
    subject,
    message,
    source,
    importType,
  } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Name, email, subject and message are required' });
  }

  const normalizedImportType = normalizeImportType(importType);
  if (!normalizedImportType) {
    return res.status(400).json({ message: 'Invalid import type' });
  }

  const contact = new ExternalContact({
    name,
    email,
    phone,
    subject,
    message,
    source: source || 'Vagarious',
    importType: normalizedImportType,
  });

  try {
    const savedContact = await contact.save();
    console.log('[ExternalContacts][POST] Saved contact', {
      id: savedContact._id?.toString(),
      dbName: mongoose.connection.db?.databaseName,
      collection: ExternalContact.collection?.name,
      createdAt: savedContact.createdAt,
    });
    res.status(201).json(savedContact);
  } catch (error) {
    console.error('[ExternalContacts][POST] Mongo save failed', {
      message: error.message,
      name: error.name,
      code: error.code,
      dbName: mongoose.connection.db?.databaseName,
      collection: ExternalContact.collection?.name,
    });
    throw error;
  }
}));

// Protected: list external contacts for admin/manager review.
router.get('/', protect, asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.importType) {
    const normalizedImportType = normalizeImportType(req.query.importType);
    if (!normalizedImportType) {
      return res.status(400).json({ message: 'Invalid import type' });
    }

    query.importType = normalizedImportType === 'external_contacts'
      ? { $in: ['external_contacts', null] }
      : normalizedImportType;
  }

  const list = await ExternalContact.find(query).sort({ createdAt: -1 }).lean();
  console.log('[ExternalContacts][GET] Loaded contacts', {
    count: list.length,
    query,
    dbName: mongoose.connection.db?.databaseName,
    readyState: mongoose.connection.readyState,
    collection: ExternalContact.collection?.name,
  });
  res.json(list);
}));

// Protected: delete external contact
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const contact = await ExternalContact.findById(req.params.id);
  if (!contact) return res.status(404).json({ message: 'External contact not found' });

  await contact.deleteOne();
  res.json({ message: 'External contact removed' });
}));

export default router;
