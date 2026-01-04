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
    console.log(`[Server] Created uploads directory: ${uploadsDir}`);
} else {
    console.log(`[Server] Uploads directory exists: ${uploadsDir}`);
    // Log files in uploads directory on startup
    try {
        const files = fs.readdirSync(uploadsDir);
        console.log(`[Server] Files in uploads directory (${files.length}): ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
    } catch (err) {
        console.error(`[Server] Error reading uploads directory: ${err.message}`);
    }
}

// File serving route - Simple and reliable approach
app.get('/uploads/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Validate filename (prevent directory traversal)
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(403).json({ msg: 'Invalid filename' });
        }
        
        // Construct absolute file path
        const filePath = path.resolve(uploadsDir, filename);
        const uploadsDirResolved = path.resolve(uploadsDir);
        
        // Security: ensure file is within uploads directory
        if (!filePath.startsWith(uploadsDirResolved)) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`[File] Not found: ${filename}`);
            console.log(`[File] Looking in: ${uploadsDirResolved}`);
            // List available files for debugging
            try {
                const files = fs.readdirSync(uploadsDirResolved);
                console.log(`[File] Available files (${files.length}): ${files.slice(0, 10).join(', ')}`);
            } catch (err) {
                console.error(`[File] Error reading directory: ${err.message}`);
            }
            return res.status(404).json({ 
                msg: 'File not found',
                filename: filename
            });
        }
        
        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        // Set response headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        // Send the file
        console.log(`[File] Serving: ${filename} from ${filePath}`);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(`[File] Error sending file ${filename}:`, err.message);
                if (!res.headersSent) {
                    res.status(500).json({ msg: 'Error serving file', error: err.message });
                }
            } else {
                console.log(`[File] Successfully served: ${filename}`);
            }
        });
    } catch (error) {
        console.error('[File] Unexpected error:', error);
        if (!res.headersSent) {
            res.status(500).json({ msg: 'Server error', error: error.message });
        }
    }
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