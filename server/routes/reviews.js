const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const Application = require('../models/Application');

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   POST api/reviews
// @desc    Submit a review for a student
// @access  Private (Business only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'business') {
    return res.status(401).json({ msg: 'Only businesses can leave reviews' });
  }

  const { studentId, jobId, rating, comment } = req.body;

  try {
    // Check if review already exists for this job/student
    let review = await Review.findOne({ student: studentId, job: jobId });
    if (review) {
      return res.status(400).json({ msg: 'You have already reviewed this hiring' });
    }

    const newReview = new Review({
      student: studentId,
      business: req.user.id,
      job: jobId,
      rating,
      comment
    });

    await newReview.save();
    res.json(newReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reviews/student/:id
// @desc    Get all reviews for a student
// @access  Public
router.get('/student/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ student: req.params.id })
      .populate('business', ['name'])
      .sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
