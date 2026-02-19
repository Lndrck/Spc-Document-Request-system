import { createContext } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});

const API_BASE_URL = 'http://localhost:5000/api';
export const RequestContext = createContext();

export { API_BASE_URL, api };
