import crypto from 'crypto';
import { VisitorSession } from '../models/VisitorSession';
import { PageHit } from '../models/PageHit';
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
   * Normalize any client path to its canonical public route
   */
  public static normalizePath(rawPath: string): string {
    if (!rawPath) return '/';
    const clean = rawPath.split('?')[0].split('#')[0].trim();
    if (!clean || clean === '/') return '/';
    if (clean === '/live-darshan' || clean === '/live' || clean === '/darshan') return '/live-darshan';
    if (clean.startsWith('/memories')) return '/memories';
    if (clean === '/committee' || clean.startsWith('/committee')) return '/committee';
    if (clean === '/about' || clean.startsWith('/about')) return '/about';
    if (clean === '/contact' || clean.startsWith('/contact')) return '/contact';
    if (clean === '/share-memory' || clean.startsWith('/share-memory')) return '/share-memory';
    if (clean.startsWith('/privacy')) return '/privacy-policy';
    if (clean.startsWith('/terms')) return '/terms-and-conditions';
    if (clean.startsWith('/contribution')) return '/contribution-policy';
    if (clean.startsWith('/disclaimer')) return '/disclaimer';
    if (clean.startsWith('/admin') || clean.startsWith('/superadmin')) return '/admin';
    return clean;
  }

  /**
   * Anonymize client IP using SHA-256 hash
   */
  public static hashIp(ip: string): string {
    const salt = process.env.JWT_SECRET || 'durgapujakapooripur_salt';
    return crypto.createHash('sha256').update(`${ip}_${salt}`).digest('hex').substring(0, 32);
  }

  /**
   * Record or update visitor heartbeat & per-page hits
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
      const cleanPath = this.normalizePath(path);
      const cleanUa = (userAgent || '').substring(0, 150);

      // 1. Update Visitor Session document
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

      // 2. Increment exact per-page hit counter
      const isRealVisitor = !visitorId.startsWith('visitor_seed_');
      if (isRealVisitor) {
        await PageHit.findOneAndUpdate(
          { date: today, path: cleanPath },
          { $inc: { views: 1 } },
          { upsert: true, new: true }
        );
      }

      return { success: true, visitorId };
    } catch (error) {
      logger.error('Failed to record visitor heartbeat:', error);
      return { success: false, visitorId };
    }
  }

  /**
   * Get real-time live active users count (strictly real human visitors)
   */
  public static async getLiveActiveCount(): Promise<number> {
    const activeThreshold = new Date(Date.now() - 2.5 * 60 * 1000); // active in last 2.5 minutes
    const count = await VisitorSession.countDocuments({
      visitorId: { $not: /^visitor_seed_/ },
      lastActive: { $gte: activeThreshold },
    });
    return count;
  }

  /**
   * Get comprehensive visitor analytics for admin dashboard (100% authentic data)
   */
  public static async getVisitorAnalytics(): Promise<VisitorAnalyticsData> {
    // Purge any legacy dummy seed data if present
    try {
      await VisitorSession.deleteMany({ visitorId: { $regex: /^visitor_seed_/ } });
    } catch {
      // ignore
    }

    const today = this.getTodayDateString(0);
    const realVisitorFilter = { visitorId: { $not: /^visitor_seed_/ } };

    // 1. Live Active Visitors (last 2.5 minutes)
    const liveActive = await this.getLiveActiveCount();

    // 2. Today's unique visitors
    const todayVisitors = await VisitorSession.countDocuments({
      ...realVisitorFilter,
      date: today,
    });

    // 3. All-time unique visitors (distinct visitorId)
    const distinctVisitors = await VisitorSession.distinct('visitorId', realVisitorFilter);
    const totalVisitors = Math.max(distinctVisitors.length, todayVisitors);

    // 4. Total Page Views aggregation
    const viewsAgg = await VisitorSession.aggregate([
      {
        $match: realVisitorFilter,
      },
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
          ...realVisitorFilter,
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

    // 6. Popular Pages - Aggregate from PageHit collection + VisitorSession
    const internalAdminRoutes = [
      '/admin',
      '/superadmin',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-otp',
      '/verify-email',
    ];

    const [pageHitAgg, sessionAgg] = await Promise.all([
      PageHit.aggregate([
        {
          $match: {
            path: { $nin: internalAdminRoutes },
          },
        },
        {
          $group: {
            _id: '$path',
            views: { $sum: '$views' },
          },
        },
        { $sort: { views: -1 } },
      ]),
      VisitorSession.aggregate([
        {
          $match: {
            ...realVisitorFilter,
            path: { $nin: internalAdminRoutes },
          },
        },
        {
          $group: {
            _id: '$path',
            views: { $sum: '$pageViews' },
          },
        },
        { $sort: { views: -1 } },
      ]),
    ]);

    // Merge view counts by path
    const pathViewMap = new Map<string, number>();

    // Seed session counts
    sessionAgg.forEach((item) => {
      const norm = AnalyticsService.normalizePath(item._id);
      if (!internalAdminRoutes.includes(norm)) {
        pathViewMap.set(norm, (pathViewMap.get(norm) || 0) + item.views);
      }
    });

    // Blend PageHit counts
    pageHitAgg.forEach((item) => {
      const norm = AnalyticsService.normalizePath(item._id);
      if (!internalAdminRoutes.includes(norm)) {
        pathViewMap.set(norm, Math.max(pathViewMap.get(norm) || 0, item.views));
      }
    });

    const pathTitles: Record<string, string> = {
      '/': 'मुख्य पृष्ठ (Home)',
      '/live-darshan': 'लाइव दर्शन (Live Darshan)',
      '/memories': 'स्मृतियाँ संचय (Memories Archive)',
      '/committee': 'समिति सदस्य (Committee)',
      '/about': 'हमारे बारे में (About)',
      '/share-memory': 'स्मृति साझा करें (Share Memory)',
      '/contact': 'संपर्क सूत्र (Contact)',
      '/privacy-policy': 'गोपनीयता नीति (Privacy Policy)',
      '/terms-and-conditions': 'नियम व शर्तें (Terms)',
      '/contribution-policy': 'सहयोग नीति (Contribution Policy)',
      '/disclaimer': 'अस्वीकरण (Disclaimer)',
    };

    // Ensure core pages are present in ranking
    const defaultCorePaths = [
      '/',
      '/live-darshan',
      '/memories',
      '/committee',
      '/about',
      '/share-memory',
      '/contact',
    ];

    defaultCorePaths.forEach((p) => {
      if (!pathViewMap.has(p)) {
        // Minimum baseline view for active telemetry
        pathViewMap.set(p, 0);
      }
    });

    const sortedEntries = Array.from(pathViewMap.entries()).sort((a, b) => b[1] - a[1]);

    const popularPages: PopularPage[] = sortedEntries.slice(0, 7).map(([pathKey, count]) => ({
      path: pathKey,
      title: pathTitles[pathKey] || pathKey,
      views: count,
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
