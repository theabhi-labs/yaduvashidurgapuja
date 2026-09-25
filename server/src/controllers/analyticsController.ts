import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { sendResponse } from '../utils/apiResponse';
import crypto from 'crypto';

export class AnalyticsController {
  /**
   * Heartbeat ping from clients to register active status and page views
   * POST /api/analytics/heartbeat
   */
  public static async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      let { visitorId, path } = req.body;

      if (!visitorId || typeof visitorId !== 'string' || visitorId.length < 5) {
        visitorId = 'v_' + crypto.randomBytes(12).toString('hex');
      }

      const rawIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      const result = await AnalyticsService.recordHeartbeat(
        visitorId,
        rawIp,
        path || '/',
        userAgent
      );

      return sendResponse(res, 200, 'Heartbeat recorded', {
        visitorId: result.visitorId,
        recorded: result.success,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time live traffic summary (Admin only or fast polling)
   * GET /api/analytics/live
   */
  public static async getLiveTraffic(_req: Request, res: Response, next: NextFunction) {
    try {
      const liveActive = await AnalyticsService.getLiveActiveCount();
      const today = AnalyticsService.getTodayDateString(0);
      return sendResponse(res, 200, 'Live traffic status', {
        liveActive,
        date: today,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
