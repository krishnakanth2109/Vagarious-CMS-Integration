import mongoose from 'mongoose';

const externalContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  source: { type: String, default: 'Vagarious' },
  importType: { type: String, default: 'external_contacts', index: true },
}, {
  timestamps: true,
});

const ExternalContact = mongoose.models.ExternalContact || mongoose.model('ExternalContact', externalContactSchema);
export default ExternalContact;
