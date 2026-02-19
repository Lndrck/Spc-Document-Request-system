import { io } from 'socket.io-client';

// Use the environment variable for production, fallback to local for development
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Force websocket for better performance
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000, //
  withCredentials: true // Required for cross-origin (Vercel to Render)
});

// Debugging listeners
socket.on('connect', () => {
  console.log('🔌 Connected to Socket.IO server:', socket.id); //
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from Socket.IO server:', reason); //
});

socket.on('connect_error', (error) => {
  console.error('🔌 Socket.IO connection error:', error); //
});

export default socket;