import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import memoryRoutes from './memoryRoutes';
import committeeRoutes from './committeeRoutes';
import reportRoutes from './reportRoutes';
import adminRoutes from './adminRoutes';
import contactRoutes from './contactRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    service: 'Yaduvashi Durga Puja Kapoori Pur Memory Archive API',
  });
});

router.use('/auth', authRoutes);
router.use('/memories', memoryRoutes);
router.use('/committee', committeeRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
