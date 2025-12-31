// API Configuration
// Uses environment variable for API URL, falls back to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
const normalizedURL = API_BASE_URL.replace(/\/$/, '');

export const API_URL = normalizedURL;
export default normalizedURL;

