import Razorpay from 'razorpay';
import { ENV } from './env';
import { logger } from '../utils/logger';

export const razorpayInstance =
  ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: ENV.RAZORPAY_KEY_ID,
        key_secret: ENV.RAZORPAY_KEY_SECRET,
      })
    : null;

if (!ENV.RAZORPAY_KEY_ID || !ENV.RAZORPAY_KEY_SECRET) {
  logger.warn('[Razorpay] Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in environment variables.');
}

export const RAZORPAY_KEY_ID = ENV.RAZORPAY_KEY_ID || '';
