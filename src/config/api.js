// Centralized API configuration for Building Approval Portal
// Automatically uses live Render backend in production / on Vercel, and localhost in dev

const DEFAULT_PROD_BACKEND = 'https://building-approval-dy6i.onrender.com';
const DEFAULT_DEV_BACKEND = 'http://localhost:5000';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = (() => {
  // 1. If running locally in dev mode or in browser on localhost, point to local Node backend
  if (import.meta.env.DEV || isLocalhost) {
    return import.meta.env.VITE_DEV_BACKEND_URL || DEFAULT_DEV_BACKEND;
  }

  // 2. Production mode (e.g. Vercel deployment)
  return (
    import.meta.env.VITE_BACKEND_URL || 
    import.meta.env.VITE_API_URL || 
    DEFAULT_PROD_BACKEND
  );
})().replace(/\/+$/, '');

