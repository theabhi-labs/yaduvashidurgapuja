import { Router } from 'express';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import {
  createOrder,
  verifyPayment,
  getDonations,
  handleRazorpayWebhook,
  getPublicDonorsWall,
  getMyDonations,
} from '../controllers/donationController';

const router = Router();

// Public Wall of Donors (Sorted descending, real-time ready)
router.get('/public-wall', getPublicDonorsWall);

// Authenticated user's receipts
router.get('/my-donations', authenticate, getMyDonations);

// Create donation order (requires auth or guest) & verify
router.post('/create-order', optionalAuthenticate, createOrder);
router.post('/verify', verifyPayment);

// Server-to-server Razorpay Webhook
router.post('/webhook', handleRazorpayWebhook);

// Admin only — view full donation transaction records
router.get('/', authenticate, requireAdmin, getDonations);

export default router;
