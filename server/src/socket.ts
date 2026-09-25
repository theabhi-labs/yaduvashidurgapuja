import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ENV } from './config/env';
import { pushCommentToRedis, ChatComment } from './config/redis';
import { logger } from './utils/logger';

let io: SocketIOServer | null = null;

// Per-socket timestamp tracking for rate limiting (1 message / 2 seconds)
const lastCommentTimestamp = new Map<string, number>();

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

    // --- 1. LIVE ARTI CHAT ROOM JOIN / LEAVE ---
    socket.on('join-arti-room', (data: { roomName: string } | string) => {
      const roomName = typeof data === 'string' ? data : data?.roomName;
      if (roomName) {
        socket.join(roomName);
        logger.info(`[Socket.io] Socket ${socket.id} joined arti chat room: ${roomName}`);
      }
    });

    socket.on('leave-arti-room', (data: { roomName: string } | string) => {
      const roomName = typeof data === 'string' ? data : data?.roomName;
      if (roomName) {
        socket.leave(roomName);
        logger.info(`[Socket.io] Socket ${socket.id} left arti chat room: ${roomName}`);
      }
    });

    // Backwards compatibility for donation listeners
    socket.on('join_room', (roomName: string) => {
      if (roomName) {
        socket.join(roomName);
      }
    });

    socket.on('leave_room', (roomName: string) => {
      if (roomName) {
        socket.leave(roomName);
      }
    });

    // --- 2. LIVE ARTI COMMENTS (Ephemeral Redis Storage, 1-hr TTL, Never MongoDB) ---
    socket.on(
      'send-comment',
      async (data: { roomName: string; message: string; name?: string }) => {
        try {
          if (!data || !data.roomName || !data.message) {
            return;
          }

          const roomName = String(data.roomName).trim();
          const rawMessage = String(data.message).trim();

          if (!rawMessage || !roomName) {
            return;
          }

          // 2.1 Enforce Rate Limiting (1 message per 2000ms per socket)
          const now = Date.now();
          const lastSent = lastCommentTimestamp.get(socket.id) || 0;
          if (now - lastSent < 2000) {
            socket.emit('chat-rate-limited', {
              message: 'कृपया धीरे-धीरे टिप्पणी करें (2 सेकंड प्रतीक्षा करें)',
            });
            return;
          }
          lastCommentTimestamp.set(socket.id, now);

          // 2.2 Sanitization & Length check (Max 200 chars)
          const cleanMessage = rawMessage.slice(0, 200);
          const cleanName = data.name && data.name.trim().length > 0
            ? data.name.trim().slice(0, 50)
            : 'भक्त';

          const comment: ChatComment = {
            id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: cleanName,
            message: cleanMessage,
            timestamp: new Date().toISOString(),
          };

          // 2.3 Push to Redis List with EXPIRE 3600 & LTRIM 0 199
          await pushCommentToRedis(roomName, comment);

          // 2.4 Broadcast to all viewers in the live room
          io?.to(roomName).emit('new-comment', comment);
        } catch (err: any) {
          logger.error(`[Socket.io] Error handling send-comment: ${err.message}`);
        }
      }
    );

    socket.on('disconnect', () => {
      lastCommentTimestamp.delete(socket.id);
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
