import { BrevoClient } from '@getbrevo/brevo';
import { ENV } from './env';
import { logger } from '../utils/logger';

export interface SendEmailOptions {
  to: string;
  name?: string;
  subject: string;
  htmlContent: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a transactional email via Brevo.
 * Supports BrevoClient SDK with native HTTPS REST API fallback.
 */
export async function sendEmail({
  to,
  name,
  subject,
  htmlContent,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = (process.env.BREVO_API_KEY || ENV.BREVO_API_KEY || '').trim();
  const senderEmail = (
    process.env.BREVO_SENDER_EMAIL ||
    ENV.BREVO_SENDER_EMAIL ||
    'abhishekyadavcode@gmail.com'
  ).trim();
  const senderName = (
    process.env.BREVO_SENDER_NAME ||
    ENV.BREVO_SENDER_NAME ||
    'Yaduvashi Durga Puja Kapooripur'
  ).trim();

  if (!apiKey) {
    const errorMsg = 'BREVO_API_KEY environment variable is not configured on server.';
    logger.warn(`[Brevo Email Warning] ${errorMsg} (Target: ${to})`);
    return { success: false, error: errorMsg };
  }

  // 1. Try via Brevo Official SDK
  try {
    const client = new BrevoClient({ apiKey });
    const response = await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to, name: name || to }],
    });

    const messageId =
      response.messageId ||
      (response as any).messageIds?.[0] ||
      'brevo_success';

    logger.info(`[Brevo Email Sent] To: ${to} | Subject: "${subject}" | MessageId: ${messageId}`);
    return { success: true, messageId };
  } catch (sdkError: any) {
    const sdkErrMsg =
      sdkError.body?.message ||
      sdkError.message ||
      JSON.stringify(sdkError);
    logger.warn(`[Brevo SDK Attempt Failed, trying direct REST API fallback]: ${sdkErrMsg}`);

    // 2. Direct HTTP REST API Fallback (https://api.brevo.com/v3/smtp/email)
    try {
      const fetchResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to, name: name || to }],
          subject,
          htmlContent,
        }),
      });

      const responseData: any = await fetchResponse.json().catch(() => ({}));

      if (!fetchResponse.ok) {
        const errorDetail =
          responseData.message ||
          responseData.code ||
          `HTTP ${fetchResponse.status} ${fetchResponse.statusText}`;
        logger.error(`[Brevo REST API Error] Failed to send email to ${to}: ${errorDetail}`);
        return { success: false, error: `Brevo API Error: ${errorDetail}` };
      }

      const messageId = responseData.messageId || responseData.messageIds?.[0] || 'rest_api_success';
      logger.info(`[Brevo REST Email Sent] To: ${to} | Subject: "${subject}" | MessageId: ${messageId}`);
      return { success: true, messageId };
    } catch (fetchError: any) {
      const finalError = fetchError.message || 'Unknown network error while contacting Brevo API';
      logger.error(`[Brevo Final Error] Could not deliver email to ${to}: ${finalError}`);
      return { success: false, error: finalError };
    }
  }
}
