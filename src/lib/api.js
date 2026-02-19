import axios from 'axios';

// DEBUG: Log environment to diagnose 404 issues
const API_URL = import.meta.env.VITE_API_URL;
console.log('%c🔍 API Configuration Debug', 'background: #222; color: #bada55; padding: 4px;');
console.log('VITE_API_URL from env:', API_URL);
console.log('Is running on Vercel:', window.location.hostname.includes('vercel.app'));

const api = axios.create({
  // Force the full Render URL if the environment variable is missing
  baseURL: import.meta.env.VITE_API_URL || 'https://spc-document-request-system-backend-r3nd.onrender.com/api',
  timeout: 20000,
  withCredentials: true
});

// DEBUG: Log the actual baseURL being used
console.log('Final baseURL:', api.defaults.baseURL);

// Request interceptor: attach JWT token if stored
api.interceptors.request.use( 
  config => {
    // Automatically attach admin or staff tokens
    const token = localStorage.getItem('adminToken') || localStorage.getItem('staffToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: centralized global error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 404: Log diagnostic info for debugging
      if (status === 404) {
        console.error('🚨 404 Error detected!');
        console.error('   Request URL:', error.config?.url);
        console.error('   Full baseURL:', api.defaults.baseURL);
        console.error('   This usually means VITE_API_URL is not set in Vercel environment variables.');
        console.error('   Check your Vercel dashboard → Settings → Environment Variables');
      }
      
      // 401: Unauthorized — redirect to login
      if (status === 401) {
        console.warn('Unauthorized: redirecting to login');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      
      // 403: Forbidden
      if (status === 403) {
        console.warn('Forbidden: access denied');
        window.location.href = '/';
      }
      
      // Server returned an error response
      console.error(`API Error ${status}:`, data?.message || data?.error || 'Unknown error');
    } else if (error.request) {
      console.error('Network error: no response from server');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
