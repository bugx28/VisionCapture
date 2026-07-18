import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Contact from './models/Contact.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.warn('WARNING: MONGODB_URI is not defined in .env. MongoDB will not connect.');
}

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, project } = req.body;

    // Validate request
    if (!name || !email || !company || !project) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 1. Save to MongoDB
    let contact;
    if (mongoose.connection.readyState === 1) {
      contact = new Contact({ name, email, company, project });
      await contact.save();
    } else {
      console.warn('MongoDB not connected, skipping database save.');
    }

    // 2. Send Email
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: 'info@visioncapture.in',
        subject: `New Project Inquiry from ${name} at ${company}`,
        text: `
You have received a new project inquiry.

Name: ${name}
Email: ${email}
Company: ${company}

Project Requirements:
${project}
        `,
        html: `
          <h2>New Project Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company}</p>
          <h3>Project Requirements:</h3>
          <p>${project.replace(/\n/g, '<br>')}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.warn('SMTP credentials not provided, skipping email notification.');
    }

    res.status(201).json({ 
      success: true, 
      message: 'Form submitted successfully.',
      contactId: contact ? contact._id : null
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to process the form submission.' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
