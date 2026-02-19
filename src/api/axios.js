import axios from 'axios';

const api = axios.create({
  // Vercel will use the VITE_API_URL. 
  // Your computer will use localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;