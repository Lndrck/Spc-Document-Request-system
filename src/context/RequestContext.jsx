import { createContext } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://spc-document-request-system-backend-r3nd.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true
});

const API_BASE_URL = API_BASE;
export const RequestContext = createContext();

export { API_BASE_URL, api };
