import { Router } from 'express';
import { PujaScheduleController } from '../controllers/pujaScheduleController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Public: Get active puja and aarti timings
router.get('/', PujaScheduleController.getSchedules);

// Admin: Management routes
router.get('/all', authenticate, requireAdmin, PujaScheduleController.getAllSchedules);
router.post('/', authenticate, requireAdmin, PujaScheduleController.createSchedule);
router.patch('/:id', authenticate, requireAdmin, PujaScheduleController.updateSchedule);
router.patch('/:id/toggle', authenticate, requireAdmin, PujaScheduleController.toggleActive);
router.delete('/:id', authenticate, requireAdmin, PujaScheduleController.deleteSchedule);

export default router;
