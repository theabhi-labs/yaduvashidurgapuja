import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Memory } from '../models/Memory';
import { Report } from '../models/Report';
import { CommitteeMember } from '../models/CommitteeMember';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { ImageService } from '../services/imageService';
import { AnalyticsService } from '../services/analyticsService';
import { logger } from '../utils/logger';
import escapeRegExp from 'lodash.escaperegexp';

export class AdminController {
  /**
   * Get overall dashboard statistics (SUPERADMIN only)
   * GET /api/admin/stats
   */
  public static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'SUPERADMIN') {
        throw new ApiError(
          403,
          'डैशबोर्ड सांख्यिकी एवं अवलोकन (Overview) केवल मुख्य व्यवस्थापक (Super Admin) के लिए उपलब्ध है'
        );
      }

      const [
        totalUsers,
        verifiedUsers,
        suspendedUsers,
        totalMemories,
        publishedMemories,
        hiddenMemories,
        pendingReports,
        totalReports,
        committeeMembers,
        visitorStats,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isEmailVerified: true }),
        User.countDocuments({ isSuspended: true }),
        Memory.countDocuments(),
        Memory.countDocuments({ status: 'published' }),
        Memory.countDocuments({ status: 'hidden' }),
        Report.countDocuments({ status: 'pending' }),
        Report.countDocuments(),
        CommitteeMember.countDocuments(),
        AnalyticsService.getVisitorAnalytics(),
      ]);

      const stats = {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          suspended: suspendedUsers,
        },
        memories: {
          total: totalMemories,
          published: publishedMemories,
          hidden: hiddenMemories,
        },
        reports: {
          pending: pendingReports,
          total: totalReports,
        },
        committee: {
          total: committeeMembers,
        },
        visitors: visitorStats,
      };

      return sendResponse(res, 200, 'व्यवस्थापक सांख्यिकी', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with pagination and search
   * GET /api/admin/users
   */
  public static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const skip = (page - 1) * limit;

      const query: any = {};
      if (req.query.search && typeof req.query.search === 'string') {
        const sanitizedSearch = escapeRegExp(req.query.search.trim());
        if (sanitizedSearch.length > 0) {
          query.$or = [
            { name: { $regex: sanitizedSearch, $options: 'i' } },
            { email: { $regex: sanitizedSearch, $options: 'i' } },
          ];
        }
      }

      if (req.query.role) {
        query.role = req.query.role;
      }

      if (req.query.isSuspended !== undefined) {
        query.isSuspended = req.query.isSuspended === 'true';
      }

      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return sendResponse(res, 200, 'उपयोगकर्ताओं की सूची', users, {
        page,
        limit,
        total,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role (Promote to ADMIN / Demote to USER) - SUPERADMIN only
   * PATCH /api/admin/users/:id/role
   */
  public static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['USER', 'ADMIN'].includes(role)) {
        throw new ApiError(400, 'अमान्य भूमिका। केवल USER अथवा ADMIN चुना जा सकता है।');
      }

      const user = await User.findById(id);
      if (!user) {
        throw new ApiError(404, 'उपयोगकर्ता नहीं मिला');
      }

      if (user.role === 'SUPERADMIN') {
        throw new ApiError(403, 'मुख्य व्यवस्थापक (Super Admin) की भूमिका बदली नहीं जा सकती');
      }

      if (user._id.toString() === req.user?._id.toString()) {
        throw new ApiError(400, 'आप अपनी स्वयं की भूमिका नहीं बदल सकते');
      }

      const oldRole = user.role;
      user.role = role;
      await user.save();

      logger.info(`User role updated: ${user.email} (${oldRole} -> ${role}) by Superadmin ${req.user?.email}`);

      return sendResponse(
        res,
        200,
        role === 'ADMIN'
          ? `उपयोगकर्ता '${user.name}' को सफलतापूर्वक व्यवस्थापक (Admin) बनाया गया`
          : `उपयोगकर्ता '${user.name}' की भूमिका बदलकर सामान्य भक्त (User) कर दी गई`,
        user
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspend / Unsuspend user
   * PATCH /api/admin/users/:id/suspend
   */
  public static async toggleUserSuspension(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isSuspended, suspensionReason } = req.body;

      const user = await User.findById(id);
      if (!user) {
        throw new ApiError(404, 'उपयोगकर्ता नहीं मिला');
      }

      if (user.role === 'SUPERADMIN') {
        throw new ApiError(403, 'मुख्य व्यवस्थापक (Super Admin) को निलंबित नहीं किया जा सकता');
      }

      if (user.role === 'ADMIN' && req.user?.role !== 'SUPERADMIN' && isSuspended) {
        throw new ApiError(403, 'व्यवस्थापक (Admin) को केवल मुख्य व्यवस्थापक (Super Admin) निलंबित कर सकते हैं');
      }

      user.isSuspended = isSuspended;
      user.suspensionReason = isSuspended ? suspensionReason || 'नियमों के उल्लंघन के कारण' : '';
      await user.save();

      logger.info(`User ${user.email} suspension state updated: ${isSuspended}`);

      return sendResponse(
        res,
        200,
        user.isSuspended ? 'उपयोगकर्ता खाता निलंबित कर दिया गया' : 'उपयोगकर्ता खाता बहाल कर दिया गया',
        user
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all memories with full moderation control
   * GET /api/admin/memories
   */
  public static async getAllMemories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const skip = (page - 1) * limit;

      const query: any = {};
      if (req.query.status) {
        query.status = req.query.status;
      }
      if (req.query.year) {
        query.year = parseInt(req.query.year as string);
      }
      if (req.query.search && typeof req.query.search === 'string') {
        const sanitizedSearch = escapeRegExp(req.query.search.trim());
        if (sanitizedSearch.length > 0) {
          query.caption = { $regex: sanitizedSearch, $options: 'i' };
        }
      }

      const [memories, total] = await Promise.all([
        Memory.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email avatar')
          .lean(),
        Memory.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return sendResponse(res, 200, 'सभी स्मृतियों की सूची', memories, {
        page,
        limit,
        total,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change memory status (published, hidden, deleted)
   * PATCH /api/admin/memories/:id/status
   */
  public static async updateMemoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const memory = await Memory.findById(id);
      if (!memory) {
        throw new ApiError(404, 'स्मृति नहीं मिली');
      }

      memory.status = status;
      await memory.save();

      return sendResponse(res, 200, `स्मृति की स्थिति बदलकर '${status}' कर दी गई`, memory);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reports
   * GET /api/admin/reports
   */
  public static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const skip = (page - 1) * limit;

      const query: any = {};
      if (req.query.status) {
        query.status = req.query.status;
      }

      const [reports, total] = await Promise.all([
        Report.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('reporterId', 'name email avatar')
          .populate({
            path: 'memoryId',
            populate: { path: 'userId', select: 'name email' },
          })
          .lean(),
        Report.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return sendResponse(res, 200, 'रिपोर्ट सूची', reports, {
        page,
        limit,
        total,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process report and take action
   * PATCH /api/admin/reports/:id
   */
  public static async handleReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminNotes, action } = req.body;

      const report = await Report.findById(id).populate('memoryId');
      if (!report) {
        throw new ApiError(404, 'रिपोर्ट नहीं मिली');
      }

      if (status) report.status = status;
      if (adminNotes) report.adminNotes = adminNotes;

      // Handle moderation action
      if (action === 'hide_memory' && report.memoryId) {
        await Memory.findByIdAndUpdate(report.memoryId._id, { status: 'hidden' });
      } else if (action === 'delete_memory' && report.memoryId) {
        const mem = await Memory.findById(report.memoryId._id);
        if (mem) {
          await ImageService.deleteImageFiles([mem.imageUrl, mem.thumbnailUrl]);
          await Memory.findByIdAndDelete(mem._id);
        }
      }

      await report.save();

      return sendResponse(res, 200, 'रिपोर्ट की स्थिति अपडेट की गई', report);
    } catch (error) {
      next(error);
    }
  }
}
