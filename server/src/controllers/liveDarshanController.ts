import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { roomService, createAccessToken, LIVEKIT_WS_URL } from '../config/livekit';
import { getCommentsFromRedis } from '../config/redis';
import { LiveSession } from '../models/LiveSession';
import { LiveMessage } from '../models/LiveMessage';
import { Donation } from '../models/Donation';
import { SystemSetting } from '../models/SystemSetting';
import { emitChatStatusUpdate, emitDonationStatusUpdate } from '../socket';
import { ApiError, sendResponse, PaginationMeta } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// Helper to get or create global system config
const getGlobalSettingDoc = async () => {
  let setting = await SystemSetting.findOne({ key: 'global_config' });
  if (!setting) {
    setting = await SystemSetting.create({
      key: 'global_config',
      isDonationEnabled: true,
      isLiveChatEnabled: true,
    });
  }
  return setting;
};

// ---- ADMIN: Schedule a future Live broadcast ----
export const scheduleLiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    if (!admin) {
      throw new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें');
    }

    const { title, description, scheduledAt } = req.body;
    if (!title || !title.trim()) {
      throw new ApiError(400, 'आरती / कार्यक्रम का शीर्षक (Topic/Title) आवश्यक है');
    }

    if (!scheduledAt) {
      throw new ApiError(400, 'निर्धारित समय (Scheduled Date/Time) आवश्यक है');
    }

    const roomName = `arti-${admin._id}-${crypto.randomBytes(4).toString('hex')}`;

    const session = await LiveSession.create({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      roomName,
      hostAdmin: admin._id,
      hostName: admin.name,
      status: 'scheduled',
      scheduledAt: new Date(scheduledAt),
    });

    return sendResponse(res, 201, 'लाइव आरती का कार्यक्रम सफलतापूर्वक शेड्यूल किया गया', session);
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: Get upcoming scheduled live broadcasts ----
export const listScheduledSessions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const schedules = await LiveSession.find({ status: 'scheduled' })
      .sort({ scheduledAt: 1 })
      .lean();

    return sendResponse(res, 200, 'आगामी लाइव आरती कार्यक्रम', schedules);
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN: Cancel a scheduled broadcast ----
export const deleteScheduledSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    const { id } = req.params;

    if (!admin) {
      throw new ApiError(401, 'कृपया लॉगिन करें');
    }

    const session = await LiveSession.findOne({
      _id: id,
      status: 'scheduled',
      ...(admin.role === 'SUPERADMIN' ? {} : { hostAdmin: admin._id }),
    });

    if (!session) {
      throw new ApiError(404, 'शेड्यूल कार्यक्रम नहीं मिला या अनुमति नहीं है');
    }

    await LiveSession.findByIdAndDelete(id);
    return sendResponse(res, 200, 'शेड्यूल कार्यक्रम रद्द कर दिया गया');
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN: Start a new live broadcast (Supports Multiple Concurrent Admins) ----
export const startLiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    if (!admin) {
      throw new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें');
    }

    const { title, description, isChatEnabled, isDonationEnabled, scheduledId } = req.body;

    // Check if this admin already has an active live session
    const existing = await LiveSession.findOne({ hostAdmin: admin._id, status: 'live' });
    if (existing) {
      const token = await createAccessToken({
        identity: String(admin._id),
        name: admin.name,
        roomName: existing.roomName,
        canPublish: true,
      });

      return sendResponse(res, 200, 'आपका लाइव प्रसारण पहले से चालू है', {
        sessionId: existing._id,
        roomName: existing.roomName,
        title: existing.title,
        token,
        wsUrl: LIVEKIT_WS_URL,
        isChatEnabled: existing.isChatEnabled,
        isDonationEnabled: existing.isDonationEnabled,
      });
    }

    let roomName: string;
    let session: any;

    // If starting from an existing scheduled session
    if (scheduledId) {
      const scheduledSession = await LiveSession.findOne({
        _id: scheduledId,
        status: 'scheduled',
        ...(admin.role === 'SUPERADMIN' ? {} : { hostAdmin: admin._id }),
      });

      if (scheduledSession) {
        roomName = scheduledSession.roomName;
        scheduledSession.status = 'live';
        scheduledSession.startedAt = new Date();
        if (title) scheduledSession.title = title.trim();
        if (description) scheduledSession.description = description.trim();
        if (isChatEnabled !== undefined) scheduledSession.isChatEnabled = isChatEnabled;
        if (isDonationEnabled !== undefined) scheduledSession.isDonationEnabled = isDonationEnabled;
        session = await scheduledSession.save();
      }
    }

    if (!session) {
      roomName = `arti-${admin._id}-${crypto.randomBytes(4).toString('hex')}`;
      session = await LiveSession.create({
        title: title ? title.trim() : 'माँ दुर्गा पावन महाआरती',
        description: description ? description.trim() : undefined,
        roomName,
        hostAdmin: admin._id,
        hostName: admin.name,
        status: 'live',
        startedAt: new Date(),
        isChatEnabled: isChatEnabled !== undefined ? Boolean(isChatEnabled) : true,
        isDonationEnabled: isDonationEnabled !== undefined ? Boolean(isDonationEnabled) : true,
      });
    } else {
      roomName = session.roomName;
    }

    // Create room in LiveKit if roomService is configured
    if (roomService) {
      try {
        await roomService.createRoom({
          name: roomName,
          emptyTimeout: 300,
          maxParticipants: 3000,
        });
      } catch (rkErr: any) {
        logger.error(`[LiveKit] Failed to create room on LiveKit server: ${rkErr.message}`);
      }
    }

    const token = await createAccessToken({
      identity: String(admin._id),
      name: admin.name,
      roomName,
      canPublish: true,
    });

    return sendResponse(res, 201, 'लाइव आरती प्रसारण शुरू हो गया', {
      sessionId: session._id,
      roomName,
      title: session.title,
      token,
      wsUrl: LIVEKIT_WS_URL,
      isChatEnabled: session.isChatEnabled,
      isDonationEnabled: session.isDonationEnabled,
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
    session.currentViewers = 0;
    await session.save();

    return sendResponse(res, 200, 'लाइव आरती सफलतापूर्वक समाप्त हो गई', {
      sessionId: session._id,
      roomName: session.roomName,
      peakViewers: session.peakViewers,
    });
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN / SUPER ADMIN: End ALL active live broadcasts with one click ----
export const endAllLiveSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    if (!admin) {
      throw new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें');
    }

    const activeSessions = await LiveSession.find({ status: 'live' });
    for (const session of activeSessions) {
      if (roomService) {
        try {
          await roomService.deleteRoom(session.roomName);
        } catch {
          // quiet
        }
      }
    }

    const result = await LiveSession.updateMany(
      { status: 'live' },
      { status: 'ended', endedAt: new Date(), currentViewers: 0 }
    );

    return sendResponse(
      res,
      200,
      `${result.modifiedCount} सक्रिय लाइव प्रसारण सफलतापूर्वक समाप्त किए गए`
    );
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: List all currently live sessions (Supports Multiple Streams) ----
export const listLiveSessions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Auto-expire zombie sessions running longer than 6 hours
    const staleThreshold = new Date(Date.now() - 6 * 60 * 60 * 1000);
    await LiveSession.updateMany(
      { status: 'live', startedAt: { $lt: staleThreshold } },
      { status: 'ended', endedAt: new Date(), currentViewers: 0 }
    );

    const [sessions, globalSetting] = await Promise.all([
      LiveSession.find({ status: 'live' })
        .select('title description roomName hostName startedAt currentViewers peakViewers isChatEnabled isDonationEnabled')
        .sort({ startedAt: -1 })
        .lean(),
      getGlobalSettingDoc(),
    ]);

    // Integrate global setting overrides
    const payload = sessions.map((s) => ({
      ...s,
      isChatEnabled: globalSetting.isLiveChatEnabled ? s.isChatEnabled : false,
      isDonationEnabled: globalSetting.isDonationEnabled ? s.isDonationEnabled : false,
    }));

    return sendResponse(res, 200, 'सक्रिय लाइव सत्र सूची', payload);
  } catch (err) {
    next(err);
  }
};

// ---- VIEWER: Join a live session — returns a subscribe-only token ----
export const joinLiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomName } = req.params;
    const user = req.user;

    const [session, globalSetting] = await Promise.all([
      LiveSession.findOne({ roomName, status: 'live' }),
      getGlobalSettingDoc(),
    ]);

    if (!session) {
      throw new ApiError(404, 'यह आरती लाइव नहीं है या समाप्त हो चुकी है');
    }

    const identity = user ? String(user._id) : `guest-${crypto.randomBytes(6).toString('hex')}`;
    const name = user ? user.name : 'भक्त';

    const token = await createAccessToken({
      identity,
      name,
      roomName,
      canPublish: false,
    });

    return sendResponse(res, 200, 'लाइव दर्शन टोकन तैयार है', {
      roomName,
      title: session.title,
      description: session.description,
      token,
      wsUrl: LIVEKIT_WS_URL,
      hostName: session.hostName,
      startedAt: session.startedAt,
      currentViewers: session.currentViewers || 0,
      peakViewers: session.peakViewers || 0,
      isChatEnabled: globalSetting.isLiveChatEnabled ? session.isChatEnabled : false,
      isDonationEnabled: globalSetting.isDonationEnabled ? session.isDonationEnabled : false,
    });
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN: Toggle Live Chat for a stream ----
export const toggleLiveChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    const { roomName } = req.params;
    const { isChatEnabled } = req.body;

    if (!admin) {
      throw new ApiError(401, 'कृपया लॉगिन करें');
    }

    const session = await LiveSession.findOne({
      roomName,
      ...(admin.role === 'SUPERADMIN' ? {} : { hostAdmin: admin._id }),
    });

    if (!session) {
      throw new ApiError(404, 'लाइव सत्र नहीं मिला');
    }

    session.isChatEnabled = Boolean(isChatEnabled);
    await session.save();

    // Broadcast real-time status update to all room viewers
    emitChatStatusUpdate(roomName, session.isChatEnabled);

    return sendResponse(
      res,
      200,
      session.isChatEnabled ? 'लाइव चैट चालू कर दी गई' : 'लाइव चैट बंद कर दी गई',
      { isChatEnabled: session.isChatEnabled }
    );
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN: Toggle Donation for a stream ----
export const toggleLiveDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    const { roomName } = req.params;
    const { isDonationEnabled } = req.body;

    if (!admin) {
      throw new ApiError(401, 'कृपया लॉगिन करें');
    }

    const session = await LiveSession.findOne({
      roomName,
      ...(admin.role === 'SUPERADMIN' ? {} : { hostAdmin: admin._id }),
    });

    if (!session) {
      throw new ApiError(404, 'लाइव सत्र नहीं मिला');
    }

    session.isDonationEnabled = Boolean(isDonationEnabled);
    await session.save();

    emitDonationStatusUpdate(roomName, session.isDonationEnabled);

    return sendResponse(
      res,
      200,
      session.isDonationEnabled ? 'दान सेवा चालू कर दी गई' : 'दान सेवा बंद कर दी गई',
      { isDonationEnabled: session.isDonationEnabled }
    );
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: Get ephemeral recent comments from Redis ----
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

// ---- PUBLIC / ADMIN: Get Global Settings ----
export const getGlobalSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await getGlobalSettingDoc();
    return sendResponse(res, 200, 'वैश्विक सेटिंग्स', setting);
  } catch (err) {
    next(err);
  }
};

// ---- SUPER ADMIN ONLY: Update Global Settings (Toggle Payment/Chat Globally) ----
export const updateGlobalSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const superAdmin = req.user;
    if (!superAdmin || superAdmin.role !== 'SUPERADMIN') {
      throw new ApiError(403, 'केवल मुख्य व्यवस्थापक (Super Admin) ही वैश्विक सेटिंग्स बदल सकते हैं');
    }

    const { isDonationEnabled, isLiveChatEnabled, announcement } = req.body;
    const setting = await getGlobalSettingDoc();

    if (isDonationEnabled !== undefined) setting.isDonationEnabled = Boolean(isDonationEnabled);
    if (isLiveChatEnabled !== undefined) setting.isLiveChatEnabled = Boolean(isLiveChatEnabled);
    if (announcement !== undefined) setting.announcement = String(announcement).trim();
    setting.updatedBy = superAdmin.name;

    await setting.save();

    return sendResponse(res, 200, 'वैश्विक सेटिंग्स सफलतापूर्वक अपडेट की गईं', setting);
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN / OVERVIEW: Get Broadcast History & Viewers Analytics ----
export const getBroadcastHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
    const skip = (page - 1) * limit;

    const [history, total, stats] = await Promise.all([
      LiveSession.find({ status: { $in: ['live', 'ended'] } })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('hostAdmin', 'name email avatar')
        .lean(),
      LiveSession.countDocuments({ status: { $in: ['live', 'ended'] } }),
      LiveSession.aggregate([
        { $match: { status: { $in: ['live', 'ended'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
            dailyPeak: { $max: '$peakViewers' },
            sessionCount: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 14 },
      ]),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };

    return sendResponse(
      res,
      200,
      'लाइव प्रसारण इतिहास एवं दर्शक सांख्यिकी',
      {
        history,
        dailyStats: stats,
      },
      pagination
    );
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN / AUDIT: Get Per-Broadcast Logs (Chat History & Donations Stream) ----
export const getSessionLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomName } = req.params;
    if (!roomName) {
      throw new ApiError(400, 'रूम नाम आवश्यक है');
    }

    const [session, donations, messages] = await Promise.all([
      LiveSession.findOne({ roomName }).populate('hostAdmin', 'name email avatar').lean(),
      Donation.find({ liveSessionRoomName: roomName, status: 'paid' }).sort({ createdAt: -1 }).lean(),
      LiveMessage.find({ roomName }).sort({ createdAt: 1 }).lean(),
    ]);

    if (!session) {
      throw new ApiError(404, 'लाइव सत्र नहीं मिला');
    }

    const totalDonationAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    return sendResponse(res, 200, 'सत्र लॉग्स, चैट एवं दान विवरण', {
      session,
      donations,
      totalDonationAmount,
      totalDonationCount: donations.length,
      messages,
      totalMessagesCount: messages.length,
    });
  } catch (err) {
    next(err);
  }
};
