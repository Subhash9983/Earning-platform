const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['approach', 'hired', 'application_update', 'general'],
    default: 'general'
  },
  message: {
    type: String,
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
