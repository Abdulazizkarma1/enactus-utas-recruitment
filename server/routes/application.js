const router = require('express').Router();
const Application = require('../models/Application');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config for Uploads - use absolute path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Create/Update Application (Supports Drafts)
router.post('/submit', upload.fields([{ name: 'profilePic' }, { name: 'cv' }]), async (req, res) => {
    try {
        const { userId, fullName, hostel, department, programme, dob, age, gender, studyType, level, phone, secondaryTeam, essayWhy, essaySkills } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({ msg: "User ID is required" });
        }
        
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: "Invalid User ID format" });
        }
        
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: "Invalid User ID format" });
        }
        if (!fullName || !hostel || !department || !secondaryTeam || !essayWhy || !essaySkills) {
            return res.status(400).json({ msg: "All required fields must be filled" });
        }

        const updateData = {
            user: userId,
            fullName: fullName.trim(),
            hostel: hostel.trim(),
            department: department.trim(),
            programme: programme ? programme.trim() : '',
            dob: dob || null,
            age: age ? parseInt(age) : null,
            gender: gender || null,
            studyType: studyType || null,
            level: level ? level.trim() : null,
            phone: phone ? phone.trim() : '',
            secondaryTeam,
            essayWhy: essayWhy.trim(),
            essaySkills: essaySkills.trim(),
            status: 'submitted'
        };

        // Handle file uploads - store path relative to uploads directory
        if (req.files && req.files.profilePic) {
            // Multer stores path as 'uploads/filename.jpg', we need just 'filename.jpg'
            const filePath = req.files.profilePic[0].path;
            // Extract filename from path (handles both 'uploads/filename.jpg' and 'uploads\\filename.jpg')
            updateData.profilePic = path.basename(filePath);
        }
        if (req.files && req.files.cv) {
            const filePath = req.files.cv[0].path;
            updateData.cv = path.basename(filePath);
        }

        // Upsert: Update if exists, Create if new
        const app = await Application.findOneAndUpdate(
            { user: userId },
            updateData,
            { new: true, upsert: true }
        );

        // CRITICAL: Return the application with status to ensure frontend updates immediately
        // Status is guaranteed to be 'submitted' from updateData above
        res.json({ 
            msg: "Application submitted successfully", 
            application: app,
            status: app.status // Explicitly return status
        });
    } catch (err) {
        console.error('Application submission error:', err);
        res.status(500).json({ msg: err.message || "Error submitting application" });
    }
});

// Save Draft (Auto-save)
router.post('/draft', upload.fields([{ name: 'profilePic' }, { name: 'cv' }]), async (req, res) => {
    try {
        const { userId, fullName, hostel, department, programme, dob, age, gender, studyType, level, phone, secondaryTeam, essayWhy, essaySkills } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: "User ID is required" });
        }
        
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: "Invalid User ID format" });
        }

        const updateData = {
            user: userId,
            status: 'draft'
        };

        if (fullName) updateData.fullName = fullName.trim();
        if (hostel) updateData.hostel = hostel.trim();
        if (department) updateData.department = department.trim();
        if (programme) updateData.programme = programme.trim();
        if (dob) updateData.dob = dob;
        if (age) updateData.age = parseInt(age);
        if (gender) updateData.gender = gender;
        if (studyType) updateData.studyType = studyType;
        if (level) updateData.level = level.trim();
        if (phone) updateData.phone = phone.trim();
        if (secondaryTeam) updateData.secondaryTeam = secondaryTeam;
        if (essayWhy) updateData.essayWhy = essayWhy.trim();
        if (essaySkills) updateData.essaySkills = essaySkills.trim();

        // Handle file uploads - store path relative to uploads directory
        if (req.files && req.files.profilePic) {
            // Multer stores path as 'uploads/filename.jpg', we need just 'filename.jpg'
            const filePath = req.files.profilePic[0].path;
            // Extract filename from path (handles both 'uploads/filename.jpg' and 'uploads\\filename.jpg')
            updateData.profilePic = path.basename(filePath);
        }
        if (req.files && req.files.cv) {
            const filePath = req.files.cv[0].path;
            updateData.cv = path.basename(filePath);
        }

        const app = await Application.findOneAndUpdate(
            { user: userId },
            updateData,
            { new: true, upsert: true }
        );

        res.json({ msg: "Draft saved successfully", application: app });
    } catch (err) {
        console.error('Draft save error:', err);
        res.status(500).json({ msg: err.message || "Error saving draft" });
    }
});

// Get My Application
router.get('/:userId', async (req, res) => {
    try {
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ msg: "Invalid User ID format" });
        }
        
        const app = await Application.findOne({ user: req.params.userId });
        // Return null explicitly if no application found (instead of undefined)
        // This ensures frontend receives a predictable response
        if (!app) {
            return res.json(null);
        }
        res.json(app);
    } catch (err) {
        console.error('Error fetching application:', err);
        res.status(500).json({ msg: err.message || "Error fetching application" });
    }
});

module.exports = router;