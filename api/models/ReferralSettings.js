import mongoose from 'mongoose';

const ReferralSettingsSchema = new mongoose.Schema({
  prizeAmounts: { type: String, default: JSON.stringify([{ rank: 1, amount: 3000 }, { rank: 2, amount: 1000 }, { rank: 3, amount: 500 }]) },
  currentMonth: { type: String, default: () => new Date().toISOString().substring(0, 7) },
  manualAdjustments: { type: Map, of: Number, default: {} },
}, { timestamps: true });

export default mongoose.models.ReferralSettings || mongoose.model('ReferralSettings', ReferralSettingsSchema);
