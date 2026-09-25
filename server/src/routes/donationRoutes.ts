import { Router } from 'express';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import {
  createOrder,
  verifyPayment,
  getDonations,
  handleRazorpayWebhook,
} from '../controllers/donationController';

const router = Router();

// Public / Guest allowed — make a donation
router.post('/create-order', optionalAuthenticate, createOrder);
router.post('/verify', verifyPayment);

// Server-to-server Razorpay Webhook
router.post('/webhook', handleRazorpayWebhook);

// Admin only — view full donation transaction records
router.get('/', authenticate, requireAdmin, getDonations);

export default router;
