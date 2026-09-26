import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ENV } from './config/env';
import { pushCommentToRedis, ChatComment } from './config/redis';
import { LiveSession } from './models/LiveSession';
import { LiveMessage } from './models/LiveMessage';
import { SystemSetting } from './models/SystemSetting';
import { logger } from './utils/logger';

let io: SocketIOServer | null = null;

// Per-socket timestamp tracking for rate limiting (1 message / 2 seconds)
const lastCommentTimestamp = new Map<string, number>();

// Track connected socket IDs per live stream room for real-time viewer counting
const roomViewers = new Map<string, Set<string>>();
// Track which rooms each socket is currently in
const socketRooms = new Map<string, Set<string>>();

const updateRoomViewerCount = async (roomName: string) => {
  if (!io || !roomName) return;
  const viewers = roomViewers.get(roomName)?.size || 0;

  // Broadcast real-time viewer count to all clients watching this broadcast
  io.to(roomName).emit('viewer-count-update', { roomName, count: viewers });

  // Update DB peak viewers and current viewers in background
  try {
    await LiveSession.findOneAndUpdate(
      { roomName, status: 'live' },
      {
        currentViewers: viewers,
        $max: { peakViewers: viewers },
      }
    );
  } catch (err: any) {
    logger.warn(`[Socket.io] Error updating DB viewer count: ${err.message}`);
  }
};

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
    socketRooms.set(socket.id, new Set<string>());

    // --- 1. LIVE ARTI CHAT & VIEWER TRACKING JOIN / LEAVE ---
    const handleJoin = (roomName: string) => {
      if (!roomName) return;

      socket.join(roomName);

      // Add to room viewers set
      if (!roomViewers.has(roomName)) {
        roomViewers.set(roomName, new Set<string>());
      }
      roomViewers.get(roomName)!.add(socket.id);
      socketRooms.get(socket.id)?.add(roomName);

      logger.info(`[Socket.io] Socket ${socket.id} joined room: ${roomName} (Total: ${roomViewers.get(roomName)!.size})`);
      updateRoomViewerCount(roomName);
    };

    const handleLeave = (roomName: string) => {
      if (!roomName) return;

      socket.leave(roomName);
      roomViewers.get(roomName)?.delete(socket.id);
      socketRooms.get(socket.id)?.delete(roomName);

      logger.info(`[Socket.io] Socket ${socket.id} left room: ${roomName}`);
      updateRoomViewerCount(roomName);
    };

    socket.on('join-arti-room', (data: { roomName: string } | string) => {
      const roomName = typeof data === 'string' ? data : data?.roomName;
      handleJoin(roomName);
    });

    socket.on('leave-arti-room', (data: { roomName: string } | string) => {
      const roomName = typeof data === 'string' ? data : data?.roomName;
      handleLeave(roomName);
    });

    socket.on('join_room', (roomName: string) => {
      handleJoin(roomName);
    });

    socket.on('leave_room', (roomName: string) => {
      handleLeave(roomName);
    });

    // --- 2. LIVE ARTI COMMENTS (Ephemeral Redis Storage with Admin/SuperAdmin Toggle Checks) ---
    socket.on(
      'send-comment',
      async (data: { roomName: string; message: string; name?: string; username?: string; avatar?: string; userId?: string }) => {
        try {
          if (!data || !data.roomName || !data.message) {
            return;
          }

          const roomName = String(data.roomName).trim();
          const rawMessage = String(data.message).trim();

          if (!rawMessage || !roomName) {
            return;
          }

          // 2.1 Check Global and Session Chat Status
          const [globalSetting, session] = await Promise.all([
            SystemSetting.findOne({ key: 'global_config' }),
            LiveSession.findOne({ roomName }),
          ]);

          if (globalSetting && globalSetting.isLiveChatEnabled === false) {
            socket.emit('chat-disabled', {
              message: 'मुख्य व्यवस्थापक द्वारा चैट सेवा अस्थायी रूप से बंद कर दी गई है।',
            });
            return;
          }

          if (session && session.isChatEnabled === false) {
            socket.emit('chat-disabled', {
              message: 'पुजारी/व्यवस्थापक द्वारा इस लाइव आरती के लिए चैट बंद की गई है।',
            });
            return;
          }

          // 2.2 Enforce Rate Limiting (1 message per 1500ms per socket)
          const now = Date.now();
          const lastSent = lastCommentTimestamp.get(socket.id) || 0;
          if (now - lastSent < 1500) {
            // Silently drop excessive rapid spam or send subtle notification without breaking UI
            socket.emit('chat-rate-limited', {
              message: 'कृपया धीरे-धीरे टिप्पणी करें (1.5 सेकंड प्रतीक्षा करें)',
            });
            return;
          }
          lastCommentTimestamp.set(socket.id, now);

          // 2.3 Sanitization & Length check (Max 250 chars)
          const cleanMessage = rawMessage.slice(0, 250);
          const cleanName = data.name && data.name.trim().length > 0
            ? data.name.trim().slice(0, 50)
            : 'भक्त';
          const cleanUsername = data.username ? String(data.username).trim().slice(0, 30) : undefined;
          const cleanAvatar = data.avatar ? String(data.avatar).trim() : undefined;

          const comment: ChatComment = {
            id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: cleanName,
            username: cleanUsername,
            avatar: cleanAvatar,
            message: cleanMessage,
            timestamp: new Date().toISOString(),
          };

          // 2.4 Push to Redis List with EXPIRE 3600 & LTRIM 0 199
          await pushCommentToRedis(roomName, comment);

          // 2.5 Persist to MongoDB for permanent per-broadcast logs
          LiveMessage.create({
            roomName,
            liveSession: session?._id,
            user: data.userId || undefined,
            name: cleanName,
            username: cleanUsername,
            avatar: cleanAvatar,
            message: cleanMessage,
            isSuperChat: false,
          }).catch((e) => logger.warn(`[Socket.io] DB LiveMessage save error: ${e.message}`));

          // 2.6 Broadcast to all viewers in the live room
          io?.to(roomName).emit('new-comment', comment);
        } catch (err: any) {
          logger.error(`[Socket.io] Error handling send-comment: ${err.message}`);
        }
      }
    );

    // --- 3. LIVE DEVOTIONAL REACTIONS (Floating Hearts, Diyas, Conch, Bells) ---
    socket.on('send-reaction', (data: { roomName: string; emoji: string }) => {
      if (data?.roomName && data?.emoji) {
        io?.to(data.roomName).emit('new-reaction', {
          id: `react_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          emoji: String(data.emoji).slice(0, 8),
          timestamp: Date.now(),
        });
      }
    });

    // --- 4. DISCONNECT CLEANUP ---
    socket.on('disconnect', () => {
      lastCommentTimestamp.delete(socket.id);
      const rooms = socketRooms.get(socket.id);
      if (rooms) {
        for (const r of rooms) {
          roomViewers.get(r)?.delete(socket.id);
          updateRoomViewerCount(r);
        }
      }
      socketRooms.delete(socket.id);
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
  avatar?: string;
  username?: string;
  roomName?: string;
  type?: 'donation' | 'dakshina';
  timestamp: string;
}

export const emitDonation = async (payload: DonationBroadcastPayload) => {
  if (!io) {
    logger.warn('[Socket.io] Cannot emit donation event: Socket.io server not initialized');
    return;
  }

  // If live session room is specified, broadcast to room viewers as Super Chat
  if (payload.roomName) {
    const superChatPayload = {
      id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: payload.donorName,
      username: payload.username,
      avatar: payload.avatar,
      message: payload.message || 'माँ के चरणों में पावन समर्पण एवं दक्षिणा',
      amount: payload.amount,
      isSuperChat: true,
      timestamp: payload.timestamp || new Date().toISOString(),
      roomName: payload.roomName,
    };

    // Broadcast both standard donation and Super Chat highlight
    io.to(payload.roomName).emit('donation', payload);
    io.to(payload.roomName).emit('super-chat', superChatPayload);
    io.to(payload.roomName).emit('new-comment', superChatPayload);

    // Save Super Chat to MongoDB LiveMessage log
    try {
      const session = await LiveSession.findOne({ roomName: payload.roomName });
      await LiveMessage.create({
        roomName: payload.roomName,
        liveSession: session?._id,
        name: payload.donorName,
        username: payload.username,
        avatar: payload.avatar,
        message: payload.message || 'पावन दान एवं समर्पण',
        isSuperChat: true,
        donationAmount: payload.amount,
      });
    } catch (e: any) {
      logger.warn(`[Socket.io] Error saving Super Chat log: ${e.message}`);
    }
  }

  // Also broadcast globally so homepage or other viewers can see devotion feeds
  io.emit('donation_global', payload);
  logger.info(`[Socket.io] Emitted donation event: ₹${payload.amount} from ${payload.donorName}`);
};

/**
 * Emits real-time chat status change to room viewers
 */
export const emitChatStatusUpdate = (roomName: string, isChatEnabled: boolean) => {
  if (io && roomName) {
    io.to(roomName).emit('chat-status-changed', { roomName, isChatEnabled });
  }
};

/**
 * Emits real-time donation status change
 */
export const emitDonationStatusUpdate = (roomName: string, isDonationEnabled: boolean) => {
  if (io && roomName) {
    io.to(roomName).emit('donation-status-changed', { roomName, isDonationEnabled });
  }
};
