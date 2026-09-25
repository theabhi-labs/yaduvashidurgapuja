import { Router } from 'express';
import { AdController } from '../controllers/adController';
import { authenticate } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/adminMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createAdSchema, updateAdSchema } from '../validators/adValidators';

const router = Router();

// Public in-feed ad endpoints
router.get('/active', AdController.getActiveAds);
router.post('/:id/click', AdController.recordClick);
router.post('/:id/impression', AdController.recordImpression);

// Super Admin ad management endpoints (also mapped under /api/admin/ads)
router.get('/', authenticate, requireSuperAdmin, AdController.getAllAds);
router.post(
  '/',
  authenticate,
  requireSuperAdmin,
  upload.single('image'),
  validateRequest(createAdSchema),
  AdController.createAd
);
router.patch(
  '/:id',
  authenticate,
  requireSuperAdmin,
  upload.single('image'),
  validateRequest(updateAdSchema),
  AdController.updateAd
);
router.delete('/:id', authenticate, requireSuperAdmin, AdController.deleteAd);

export default router;
