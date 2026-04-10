const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'business', 'admin'],
    default: 'student',
  },
  
  // --- Student Fields ---
  university: {
    type: String,
  },
  educationDegree: {
    type: String,
  },
  educationDateRange: {
    type: String,
  },
  phone: {
    type: String,
  },
  location: {
    type: String,
  },
  githubLink: {
    type: String,
  },
  linkedinLink: {
    type: String,
  },
  skills: {
    type: [String],
  },
  rating: {
    type: Number,
  },
  jobsCompleted: {
    type: Number,
  },
  frameworks: {
    type: String,
  },
  developerTools: {
    type: String,
  },
  softSkills: {
    type: String,
  },
  achievements: {
    type: [String],
  },
  portfolio: [{
    title: String,
    description: String,
    link: String,
    techStack: String,
    dateRange: String,
    image: String
  }],

  // --- Business Fields ---
  companyName: {
    type: String,
  },
  website: {
    type: String,
  },
  industry: {
    type: String,
  },
  businessLocation: {
    type: String,
  },
  isVerifiedBusiness: {
    type: Boolean,
    default: false,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },

  profileViews: {
    type: Number,
    default: 0,
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // --- Shared Fields ---
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,
    default: 'Welcome to GigGrow!',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
