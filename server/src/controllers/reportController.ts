import { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { Memory } from '../models/Memory';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export class ReportController {
  /**
   * Create a report for a memory
   * POST /api/reports
   */
  public static async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया रिपोर्ट करने के लिए लॉगिन करें');
      }

      const { memoryId, reason, description } = req.body;

      // Verify memory exists
      const memory = await Memory.findById(memoryId);
      if (!memory) {
        throw new ApiError(404, 'स्मृति नहीं मिली');
      }

      // Check if user already reported this memory
      const existingReport = await Report.findOne({
        memoryId,
        reporterId: req.user._id,
      });

      if (existingReport) {
        throw new ApiError(400, 'आप इस स्मृति की रिपोर्ट पहले ही दर्ज कर चुके हैं। समिति द्वारा इसकी समीक्षा की जा रही है।');
      }

      const report = await Report.create({
        memoryId,
        reporterId: req.user._id,
        reason,
        description: description || '',
        status: 'pending',
      });

      logger.info(`Memory ${memoryId} reported by user ${req.user.email} (Reason: ${reason})`);

      return sendResponse(
        res,
        201,
        'आपकी रिपोर्ट प्राप्त हो गई है। हमारी समिति इसकी शीघ्र समीक्षा करेगी। धन्यवाद।',
        report
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current User's Submitted Reports
   * GET /api/reports/my
   */
  public static async getMyReports(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'कृपया लॉगिन करें');
      }

      const reports = await Report.find({ reporterId: req.user._id })
        .populate('memoryId', 'caption year imageUrl status')
        .sort({ createdAt: -1 });

      return sendResponse(res, 200, 'आपकी रिपोर्ट सूची', reports);
    } catch (error) {
      next(error);
    }
  }
}
