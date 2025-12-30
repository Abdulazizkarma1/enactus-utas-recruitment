const mongoose = require('mongoose');
const ApplicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Step 1: Personal
    fullName: String,
    hostel: String,
    department: String,
    programme: String,
    dob: Date,
    phone: String,

    // Step 2: Teams
    secondaryTeam: {
        type: String,
        enum: ['IT Team', 'Presentation Team', 'Scripting Team', 'Research Team']
    },

    // Step 3: Essays
    essayWhy: String,
    essaySkills: String,

    // Step 4: Files (Paths)
    profilePic: String,
    cv: String,

    status: {
        type: String,
        enum: ['draft', 'submitted', 'interview', 'recruited', 'declined'],
        default: 'draft'
    }
}, { timestamps: true });
module.exports = mongoose.model('Application', ApplicationSchema);