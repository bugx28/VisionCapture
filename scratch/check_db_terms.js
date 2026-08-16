import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ProjectSchema = new mongoose.Schema({
  title: String,
  termsAndConditions: String
}, { strict: false });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const projects = await Project.find();
  console.log('Projects:', projects.map(p => ({ id: p._id, title: p.title, terms: p.termsAndConditions })));
  process.exit();
}).catch(console.error);
