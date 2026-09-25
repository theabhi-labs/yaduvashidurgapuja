import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ENV } from './config/env';
import { logger } from './utils/logger';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        ENV.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://yaduvashidurgapuja2-0.vercel.app',
        'https://yaduvashidurgapuja2-o.vercel.app',
      ],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[Socket.io] Client connected: ${socket.id}`);

    // Join specific live stream room for targeted donation cards & real-time updates
    socket.on('join_room', (roomName: string) => {
      if (roomName) {
        socket.join(roomName);
        logger.info(`[Socket.io] Socket ${socket.id} joined room: ${roomName}`);
      }
    });

    socket.on('leave_room', (roomName: string) => {
      if (roomName) {
        socket.leave(roomName);
        logger.info(`[Socket.io] Socket ${socket.id} left room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  logger.info('[Socket.io] Socket server initialized successfully');
  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

export interface DonationBroadcastPayload {
  donorName: string;
  amount: number;
  message?: string;
  roomName?: string;
  timestamp: string;
}

export const emitDonation = (payload: DonationBroadcastPayload) => {
  if (!io) {
    logger.warn('[Socket.io] Cannot emit donation event: Socket.io server not initialized');
    return;
  }

  // If live session room is specified, broadcast to room viewers first
  if (payload.roomName) {
    io.to(payload.roomName).emit('donation', payload);
  }

  // Also broadcast globally so homepage or other viewers can see devotion feeds
  io.emit('donation_global', payload);
  logger.info(`[Socket.io] Emitted donation event: ₹${payload.amount} from ${payload.donorName}`);
};
