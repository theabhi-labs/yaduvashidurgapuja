import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Public heartbeat endpoint (invoked automatically by visitors)
router.post('/heartbeat', AnalyticsController.heartbeat);

// Admin-only real-time live traffic polling
router.get('/live', authenticate, requireAdmin, AnalyticsController.getLiveTraffic);

export default router;
