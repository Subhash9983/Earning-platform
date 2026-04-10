const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('review', ReviewSchema);
