import { Request, Response, NextFunction } from 'express';
import { HeroBanner } from '../models/HeroBanner';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { ImageService } from '../services/imageService';
import { logger } from '../utils/logger';

export class HeroBannerController {
  /**
   * Get all currently active hero banners for public homepage carousel
   * GET /api/hero-banners/active
   */
  public static async getActiveBanners(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await HeroBanner.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return sendResponse(res, 200, 'Active hero banners retrieved successfully', banners);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get all hero banners for management
   * GET /api/hero-banners
   */
  public static async getAllBanners(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await HeroBanner.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return sendResponse(res, 200, 'All hero banners retrieved successfully', banners);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new hero banner with image upload
   * POST /api/hero-banners
   */
  public static async createBanner(req: Request, res: Response, next: NextFunction) {
    try {
      let imageUrl = req.body.imageUrl;

      if (req.file) {
        imageUrl = await ImageService.processHeroBannerImage(req.file.buffer);
      }

      if (!imageUrl) {
        throw new ApiError(400, 'बैनर का चित्र आवश्यक है। कृपया एक फोटो अपलोड करें।');
      }

      const { title, badge, subtext, order = 0, isActive = true } = req.body;

      if (!title || !title.trim()) {
        throw new ApiError(400, 'बैनर का मुख्य शीर्षक आवश्यक है।');
      }

      const banner = await HeroBanner.create({
        title: title.trim(),
        badge: badge ? badge.trim() : 'कपूरिपुर पावन धाम',
        subtext: subtext ? subtext.trim() : undefined,
        imageUrl,
        order: Number(order) || 0,
        isActive: isActive === 'true' || isActive === true,
      });

      logger.info(`New Hero Banner created: "${banner.title}" (ID: ${banner._id})`);
      return sendResponse(res, 201, 'नया हीरो बैनर सफलतापूर्वक जोड़ा गया', banner);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing hero banner
   * PATCH /api/hero-banners/:id
   */
  public static async updateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const banner = await HeroBanner.findById(id);

      if (!banner) {
        throw new ApiError(404, 'हीरो बैनर नहीं मिला');
      }

      let imageUrl = banner.imageUrl;

      if (req.file) {
        const newImageUrl = await ImageService.processHeroBannerImage(req.file.buffer);
        // Clean up old image if changed
        if (banner.imageUrl && banner.imageUrl !== newImageUrl && !banner.imageUrl.startsWith('/hero-durga')) {
          ImageService.deleteImageFiles([banner.imageUrl]).catch((err) =>
            logger.warn('Failed to delete old banner image:', err)
          );
        }
        imageUrl = newImageUrl;
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
      }

      const { title, badge, subtext, order, isActive } = req.body;

      if (title !== undefined) banner.title = title.trim();
      if (badge !== undefined) banner.badge = badge.trim();
      if (subtext !== undefined) banner.subtext = subtext ? subtext.trim() : '';
      if (imageUrl !== undefined) banner.imageUrl = imageUrl;
      if (order !== undefined) banner.order = Number(order) || 0;
      if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

      await banner.save();

      logger.info(`Hero Banner updated: "${banner.title}" (ID: ${banner._id})`);
      return sendResponse(res, 200, 'हीरो बैनर सफलतापूर्वक अपडेट किया गया', banner);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Toggle banner active state
   * PATCH /api/hero-banners/:id/toggle
   */
  public static async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const banner = await HeroBanner.findById(id);

      if (!banner) {
        throw new ApiError(404, 'हीरो बैनर नहीं मिला');
      }

      banner.isActive = !banner.isActive;
      await banner.save();

      return sendResponse(
        res,
        200,
        `बैनर अब ${banner.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'} है`,
        banner
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete a hero banner
   * DELETE /api/hero-banners/:id
   */
  public static async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const banner = await HeroBanner.findById(id);

      if (!banner) {
        throw new ApiError(404, 'हीरो बैनर नहीं मिला');
      }

      if (banner.imageUrl && !banner.imageUrl.startsWith('/hero-durga')) {
        ImageService.deleteImageFiles([banner.imageUrl]).catch((err) =>
          logger.warn('Failed to delete banner image file:', err)
        );
      }

      await HeroBanner.findByIdAndDelete(id);

      logger.info(`Hero Banner deleted: "${banner.title}" (ID: ${id})`);
      return sendResponse(res, 200, 'हीरो बैनर सफलतापूर्वक हटा दिया गया');
    } catch (error) {
      next(error);
    }
  }
}
