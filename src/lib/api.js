import axios from 'axios'; // Only this one at the top

const api = axios.create({
  // This correctly points to Render when the Vercel variable is missing
  baseURL: import.meta.env.VITE_API_URL || 'https://spc-document-request-system-backend-r3nd.onrender.com/api',
  timeout: 20000,
  withCredentials: true
});
// Request interceptor: attach JWT token if stored
api.interceptors.request.use( 
  config => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('staffToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: helps you see if the URL is wrong in the console
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error("🚀 API Route Not Found. Check if baseURL points to Render!");
    }
    return Promise.reject(error);
  }
);

export default api;
