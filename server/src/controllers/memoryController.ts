import { Request, Response, NextFunction } from 'express';
import { Memory, IMemory } from '../models/Memory';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { ImageService } from '../services/imageService';
import { logger } from '../utils/logger';

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

      // Optional search by caption
      if (req.query.search && typeof req.query.search === 'string') {
        const searchStr = req.query.search.trim();
        if (searchStr.length > 0) {
          query.caption = { $regex: searchStr, $options: 'i' };
        }
      }

      const [memories, total] = await Promise.all([
        Memory.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name avatar')
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

      const memory = await Memory.findByIdAndUpdate(
        id,
        { $inc: { impressions: 1 } },
        { new: true }
      ).populate('userId', 'name avatar');

      if (!memory || memory.status === 'deleted') {
        throw new ApiError(404, 'स्मृति नहीं मिली या हटा दी गई है');
      }

      // If hidden, only owner or admin can view
      if (memory.status === 'hidden') {
        const isOwner = req.user && req.user._id.toString() === memory.userId._id.toString();
        const isAdmin = req.user && req.user.role === 'ADMIN';

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
   * Record memory card impression (from feed or list)
   * POST /api/memories/:id/impression
   */
  public static async recordImpression(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const memory = await Memory.findByIdAndUpdate(
        id,
        { $inc: { impressions: 1 } },
        { new: true, select: '_id impressions' }
      );

      if (!memory) {
        throw new ApiError(404, 'स्मृति नहीं मिली');
      }

      return sendResponse(res, 200, 'अवलोकन दर्ज किया गया', { impressions: memory.impressions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create New Memory
   * POST /api/memories (multipart: image, caption, year)
   */
  public static async createMemory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया लॉगिन करें');
      }

      if (!req.file) {
        throw new ApiError(400, 'कृपया स्मृति का चित्र (फोटो) चुनें');
      }

      const { caption, year } = req.body;

      // Process image using Sharp with EXIF stripping and webp generation
      const { imageUrl, thumbnailUrl } = await ImageService.processMemoryImage(req.file.buffer);

      const memory = await Memory.create({
        userId: req.user._id,
        imageUrl,
        thumbnailUrl,
        caption,
        year: parseInt(year, 10),
        status: 'published',
      });

      const populatedMemory = await Memory.findById(memory._id).populate('userId', 'name avatar');

      logger.info(`New memory uploaded by user: ${req.user.email} (Year: ${year})`);

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
        .populate('userId', 'name avatar');

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
      const isAdmin = req.user.role === 'ADMIN';

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
   * Delete Memory (Owner or Admin)
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
        throw new ApiError(404, 'स्मृति नहीं मिली');
      }

      const isOwner = memory.userId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'आप केवल अपनी ही स्मृति को हटा सकते हैं');
      }

      // Clean up files from storage
      await ImageService.deleteImageFiles([memory.imageUrl, memory.thumbnailUrl]);

      // Remove record from database
      await Memory.findByIdAndDelete(id);

      logger.info(`Memory ${id} deleted by ${req.user.email}`);

      return sendResponse(res, 200, 'स्मृति सफलतापूर्वक हटा दी गई');
    } catch (error) {
      next(error);
    }
  }
}
