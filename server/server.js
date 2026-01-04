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
    
    // Security: prevent directory traversal
    if (!path.resolve(filePath).startsWith(path.resolve(uploadsDir))) {
        return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ msg: 'File not found' });
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
    
    // Send file
    res.sendFile(filePath);
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