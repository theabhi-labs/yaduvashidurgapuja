import { Router } from 'express';
import { MemoryController } from '../controllers/memoryController';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { uploadLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { createMemorySchema, updateMemorySchema } from '../validators/memoryValidators';

const router = Router();

// Public feed (supports optional auth to tailor hidden visibility)
router.get('/', optionalAuthenticate, MemoryController.getMemories);

// User's own memories
router.get('/my', authenticate, MemoryController.getMyMemories);

// Single canonical memory
router.get('/:id', optionalAuthenticate, MemoryController.getMemoryById);

// Record memory impression
router.post('/:id/impression', MemoryController.recordImpression);


// Upload new memory
router.post(
  '/',
  authenticate,
  uploadLimiter,
  upload.single('image'),
  validateRequest(createMemorySchema),
  MemoryController.createMemory
);

// Edit memory
router.patch(
  '/:id',
  authenticate,
  validateRequest(updateMemorySchema),
  MemoryController.updateMemory
);

// Delete memory
router.delete('/:id', authenticate, MemoryController.deleteMemory);

export default router;
