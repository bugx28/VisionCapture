import mongoose from 'mongoose';

const ProjectTermsSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  termsHash: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

// Add compound index for fast lookups
ProjectTermsSchema.index({ projectId: 1, termsHash: 1 }, { unique: true });

export default mongoose.models.ProjectTerms || mongoose.model('ProjectTerms', ProjectTermsSchema);
