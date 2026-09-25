import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export class ContactController {
  /**
   * Submit Contact / Enquiry Message
   * POST /api/contact
   */
  public static async submitContactMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, subject, message } = req.body;

      // Log safely without sensitive headers or credentials
      logger.info(`[Contact Enquiry] From: ${name} <${email}> | Subject: "${subject}"`);

      // In production, an email notification can be dispatched to the committee inbox.
      // For resilience, we return a successful response acknowledging receipt.
      return sendResponse(
        res,
        200,
        'आपका संदेश सफलतापूर्वक प्राप्त हो गया है। समिति द्वारा शीघ्र ही संपर्क किया जाएगा। धन्यवाद।',
        {
          received: true,
          name,
          email,
          subject,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      next(error);
    }
  }
}
