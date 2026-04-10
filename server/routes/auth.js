const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, companyName, industry } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'student',
      // Conditionals based on role
      companyName: role === 'business' ? companyName : undefined,
      industry: role === 'business' ? industry : undefined,
      bio: role === 'business' 
        ? `Professional organization specializing in ${industry || 'talent discovery'}.` 
        : 'I am a student looking for opportunities.',
      
      // Student defaults (only if role is student)
      university: role === 'student' ? 'Not specified' : undefined,
      rating: role === 'student' ? 5.0 : undefined,
      jobsCompleted: role === 'student' ? 0 : undefined,
      skills: role === 'student' ? [] : undefined
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role, name: user.name, userId: user.id });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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

router.get('/me', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'viewedBy',
        select: 'name companyName profilePicture'
      });

    // --- Resilience Hack: Manual Populate if string IDs were present ---
    if (user.viewedBy && user.viewedBy.length > 0 && typeof user.viewedBy[0] === 'string') {
        const visitors = await User.find({ _id: { $in: user.viewedBy } }).select('name companyName profilePicture');
        user = user.toObject(); // Convert to plain object to modify
        user.viewedBy = visitors;
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { bio, university, skills, portfolio } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.university !== undefined) user.university = req.body.university;
    if (req.body.educationDegree !== undefined) user.educationDegree = req.body.educationDegree;
    if (req.body.educationDateRange !== undefined) user.educationDateRange = req.body.educationDateRange;
    if (req.body.skills !== undefined) user.skills = req.body.skills;
    if (req.body.portfolio !== undefined) user.portfolio = req.body.portfolio;
    
    // New Resume Fields
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.githubLink !== undefined) user.githubLink = req.body.githubLink;
    if (req.body.linkedinLink !== undefined) user.linkedinLink = req.body.linkedinLink;
    if (req.body.frameworks !== undefined) user.frameworks = req.body.frameworks;
    if (req.body.developerTools !== undefined) user.developerTools = req.body.developerTools;
    if (req.body.softSkills !== undefined) user.softSkills = req.body.softSkills;
    if (req.body.achievements !== undefined) user.achievements = req.body.achievements;

    // Business specific fields
    if (req.body.companyName !== undefined) user.companyName = req.body.companyName;
    if (req.body.website !== undefined) user.website = req.body.website;
    if (req.body.industry !== undefined) user.industry = req.body.industry;
    if (req.body.businessLocation !== undefined) user.businessLocation = req.body.businessLocation;

    // Profile Picture & Availability
    if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;
    if (req.body.isAvailable !== undefined) user.isAvailable = req.body.isAvailable;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role, name: user.name, userId: user.id });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/students
// @desc    Get all students (for Business Talent Search)
// @access  Private (Business only)
router.get('/students', auth, async (req, res) => {
  try {
    // Only allow businesses to search for students
    if (req.user.role !== 'business') {
      return res.status(401).json({ msg: 'Not authorized to view talent' });
    }
    
    // Find all users with role 'student' who are AVAILABLE
    const students = await User.find({ role: 'student', isAvailable: { $ne: false } }).select('-password -email');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/public-student/:id OR api/auth/student/:id
// @desc    Get student profile by ID
// @access  Public (Debug Mode)
const getStudentById = async (req, res) => {
  try {
    const safeId = req.params.id.trim();
    console.log(`DEBUG RE-ROUTE: FETCHING STUDENT BY ID: ${safeId}`);
    const student = await User.findById(safeId).select('-password');
    if (!student) {
      console.log(`DEBUG: STUDENT NOT FOUND: ${req.params.id}`);
      return res.status(404).json({ msg: 'Student not found in database' });
    }

    // --- Increment View Count Only if View is by a Business ---
    const token = req.header('x-auth-token');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            const viewer = decoded.user;
            if (viewer.role === 'business' && viewer.id !== student.id) {
                // Ensure viewedBy is an array
                if (!Array.isArray(student.viewedBy)) student.viewedBy = [];
                
                // Only increment if this business ID hasn't viewed before
                const hasViewed = student.viewedBy.some(id => id.toString() === viewer.id);
                if (!hasViewed) {
                    student.viewedBy.push(viewer.id);
                    student.profileViews = (student.profileViews || 0) + 1;
                    await student.save();
                    console.log(`DEBUG: UNIQUE VIEW INCREMENTED FOR ${student.name}`);
                }
            }
        } catch (e) { console.log("DEBUG: VIEW TRACK ERROR", e.message); }
    }

    console.log(`DEBUG: FOUND STUDENT: ${student.name}`);
    res.json(student);
  } catch (err) {
    console.error(`DEBUG: ERROR IN /student/:id: ${err.message}`);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

router.get('/public-student/:id', getStudentById);
router.get('/student/:id', getStudentById);

module.exports = router;
