import { Router } from 'express';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import {
  createOrder,
  verifyPayment,
  getDonations,
} from '../controllers/donationController';

const router = Router();

// Public / Guest allowed — make a donation
router.post('/create-order', optionalAuthenticate, createOrder);
router.post('/verify', verifyPayment);

// Admin only — view full donation transaction records
router.get('/', authenticate, requireAdmin, getDonations);

export default router;
