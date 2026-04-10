const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Notification = require('./models/Notification');
const User = require('./models/User');

async function check() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/student-gig-platform';
    await mongoose.connect(mongoUri);
    
    // Find Rishi's actual ID
    const rishi = await User.findOne({ name: /rishi/i });
    console.log(`Rishi Actual ID: ${rishi?._id}`);
    
    // Find all notifications
    const all = await Notification.find();
    console.log(`\nTotal Notifications: ${all.length}`);
    
    all.forEach((n, i) => {
      console.log(`Notif ${i+1}: To ${n.recipient}, Sender ${n.sender}, Msg: ${n.message.substring(0,30)}...`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
