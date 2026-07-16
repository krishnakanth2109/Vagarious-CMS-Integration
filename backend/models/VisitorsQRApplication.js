import mongoose from 'mongoose';

const visitorsQRApplicationSchema = new mongoose.Schema(
  {
    tenantOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    qrCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitorsQRCampaign',
      required: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    yearOfPassOut: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    photoCopy: {
      url: { type: String },
      publicId: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
    },
    resume: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
    },
    source: {
      type: String,
      default: 'Visitors QR',
    },
    status: {
      type: String,
      enum: ['New', 'Duplicate', 'Converted', 'Rejected'],
      default: 'New',
      index: true,
    },
    duplicateStatus: {
      type: String,
      enum: ['Unique', 'Duplicate'],
      default: 'Unique',
    },
    convertedCandidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
visitorsQRApplicationSchema.index({ email: 1, phone: 1 });
visitorsQRApplicationSchema.index({ tenantOwnerId: 1 });
visitorsQRApplicationSchema.index({ qrCampaignId: 1 });

const VisitorsQRApplication = mongoose.model('VisitorsQRApplication', visitorsQRApplicationSchema);
export default VisitorsQRApplication;
