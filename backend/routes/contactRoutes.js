import express from 'express';
import Contact from '../models/Contact.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact form inquiry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact inquiry submitted successfully.' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server Error. Could not submit contact form.' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact inquiries
// @access  Private (Admin/Manager)
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    res.status(500).json({ message: 'Server Error. Could not fetch contact inquiries.' });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact inquiry
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found.' });
    }
    res.status(200).json({ message: 'Contact inquiry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting contact inquiry:', error);
    res.status(500).json({ message: 'Server Error. Could not delete contact inquiry.' });
  }
});

// @route   PATCH /api/contact/:id
// @desc    Update contact inquiry status
// @access  Private (Admin/Manager)
router.patch('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found.' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error updating contact inquiry:', error);
    res.status(500).json({ message: 'Server Error. Could not update contact inquiry.' });
  }
});

export default router;
