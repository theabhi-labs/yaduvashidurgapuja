import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createReportSchema } from '../validators/reportValidators';

const router = Router();

// Create report for a memory
router.post(
  '/',
  authenticate,
  validateRequest(createReportSchema),
  ReportController.createReport
);

// View user's own reports
router.get('/my', authenticate, ReportController.getMyReports);

export default router;
