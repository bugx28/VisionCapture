import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: function() { return this.role === 'user'; } },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  city: { type: String, required: function() { return this.role === 'user'; } },
  country: { type: String, required: function() { return this.role === 'user'; } },
  nativeLanguage: { type: String, required: function() { return this.role === 'user'; } },
  additionalLanguage: { type: String },
  phone: { type: String, required: function() { return this.role === 'user'; } },
  experience: { type: String },
  howFoundUs: { type: String },
  projectsInterestedIn: [{ type: String }],
  role: { type: String, enum: ['user', 'admin', 'project_manager'], default: 'user', index: true },
  isVerified: { type: Boolean, default: false },
  upiId: { type: String },
  referralCode: { type: String, unique: true, sparse: true, index: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trustScore: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
