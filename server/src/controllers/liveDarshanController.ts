import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { roomService, createAccessToken, LIVEKIT_WS_URL } from '../config/livekit';
import { getCommentsFromRedis } from '../config/redis';
import { LiveSession } from '../models/LiveSession';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// ---- ADMIN: Start a new live Arti broadcast ----
export const startLiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    if (!admin) {
      throw new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें');
    }

    // Check if admin already has an active live session
    const existing = await LiveSession.findOne({ hostAdmin: admin._id, status: 'live' });
    if (existing) {
      // If already live, return the active session details
      const token = await createAccessToken({
        identity: String(admin._id),
        name: admin.name,
        roomName: existing.roomName,
        canPublish: true,
      });

      return sendResponse(res, 200, 'आपका लाइव प्रसारण पहले से चालू है', {
        sessionId: existing._id,
        roomName: existing.roomName,
        token,
        wsUrl: LIVEKIT_WS_URL,
      });
    }

    const roomName = `arti-${admin._id}-${crypto.randomBytes(4).toString('hex')}`;

    // Create room in LiveKit if roomService is configured
    if (roomService) {
      try {
        await roomService.createRoom({
          name: roomName,
          emptyTimeout: 300, // room auto-closes 5 min after all participants leave
          maxParticipants: 3000,
        });
      } catch (rkErr: any) {
        logger.error(`[LiveKit] Failed to create room on LiveKit server: ${rkErr.message}`);
      }
    }

    const session = await LiveSession.create({
      roomName,
      hostAdmin: admin._id,
      hostName: admin.name,
      status: 'live',
      startedAt: new Date(),
    });

    const token = await createAccessToken({
      identity: String(admin._id),
      name: admin.name,
      roomName,
      canPublish: true,
    });

    return sendResponse(res, 201, 'लाइव आरती प्रसारण शुरू हो गया', {
      sessionId: session._id,
      roomName,
      token,
      wsUrl: LIVEKIT_WS_URL,
    });
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN: End a live session ----
export const endLiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    const { roomName } = req.params;

    if (!admin) {
      throw new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें');
    }

    const session = await LiveSession.findOne({
      roomName,
      ...(admin.role === 'SUPERADMIN' ? {} : { hostAdmin: admin._id }),
      status: 'live',
    });

    if (!session) {
      throw new ApiError(404, 'लाइव सत्र नहीं मिला या पहले ही समाप्त हो चुका है');
    }

    if (roomService) {
      try {
        await roomService.deleteRoom(roomName);
      } catch (e: any) {
        logger.warn(`[LiveKit] Room deletion info: ${e.message}`);
      }
    }

    session.status = 'ended';
    session.endedAt = new Date();
    await session.save();

    return sendResponse(res, 200, 'लाइव आरती सफलतापूर्वक समाप्त हो गई', {
      sessionId: session._id,
      roomName: session.roomName,
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: List all currently live sessions ("Live Now" section) ----
export const listLiveSessions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await LiveSession.find({ status: 'live' })
      .select('roomName hostName startedAt peakViewers')
      .sort({ startedAt: -1 });

    return sendResponse(res, 200, 'सक्रिय लाइव सत्र सूची', sessions);
  } catch (err) {
    next(err);
  }
};

// ---- VIEWER: Join a live session — returns a subscribe-only token ----
export const joinLiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomName } = req.params;
    const user = req.user;

    const session = await LiveSession.findOne({ roomName, status: 'live' });
    if (!session) {
      throw new ApiError(404, 'यह आरती लाइव नहीं है या समाप्त हो चुकी है');
    }

    const identity = user ? String(user._id) : `guest-${crypto.randomBytes(6).toString('hex')}`;
    const name = user ? user.name : 'भक्त';

    const token = await createAccessToken({
      identity,
      name,
      roomName,
      canPublish: false, // Viewer-only: bandwidth optimized
    });

    return sendResponse(res, 200, 'लाइव दर्शन टोकन तैयार है', {
      roomName,
      token,
      wsUrl: LIVEKIT_WS_URL,
      hostName: session.hostName,
      startedAt: session.startedAt,
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: Get recent ephemeral comments for a room (from Redis only) ----
export const getRoomComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomName } = req.params;
    if (!roomName) {
      throw new ApiError(400, 'रूम का नाम आवश्यक है');
    }

    const comments = await getCommentsFromRedis(roomName);
    return sendResponse(res, 200, 'लाइव आरती टिप्पणियाँ प्राप्त हुईं', comments);
  } catch (err) {
    next(err);
  }
};
