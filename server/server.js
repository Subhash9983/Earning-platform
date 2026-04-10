const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes Placeholder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));

// Global Stats for Landing Page
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Review = require('./models/Review');
const jwt = require('jsonwebtoken');

const authMW = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret').user;
    next();
  } catch { res.status(401).json({ msg: 'Invalid token' }); }
};

app.get('/api/stats', async (req, res) => {
  try {
    const studentCount  = await User.countDocuments({ role: 'student' });
    const businessCount = await User.countDocuments({ role: 'business' });
    const jobCount      = await Job.countDocuments();
    res.json({ studentCount, businessCount, jobCount });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Public Talent Preview (Top 3)
app.get('/api/public/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name university rating jobsCompleted')
      .limit(3)
      .sort({ rating: -1 });
    res.json(students);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Admin Stats
app.get('/api/admin/stats', authMW, async (req, res) => {
  try {
    const [students, businesses, jobs, applications, reviews] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'business' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Review.countDocuments(),
    ]);
    const recentUsers = await User.find().sort({ date: -1 }).limit(10).select('name email role date');
    res.json({ students, businesses, jobs, applications, reviews, recentUsers });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Notifications are now handled by /api/notifications route file.

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student-gig-platform';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
