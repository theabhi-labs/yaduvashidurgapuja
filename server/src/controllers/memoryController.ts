import { Request, Response, NextFunction } from 'express';
import { Memory, IMemory } from '../models/Memory';
import { User } from '../models/User';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { ImageService } from '../services/imageService';
import { logger } from '../utils/logger';
import escapeRegExp from 'lodash.escaperegexp';
import { registerUniqueImpression } from '../config/redis';
import { AnalyticsService } from '../services/analyticsService';

export class MemoryController {
  /**
   * Get public memories feed
   * GET /api/memories?page=1&limit=12&year=2024&search=
   */
  public static async getMemories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
      const skip = (page - 1) * limit;

      const query: any = { status: 'published' };

      // Optional filter by year
      if (req.query.year) {
        const year = parseInt(req.query.year as string);
        if (!isNaN(year)) {
          query.year = year;
        }
      }

      // Optional search by caption or contributor name/@username
      if (req.query.search && typeof req.query.search === 'string') {
        const rawSearch = req.query.search.trim();
        const cleanSearch = rawSearch.startsWith('@') ? rawSearch.slice(1) : rawSearch;
        const searchStr = escapeRegExp(cleanSearch);

        if (searchStr.length > 0) {
          const matchingUsers = await User.find({
            $or: [
              { name: { $regex: searchStr, $options: 'i' } },
              { username: { $regex: searchStr, $options: 'i' } },
            ],
          }).select('_id');

          const userIds = matchingUsers.map((u: any) => u._id);

          query.$or = [
            { caption: { $regex: searchStr, $options: 'i' } },
            { userId: { $in: userIds } },
          ];
        }
      }

      const [memories, total] = await Promise.all([
        Memory.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name username avatar')
          .lean(),
        Memory.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return sendResponse(
        res,
        200,
        'स्मृतियाँ प्राप्त हुईं',
        memories,
        {
          page,
          limit,
          total,
          totalPages,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single Memory
   * GET /api/memories/:id
   */
  public static async getMemoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const memory = await Memory.findById(id).populate('userId', 'name username avatar');

      if (!memory || memory.status === 'deleted') {
        throw new ApiError(404, 'स्मृति नहीं मिली या हटा दी गई है');
      }

      // If hidden, only owner or admin can view
      if (memory.status === 'hidden') {
        const isOwner = req.user && req.user._id.toString() === memory.userId._id.toString();
        const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN');

        if (!isOwner && !isAdmin) {
          throw new ApiError(404, 'यह स्मृति वर्तमान में समीक्षाधीन या छिपी हुई है');
        }
      }

      return sendResponse(res, 200, 'स्मृति विवरण', memory);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record memory card impression (deduplicated per user/visitor/IP with 24h window)
   * POST /api/memories/:id/impression
   */
  public static async recordImpression(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const visitorId = (req.body && req.body.visitorId) || (req.headers['x-visitor-id'] as string);
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userId = req.user ? req.user._id.toString() : '';

      const memory = await Memory.findById(id);
      if (!memory || memory.status === 'deleted') {
        throw new ApiError(404, 'स्मृति नहीं मिली');
      }

      // Check if current user is the uploader (author views are not counted towards public views)
      const isAuthor = Boolean(userId && memory.userId && memory.userId.toString() === userId);

      let currentImpressions = memory.impressions || 0;

      if (!isAuthor) {
        // Unique viewer identifier: user ID > visitor token > IP hash
        const viewerKey = userId
          ? `u_${userId}`
          : visitorId && visitorId.length > 5
          ? `v_${visitorId}`
          : `ip_${AnalyticsService.hashIp(clientIp)}`;

        // Check if this viewer has already viewed this memory in the last 24 hours
        const isNewUniqueView = await registerUniqueImpression('memory', id, viewerKey, 86400);

        if (isNewUniqueView) {
          const updated = await Memory.findByIdAndUpdate(
            id,
            { $inc: { impressions: 1 } },
            { new: true, select: '_id impressions' }
          );
          if (updated) {
            currentImpressions = updated.impressions;
          }
        }
      }

      return sendResponse(res, 200, 'अवलोकन दर्ज किया गया', { impressions: currentImpressions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create New Memory
   * POST /api/memories (multipart: images/image, caption, year)
   */
  public static async createMemory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया लॉगिन करें');
      }

      // Extract all uploaded files (supports both array 'images' and single 'image')
      let files: Express.Multer.File[] = [];

      if (req.files) {
        if (Array.isArray(req.files)) {
          files = req.files;
        } else {
          const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };
          if (filesObj['images'] && filesObj['images'].length > 0) {
            files = filesObj['images'];
          } else if (filesObj['image'] && filesObj['image'].length > 0) {
            files = filesObj['image'];
          }
        }
      } else if (req.file) {
        files = [req.file];
      }

      if (files.length === 0) {
        throw new ApiError(400, 'कृपया कम से कम एक स्मृति चित्र (फोटो) चुनें');
      }

      if (files.length > 10) {
        throw new ApiError(400, 'एक पोस्ट में अधिकतम 10 चित्र (तस्वीरें) ही अपलोड की जा सकती हैं');
      }

      const { caption, year } = req.body;

      // Process all images concurrently using Sharp with EXIF stripping and webp generation
      const processedImages = await Promise.all(
        files.map((file) => ImageService.processMemoryImage(file.buffer))
      );

      const memory = await Memory.create({
        userId: req.user._id,
        imageUrl: processedImages[0].imageUrl,
        thumbnailUrl: processedImages[0].thumbnailUrl,
        images: processedImages.map((img) => ({
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl,
        })),
        caption,
        year: parseInt(year, 10),
        status: 'published',
      });

      const populatedMemory = await Memory.findById(memory._id).populate('userId', 'name username avatar');

      logger.info(`New memory with ${files.length} photo(s) uploaded by user: ${req.user.email} (Year: ${year})`);

      return sendResponse(
        res,
        201,
        'आपकी स्मृति सफलतापूर्वक सहेजी गई है! माँ दुर्गा का आशीर्वाद बना रहे।',
        populatedMemory
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Logged In User's Memories
   * GET /api/memories/my
   */
  public static async getMyMemories(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया लॉगिन करें');
      }

      const memories = await Memory.find({
        userId: req.user._id,
        status: { $ne: 'deleted' },
      })
        .sort({ createdAt: -1 })
        .populate('userId', 'name username avatar');

      return sendResponse(res, 200, 'आपकी स्मृतियाँ', memories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Memory (Owner or Admin)
   * PATCH /api/memories/:id
   */
  public static async updateMemory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया लॉगिन करें');
      }

      const { id } = req.params;
      const { caption, year, status } = req.body;

      const memory = await Memory.findById(id);
      if (!memory || memory.status === 'deleted') {
        throw new ApiError(404, 'स्मृति नहीं मिली');
      }

      const isOwner = memory.userId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN';

      if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'आप केवल अपनी ही स्मृति को संपादित कर सकते हैं');
      }

      if (caption !== undefined) memory.caption = caption;
      if (year !== undefined) memory.year = parseInt(year, 10);
      if (status !== undefined && (isAdmin || isOwner)) {
        // Users can set published/hidden, admins can set any status
        memory.status = status;
      }

      await memory.save();
      const updated = await Memory.findById(memory._id).populate('userId', 'name avatar');

      return sendResponse(res, 200, 'स्मृति सफलतापूर्वक अपडेट की गई', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Memory (Owner, Admin or SuperAdmin)
   * DELETE /api/memories/:id
   */
  public static async deleteMemory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया लॉगिन करें');
      }

      const { id } = req.params;
      const memory = await Memory.findById(id);
      if (!memory) {
        // If already deleted from DB, return success cleanly
        return sendResponse(res, 200, 'स्मृति सफलतापूर्वक हटा दी गई');
      }

      const isOwner = memory.userId ? memory.userId.toString() === req.user._id.toString() : false;
      const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN';

      if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'आप केवल अपनी ही स्मृति को हटा सकते हैं');
      }

      // Safely clean up storage files without failing the DB deletion
      try {
        const filesToDelete = [memory.imageUrl, memory.thumbnailUrl].filter(Boolean) as string[];
        if (filesToDelete.length > 0) {
          await ImageService.deleteImageFiles(filesToDelete);
        }
      } catch (fileErr) {
        logger.warn(`Storage file cleanup error for memory ${id}:`, fileErr);
      }

      // Remove record from database permanently
      await Memory.findByIdAndDelete(id);

      logger.info(`Memory ${id} permanently deleted by ${req.user.email} (Role: ${req.user.role})`);

      return sendResponse(res, 200, 'स्मृति सफलतापूर्वक हटा दी गई');
    } catch (error) {
      next(error);
    }
  }
}
