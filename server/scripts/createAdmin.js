const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminStudentId = 'admin001';
    const adminEmail = 'admin@enactus.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [{ studentId: adminStudentId }, { email: adminEmail }] 
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        // Update to admin
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminPassword, salt);
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ User updated to admin');
      } else {
        console.log('✅ Admin already exists');
      }
      console.log('\n📋 Admin Credentials:');
      console.log('   Email:', adminEmail);
      console.log('   Student ID:', adminStudentId);
      console.log('   Password:', adminPassword);
      process.exit(0);
    }

    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    const newAdmin = new User({ 
      studentId: adminStudentId, 
      email: adminEmail, 
      password: hashedPassword,
      role: 'admin'
    });
    await newAdmin.save();

    console.log('✅ Test admin created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Student ID:', adminStudentId);
    console.log('   Password:', adminPassword);
    console.log('\n💡 You can now login as admin using either email or student ID');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

