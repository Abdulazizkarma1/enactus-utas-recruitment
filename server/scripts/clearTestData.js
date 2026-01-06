const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Application = require('../models/Application');
const Voucher = require('../models/Voucher');
const User = require('../models/User');

async function clearTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Confirm before proceeding
    console.log('⚠️  WARNING: This will delete ALL test data!');
    console.log('   - All Applications');
    console.log('   - All Vouchers');
    console.log('   - All Applicant Users (Admin accounts will be preserved)\n');

    // Count existing data
    const appCount = await Application.countDocuments();
    const voucherCount = await Voucher.countDocuments();
    const applicantCount = await User.countDocuments({ role: 'applicant' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log('📊 Current Database Status:');
    console.log(`   Applications: ${appCount}`);
    console.log(`   Vouchers: ${voucherCount}`);
    console.log(`   Applicant Users: ${applicantCount}`);
    console.log(`   Admin Users: ${adminCount} (will be preserved)\n`);

    if (appCount === 0 && voucherCount === 0 && applicantCount === 0) {
      console.log('✅ Database is already clean. No test data to remove.');
      process.exit(0);
    }

    // Delete all applications
    const deletedApps = await Application.deleteMany({});
    console.log(`✅ Deleted ${deletedApps.deletedCount} applications`);

    // Delete all vouchers
    const deletedVouchers = await Voucher.deleteMany({});
    console.log(`✅ Deleted ${deletedVouchers.deletedCount} vouchers`);

    // Delete all applicant users (preserve admins)
    const deletedUsers = await User.deleteMany({ role: 'applicant' });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} applicant users`);

    console.log('\n✅ Test data cleared successfully!');
    console.log('💡 Admin accounts have been preserved.');
    console.log('💡 You can now generate new vouchers and start fresh.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    process.exit(1);
  }
}

clearTestData();

