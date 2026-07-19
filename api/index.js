import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import compression from 'compression';
import Contact from './models/Contact.js';
import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_please_change_in_production';

app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory OTP store (For production, consider Redis or MongoDB for distributed persistence)
const otpStore = new Map();

let isConnected = false;
// MongoDB Serverless Connection Helper
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not defined in .env.');
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB Atlas');
    await seedAdmin();
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

const seedAdmin = async () => {
  try {
    const adminEmail = 'dsainwala0@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Work@6522#', 10);
      const newAdmin = new User({
        fullName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      await newAdmin.save();
      console.log('Default admin created successfully.');
    }
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
};

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

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, project } = req.body;
    if (!name || !email || !company || !project) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    await connectDB();
    let contact;
    if (mongoose.connection.readyState === 1) {
      contact = new Contact({ name, email, company, project });
      await contact.save();
    }
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: 'info@visioncapture.in',
        subject: `New Project Inquiry from ${name} at ${company}`,
        text: `New project inquiry.\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nProject: ${project}`,
        html: `<h2>New Project Inquiry</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company}</p><h3>Project Requirements:</h3><p>${project.replace(/\n/g, '<br>')}</p>`,
      };
      await transporter.sendMail(mailOptions);
    }
    res.status(201).json({ success: true, message: 'Form submitted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// =======================
// AUTH ROUTES
// =======================

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, type = 'register' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    await connectDB();
    const existingUser = await User.findOne({ email });

    if (type === 'register' && existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    if (type === 'reset' && !existingUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 mins

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Vision Capture" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Registration OTP',
        text: `Your OTP for registration is: ${otp}`,
      });
      res.json({ success: true, message: 'OTP sent successfully.' });
    } else {
      console.warn('SMTP not configured. Generated OTP:', otp);
      res.json({ success: true, message: 'SMTP not configured, check server logs.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, otp, ...otherDetails } = req.body;

    const storedOtpData = otpStore.get(email);
    if (!storedOtpData || storedOtpData.otp !== otp || Date.now() > storedOtpData.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    await connectDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword, isVerified: true, ...otherDetails });
    await newUser.save();

    otpStore.delete(email); // clear OTP
    res.status(201).json({ success: true, message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
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

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const storedOtpData = otpStore.get(email);
    if (!storedOtpData || storedOtpData.otp !== otp || Date.now() > storedOtpData.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(email); // clear OTP
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

app.get('/api/messages/:userId', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    let query;
    if (req.params.userId === req.user.id) {
      // User fetching their own messages with admin
      query = { $or: [{ senderId: req.user.id }, { receiverId: req.user.id }] };
    } else {
      // Admin fetching messages with a specific user
      query = {
        $or: [
          { senderId: req.params.userId, receiverId: req.user.id },
          { senderId: req.user.id, receiverId: req.params.userId },
        ]
      };
    }
    const messages = await Message.find(query).sort({ createdAt: 1 }).lean();

    // Auto-deliver welcome message if it's the user's first time checking messages
    if (messages.length === 0 && req.params.userId === req.user.id) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        const welcomeContent = `Welcome to Vision Capture!\n\nThank you for joining us. We're excited to have you as part of our contributor community.\n\nWe'll notify you when projects matching your profile become available.\n\nRegards,\nVision Capture Team`;
        const welcomeMsg = new Message({
          senderId: adminUser._id,
          receiverId: req.user.id,
          content: welcomeContent
        });
        await welcomeMsg.save();
        messages.push(welcomeMsg);
      }
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

app.post('/api/messages', authenticateUser, async (req, res) => {
  try {
    let { receiverId, content } = req.body;
    await connectDB();

    // If receiver is 'admin', find the admin user's ID
    if (receiverId === 'admin') {
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) return res.status(404).json({ error: 'Admin not found' });
      receiverId = adminUser._id;
    }

    const msg = new Message({ senderId: req.user.id, receiverId, content });
    await msg.save();
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// =======================
// ADMIN ROUTES
// =======================

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role: 'user' })
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: 'user' })
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
