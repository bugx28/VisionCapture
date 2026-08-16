import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  payRate: { type: String, required: true },
  estimatedDuration: { type: String },
  country: { type: String },
  shortDescription: { type: String },
  fullDescription: { type: String },
  projectDetails: { type: String },
  projectInstructions: { type: String },
  requirements: { type: String },
  devicesRequired: { type: String },
  eligibility: { type: String },
  instructions: { type: String },
  deadline: { type: Date },

  bannerImage: { type: String },
  coverImage: {
    url: { type: String },
    pathname: { type: String }
  },
  homepageVisible: { type: Boolean, default: false },
  contributorVisible: { type: Boolean, default: false },
  isEgocentric: { type: Boolean, default: false },
  telegramLink: { type: String },
  termsAndConditions: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
