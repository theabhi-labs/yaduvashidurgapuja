import { Request, Response, NextFunction } from 'express';
import { Ad } from '../models/Ad';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { ImageService } from '../services/imageService';
import { logger } from '../utils/logger';
import { registerUniqueImpression } from '../config/redis';
import { AnalyticsService } from '../services/analyticsService';

export class AdController {
  /**
   * Get all currently active in-feed ads
   * GET /api/ads/active
   */
  public static async getActiveAds(_req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();

      const query: any = {
        isActive: true,
        $and: [
          {
            $or: [
              { startDate: null },
              { startDate: { $exists: false } },
              { startDate: { $lte: now } },
            ],
          },
          {
            $or: [
              { endDate: null },
              { endDate: { $exists: false } },
              { endDate: { $gte: now } },
            ],
          },
        ],
      };

      const ads = await Ad.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .lean();

      return sendResponse(res, 200, 'Active ads retrieved successfully', ads);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record Ad click counter (public, fire-and-forget for fast client response)
   * POST /api/ads/:id/click
   */
  public static async recordClick(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(400, 'Ad ID is required');
      }

      // Fire and forget increment
      Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } })
        .exec()
        .catch((err) => logger.warn(`Failed to track ad click for ${id}:`, err));

      return sendResponse(res, 200, 'Click recorded', null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record Ad impression counter (public, deduplicated per viewer)
   * POST /api/ads/:id/impression
   */
  public static async recordImpression(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const visitorId = (req.body && req.body.visitorId) || (req.headers['x-visitor-id'] as string);
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userId = req.user ? req.user._id.toString() : '';

      if (!id) {
        throw new ApiError(400, 'Ad ID is required');
      }

      const viewerKey = userId
        ? `u_${userId}`
        : visitorId && visitorId.length > 5
        ? `v_${visitorId}`
        : `ip_${AnalyticsService.hashIp(clientIp)}`;

      const isNewUnique = await registerUniqueImpression('ad', id, viewerKey, 86400);

      if (isNewUnique) {
        Ad.findByIdAndUpdate(id, { $inc: { impressions: 1 } })
          .exec()
          .catch((err) => logger.warn(`Failed to track ad impression for ${id}:`, err));
      }

      return sendResponse(res, 200, 'Impression recorded', null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all ads with analytics (Impressions, Clicks, CTR)
   * GET /api/admin/ads
   */
  public static async getAllAds(_req: Request, res: Response, next: NextFunction) {
    try {
      const ads = await Ad.find().sort({ priority: -1, createdAt: -1 }).lean();
      return sendResponse(res, 200, 'All ads retrieved successfully', ads);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new native in-feed ad
   * POST /api/admin/ads
   */
  public static async createAd(req: Request, res: Response, next: NextFunction) {
    try {
      let imageUrl = req.body.imageUrl;

      if (req.file) {
        imageUrl = await ImageService.processAdImage(req.file.buffer);
      }

      if (!imageUrl) {
        throw new ApiError(400, 'Ad image is required. Please upload an image.');
      }

      const {
        title,
        linkUrl,
        sponsorName,
        priority = 0,
        isActive = true,
        startDate,
        endDate,
      } = req.body;

      if (!title || !linkUrl || !sponsorName) {
        throw new ApiError(400, 'Title, destination link URL, and sponsor name are required.');
      }

      const ad = await Ad.create({
        title: title.trim(),
        imageUrl,
        linkUrl: linkUrl.trim(),
        sponsorName: sponsorName.trim(),
        priority: Number(priority) || 0,
        isActive: isActive === 'true' || isActive === true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      });

      logger.info(`New in-feed ad created: "${ad.title}" by sponsor "${ad.sponsorName}"`);
      return sendResponse(res, 201, 'Ad created successfully', ad);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing ad
   * PATCH /api/admin/ads/:id
   */
  public static async updateAd(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ad = await Ad.findById(id);

      if (!ad) {
        throw new ApiError(404, 'Ad not found');
      }

      let imageUrl = ad.imageUrl;

      if (req.file) {
        const newImageUrl = await ImageService.processAdImage(req.file.buffer);
        // Clean up old image if changed
        if (ad.imageUrl && ad.imageUrl !== newImageUrl) {
          ImageService.deleteImageFiles([ad.imageUrl]).catch((err) =>
            logger.warn('Failed to delete old ad image:', err)
          );
        }
        imageUrl = newImageUrl;
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
      }

      const { title, linkUrl, sponsorName, priority, isActive, startDate, endDate } = req.body;

      if (title !== undefined) ad.title = title.trim();
      if (linkUrl !== undefined) ad.linkUrl = linkUrl.trim();
      if (sponsorName !== undefined) ad.sponsorName = sponsorName.trim();
      if (priority !== undefined) ad.priority = Number(priority) || 0;
      if (isActive !== undefined) ad.isActive = isActive === 'true' || isActive === true;
      if (startDate !== undefined) ad.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) ad.endDate = endDate ? new Date(endDate) : null;
      ad.imageUrl = imageUrl;

      await ad.save();

      logger.info(`Ad updated: "${ad.title}" (${ad._id})`);
      return sendResponse(res, 200, 'Ad updated successfully', ad);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete an ad
   * DELETE /api/admin/ads/:id
   */
  public static async deleteAd(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ad = await Ad.findById(id);

      if (!ad) {
        throw new ApiError(404, 'Ad not found');
      }

      if (ad.imageUrl) {
        ImageService.deleteImageFiles([ad.imageUrl]).catch((err) =>
          logger.warn('Failed to delete ad image file:', err)
        );
      }

      await Ad.findByIdAndDelete(id);

      logger.info(`Ad deleted: "${ad.title}" (${id})`);
      return sendResponse(res, 200, 'Ad deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}
