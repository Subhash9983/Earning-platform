const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) { res.status(401).json({ msg: 'Invalid token' }); }
};

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', (req, res, next) => {
  console.log('UNAUTHENTICATED NOTIF REQUEST RECEIVED');
  next();
}, auth, async (req, res) => {
  try {
    console.log('FETCHING NOTIFS FOR USER:', req.user.id);
    const notifications = await Notification.find({ 
      $or: [
        { recipient: req.user.id },
        { recipient: new mongoose.Types.ObjectId(req.user.id) }
      ]
    })
      .populate('sender', 'name profilePicture')
      .populate('job', 'title')
      .sort({ date: -1 })
      .limit(30);
    console.log('FOUND NOTIFS COUNT:', notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error('NOTIF ERROR:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/notifications
// @desc    Send a notification (e.g., approach a student)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { recipientId, message, type, jobId } = req.body;
  try {
    const newNotification = new Notification({
      recipient: recipientId,
      sender: req.user.id,
      message,
      type: type || 'general',
      job: jobId
    });
    await newNotification.save();
    res.json(newNotification);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: 'Marked as read' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
