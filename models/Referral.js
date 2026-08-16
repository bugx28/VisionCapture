import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'successful'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
