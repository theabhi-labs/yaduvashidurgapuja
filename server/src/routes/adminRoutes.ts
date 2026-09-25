import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { updateReportStatusSchema } from '../validators/reportValidators';

import { AdController } from '../controllers/adController';
import { upload } from '../middleware/uploadMiddleware';
import { createAdSchema, updateAdSchema } from '../validators/adValidators';

const router = Router();

// Protect all admin routes with auth and at least admin role check
router.use(authenticate, requireAdmin);

// Dashboard stats - SUPERADMIN only
router.get('/stats', requireSuperAdmin, AdminController.getStats);

// Users management - SUPERADMIN can update role, both can view/suspend
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', requireSuperAdmin, AdminController.updateUserRole);
router.patch('/users/:id/suspend', AdminController.toggleUserSuspension);

// Memories moderation
router.get('/memories', AdminController.getAllMemories);
router.patch('/memories/:id/status', AdminController.updateMemoryStatus);

// Reports management
router.get('/reports', AdminController.getReports);
router.patch(
  '/reports/:id',
  validateRequest(updateReportStatusSchema),
  AdminController.handleReport
);

// Native In-Feed Ads management - SUPERADMIN only
router.get('/ads', requireSuperAdmin, AdController.getAllAds);
router.post(
  '/ads',
  requireSuperAdmin,
  upload.single('image'),
  validateRequest(createAdSchema),
  AdController.createAd
);
router.patch(
  '/ads/:id',
  requireSuperAdmin,
  upload.single('image'),
  validateRequest(updateAdSchema),
  AdController.updateAd
);
router.delete('/ads/:id', requireSuperAdmin, AdController.deleteAd);

export default router;
