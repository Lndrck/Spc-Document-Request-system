import { io } from 'socket.io-client';

// Dynamic URL: Use environment variable or fallback to Render root (strip /api)
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'https://spc-document-request-system-backend-r3nd.onrender.com';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  withCredentials: true
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