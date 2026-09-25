import { BrevoClient } from '@getbrevo/brevo';
import { ENV } from './env';
import { logger } from '../utils/logger';

const brevo = new BrevoClient({
  apiKey: ENV.BREVO_API_KEY || '',
});

if (!ENV.BREVO_API_KEY) {
  logger.warn('[Brevo] BREVO_API_KEY is not configured in .env. Emails will be logged in console.');
}

export interface SendEmailOptions {
  to: string;
  name?: string;
  subject: string;
  htmlContent: string;
}

/**
 * Reusable helper to send transactional emails via Brevo.
 * Wrapped in safe try/catch so email failures never crash or block main registration/OTP flows.
 */
export async function sendEmail({ to, name, subject, htmlContent }: SendEmailOptions): Promise<boolean> {
  try {
    if (!ENV.BREVO_API_KEY) {
      logger.info(`[Email Simulation - No Brevo Key] To: ${to} | Subject: "${subject}"`);
      return true;
    }

    const response = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: {
        name: ENV.BREVO_SENDER_NAME,
        email: ENV.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to, name: name || to }],
    });

    logger.info(
      `[Brevo Email Sent] To: ${to} | Subject: "${subject}" | MessageId: ${
        response.messageId || (response as any).messageIds?.[0] || 'success'
      }`
    );
    return true;
  } catch (error: any) {
    const errorMsg = error.body?.message || error.message || error;
    logger.error(`[Brevo Email Error] Failed to send email to ${to}: ${errorMsg}`);
    // Return false without throwing so main app flows continue uninterrupted
    return false;
  }
}
