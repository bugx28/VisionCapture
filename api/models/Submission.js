import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  externalProjectId: { type: String, required: true },
  notes: { type: String },
  submissionLink: { type: String, required: false },
  additionalComments: { type: String },
  status: { type: String, enum: ['Submitted', 'Under Review', 'Approved', 'Rework Required', 'Rejected', 'Completed'], default: 'Submitted', index: true },
  feedback: { type: String },
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
