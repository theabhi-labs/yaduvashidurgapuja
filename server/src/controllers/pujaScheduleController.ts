import { Request, Response, NextFunction } from 'express';
import { PujaSchedule } from '../models/PujaSchedule';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

const DEFAULT_SCHEDULES = [
  {
    title: 'प्रातः मंगला आरती',
    time: '06:30 AM',
    description: 'माँ भगवती का पावन अभिषेक एवं मंगला स्तुति',
    isSpecial: false,
    order: 1,
    isActive: true,
  },
  {
    title: 'मध्याह्न भोग व आरती',
    time: '12:00 PM',
    description: 'माँ को नैवेद्य अर्पण एवं मध्याह्न पावन आरती',
    isSpecial: false,
    order: 2,
    isActive: true,
  },
  {
    title: 'संध्या दिव्य महाआरती',
    time: '07:30 PM',
    description: 'कपूरिपुर प्रांगण में भव्य 108 दीप महाआरती व शंखनाद',
    isSpecial: true,
    order: 3,
    isActive: true,
  },
  {
    title: 'शयन आरती व वंदना',
    time: '10:00 PM',
    description: 'रात्रि विश्राम पूर्व माँ की पावन क्षमा प्रार्थना व आरती',
    isSpecial: false,
    order: 4,
    isActive: true,
  },
];

export class PujaScheduleController {
  /**
   * Get all active puja and aarti timings (Public)
   * GET /api/puja-schedules
   */
  public static async getSchedules(_req: Request, res: Response, next: NextFunction) {
    try {
      let schedules = await PujaSchedule.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();

      // Auto-seed defaults if database table is empty
      if (schedules.length === 0) {
        await PujaSchedule.insertMany(DEFAULT_SCHEDULES);
        schedules = await PujaSchedule.find({ isActive: true })
          .sort({ order: 1, createdAt: 1 })
          .lean();
      }

      return sendResponse(res, 200, 'Puja and aarti schedules retrieved successfully', schedules);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get all schedules (including inactive)
   * GET /api/puja-schedules/all
   */
  public static async getAllSchedules(_req: Request, res: Response, next: NextFunction) {
    try {
      let schedules = await PujaSchedule.find()
        .sort({ order: 1, createdAt: 1 })
        .lean();

      if (schedules.length === 0) {
        await PujaSchedule.insertMany(DEFAULT_SCHEDULES);
        schedules = await PujaSchedule.find()
          .sort({ order: 1, createdAt: 1 })
          .lean();
      }

      return sendResponse(res, 200, 'All schedules retrieved successfully', schedules);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new puja timing card
   * POST /api/puja-schedules
   */
  public static async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, time, description, isSpecial = false, order = 0, isActive = true } = req.body;

      if (!title || !title.trim() || !time || !time.trim()) {
        throw new ApiError(400, 'पूजा का नाम और समय आवश्यक है');
      }

      const schedule = await PujaSchedule.create({
        title: title.trim(),
        time: time.trim(),
        description: description ? description.trim() : undefined,
        isSpecial: isSpecial === true || isSpecial === 'true',
        order: Number(order) || 0,
        isActive: isActive === true || isActive === 'true',
      });

      logger.info(`New Puja Schedule created: "${schedule.title}" at "${schedule.time}"`);
      return sendResponse(res, 201, 'आरती समय सफलतापूर्वक जोड़ा गया', schedule);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update a timing card
   * PATCH /api/puja-schedules/:id
   */
  public static async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await PujaSchedule.findById(id);

      if (!schedule) {
        throw new ApiError(404, 'पूजा समय सारणी नहीं मिली');
      }

      const { title, time, description, isSpecial, order, isActive } = req.body;

      if (title !== undefined) schedule.title = title.trim();
      if (time !== undefined) schedule.time = time.trim();
      if (description !== undefined) schedule.description = description ? description.trim() : '';
      if (isSpecial !== undefined) schedule.isSpecial = isSpecial === true || isSpecial === 'true';
      if (order !== undefined) schedule.order = Number(order) || 0;
      if (isActive !== undefined) schedule.isActive = isActive === true || isActive === 'true';

      await schedule.save();

      logger.info(`Puja Schedule updated: "${schedule.title}" (ID: ${id})`);
      return sendResponse(res, 200, 'आरती समय सफलतापूर्वक अपडेट किया गया', schedule);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Toggle schedule active status
   * PATCH /api/puja-schedules/:id/toggle
   */
  public static async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await PujaSchedule.findById(id);

      if (!schedule) {
        throw new ApiError(404, 'पूजा समय सारणी नहीं मिली');
      }

      schedule.isActive = !schedule.isActive;
      await schedule.save();

      return sendResponse(
        res,
        200,
        `समय सारणी अब ${schedule.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'} है`,
        schedule
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete a timing card
   * DELETE /api/puja-schedules/:id
   */
  public static async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await PujaSchedule.findById(id);

      if (!schedule) {
        throw new ApiError(404, 'पूजा समय सारणी नहीं मिली');
      }

      await PujaSchedule.findByIdAndDelete(id);

      logger.info(`Puja Schedule deleted: "${schedule.title}" (ID: ${id})`);
      return sendResponse(res, 200, 'आरती समय सफलतापूर्वक हटा दिया गया');
    } catch (error) {
      next(error);
    }
  }
}
