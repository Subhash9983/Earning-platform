const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Notification = require('./models/Notification');

async function check() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/student-gig-platform';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');
    
    const count = await Notification.countDocuments();
    console.log('Total Notifications in DB:', count);
    
    // Find all notifications
    const all = await Notification.find();
    
    console.log('\n--- Notification Entries ---');
    for (const n of all) {
       console.log(`ID: ${n._id}`);
       console.log(`Recipient ID: ${n.recipient}`);
       console.log(`Sender ID: ${n.sender}`);
       console.log(`Message: ${n.message}`);
       console.log(`Type: ${n.type}`);
       console.log(`Is Read: ${n.isRead}`);
       console.log('---------------------------');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Check Error:', err);
    process.exit(1);
  }
}

check();
