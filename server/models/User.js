const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'admin'], default: 'applicant' },
  // Link to their application if it exists
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);