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

// DOWNLOAD PDF ROUTE
router.get('/pdf/:appId', async (req, res) => {
    try {
        const app = await Application.findById(req.params.appId);

        // Create a PDF document
        const doc = new PDFDocument();

        // Pipe the PDF into the response (download it directly)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Enactus_${app.fullName}.pdf`);
        doc.pipe(res);

        // --- PDF CONTENT DESIGN ---

        // Header
        doc.fontSize(20).fillColor('#800000').text('ENACTUS UTAS', { align: 'center' });
        doc.fontSize(12).fillColor('black').text('Recruitment Application Summary', { align: 'center' });
        doc.moveDown();

        // Section 1: Biodata
        doc.fontSize(14).fillColor('#800000').text('1. Personal Details');
        doc.fontSize(12).fillColor('black');
        doc.text(`Name: ${app.fullName}`);
        doc.text(`Department: ${app.department}`);
        doc.text(`Hostel: ${app.hostel}`);
        doc.text(`Phone: ${app.phone || 'N/A'}`);
        doc.moveDown();

        // Section 2: Teams
        doc.fontSize(14).fillColor('#800000').text('2. Team Selection');
        doc.fontSize(12).fillColor('black');
        doc.text(`Mandatory: Field Work Team`);
        doc.text(`Secondary: ${app.secondaryTeam}`);
        doc.moveDown();

        // Section 3: Essays
        doc.fontSize(14).fillColor('#800000').text('3. Essay: Why Join?');
        doc.fontSize(11).fillColor('black').text(app.essayWhy);
        doc.moveDown();

        doc.fontSize(14).fillColor('#800000').text('3. Essay: Skills');
        doc.fontSize(11).fillColor('black').text(app.essaySkills);
        doc.moveDown();

        // Finalize
        doc.end();

    } catch (err) {
        res.status(500).send("Error generating PDF");
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