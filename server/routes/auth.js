const router = require('express').Router();
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const Application = require('../models/Application');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register with Voucher
router.post('/register', async (req, res) => {
    try {
        const { studentId, email, password, serial, pin } = req.body;

        // Validate input
        if (!studentId || !email || !password || !serial || !pin) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "Invalid email format" });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long" });
        }

        // Validate student ID format (11 digits)
        if (!/^\d{11}$/.test(studentId.trim())) {
            return res.status(400).json({ msg: "Student ID must be exactly 11 digits" });
        }

        // 1. Validate Voucher
        const voucher = await Voucher.findOne({ serialNumber: serial.trim(), pin: pin.trim() });
        if (!voucher) return res.status(400).json({ msg: "Invalid Voucher Serial Number or PIN" });
        if (voucher.isUsed) return res.status(400).json({ msg: "This voucher has already been used" });

        // 2. Check if email already exists
        const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (emailExists) return res.status(400).json({ msg: "Email already registered" });

        // 3. Check if Student ID already exists
        const userExists = await User.findOne({ studentId: studentId.trim() });
        if (userExists) return res.status(400).json({ msg: "Student ID already exists" });

        // 4. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            studentId: studentId.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });
        const savedUser = await newUser.save();

        // 5. Mark Voucher Used
        voucher.isUsed = true;
        voucher.usedBy = savedUser._id;
        await voucher.save();

        res.status(201).json({ msg: "Registration successful! You can now login." });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: err.message || "Server error during registration" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { studentId, email, password } = req.body;

        // Find user by studentId or email
        let user;
        if (studentId) {
            user = await User.findOne({ studentId });
        } else if (email) {
            user = await User.findOne({ email });
        } else {
            return res.status(400).json({ msg: "Please provide studentId or email" });
        }

        if (!user) return res.status(404).json({ msg: "User not found" });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ msg: "Invalid password" });

        // CRITICAL: Query Application collection to get actual status
        // Do not rely on User model flags - always check Application collection
        let applicationStatus = null;
        try {
            const application = await Application.findOne({ user: user._id });
            if (application && application.status) {
                applicationStatus = application.status;
            }
        } catch (appErr) {
            console.error('Error fetching application status during login:', appErr);
            // Continue with login even if application fetch fails
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                studentId: user.studentId, 
                role: user.role 
            },
            applicationStatus: applicationStatus // Include application status in login response
        });
    } catch (err) { 
        console.error('Login error:', err);
        res.status(500).json({ msg: err.message || "Server error during login" }); 
    }
});


// Validate Voucher (without registration)
router.post('/validate-voucher', async (req, res) => {
    try {
        const { serial, pin } = req.body;

        if (!serial || !pin) {
            return res.status(400).json({ msg: "Serial Number and PIN are required" });
        }

        const voucher = await Voucher.findOne({ 
            serialNumber: serial.trim(), 
            pin: pin.trim() 
        });

        if (!voucher) {
            return res.status(400).json({ msg: "Invalid Voucher Serial Number or PIN" });
        }

        if (voucher.isUsed) {
            return res.status(400).json({ msg: "This voucher has already been used" });
        }

        res.json({ msg: "Voucher is valid", valid: true });
    } catch (err) {
        console.error('Voucher validation error:', err);
        res.status(500).json({ msg: err.message || "Server error during validation" });
    }
});

module.exports = router;