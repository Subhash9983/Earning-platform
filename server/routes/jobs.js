const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const Application = require('../models/Application');

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

// @route   GET api/jobs
// @desc    Get all active jobs with filters
// @access  Public
router.get('/', async (req, res) => {
  const { category, location, search } = req.query;
  let query = { status: 'active' };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const jobs = await Job.find(query).sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/jobs
// @desc    Add new job
// @access  Private (Business only)
router.post('/', auth, async (req, res) => {
  const { title, pay, location, description, category, duration, skills } = req.body;

  if (req.user.role !== 'business') {
    return res.status(401).json({ msg: 'Only businesses can post jobs' });
  }

  try {
    const newJob = new Job({
      title,
      pay,
      location,
      description,
      category: category || 'General',
      duration: duration || 'Flexible',
      skills: skills || [],
      business: req.user.id,
      status: 'active',
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job (business owner only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.business.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/business/my
// @desc    Get all jobs posted by the logged-in business
// @access  Private (Business only)
router.get('/business/my', auth, async (req, res) => {
  if (req.user.role !== 'business') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const jobs = await Job.find({ business: req.user.id }).sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
