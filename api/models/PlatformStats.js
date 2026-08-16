import mongoose from 'mongoose';

const PlatformStatsSchema = new mongoose.Schema({
  totalPayments: { type: String, default: '0' },
  projectsDelivered: { type: String, default: '0' },
  clientsServed: { type: String, default: '0' },
}, { timestamps: true });

export default mongoose.models.PlatformStats || mongoose.model('PlatformStats', PlatformStatsSchema);
