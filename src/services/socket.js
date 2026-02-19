import { io } from 'socket.io-client';

// Create socket connection to the server
// Note: Server is configured to run on port 5000 (overridden by environment or default)
const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Force websocket transport for better performance
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('🔌 Connected to Socket.IO server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from Socket.IO server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🔌 Socket.IO connection error:', error);
});

export default socket;
