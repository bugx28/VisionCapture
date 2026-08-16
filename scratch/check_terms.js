import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './api/models/Project.js';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const p = await Project.findOne();
  console.log('Project termsAndConditions:', p.termsAndConditions);
  process.exit();
}).catch(console.error);
