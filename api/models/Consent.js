import mongoose from 'mongoose';

const ConsentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  termsSnapshot: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Consent || mongoose.model('Consent', ConsentSchema);
