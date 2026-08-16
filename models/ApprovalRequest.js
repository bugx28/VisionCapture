import mongoose from 'mongoose';

const ApprovalRequestSchema = new mongoose.Schema({
  type: { type: String, enum: ['CREATE_PROJECT', 'UPDATE_PROJECT', 'UPDATE_EGOCENTRIC'], required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // null for CREATE_PROJECT
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payload: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String }
}, { timestamps: true });

export default mongoose.models.ApprovalRequest || mongoose.model('ApprovalRequest', ApprovalRequestSchema);
