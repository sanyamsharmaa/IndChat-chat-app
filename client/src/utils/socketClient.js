import { io } from 'socket.io-client';

let socket = null;
export function connectSocket() {
  console.log("creating connection")
  if (!socket) {
    socket = io('http://localhost:8000', {
      withCredentials: true, // required for cookies on cross-origin
      // auth: {} // optional if you prefer sending token in auth instead
    });
  }
  return socket;
}
export function getSocket() { return socket; }