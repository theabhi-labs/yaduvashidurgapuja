import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { razorpayInstance, RAZORPAY_KEY_ID } from '../config/razorpay';
import { ENV } from '../config/env';
import { Donation } from '../models/Donation';
import { emitDonation } from '../socket';
import { ApiError, sendResponse, PaginationMeta } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import escapeRegExp from 'lodash.escaperegexp';

import { sendEmail } from '../config/brevo';
import { getReceiptEmailHtml } from '../emails/receiptEmail';
import { User } from '../models/User';

// ---- PUBLIC: Create a Razorpay donation order ----
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, donorName, isAnonymous, liveSessionRoomName, message } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      throw new ApiError(400, 'दान राशि कम से कम ₹1 होनी चाहिए');
    }

    const effectiveDonorName = isAnonymous ? 'गुमनाम भक्त' : (donorName?.trim() || req.user?.name || 'श्रद्धालु');
    let orderId: string;

    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create({
        amount: Math.round(parsedAmount * 100), // in paise
        currency: 'INR',
        receipt: `puja_${Date.now().toString().slice(-8)}`,
        notes: {
          donorName: effectiveDonorName,
          liveSessionRoomName: liveSessionRoomName || '',
          userId: req.user?._id?.toString() || '',
        },
      });
      orderId = order.id;
    } else {
      // Mock order for dev/fallback if keys are not configured yet
      logger.warn('[Razorpay] Generating dev mock order id');
      orderId = `order_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    const donation = await Donation.create({
      donorName: effectiveDonorName,
      amount: parsedAmount,
      currency: 'INR',
      razorpayOrderId: orderId,
      status: 'created',
      liveSessionRoomName: liveSessionRoomName || undefined,
      user: req.user?._id,
      isAnonymous: Boolean(isAnonymous),
      message: message ? String(message).trim() : undefined,
    });

    return sendResponse(res, 201, 'दान ऑर्डर तैयार किया गया', {
      orderId,
      amount: parsedAmount,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      donorName: effectiveDonorName,
      donationId: donation._id,
    });
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: Verify Razorpay payment signature, send digital receipt, and emit real-time event ----
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      throw new ApiError(400, 'ऑर्डर आईडी और पेमेंट आईडी आवश्यक हैं');
    }

    const donation = await Donation.findOne({ razorpayOrderId }).populate('user', 'name username avatar email');
    if (!donation) {
      throw new ApiError(404, 'दान रिकॉर्ड नहीं मिला');
    }

    if (donation.status === 'paid') {
      return sendResponse(res, 200, 'भुगतान पहले ही सत्यापित हो चुका है', donation);
    }

    // Verify HMAC SHA-256 signature
    let isValid = false;
    if (ENV.RAZORPAY_KEY_SECRET && razorpaySignature) {
      const expectedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = expectedSignature === razorpaySignature;
    } else if (!ENV.RAZORPAY_KEY_SECRET) {
      // Dev mode bypass
      logger.warn('[Razorpay] Bypassing signature check in dev mode (RAZORPAY_KEY_SECRET not set)');
      isValid = true;
    }

    if (!isValid) {
      donation.status = 'failed';
      await donation.save();
      throw new ApiError(400, 'भुगतान सत्यापन असफल रहा — अमान्य डिजिटल हस्ताक्षर');
    }

    // Mark as paid
    donation.status = 'paid';
    donation.razorpayPaymentId = razorpayPaymentId;
    donation.razorpaySignature = razorpaySignature;
    await donation.save();

    const userObj = donation.user as any;
    const finalDonorName = donation.isAnonymous ? 'गुमनाम भक्त' : (donation.donorName || userObj?.name || 'श्रद्धालु');
    const finalAvatar = donation.isAnonymous ? '' : (userObj?.avatar || '');
    const finalUsername = donation.isAnonymous ? '' : (userObj?.username || '');

    // Broadcast real-time donation event to viewers with avatar & username
    emitDonation({
      donorName: finalDonorName,
      amount: donation.amount,
      message: donation.message,
      avatar: finalAvatar,
      username: finalUsername,
      roomName: donation.liveSessionRoomName,
      timestamp: new Date().toISOString(),
    });

    // Send instant devotional receipt email if devotee email is available
    const recipientEmail = userObj?.email || req.body.email;
    if (recipientEmail) {
      const formattedDate = new Date().toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      sendEmail({
        to: recipientEmail,
        name: finalDonorName,
        subject: `पावन दान पावती रसीद (₹${donation.amount}) — श्री यदुवंशी दुर्गा पूजा कपूरिपुर`,
        htmlContent: getReceiptEmailHtml({
          donorName: finalDonorName,
          amount: donation.amount,
          razorpayPaymentId,
          razorpayOrderId,
          date: formattedDate,
          message: donation.message,
        }),
      }).catch((e) => logger.warn(`[Donation Email Warning] Receipt delivery error: ${e.message}`));
    }

    return sendResponse(
      res,
      200,
      'माँ दुर्गा की कृपा से आपका दान सफलतापूर्वक प्राप्त हुआ! जय माता दी 🙏',
      donation
    );
  } catch (err) {
    next(err);
  }
};

// ---- PUBLIC: Get Wall of Donors sorted descending by donation amount ----
export const getPublicDonorsWall = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [donors, stats] = await Promise.all([
      Donation.find({ status: 'paid' })
        .sort({ amount: -1, createdAt: -1 })
        .limit(200)
        .populate('user', 'name username avatar role')
        .lean(),
      Donation.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonors: { $sum: 1 },
            highestDonation: { $max: '$amount' },
          },
        },
      ]),
    ]);

    // Sanitize anonymous donors
    const sanitizedDonors = donors.map((d: any) => {
      const isAnon = Boolean(d.isAnonymous);
      const user = d.user;
      return {
        _id: d._id,
        donorName: isAnon ? 'गुमनाम भक्त' : (d.donorName || user?.name || 'श्रद्धालु'),
        username: isAnon ? undefined : (user?.username || undefined),
        avatar: isAnon ? '' : (user?.avatar || ''),
        amount: d.amount,
        message: d.message,
        createdAt: d.createdAt,
        isAnonymous: isAnon,
      };
    });

    const summary = stats.length > 0 ? stats[0] : { totalAmount: 0, totalDonors: 0, highestDonation: 0 };

    return sendResponse(res, 200, 'दानदाता सूची प्राप्त हुई', {
      donors: sanitizedDonors,
      summary: {
        totalAmount: summary.totalAmount || 0,
        totalDonors: summary.totalDonors || 0,
        highestDonation: summary.highestDonation || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---- USER AUTHENTICATED: Get my donation history with receipts ----
export const getMyDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'कृपया लॉगिन करें');
    }

    const donations = await Donation.find({ user: req.user._id, status: 'paid' })
      .sort({ createdAt: -1 })
      .lean();

    const totalContributed = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    return sendResponse(res, 200, 'आपकी दान रसीदें प्राप्त हुईं', {
      donations,
      totalContributed,
      count: donations.length,
    });
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN ONLY: Get paginated donation history with stats ----
export const getDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const { status, liveSessionRoomName, search } = req.query;

    const filter: any = {};
    if (status && ['created', 'paid', 'failed'].includes(String(status))) {
      filter.status = status;
    }
    if (liveSessionRoomName) {
      filter.liveSessionRoomName = liveSessionRoomName;
    }
    if (search && typeof search === 'string') {
      const sanitizedSearch = escapeRegExp(search.trim());
      if (sanitizedSearch.length > 0) {
        filter.$or = [
          { donorName: { $regex: sanitizedSearch, $options: 'i' } },
          { razorpayOrderId: { $regex: sanitizedSearch, $options: 'i' } },
          { razorpayPaymentId: { $regex: sanitizedSearch, $options: 'i' } },
        ];
      }
    }

    const [donations, total, stats] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Donation.countDocuments(filter),
      Donation.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const totalCollected = stats.length > 0 ? stats[0].totalAmount : 0;
    const paidCount = stats.length > 0 ? stats[0].count : 0;

    return sendResponse(
      res,
      200,
      'दान सूची प्राप्त हुई',
      {
        donations,
        summary: {
          totalCollected,
          paidCount,
        },
      },
      pagination
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Razorpay Server-to-Server Webhook Handler
 * Endpoint: POST /api/donations/webhook
 * 
 * Razorpay Dashboard Setup Instruction:
 * 1. Go to: Razorpay Dashboard -> Settings -> Webhooks -> Add New Webhook
 * 2. Webhook URL: https://<your-backend-domain>/api/donations/webhook
 * 3. Secret: Set your RAZORPAY_WEBHOOK_SECRET (.env)
 * 4. Active Events: select 'payment.captured' (and 'order.paid')
 */
export const handleRazorpayWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = ENV.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured in .env. Webhook rejected.');
      return res.status(400).json({ success: false, message: 'Webhook secret not configured' });
    }

    if (!signature) {
      logger.warn('[Razorpay Webhook] Missing x-razorpay-signature header');
      return res.status(400).json({ success: false, message: 'Missing webhook signature' });
    }

    // Get raw body buffer preserved by express.json({ verify })
    const rawBody = (req as any).rawBody
      ? (req as any).rawBody.toString('utf8')
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('[Razorpay Webhook] Invalid signature verification');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body?.event;
    logger.info(`[Razorpay Webhook] Received valid webhook event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || req.body?.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const donation = await Donation.findOne({ razorpayOrderId: orderId });
        if (donation) {
          // Idempotency check: Only update and emit if not already marked paid
          if (donation.status !== 'paid') {
            donation.status = 'paid';
            if (paymentId) donation.razorpayPaymentId = paymentId;
            donation.razorpaySignature = signature;
            await donation.save();

            logger.info(`[Razorpay Webhook] Marked donation ${donation._id} as paid for order ${orderId}`);

            // Emit real-time donation event to viewers
            emitDonation({
              donorName: donation.isAnonymous ? 'गुमनाम भक्त' : donation.donorName,
              amount: donation.amount,
              message: donation.message,
              roomName: donation.liveSessionRoomName,
              timestamp: new Date().toISOString(),
            });
          } else {
            logger.info(`[Razorpay Webhook] Donation ${donation._id} was already marked paid. Skipping duplicate emit.`);
          }
        } else {
          logger.warn(`[Razorpay Webhook] No matching donation found for order ${orderId}`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    logger.error('[Razorpay Webhook] Error processing webhook:', err);
    return res.status(500).json({ success: false, message: 'Internal server error in webhook handler' });
  }
};

