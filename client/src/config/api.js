// API Configuration
// Uses environment variable for API URL, falls back to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URL = API_BASE_URL;
export default API_BASE_URL;

