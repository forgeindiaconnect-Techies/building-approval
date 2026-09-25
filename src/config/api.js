// Centralized API configuration for Building Approval Portal
// Uses environment variable VITE_BACKEND_URL in production (e.g. on Vercel), with fallback to localhost

export const API_BASE_URL = (
  import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000'
).replace(/\/+$/, ''); // Remove trailing slashes
