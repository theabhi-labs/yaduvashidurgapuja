import { Router } from 'express';
import { HeroBannerController } from '../controllers/heroBannerController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public endpoint for homepage carousel
router.get('/active', HeroBannerController.getActiveBanners);

// Admin endpoints (Admins and SuperAdmins can manage hero posters)
router.get('/', authenticate, requireAdmin, HeroBannerController.getAllBanners);
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('image'),
  HeroBannerController.createBanner
);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('image'),
  HeroBannerController.updateBanner
);
router.patch(
  '/:id/toggle',
  authenticate,
  requireAdmin,
  HeroBannerController.toggleActive
);
router.delete('/:id', authenticate, requireAdmin, HeroBannerController.deleteBanner);

export default router;
