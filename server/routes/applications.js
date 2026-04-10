const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   POST api/applications
// @desc    Apply for a job
// @access  Private (Student only)
router.post('/', auth, async (req, res) => {
  const { jobId } = req.body;

  if (req.user.role !== 'student') {
    return res.status(401).json({ msg: 'Only students can apply for jobs' });
  }

  try {
    // Check if user has already applied
    let application = await Application.findOne({ job: jobId, student: req.user.id });
    if (application) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    const newApplication = new Application({
      job: jobId,
      student: req.user.id,
    });

    await newApplication.save();

    // Notify Business
    const job = await Job.findById(jobId);
    const student = await User.findById(req.user.id);
    const newNotif = new Notification({
       recipient: job.business,
       sender: req.user.id,
       message: `${student.name} applied for "${job.title}"`,
       type: 'general',
       job: jobId
    });
    await newNotif.save();

    // Increment applicant count on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    res.json(newApplication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/applications/offer
// @desc    Business sends an offer to a student
// @access  Private (Business only)
router.post('/offer', auth, async (req, res) => {
  const { studentId, jobId, message } = req.body;

  if (req.user.role !== 'business') {
    return res.status(401).json({ msg: 'Only businesses can send offers' });
  }

  try {
    // Check if an application/offer already exists
    let application = await Application.findOne({ job: jobId, student: studentId });
    if (application) {
      return res.status(400).json({ msg: 'An application or offer already exists for this student' });
    }

    const newApplication = new Application({
      job: jobId,
      student: studentId,
      status: 'offered'
    });

    await newApplication.save();

    // Notify Student
    const job = await Job.findById(jobId);
    const business = await User.findById(req.user.id);
    const newNotif = new Notification({
      recipient: studentId,
      sender: req.user.id,
      message: message || `${business.name} has offered you the "${job.title}" role!`,
      type: 'approach',
      job: jobId
    });
    await newNotif.save();

    res.json(newApplication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/applications/my
// @desc    Get current student's own applications
// @access  Private (Student only)
router.get('/my', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  try {
    const apps = await Application.find({ student: req.user.id })
      .populate('job', 'title pay location category duration')
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/applications/invitations
// @desc    Get pending offers for current student
// @access  Private (Student only)
router.get('/invitations', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  try {
    const invites = await Application.find({ student: req.user.id, status: 'offered' })
      .populate('job')
      .populate({
        path: 'job',
        populate: { path: 'business', select: 'name companyName profilePicture' }
      })
      .sort({ appliedAt: -1 });
    res.json(invites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/applications/stats/student
// @desc    Get stats for the current student
// @access  Private (Student only)
router.get('/stats/student', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job', 'pay');

    const appliedCount = applications.length;
    let totalEarnings = 0;

    applications.forEach(app => {
      if (app.status === 'accepted' && app.job) {
        totalEarnings += Number(app.job.pay) || 0;
      }
    });

    res.json({ appliedCount, totalEarnings });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/applications/job/:jobId
// @desc    Get all applicants for a job
// @access  Private (Business only)
router.get('/job/:jobId', auth, async (req, res) => {
  if (req.user.role !== 'business') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', ['name', 'email'])
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/applications/:id/status
// @desc    Update application status
// @access  Private (Business only)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    let application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    // Permissions: Business can accept/reject pending, Student can accept/reject offered
    if (application.status === 'pending' && req.user.role !== 'business') {
      return res.status(401).json({ msg: 'Only businesses can process pending applications' });
    }
    if (application.status === 'offered' && req.user.role !== 'student') {
      return res.status(401).json({ msg: 'Only students can process job offers' });
    }

    application.status = status;
    await application.save();

    // Notify Student
    const job = await Job.findById(application.job);
    const newNotif = new Notification({
       recipient: application.student,
       sender: req.user.id,
       message: status === 'accepted' 
          ? `🎉 Congratulations! You were hired for "${job.title}"` 
          : `Your application for "${job.title}" was not selected.`,
       type: status === 'accepted' ? 'hired' : 'application_update',
       job: job._id
    });
    await newNotif.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
