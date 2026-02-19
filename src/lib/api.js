import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  withCredentials: true
});

// Request interceptor: attach JWT token if stored
api.interceptors.request.use(
  config => {
    // If using localStorage (not recommended for XSS risk, prefer httpOnly cookie)
    // const token = localStorage.getItem('access_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // Prefer server-set httpOnly cookies; axios auto-sends them with withCredentials
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
