import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  city: { type: String },
  country: { type: String },
  nativeLanguage: { type: String },
  additionalLanguage: { type: String },
  phone: { type: String },
  experience: { type: String },
  howFoundUs: { type: String },
  projectsInterestedIn: [{ type: String }],
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
