import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Applied', 'Approved', 'Rejected'], default: 'Applied', index: true },
  formData: { type: mongoose.Schema.Types.Mixed }, // For dynamic application forms (e.g., Egocentric project)
}, { timestamps: true });

// Prevent duplicate applications
ApplicationSchema.index({ projectId: 1, contributorId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
