const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

const admins = [
  {
    studentId: 'president001',
    email: 'president@enactusutas.org',
    password: 'president@enactus',
    role: 'admin'
  },
  {
    studentId: 'advisor001',
    email: 'advisor@enactusutas.org',
    password: 'advisor@enactus',
    role: 'admin'
  },
  {
    studentId: 'vp001',
    email: 'vp@enactusutas.org',
    password: 'vp@enactus',
    role: 'admin'
  }
];

async function createAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    const results = {
      created: [],
      updated: [],
      existing: []
    };

    for (const admin of admins) {
      try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
          $or: [
            { studentId: admin.studentId }, 
            { email: admin.email }
          ] 
        });

        if (existingAdmin) {
          // Update existing admin
          const salt = await bcrypt.genSalt(10);
          existingAdmin.password = await bcrypt.hash(admin.password, salt);
          existingAdmin.role = 'admin';
          existingAdmin.studentId = admin.studentId;
          existingAdmin.email = admin.email;
          await existingAdmin.save();
          results.updated.push(admin);
          console.log(`✅ Updated admin: ${admin.email}`);
        } else {
          // Create new admin
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(admin.password, salt);
          const newAdmin = new User({ 
            studentId: admin.studentId, 
            email: admin.email, 
            password: hashedPassword,
            role: admin.role
          });
          await newAdmin.save();
          results.created.push(admin);
          console.log(`✅ Created admin: ${admin.email}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${admin.email}:`, error.message);
      }
    }

    console.log('\n📋 Admin Accounts Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    for (const admin of admins) {
      console.log(`\n   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   Student ID: ${admin.studentId}`);
    }
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('\n💡 You can now login as admin using either email or student ID');
    console.log('💡 Make sure to change these passwords after first login for security!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admins:', error);
    process.exit(1);
  }
}

createAdmins();
