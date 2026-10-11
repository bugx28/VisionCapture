import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import compression from 'compression';
import Contact from '../models/Contact.js';
import User from '../models/User.js';

import Project from '../models/Project.js';
import Opportunity from '../models/Opportunity.js';
import PlatformStats from '../models/PlatformStats.js';
import Referral from '../models/Referral.js';
import ReferralSettings from '../models/ReferralSettings.js';
import Application from '../models/Application.js';
import Submission from '../models/Submission.js';
import Payment from '../models/Payment.js';
import ProjectMessage from '../models/ProjectMessage.js';
import Notification from '../models/Notification.js';
import ProjectTerms from '../models/ProjectTerms.js';
import OTP from '../models/OTP.js';
import crypto from 'crypto';
import { waitUntil } from '@vercel/functions';
import multer from 'multer';
import { put, del } from '@vercel/blob';
import ApprovalRequest from '../models/ApprovalRequest.js';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is missing in production!');
}
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_please_change_in_production';

app.use(cors());
app.use(compression());
app.use(express.json());

// Lightweight sliding-window rate limiters
const rateLimitMap = new Map();
const createRateLimiter = (windowMs, maxRequests, message) => {
  return (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || 'unknown';
    const now = Date.now();
    const key = `${req.baseUrl || req.path}:${ip}`;
    const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }
    rateLimitMap.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({ error: message || 'Too many requests. Please try again later.' });
    }
    next();
  };
};

const authRateLimiter = createRateLimiter(15 * 60 * 1000, 20, 'Too many login attempts. Please wait 15 minutes.');
const otpRateLimiter = createRateLimiter(15 * 60 * 1000, 6, 'Too many OTP requests. Please wait 15 minutes.');
const contactRateLimiter = createRateLimiter(15 * 60 * 1000, 8, 'Too many submissions. Please wait 15 minutes.');

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

let cachedDb = null;
// MongoDB Serverless Connection Helper
const connectDB = async () => {
  if (cachedDb) {
    await cachedDb;
    return;
  }
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('WARNING: Neither MONGODB_URI nor MONGO_URI is defined in environment variables.');
    return;
  }
  try {
    cachedDb = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    await cachedDb;
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    cachedDb = null;
  }
};

// Unified SMTP credentials supporting both SMTP_* and EMAIL_* conventions
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000, // 10s max to establish connection
  greetingTimeout: 7000,    // 7s max for SMTP greeting
  socketTimeout: 15000,     // 15s max socket inactivity
});

// Middleware for Admin Auth
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for PM Auth
const authenticatePM = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'project_manager' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for User Auth
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// =======================
// PUBLIC ROUTES
// =======================

app.post('/api/contact', contactRateLimiter, async (req, res) => {
  try {
    let { name, email, company, serviceType, message } = req.body;
    email = email?.toLowerCase();
    if (!name || !email || !serviceType || !message) {
      return res.status(400).json({ error: 'All fields except company are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    await connectDB();
    if (mongoose.connection.readyState < 1) {
      throw new Error('Database connection unavailable');
    }
    const contact = new Contact({ name, email, company, serviceType, message });
    await contact.save();
    res.status(201).json({ success: true, message: 'Form submitted successfully.' });

    if (SMTP_USER && SMTP_PASS) {
      const mailOptions = {
        from: `"${name}" <${SMTP_USER}>`,
        replyTo: email,
        to: 'info@visioncapture.in',
        subject: `New Project Inquiry from ${name}${company ? ` at ${company}` : ''}`,
        text: `New project inquiry.\nName: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nService Type: ${serviceType}\nMessage: ${message}`,
        html: `<h2>New Project Inquiry</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company || 'N/A'}</p><p><strong>Service Type:</strong> ${serviceType}</p><h3>Message:</h3><p>${message.replace(/\n/g, '<br>')}</p>`,
      };
      const sendEmailPromise = transporter.sendMail(mailOptions).catch(console.error);
      if (typeof waitUntil === 'function') {
        try {
          waitUntil(sendEmailPromise);
        } catch (e) {}
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// =======================
// AUTH ROUTES
// =======================

app.post('/api/auth/send-otp', otpRateLimiter, async (req, res) => {
  try {
    let { email, type = 'register' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    email = email.toLowerCase();
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    await connectDB();
    const existingUser = await User.findOne({ email });

    if (type === 'register' && existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    if (type === 'reset' && !existingUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTP.findOneAndUpdate(
      { email },
      { otp, purpose: type, attempts: 0, expiresAt },
      { upsert: true, returnDocument: 'after' }
    );

    if (SMTP_USER && SMTP_PASS) {
      let subject = 'Your Registration OTP';
      let purposeText = 'registration';
      if (type === 'reset') {
        subject = 'Your Password Reset OTP';
        purposeText = 'password reset';
      } else if (type === 'profile-update') {
        subject = 'Your Profile Update OTP';
        purposeText = 'profile update';
      }

      await transporter.sendMail({
        from: `"Vision Capture" <${SMTP_USER}>`,
        to: email,
        subject,
        text: `Your OTP for ${purposeText} is: ${otp}. It is valid for 10 minutes.`,
      });
      res.json({ success: true, message: 'OTP sent successfully.' });
    } else {
      console.warn('SMTP not configured. Generated OTP:', otp);
      res.json({ success: true, message: 'SMTP not configured, check server logs.' });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    let { fullName, email, password, otp, referredByCode, ...otherDetails } = req.body;
    email = email?.toLowerCase();
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    if (!otherDetails.country || !otherDetails.phone) return res.status(400).json({ error: 'Country and Phone are required.' });

    await connectDB();
    const storedOtpData = await OTP.findOne({ email });
    if (!storedOtpData || storedOtpData.otp !== otp || new Date() > storedOtpData.expiresAt || storedOtpData.attempts >= 5) {
      if (storedOtpData) {
        storedOtpData.attempts = (storedOtpData.attempts || 0) + 1;
        await storedOtpData.save();
      }
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const referralCode = 'VC' + Math.random().toString(36).substring(2, 8).toUpperCase();

    let referredByUserId = null;
    if (referredByCode) {
      const referrer = await User.findOne({ referralCode: referredByCode });
      if (referrer) referredByUserId = referrer._id;
    }

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isVerified: true,
      referralCode,
      referredBy: referredByUserId,
      ...otherDetails
    });
    await newUser.save();

    if (referredByUserId) {
      const newReferral = new Referral({
        contributorId: referredByUserId,
        referredUserId: newUser._id,
        status: 'successful' // As requested: on successful onboarding
      });
      await newReferral.save();
    }

    await OTP.deleteOne({ email }); // clear OTP
    res.status(201).json({ success: true, message: 'Registration successful.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register.' });
  }
});

app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase();
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// =======================
// USER & MESSAGING ROUTES
// =======================

app.post('/api/auth/reset-password', authRateLimiter, async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;
    email = email?.toLowerCase();
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });

    await connectDB();
    const storedOtpData = await OTP.findOne({ email });
    if (!storedOtpData || storedOtpData.otp !== otp || new Date() > storedOtpData.expiresAt || storedOtpData.attempts >= 5) {
      if (storedOtpData) {
        storedOtpData.attempts = (storedOtpData.attempts || 0) + 1;
        await storedOtpData.save();
      }
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ email }); // clear OTP
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

app.get('/api/users/me', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});


// =======================
// ADMIN ROUTES
app.post('/api/admin/create-pm', authenticateAdmin, async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase();
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newPm = new User({
      email,
      password: hashedPassword,
      role: 'project_manager',
      isVerified: true
    });

    await newPm.save();
    res.status(201).json({ success: true, message: 'Project Manager created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Project Manager.' });
  }
});

app.get('/api/admin/pms', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const pms = await User.find({ role: 'project_manager' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, pms });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Project Managers.' });
  }
});

app.delete('/api/admin/pms/:id', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const deletedPm = await User.findOneAndDelete({ _id: req.params.id, role: 'project_manager' });
    if (!deletedPm) return res.status(404).json({ error: 'Project Manager not found.' });
    res.json({ success: true, message: 'Project Manager deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Project Manager.' });
  }
});

app.put('/api/admin/pms/:id', authenticateAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const updateData = {};
    if (email) {
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
      updateData.email = email.toLowerCase();
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      updateData.password = await bcrypt.hash(password, 10);
    }

    await connectDB();
    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const updatedPm = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'project_manager' },
      updateData,
      { new: true }
    );
    if (!updatedPm) return res.status(404).json({ error: 'Project Manager not found.' });

    res.json({ success: true, message: 'Project Manager updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update Project Manager.' });
  }
});

// =======================

app.get('/api/admin/approvals', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const approvals = await ApprovalRequest.find({ status: 'pending' })
      .populate('requestedBy', 'email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, approvals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending approvals.' });
  }
});

app.post('/api/admin/approvals/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval || approval.status !== 'pending') return res.status(404).json({ error: 'Pending approval not found.' });

    if (approval.type === 'CREATE_PROJECT') {
      const project = new Project(approval.payload);
      await project.save();
    } else if (approval.type === 'UPDATE_PROJECT') {
      const updateData = { ...approval.payload };
      if (updateData._removeCoverImage) {
        const existingProject = await Project.findById(approval.projectId);
        if (existingProject && existingProject.coverImage && existingProject.coverImage.pathname) {
          await del(existingProject.coverImage.pathname).catch(console.error);
        }
        delete updateData._removeCoverImage;
      }
      await Project.findByIdAndUpdate(approval.projectId, updateData);
    } else if (approval.type === 'UPDATE_EGOCENTRIC') {
      await Project.findByIdAndUpdate(approval.projectId, approval.payload);
    }

    approval.status = 'approved';
    await approval.save();
    res.json({ success: true, message: 'Approved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve request.' });
  }
});

app.post('/api/admin/approvals/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval || approval.status !== 'pending') return res.status(404).json({ error: 'Pending approval not found.' });

    approval.status = 'rejected';
    if (req.body.adminNotes) approval.adminNotes = req.body.adminNotes;
    await approval.save();

    res.json({ success: true, message: 'Rejected successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request.' });
  }
});

// =======================

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { role: 'user' };
    if (req.query.country) {
      query.country = req.query.country;
    }
    if (req.query.search) {
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapeRegex(req.query.search), 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

app.get('/api/admin/countries', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const countries = await User.distinct('country', { role: 'user' });
    // Filter out null/empty strings
    const validCountries = countries.filter(c => c && c.trim() !== '').sort();
    res.json({ success: true, countries: validCountries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countries.' });
  }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      Contact.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments()
    ]);

    res.json({
      success: true,
      contacts,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact.' });
  }
});

// =======================
// PROJECT MANAGER ROUTES
// =======================

app.post('/api/pm/projects', authenticatePM, async (req, res) => {
  try {
    await connectDB();

    // Parse boolean fields that might come as strings if sent from older FormData
    const homepageVisible = req.body.homepageVisible === 'true' || req.body.homepageVisible === true;
    const contributorVisible = req.body.contributorVisible === 'true' || req.body.contributorVisible === true;

    const projectData = {
      ...req.body,
      homepageVisible,
      contributorVisible,
      createdBy: req.user.id
    };

    if (req.body.publicCoverImage) {
      projectData.coverImage = { url: `/${req.body.publicCoverImage.trim()}`, pathname: '' };
    }

    const approval = new ApprovalRequest({
      type: 'CREATE_PROJECT',
      requestedBy: req.user.id,
      payload: projectData
    });
    await approval.save();

    res.status(201).json({ success: true, message: 'Project creation request sent for admin approval.', requestId: approval._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project approval request.' });
  }
});

app.get('/api/pm/projects', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

app.put('/api/pm/projects/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();

    // Parse boolean fields
    const homepageVisible = req.body.homepageVisible === 'true' || req.body.homepageVisible === true;
    const contributorVisible = req.body.contributorVisible === 'true' || req.body.contributorVisible === true;

    const updateData = {
      ...req.body,
      homepageVisible,
      contributorVisible
    };

    if (req.body.publicCoverImage) {
      updateData.coverImage = { url: `/${req.body.publicCoverImage.trim()}`, pathname: '' };
    }

    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) return res.status(404).json({ error: 'Project not found.' });

    if (updateData.status === 'archived') {
      const completedSubs = await Submission.find({ projectId: req.params.id, status: 'Completed' });
      if (completedSubs.length > 0) {
        const contributorIds = completedSubs.map(sub => sub.contributorId);
        const payments = await Payment.find({ projectId: req.params.id, contributorId: { $in: contributorIds } });
        const paidContributorIds = new Set(payments.filter(p => p.status === 'Paid').map(p => p.contributorId.toString()));
        for (const sub of completedSubs) {
          if (!paidContributorIds.has(sub.contributorId.toString())) {
            return res.status(400).json({ error: 'Cannot archive project: There are completed submissions that have not been paid.' });
          }
        }
      }
    }

    if (req.body.removeCoverImage === 'true' || req.body.removeCoverImage === true) {
      updateData.coverImage = { url: '', pathname: '' };
      updateData._removeCoverImage = true;
    }

    const approval = new ApprovalRequest({
      type: 'UPDATE_PROJECT',
      projectId: req.params.id,
      requestedBy: req.user.id,
      payload: updateData
    });
    await approval.save();

    res.json({ success: true, message: 'Project update request sent for admin approval.', requestId: approval._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// --- EGOCENTRIC PM ROUTES ---
app.get('/api/pm/egocentric/project', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    let egoProject = await Project.findOne({ isEgocentric: true });

    if (!egoProject) {
      return res.status(404).json({ error: 'Egocentric project not found.' });
    }
    res.json({ success: true, project: egoProject });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Egocentric project.' });
  }
});

app.put('/api/pm/egocentric/project', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const existingProject = await Project.findOne({ isEgocentric: true });
    if (!existingProject) return res.status(404).json({ error: 'Egocentric Project not found.' });

    const updateData = {
      payRate: req.body.payRate,
      telegramLink: req.body.telegramLink,
      termsAndConditions: req.body.termsAndConditions,
      projectInstructions: req.body.projectInstructions
    };

    const approval = new ApprovalRequest({
      type: 'UPDATE_EGOCENTRIC',
      projectId: existingProject._id,
      requestedBy: req.user.id,
      payload: updateData
    });
    await approval.save();

    res.json({ success: true, message: 'Egocentric project update request sent for admin approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update Egocentric project.' });
  }
});

app.post('/api/pm/upload/cover', authenticatePM, upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const ext = req.file.originalname.split('.').pop();
    const uniqueName = `cover-${Date.now()}.${ext}`;
    const pathname = `pending-uploads/${uniqueName}`;

    const blobResult = await put(pathname, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    res.json({ success: true, url: blobResult.url, pathname: blobResult.pathname });
  } catch (err) {
    console.error('Error uploading cover image:', err);
    res.status(500).json({ error: 'Failed to upload cover image.' });
  }
});

app.get('/api/pm/approvals', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const approvals = await ApprovalRequest.find({ requestedBy: req.user.id })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, approvals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approvals.' });
  }
});

app.delete('/api/pm/projects/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    // Cleanup blob image if it exists
    if (project.coverImage && project.coverImage.pathname) {
      await del(project.coverImage.pathname).catch(console.error);
    }

    await Project.findByIdAndDelete(req.params.id);
    await ProjectMessage.deleteMany({ projectId: req.params.id });
    await Application.deleteMany({ projectId: req.params.id });
    await Submission.deleteMany({ projectId: req.params.id });
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// =======================
// OPPORTUNITY PM ROUTES
// =======================

app.post('/api/pm/opportunities', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const newOpp = new Opportunity({
      ...req.body,
      createdBy: req.user.id
    });
    await newOpp.save();
    res.status(201).json({ success: true, opportunity: newOpp });
  } catch (err) {
    console.error('Error creating opportunity:', err);
    res.status(500).json({ error: 'Failed to create opportunity.' });
  }
});

app.get('/api/pm/opportunities', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    res.json({ success: true, opportunities });
  } catch (err) {
    console.error('Error fetching opportunities:', err);
    res.status(500).json({ error: 'Failed to fetch opportunities.' });
  }
});

app.put('/api/pm/opportunities/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const updatedOpp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOpp) return res.status(404).json({ error: 'Opportunity not found.' });
    res.json({ success: true, opportunity: updatedOpp });
  } catch (err) {
    console.error('Error updating opportunity:', err);
    res.status(500).json({ error: 'Failed to update opportunity.' });
  }
});

app.delete('/api/pm/opportunities/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    res.json({ success: true, message: 'Opportunity deleted.' });
  } catch (err) {
    console.error('Error deleting opportunity:', err);
    res.status(500).json({ error: 'Failed to delete opportunity.' });
  }
});

// =======================
// PUBLIC NEW ROUTES
// =======================

app.get('/api/public/projects/homepage', async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find({ homepageVisible: true, status: 'active' }).sort({ createdAt: -1 });
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, projects });
  } catch (err) {
    console.error('Error fetching homepage projects:', err);
    res.status(500).json({ error: 'Failed to fetch homepage projects.' });
  }
});

app.get('/api/public/opportunities', async (req, res) => {
  try {
    await connectDB();
    const opportunities = await Opportunity.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, opportunities });
  } catch (err) {
    console.error('Error fetching public opportunities:', err);
    res.status(500).json({ error: 'Failed to fetch public opportunities.' });
  }
});

app.get('/api/public/projects/contributor', async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find({ contributorVisible: true, status: 'active' }).sort({ createdAt: -1 });
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, projects });
  } catch (err) {
    console.error('Error fetching contributor projects:', err);
    res.status(500).json({ error: 'Failed to fetch contributor projects.' });
  }
});

app.get('/api/public/platform-stats', async (req, res) => {
  try {
    await connectDB();
    const [stats, totalContributors] = await Promise.all([
      PlatformStats.findOne() || new PlatformStats(),
      User.countDocuments({ role: 'user' })
    ]);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, stats, totalContributors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch platform stats.' });
  }
});

// =======================
// ADMIN SETTINGS & REFERRALS
// =======================

app.post('/api/admin/platform-stats', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    let stats = await PlatformStats.findOne();
    if (!stats) stats = new PlatformStats(req.body);
    else {
      stats.totalPayments = req.body.totalPayments || stats.totalPayments;
      stats.projectsDelivered = req.body.projectsDelivered || stats.projectsDelivered;
      stats.clientsServed = req.body.clientsServed || stats.clientsServed;
    }
    await stats.save();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update platform stats.' });
  }
});

app.get('/api/admin/referral-settings', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    let settings = await ReferralSettings.findOne();
    if (!settings) {
      settings = new ReferralSettings();
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral settings.' });
  }
});

app.post('/api/admin/referral-settings', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    let settings = await ReferralSettings.findOne();
    if (!settings) settings = new ReferralSettings(req.body);
    else {
      if (req.body.prizeAmounts) settings.prizeAmounts = req.body.prizeAmounts;
      if (req.body.currentMonth) settings.currentMonth = req.body.currentMonth;
      if (req.body.manualAdjustments) settings.manualAdjustments = req.body.manualAdjustments;
    }
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update referral settings.' });
  }
});

app.get('/api/public/leaderboard', async (req, res) => {
  try {
    await connectDB();
    // In a real app, this would aggregate actual Referral documents.
    // For this implementation, we will mock it based on settings and users, 
    // or return an empty array if no referals exist yet.
    // Since manual adjustments are supported, we will use that as the primary driver.
    const settings = await ReferralSettings.findOne();
    if (!settings) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.json({ success: true, leaderboard: [] });
    }

    const manualAdj = settings.manualAdjustments ? Object.fromEntries(settings.manualAdjustments) : {};

    // Convert manual adjustments to an array of { userId, count }
    const leaderboardData = [];
    const manualAdjUserIds = Object.keys(manualAdj);
    
    if (manualAdjUserIds.length > 0) {
      const users = await User.find({ _id: { $in: manualAdjUserIds } }).select('fullName email');
      const userMap = new Map(users.map(u => [u._id.toString(), u]));
      
      for (const [userId, count] of Object.entries(manualAdj)) {
        const user = userMap.get(userId);
        if (user) {
          leaderboardData.push({
            userId,
            name: user.fullName || user.email.split('@')[0],
            count: count
          });
        }
      }
    }

    // Sort descending
    leaderboardData.sort((a, b) => b.count - a.count);

    // Assign ranks and prizes
    let prizes = [];
    try { prizes = JSON.parse(settings.prizeAmounts); } catch (e) { }

    const finalLeaderboard = leaderboardData.map((entry, index) => {
      const rank = index + 1;
      const prizeObj = prizes.find(p => p.rank === rank);
      return {
        ...entry,
        rank,
        prizeAmount: prizeObj ? prizeObj.amount : 0
      };
    });

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, leaderboard: finalLeaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// ==========================================
// SCALABLE ARCHITECTURE ROUTES
// ==========================================

// --- USER PROFILE ---
app.put('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { otp, profileData } = req.body; console.log("Profile update body:", req.body);

    // Verify OTP
    if (!otp) return res.status(400).json({ error: 'OTP is required.' });
    const storedOtpData = await OTP.findOne({ email: user.email.toLowerCase() });
    if (!storedOtpData || storedOtpData.otp !== otp || new Date() > storedOtpData.expiresAt || storedOtpData.attempts >= 5) {
      if (storedOtpData) {
        storedOtpData.attempts = (storedOtpData.attempts || 0) + 1;
        await storedOtpData.save();
      }
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Check Payment Lock (1st to 7th of month)
    const paymentFields = ['upiId', 'cryptoNetwork', 'cryptoWalletAddress'];
    const currentDay = new Date().getDate();
    const isLockedPeriod = currentDay >= 1 && currentDay <= 7;
    
    // Check if user is trying to update payment fields during lock period
    const isUpdatingPayment = paymentFields.some(field => profileData[field] !== undefined && profileData[field] !== user[field]);
    if (isUpdatingPayment && isLockedPeriod) {
       const remainingDays = 8 - currentDay;
       return res.status(400).json({ error: `You can't edit payment details until ${remainingDays} days as payments for previous months are in Progress.` });
    }

    // Update fields
    const allowedFields = ['fullName', 'city', 'country', 'nativeLanguage', 'additionalLanguage', 'phone', 'experience', 'howFoundUs', 'upiId', 'cryptoNetwork', 'cryptoWalletAddress'];
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        user[field] = profileData[field];
      }
    }

    await user.save();
    await OTP.deleteOne({ email: user.email.toLowerCase() }); // Clear OTP

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.put('/api/user/password', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// --- APPLICATIONS ---
app.post('/api/applications', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const { projectId, agreedToTerms, formData } = req.body;
    const existing = await Application.findOne({ projectId, contributorId: req.user.id });
    if (existing) return res.status(400).json({ error: 'Already applied' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let termsHash = null;
    if (project.termsAndConditions) {
      if (!agreedToTerms) {
        return res.status(400).json({ error: 'You must agree to the Terms and Conditions to apply.' });
      }
      
      // Store a hash instead of duplicating the entire document
      termsHash = crypto.createHash('sha256').update(project.termsAndConditions).digest('hex');
      
      // Keep exactly one copy of the text per version for this project
      await ProjectTerms.findOneAndUpdate(
        { projectId: project._id, termsHash },
        { projectId: project._id, termsHash, content: project.termsAndConditions },
        { upsert: true, new: true }
      );
    }

    const app = new Application({ 
      projectId, 
      contributorId: req.user.id, 
      status: 'Applied', 
      formData,
      ...(termsHash && { termsHash, agreedToTermsAt: new Date() })
    });
    await app.save();
    res.status(201).json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// Mark onboarding as completed for an application
app.put('/api/applications/:id/onboarded', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const app = await Application.findOne({ _id: req.params.id, contributorId: req.user.id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    app.onboardingCompleted = true;
    await app.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Onboarding completion error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

app.get('/api/applications/user', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const apps = await Application.find({ contributorId: req.user.id }).populate('projectId');
    const validApps = apps.filter(app => app.projectId && app.projectId.status !== 'archived');
    res.json({ success: true, applications: validApps });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.get('/api/applications/project/:projectId', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const apps = await Application.find({ projectId: req.params.projectId }).populate('contributorId', 'fullName email country nativeLanguage experience phone');
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.put('/api/applications/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// --- SUBMISSIONS ---
app.post('/api/submissions', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const { id, projectId, externalProjectId, notes, submissionLink, additionalComments } = req.body;

    if (id) {
      // User is resubmitting after a Rework request
      const existingSub = await Submission.findById(id);
      if (!existingSub || existingSub.contributorId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this submission' });
      }
      const updatedSub = await Submission.findByIdAndUpdate(
        id,
        { externalProjectId, notes, submissionLink, additionalComments, status: 'Submitted', feedback: '' },
        { new: true }
      );
      return res.status(200).json({ success: true, submission: updatedSub });
    }

    // Verify that the contributor has an approved application for this project
    const approvedApp = await Application.findOne({
      projectId,
      contributorId: req.user.id,
      status: 'Approved'
    });
    if (!approvedApp) {
      return res.status(403).json({ error: 'You must have an approved application to submit work for this project.' });
    }

    const sub = new Submission({
      projectId,
      contributorId: req.user.id,
      externalProjectId, notes, submissionLink, additionalComments
    });
    await sub.save();
    res.status(201).json({ success: true, submission: sub });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit' });
  }
});

app.get('/api/submissions/user', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const subs = await Submission.find({ contributorId: req.user.id }).populate('projectId');
    const validSubs = subs.filter(sub => sub.projectId && sub.projectId.status !== 'archived');
    res.json({ success: true, submissions: validSubs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.get('/api/submissions/project/:projectId', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const subs = await Submission.find({ projectId: req.params.projectId }).populate('contributorId', 'fullName email');
    res.json({ success: true, submissions: subs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.put('/api/submissions/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const { status, feedback } = req.body;
    const oldSub = await Submission.findById(req.params.id);
    if (!oldSub) return res.status(404).json({ error: 'Submission not found' });

    const sub = await Submission.findByIdAndUpdate(req.params.id, { status, feedback }, { returnDocument: 'after' });

    if (oldSub.status !== 'Completed' && status === 'Completed') {
      await User.findByIdAndUpdate(sub.contributorId, { $inc: { trustScore: 1 } });
    } else if (oldSub.status === 'Completed' && status !== 'Completed') {
      await User.findByIdAndUpdate(sub.contributorId, { $inc: { trustScore: -1 } });
    }

    res.json({ success: true, submission: sub });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// --- PAYMENTS ---
app.get('/api/payments/user', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const payments = await Payment.find({ contributorId: req.user.id }).populate('projectId', 'title');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.get('/api/payments/project/:projectId', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const payments = await Payment.find({ projectId: req.params.projectId }).populate('contributorId', 'fullName email upiId');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/payments', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const { projectId, contributorId, amount, status, remarks } = req.body;
    const payment = new Payment({ projectId, contributorId, amount, status, remarks, date: status === 'Paid' ? new Date() : null });
    await payment.save();
    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

app.put('/api/payments/:id', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const { amount, status, remarks } = req.body;
    const update = { amount, status, remarks };
    if (status === 'Paid') update.date = new Date();
    const payment = await Payment.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// --- PROJECT MESSAGES ---
app.get('/api/project-messages/:projectId', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const query = { projectId: req.params.projectId };

    // Regular contributors can ONLY access messages where they are sender or receiver
    if (req.user.role === 'user') {
      query.$or = [{ senderId: req.user.id }, { receiverId: req.user.id }];
    } else if (req.query.contributorId) {
      // PM or Admin filtering by specific contributor
      query.$or = [{ senderId: req.query.contributorId }, { receiverId: req.query.contributorId }];
    }

    // Incremental cursor pagination using timestamp
    if (req.query.since) {
      const sinceDate = new Date(req.query.since);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
      const msgs = await ProjectMessage.find(query)
        .populate('senderId', 'fullName role')
        .populate('receiverId', 'fullName role')
        .sort({ createdAt: 1 })
        .limit(limit);
      return res.json({ success: true, messages: msgs });
    }

    // Page-capped latest messages
    if (req.query.limit) {
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
      const msgs = await ProjectMessage.find(query)
        .populate('senderId', 'fullName role')
        .populate('receiverId', 'fullName role')
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.json({ success: true, messages: msgs.reverse() });
    }

    // Default chronological fetch
    const msgs = await ProjectMessage.find(query)
      .populate('senderId', 'fullName role')
      .populate('receiverId', 'fullName role')
      .sort({ createdAt: 1 });
    res.json({ success: true, messages: msgs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/project-messages/:projectId', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const { receiverId, content } = req.body;
    const msg = new ProjectMessage({
      projectId: req.params.projectId,
      senderId: req.user.id,
      receiverId,
      content
    });
    await msg.save();
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send' });
  }
});

app.put('/api/project-messages/:projectId/read', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const filter = { projectId: req.params.projectId, receiverId: req.user.id, isRead: false };
    if (req.body.senderId) filter.senderId = req.body.senderId;
    await ProjectMessage.updateMany(filter, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

app.get('/api/user/unread-messages', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const query = { receiverId: req.user.id, isRead: false };
    if (req.query.projectId) query.projectId = req.query.projectId;
    // Check if there are any unread project messages for this user
    // We populate projectId to ensure we don't count messages for deleted projects
    const unreadMessages = await ProjectMessage.find(query).populate('projectId').lean();
    const validUnreadMessages = unreadMessages.filter(m => m.projectId !== null);
    const unreadProjectIds = [...new Set(validUnreadMessages.map(m => m.projectId._id.toString()))];
    const unreadSenderIds = [...new Set(validUnreadMessages.map(m => m.senderId.toString()))];
    res.json({ success: true, hasUnread: validUnreadMessages.length > 0, count: validUnreadMessages.length, unreadProjectIds, unreadSenderIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});

// --- NOTIFICATIONS & ANALYSIS ---
app.get('/api/notifications', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { returnDocument: 'after' }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

app.post('/api/pm/notifications/send', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const { targetUserIds, message } = req.body;
    if (!targetUserIds || !targetUserIds.length || !message) {
      return res.status(400).json({ error: 'Missing target users or message' });
    }
    const notifications = targetUserIds.map(userId => ({
      userId,
      message,
    }));
    await Notification.insertMany(notifications);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});
app.get('/api/pm/visualisation-data', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    
    // Global User Stats
    const users = await User.find({ role: 'user' }).select('-password').lean();
    
    const countryStats = {};
    const nativeLangStats = {};
    const addLangStats = {};
    const sourceStats = {};
    const projectInterestStats = {};
    
    users.forEach(u => {
      if (u.country) countryStats[u.country] = (countryStats[u.country] || 0) + 1;
      if (u.nativeLanguage) nativeLangStats[u.nativeLanguage] = (nativeLangStats[u.nativeLanguage] || 0) + 1;
      
      // additionalLanguage is stored as a string in DB
      if (u.additionalLanguage) {
        addLangStats[u.additionalLanguage] = (addLangStats[u.additionalLanguage] || 0) + 1;
      }
      
      if (u.howFoundUs) {
        sourceStats[u.howFoundUs] = (sourceStats[u.howFoundUs] || 0) + 1;
      }
      
      if (u.projectsInterestedIn && Array.isArray(u.projectsInterestedIn)) {
        u.projectsInterestedIn.forEach(p => {
          if (p) projectInterestStats[p] = (projectInterestStats[p] || 0) + 1;
        });
      }
    });

    const formatForChart = (obj) => Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    // Egocentric Application Stats
    const egocentricProject = await Project.findOne({ title: { $regex: /Egocentric Video/i } }).lean();
    let egocentricStats = null;
    
    if (egocentricProject) {
      // Build a quick map of userId to country
      const userCountryMap = {};
      users.forEach(u => {
        if (u._id) {
          userCountryMap[u._id.toString()] = u.country || 'Unknown';
        }
      });

      const applications = await Application.find({ projectId: egocentricProject._id }).lean();
      
      const uniqueContributorsByType = {};
      const uniqueContributorsByTypeCountry = {}; 
      const iosSet = new Set();
      const androidSet = new Set();
      const uniqueContributorsByStatus = {};
      
      applications.forEach(app => {
        const cId = app.contributorId ? app.contributorId.toString() : 'unknown';
        
        if (!uniqueContributorsByStatus[app.status]) uniqueContributorsByStatus[app.status] = new Set();
        uniqueContributorsByStatus[app.status].add(cId);
        
        if (app.formData) {
          const type = app.formData.contributorType || 'Unknown';
          if (!uniqueContributorsByType[type]) uniqueContributorsByType[type] = new Set();
          uniqueContributorsByType[type].add(cId);
          
          const country = userCountryMap[cId] || 'Unknown';
          if (!uniqueContributorsByTypeCountry[type]) uniqueContributorsByTypeCountry[type] = {};
          if (!uniqueContributorsByTypeCountry[type][country]) uniqueContributorsByTypeCountry[type][country] = new Set();
          uniqueContributorsByTypeCountry[type][country].add(cId);
          
          const device = (app.formData.deviceName || '').toLowerCase();
          if (device.includes('iphone')) {
            iosSet.add(cId);
          } else if (device) {
            androidSet.add(cId);
          }
        }
      });

      const contributorTypeStats = {};
      Object.keys(uniqueContributorsByType).forEach(type => contributorTypeStats[type] = uniqueContributorsByType[type].size);

      const typeCountryStats = {};
      Object.keys(uniqueContributorsByTypeCountry).forEach(type => {
        typeCountryStats[type] = {};
        Object.keys(uniqueContributorsByTypeCountry[type]).forEach(country => {
          typeCountryStats[type][country] = uniqueContributorsByTypeCountry[type][country].size;
        });
      });
      
      const statusStats = {};
      Object.keys(uniqueContributorsByStatus).forEach(status => statusStats[status] = uniqueContributorsByStatus[status].size);
      
      egocentricStats = {
        contributorType: formatForChart(contributorTypeStats),
        countryByType: Object.entries(typeCountryStats).map(([type, cStats]) => ({
          type,
          data: formatForChart(cStats)
        })),
        deviceStats: [
          { name: 'iOS (iPhone)', value: iosSet.size },
          { name: 'Android / Other', value: androidSet.size }
        ],
        statusStats: formatForChart(statusStats)
      };
    }

    res.json({
      success: true,
      globalStats: {
        country: formatForChart(countryStats),
        nativeLanguage: formatForChart(nativeLangStats),
        additionalLanguages: formatForChart(addLangStats),
        howDidYouFindUs: formatForChart(sourceStats),
        projectsInterestedIn: formatForChart(projectInterestStats)
      },
      egocentricStats
    });
  } catch (error) {
    console.error('Visualisation data error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate visualisations' });
  }
});

app.get('/api/pm/contributors-analysis', authenticatePM, async (req, res) => {
  try {
    await connectDB();

    // 1. Database-level aggregation for contributor applications and completed submissions
    const usersWithApps = await User.aggregate([
      { $match: { role: 'user' } },
      { $project: { password: 0 } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'contributorId',
          as: 'userApps'
        }
      },
      {
        $lookup: {
          from: 'submissions',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$contributorId', '$$userId'] },
                    { $eq: ['$status', 'Completed'] }
                  ]
                }
              }
            },
            { $project: { projectId: 1 } }
          ],
          as: 'completedSubs'
        }
      },
      {
        $addFields: {
          appliedProjectIds: {
            $setUnion: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$userApps',
                      as: 'app',
                      cond: { $ne: ['$$app.projectId', null] }
                    }
                  },
                  as: 'a',
                  in: { $toString: '$$a.projectId' }
                }
              },
              []
            ]
          },
          completedProjectIds: {
            $setUnion: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$completedSubs',
                      as: 'sub',
                      cond: { $ne: ['$$sub.projectId', null] }
                    }
                  },
                  as: 's',
                  in: { $toString: '$$s.projectId' }
                }
              },
              []
            ]
          }
        }
      },
      {
        $project: {
          userApps: 0,
          completedSubs: 0
        }
      }
    ]);

    // 2. Database-level aggregation for project applicant counts
    const applicantCounts = await Application.aggregate([
      { $match: { projectId: { $ne: null } } },
      { $group: { _id: '$projectId', applicantCount: { $sum: 1 } } }
    ]);
    const countMap = new Map(applicantCounts.map(c => [c._id.toString(), c.applicantCount]));

    const projects = await Project.find().select('title status').lean();
    const projectStats = projects.map(p => ({
      projectId: p._id,
      title: p.title,
      status: p.status || 'active',
      applicantCount: countMap.get(p._id.toString()) || 0
    }));

    res.json({ success: true, contributors: usersWithApps, projectStats });
  } catch (err) {
    console.error('Contributor analysis aggregation error:', err);
    res.status(500).json({ error: 'Failed to fetch contributor analysis' });
  }
});

app.post('/api/pm/mail-contributors', authenticatePM, async (req, res) => {
  try {
    await connectDB();
    const { userIds, subject, message } = req.body;
    if (!userIds || !userIds.length || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const users = await User.find({ _id: { $in: userIds } }).select('email');
    const emails = users.map(u => u.email).filter(Boolean);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No valid email addresses found' });
    }

    const senderEmail = SMTP_USER;

    // Immediately return HTTP 200 response to avoid reverse proxy / serverless gateway timeouts (e.g. Vercel 10s limit)
    res.json({ success: true, message: `Successfully queued emails for ${emails.length} contributors.` });

    // Asynchronously dispatch email batches in background
    const dispatchPromise = (async () => {
      try {
        const chunkSize = 20;
        for (let i = 0; i < emails.length; i += chunkSize) {
          const chunk = emails.slice(i, i + chunkSize);
          
          const mailOptions = {
            from: `"Vision Capture" <${senderEmail}>`,
            bcc: chunk.join(','),
            subject,
            text: message,
            html: `<div style="font-family: sans-serif; white-space: pre-wrap; color: #334155; line-height: 1.6;">${message}</div>`
          };

          await transporter.sendMail(mailOptions);
          
          // Delay between chunks if needed (1s) to respect SMTP rate limits
          if (i + chunkSize < emails.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        console.log(`[Bulk Mailer] Successfully dispatched batch to ${emails.length} recipients for: "${subject}"`);
      } catch (sendErr) {
        console.error('[Bulk Mailer Background Error]:', sendErr);
      }
    })();

    if (typeof waitUntil === 'function') {
      try {
        waitUntil(dispatchPromise);
      } catch (wErr) {
        // Safe fallback in non-serverless runtime
      }
    }
  } catch (err) {
    console.error('Mail initialization error:', err);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
