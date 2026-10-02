import mongoose from 'mongoose';

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  tags: [{ type: String }],
  shortDescription: { type: String, required: true },
  payRate: { type: String, required: true },
  applyLink: { type: String, required: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);
