const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files - use absolute path and set proper headers
app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
        // Set appropriate content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        };
        if (contentTypes[ext]) {
            res.setHeader('Content-Type', contentTypes[ext]);
        }
        // Allow CORS for file access
        res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
    }
}));

// Fallback route for file access (in case static middleware doesn't catch it)
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    const resolvedFilePath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    console.log(`[File Request] Filename: ${filename}`);
    console.log(`[File Request] File path: ${filePath}`);
    console.log(`[File Request] Resolved file path: ${resolvedFilePath}`);
    console.log(`[File Request] Resolved uploads dir: ${resolvedUploadsDir}`);
    console.log(`[File Request] Uploads dir exists: ${fs.existsSync(uploadsDir)}`);
    console.log(`[File Request] File exists: ${fs.existsSync(filePath)}`);
    
    // Security: prevent directory traversal
    if (!resolvedFilePath.startsWith(resolvedUploadsDir)) {
        console.log(`[File Request] Security check failed: ${resolvedFilePath} not in ${resolvedUploadsDir}`);
        return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log(`[File Request] File not found: ${filePath}`);
        // List files in uploads directory for debugging
        try {
            const files = fs.readdirSync(uploadsDir);
            console.log(`[File Request] Files in uploads directory: ${files.join(', ')}`);
        } catch (err) {
            console.error(`[File Request] Error reading uploads directory: ${err.message}`);
        }
        return res.status(404).json({ 
            msg: 'File not found',
            filename: filename,
            uploadsDir: uploadsDir,
            filePath: filePath
        });
    }
    
    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    
    console.log(`[File Request] Serving file: ${filePath}`);
    // Send file
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`[File Request] Error sending file: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).json({ msg: 'Error serving file', error: err.message });
            }
        }
    });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Enactus UTAS Recruitment API is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/application', require('./routes/application'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));