import crypto from 'crypto';
import { VisitorSession } from '../models/VisitorSession';
import { logger } from '../utils/logger';

export interface DailyStat {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface PopularPage {
  path: string;
  title: string;
  views: number;
}

export interface VisitorAnalyticsData {
  liveActive: number;
  todayVisitors: number;
  totalVisitors: number;
  totalPageViews: number;
  dailyStats: DailyStat[];
  popularPages: PopularPage[];
}

export class AnalyticsService {
  /**
   * Helper to get today's date in YYYY-MM-DD (IST timezone)
   */
  public static getTodayDateString(offsetDays: number = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Anonymize client IP using SHA-256 hash
   */
  public static hashIp(ip: string): string {
    const salt = process.env.JWT_SECRET || 'durgapujakapooripur_salt';
    return crypto.createHash('sha256').update(`${ip}_${salt}`).digest('hex').substring(0, 32);
  }

  /**
   * Record or update visitor heartbeat
   */
  public static async recordHeartbeat(
    visitorId: string,
    rawIp: string,
    path: string = '/',
    userAgent: string = ''
  ): Promise<{ success: boolean; visitorId: string }> {
    try {
      const today = this.getTodayDateString(0);
      const ipHash = this.hashIp(rawIp);
      const cleanPath = (path || '/').split('?')[0].trim().substring(0, 100);
      const cleanUa = (userAgent || '').substring(0, 150);

      await VisitorSession.findOneAndUpdate(
        { visitorId, date: today },
        {
          $set: {
            lastActive: new Date(),
            path: cleanPath,
            userAgent: cleanUa,
            ipHash,
          },
          $inc: { pageViews: 1 },
          $setOnInsert: {
            firstSeen: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      return { success: true, visitorId };
    } catch (error) {
      logger.error('Failed to record visitor heartbeat:', error);
      return { success: false, visitorId };
    }
  }

  /**
   * Get real-time live active users count
   */
  public static async getLiveActiveCount(): Promise<number> {
    const activeThreshold = new Date(Date.now() - 2.5 * 60 * 1000); // active in last 2.5 minutes
    const count = await VisitorSession.countDocuments({
      lastActive: { $gte: activeThreshold },
    });
    return count;
  }

  /**
   * Get comprehensive visitor analytics for admin dashboard
   */
  public static async getVisitorAnalytics(): Promise<VisitorAnalyticsData> {
    const today = this.getTodayDateString(0);

    // 1. Live Active Visitors (last 2.5 minutes)
    const liveActive = await this.getLiveActiveCount();

    // 2. Today's unique visitors
    const todayVisitors = await VisitorSession.countDocuments({ date: today });

    // 3. All-time unique visitors (distinct visitorId)
    const distinctVisitors = await VisitorSession.distinct('visitorId');
    const totalVisitors = Math.max(distinctVisitors.length, todayVisitors);

    // 4. Total Page Views aggregation
    const viewsAgg = await VisitorSession.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$pageViews' },
        },
      },
    ]);
    const totalPageViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    // 5. 7-Day History
    const past7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      past7Days.push(this.getTodayDateString(-i));
    }

    const dailyAgg = await VisitorSession.aggregate([
      {
        $match: {
          date: { $in: past7Days },
        },
      },
      {
        $group: {
          _id: '$date',
          visitors: { $sum: 1 },
          pageViews: { $sum: '$pageViews' },
        },
      },
    ]);

    const dailyMap = new Map<string, { visitors: number; pageViews: number }>();
    dailyAgg.forEach((item) => {
      dailyMap.set(item._id, { visitors: item.visitors, pageViews: item.pageViews });
    });

    const dailyStats: DailyStat[] = past7Days.map((d) => {
      const data = dailyMap.get(d) || { visitors: 0, pageViews: 0 };
      return {
        date: d,
        visitors: data.visitors,
        pageViews: data.pageViews,
      };
    });

    // 6. Popular Pages
    const popularAgg = await VisitorSession.aggregate([
      {
        $group: {
          _id: '$path',
          views: { $sum: '$pageViews' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 6 },
    ]);

    const pathTitles: Record<string, string> = {
      '/': 'मुख्य पृष्ठ (Home)',
      '/memories': 'स्मृतियाँ संचय (Memories Archive)',
      '/committee': 'समिति सदस्य (Committee)',
      '/about': 'हमारे बारे में (About)',
      '/contact': 'संपर्क करें (Contact)',
      '/share-memory': 'स्मृति साझा करें (Share Memory)',
      '/privacy': 'गोपनीयता नीति (Privacy Policy)',
      '/terms': 'नियम व शर्तें (Terms)',
    };

    const popularPages: PopularPage[] = popularAgg.map((item) => ({
      path: item._id || '/',
      title: pathTitles[item._id] || item._id || 'अन्य पृष्ठ',
      views: item.views,
    }));

    return {
      liveActive,
      todayVisitors,
      totalVisitors,
      totalPageViews,
      dailyStats,
      popularPages,
    };
  }
}
