import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    let socketUrl = window.location.origin;

    if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const parsed = new URL(apiUrl);
        socketUrl = parsed.origin;
      } catch {
        socketUrl = window.location.origin;
      }
    } else if (import.meta.env.DEV) {
      socketUrl = 'http://localhost:5000';
    }

    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
    });
  }

  return socketInstance;
};
