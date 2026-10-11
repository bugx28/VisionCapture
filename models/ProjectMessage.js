import mongoose from 'mongoose';

const ProjectMessageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Compound indexes for polling and conversation lookups
ProjectMessageSchema.index({ projectId: 1, senderId: 1, receiverId: 1, createdAt: 1 });
ProjectMessageSchema.index({ receiverId: 1, isRead: 1 });

export default mongoose.models.ProjectMessage || mongoose.model('ProjectMessage', ProjectMessageSchema);
