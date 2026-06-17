import mongoose from 'mongoose';

const externalClientSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  positions: { type: String, default: '', trim: true },
  location: { type: String, default: '', trim: true },
  requirements: { type: String, required: true, trim: true },
  source: { type: String, default: 'Vagarious' },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Closed'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const ExternalClient = mongoose.models.ExternalClient || mongoose.model('ExternalClient', externalClientSchema);
export default ExternalClient;
