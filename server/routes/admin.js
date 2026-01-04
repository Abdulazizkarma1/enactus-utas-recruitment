const router = require('express').Router();
const Voucher = require('../models/Voucher');
const Application = require('../models/Application');
const sendEmail = require('../utils/sendEmail'); // Import the emailer
const User = require('../models/User'); // Import User to get email addres
const PDFDocument = require('pdfkit');

// Generate Vouchers
router.post('/vouchers', async (req, res) => {
    try {
        const { amount } = req.body;
        const vouchers = [];
        for (let i = 0; i < amount; i++) {
            vouchers.push({
                serialNumber: 'EN' + Math.floor(Math.random() * 1000000),
                pin: Math.floor(1000 + Math.random() * 9000).toString()
            });
        }
        const saved = await Voucher.insertMany(vouchers);
        res.json(saved);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get All Vouchers
router.get('/vouchers', async (req, res) => {
    try {
        const vouchers = await Voucher.find().populate('usedBy', 'studentId email').sort({ createdAt: -1 });
        res.json(vouchers);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Delete Voucher
router.delete('/vouchers/:id', async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ msg: 'Voucher not found' });
        }
        if (voucher.isUsed) {
            return res.status(400).json({ msg: 'Cannot delete a used voucher' });
        }
        await Voucher.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Voucher deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get All Applicants (With User details)
router.get('/applicants', async (req, res) => {
    const apps = await Application.find().populate('user', 'studentId email');
    res.json(apps);
});

// DOWNLOAD PDF ROUTE - Enhanced with all applicant information
router.get('/pdf/:appId', async (req, res) => {
    try {
        const app = await Application.findById(req.params.appId).populate('user', 'studentId email');
        
        if (!app) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Create a PDF document with margins
        const doc = new PDFDocument({ 
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Pipe the PDF into the response (download it directly)
        res.setHeader('Content-Type', 'application/pdf');
        const safeFileName = app.fullName ? app.fullName.replace(/[^a-z0-9]/gi, '_') : 'Application';
        res.setHeader('Content-Disposition', `attachment; filename=Enactus_${safeFileName}_${app._id}.pdf`);
        doc.pipe(res);

        // --- PDF CONTENT DESIGN ---

        // Header
        doc.fontSize(20).fillColor('#800000').text('ENACTUS UTAS', { align: 'center' });
        doc.fontSize(12).fillColor('black').text('Recruitment Application Summary', { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Application Date: ${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}`, { align: 'center' });
        doc.moveDown(1.5);

        // Section 1: Personal Information
        doc.fontSize(14).fillColor('#800000').text('1. Personal Information', { underline: true });
        doc.fontSize(11).fillColor('black');
        doc.text(`Full Name: ${app.fullName || 'N/A'}`);
        doc.text(`Student ID: ${app.user?.studentId || 'N/A'}`);
        doc.text(`Email: ${app.user?.email || 'N/A'}`);
        doc.text(`Date of Birth: ${app.dob ? new Date(app.dob).toLocaleDateString() : 'N/A'}`);
        doc.text(`Phone Number: ${app.phone || 'N/A'}`);
        doc.moveDown(0.5);

        // Section 2: Academic Information
        doc.fontSize(14).fillColor('#800000').text('2. Academic Information', { underline: true });
        doc.fontSize(11).fillColor('black');
        doc.text(`Department: ${app.department || 'N/A'}`);
        doc.text(`Programme: ${app.programme || 'N/A'}`);
        doc.text(`Hostel: ${app.hostel || 'N/A'}`);
        doc.moveDown(0.5);

        // Section 3: Team Selection
        doc.fontSize(14).fillColor('#800000').text('3. Team Selection', { underline: true });
        doc.fontSize(11).fillColor('black');
        doc.text(`Mandatory Team: Field Work Team`);
        doc.text(`Secondary Team: ${app.secondaryTeam || 'N/A'}`);
        doc.moveDown(0.5);

        // Section 4: Application Status
        doc.fontSize(14).fillColor('#800000').text('4. Application Status', { underline: true });
        doc.fontSize(11).fillColor('black');
        const statusLabels = {
            'New': 'New Application',
            'draft': 'Draft',
            'submitted': 'Submitted',
            'interview': 'Interview Stage',
            'recruited': 'Recruited',
            'declined': 'Declined'
        };
        doc.text(`Status: ${statusLabels[app.status] || app.status || 'Submitted'}`);
        doc.moveDown(1);

        // Section 5: Essay Responses
        doc.fontSize(14).fillColor('#800000').text('5. Essay: Why do you want to join Enactus UTAS?', { underline: true });
        doc.fontSize(10).fillColor('black');
        if (app.essayWhy) {
            // Handle long text by wrapping
            doc.text(app.essayWhy, {
                width: 500,
                align: 'left',
                lineGap: 2
            });
        } else {
            doc.text('Not provided', { italic: true });
        }
        doc.moveDown(1);

        doc.fontSize(14).fillColor('#800000').text('6. Essay: What skills and experiences can you bring to Enactus UTAS?', { underline: true });
        doc.fontSize(10).fillColor('black');
        if (app.essaySkills) {
            doc.text(app.essaySkills, {
                width: 500,
                align: 'left',
                lineGap: 2
            });
        } else {
            doc.text('Not provided', { italic: true });
        }
        doc.moveDown(1);

        // Footer
        doc.fontSize(8).fillColor('#999').text(
            `Generated on ${new Date().toLocaleString()} | Enactus UTAS Recruitment System`,
            { align: 'center' }
        );

        // Finalize
        doc.end();

    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ msg: "Error generating PDF", error: err.message });
    }
});

// UPDATE STATUS ROUTE (Enhanced)
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;

        // 1. Update the Application
        const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });

        // 2. Find the User to get their email
        const user = await User.findById(app.user);

        // 3. Determine Email Message based on Status
        let subject = "Application Status Update";
        let message = "";

        if (status === 'interview') {
            message = `Dear ${app.fullName}, we are pleased to inform you that your application has been moved to the INTERVIEW stage. Check your dashboard for details.`;
        } else if (status === 'recruited') {
            subject = "Welcome to Enactus UTAS!";
            message = `Congratulations ${app.fullName}! You have been officially recruited into Enactus UTAS.`;
        } else if (status === 'declined') {
            message = `Dear ${app.fullName}, thank you for your interest. Unfortunately, we are not proceeding with your application at this time.`;
        }

        // 4. Send the Email (if message is set)
        if (message) {
            await sendEmail(user.email, subject, message);
        }

        res.json(app);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Statistics for Dashboard
router.get('/statistics', async (req, res) => {
    try {
        // Total applications
        const totalApplications = await Application.countDocuments();
        
        // Applications by status
        const statusCounts = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Applications per day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const applicationsPerDay = await Application.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Applications per month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const applicationsPerMonth = await Application.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Voucher statistics
        const totalVouchers = await Voucher.countDocuments();
        const usedVouchers = await Voucher.countDocuments({ isUsed: true });
        const availableVouchers = totalVouchers - usedVouchers;
        
        // Vouchers used per day (last 30 days) - use updatedAt when isUsed is true
        const vouchersUsedPerDay = await Voucher.aggregate([
            {
                $match: {
                    isUsed: true,
                    updatedAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Vouchers used per month (last 12 months)
        const vouchersUsedPerMonth = await Voucher.aggregate([
            {
                $match: {
                    isUsed: true,
                    updatedAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m', date: '$updatedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Format status counts
        const statusMap = {};
        statusCounts.forEach(item => {
            statusMap[item._id || 'submitted'] = item.count;
        });
        
        res.json({
            applications: {
                total: totalApplications,
                byStatus: {
                    new: statusMap['New'] || 0,
                    draft: statusMap['draft'] || 0,
                    submitted: statusMap['submitted'] || 0,
                    interview: statusMap['interview'] || 0,
                    recruited: statusMap['recruited'] || 0,
                    declined: statusMap['declined'] || 0
                },
                perDay: applicationsPerDay,
                perMonth: applicationsPerMonth
            },
            vouchers: {
                total: totalVouchers,
                used: usedVouchers,
                available: availableVouchers,
                usedPerDay: vouchersUsedPerDay,
                usedPerMonth: vouchersUsedPerMonth
            }
        });
    } catch (err) {
        console.error('Statistics error:', err);
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;