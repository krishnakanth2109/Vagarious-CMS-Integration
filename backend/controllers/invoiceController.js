import { v2 as cloudinary } from 'cloudinary';
import Invoice from '../models/Invoice.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Helper to determine Cloudinary resource type
const getCloudinaryResourceType = (mimeType = '') => {
  if (mimeType === 'application/pdf') return 'image'; // Standard Cloudinary PDF support
  return 'raw';
};

// Create and Save Invoice
export const createInvoice = async (req, res) => {
  try {
    const tenantOwnerId = req.user._id;
    const generatedBy = req.user._id;

    // Parse metadata
    let metadata;
    try {
      metadata = typeof req.body.metadata === 'string' ? JSON.parse(req.body.metadata) : req.body.metadata;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid metadata payload.' });
    }

    if (!metadata || !metadata.invoiceNumber) {
      return res.status(400).json({ message: 'Invoice number is required.' });
    }

    // Check for duplicate invoice number per tenant
    const existing = await Invoice.findOne({ tenantOwnerId, invoiceNumber: metadata.invoiceNumber });
    if (existing) {
      return res.status(400).json({ message: 'This invoice number already exists.' });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'Invoice file is required.' });
    }

    const mimeType = req.file.mimetype;
    const size = req.file.size;

    if (mimeType !== 'application/pdf') {
      return res.status(400).json({ message: 'Invalid file type. Only PDF is supported.' });
    }

    // Upload to Cloudinary
    const resourceType = getCloudinaryResourceType(mimeType);
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vts/invoices',
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          filename_override: `Invoice_${metadata.invoiceNumber}`,
        },
        (error, response) => {
          if (error) return reject(error);
          resolve(response);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Construct invoice document
    const invoiceData = {
      tenantOwnerId,
      invoiceNumber: metadata.invoiceNumber,
      invoiceDate: metadata.invoiceDate,
      clientId: metadata.clientId,
      clientName: metadata.clientName,
      candidates: metadata.candidates || [],
      candidateCount: metadata.candidateCount || 0,
      subtotal: metadata.subtotal || 0,
      cgstPercentage: metadata.cgstPercentage || 0,
      cgstAmount: metadata.cgstAmount || 0,
      sgstPercentage: metadata.sgstPercentage || 0,
      sgstAmount: metadata.sgstAmount || 0,
      grandTotal: metadata.grandTotal || 0,
      accountType: metadata.accountType || 'no',
      accountDetails: metadata.accountDetails || {},
      file: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileName: `Invoice_${metadata.invoiceNumber}.pdf`,
        mimeType,
        size,
      },
      format: metadata.format || 'pdf',
      generatedBy,
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ message: error.message || 'Invoice file could not be saved.' });
  }
};

// Get Invoices with Pagination and Filters
export const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, clientId, startDate, endDate } = req.query;

    const query = {};

    // Tenant & Role restrictions
    if (req.user.role === 'recruiter') {
      query.generatedBy = req.user._id;
    } else {
      query.tenantOwnerId = req.user._id;
    }

    // Filter by Client
    if (clientId) {
      query.clientId = clientId;
    }

    // Filter by Date Range
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    // Filter by Search Query
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { invoiceNumber: searchRegex },
        { clientName: searchRegex },
        { 'candidates.name': searchRegex },
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .select('invoiceNumber file clientName invoiceDate grandTotal candidateCount candidates generatedBy createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ message: error.message || 'Unable to load invoice history.' });
  }
};

// Get Single Invoice Details
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).lean();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // Security validation: check role and ownership
    if (req.user.role === 'recruiter') {
      if (String(invoice.generatedBy) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden. You do not own this invoice.' });
      }
    } else {
      if (String(invoice.tenantOwnerId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden. This invoice belongs to another tenant.' });
      }
    }

    res.json(invoice);
  } catch (error) {
    console.error('Fetch single invoice error:', error);
    res.status(500).json({ message: error.message || 'Unable to load the saved invoice.' });
  }
};

// Delete Invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // Security validation: check role and ownership
    if (req.user.role === 'recruiter') {
      if (String(invoice.generatedBy) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden. You do not own this invoice.' });
      }
    } else {
      if (String(invoice.tenantOwnerId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden. This invoice belongs to another tenant.' });
      }
    }

    // Delete from Cloudinary if publicId exists
    if (invoice.file && invoice.file.publicId) {
      const resourceType = getCloudinaryResourceType(invoice.file.mimeType);
      try {
        await cloudinary.uploader.destroy(invoice.file.publicId, { resource_type: resourceType });
      } catch (cloudErr) {
        console.error('Failed to delete file from Cloudinary:', cloudErr);
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: 'Invoice deleted successfully.' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: error.message || 'Unable to delete invoice.' });
  }
};

