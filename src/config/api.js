// Centralized API configuration for Building Approval Portal
// Automatically uses live Render backend in production / on Vercel, and localhost in dev

const DEFAULT_PROD_BACKEND = 'https://building-approval-dy6i.onrender.com';
const DEFAULT_DEV_BACKEND = 'http://localhost:5000';

export const API_BASE_URL = (
  import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? DEFAULT_PROD_BACKEND : DEFAULT_DEV_BACKEND)
).replace(/\/+$/, '');
