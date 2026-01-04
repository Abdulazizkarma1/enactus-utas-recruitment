// API Configuration
import axios from 'axios';

// Uses environment variable for API URL, falls back to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
const normalizedURL = API_BASE_URL.replace(/\/$/, '');

// Configure axios to include auth token in all requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Helper function to get file URL (handles both old and new path formats)
export const getFileUrl = (filePath) => {
    if (!filePath) return '';
    // If path already includes 'uploads/', use it as is, otherwise add it
    if (filePath.startsWith('uploads/') || filePath.startsWith('/uploads/')) {
        return `${normalizedURL}/${filePath.replace(/^\/+/, '')}`;
    }
    return `${normalizedURL}/uploads/${filePath}`;
};

export const API_URL = normalizedURL;
export default normalizedURL;

