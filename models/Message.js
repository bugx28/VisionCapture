import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
