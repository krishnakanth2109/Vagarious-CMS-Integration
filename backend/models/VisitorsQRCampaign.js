import mongoose from 'mongoose';

const visitorsQRCampaignSchema = new mongoose.Schema(
  {
    tenantOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    publicUrl: {
      type: String,
      required: true,
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
    jobCode: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
visitorsQRCampaignSchema.index({ token: 1 });
visitorsQRCampaignSchema.index({ tenantOwnerId: 1 });

const VisitorsQRCampaign = mongoose.model('VisitorsQRCampaign', visitorsQRCampaignSchema);
export default VisitorsQRCampaign;
