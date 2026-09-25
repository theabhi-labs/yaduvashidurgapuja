import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { validateRequest } from '../middleware/validateRequest';
import { authLimiter } from '../middleware/rateLimiter';
import { contactSchema } from '../validators/contactValidators';

const router = Router();

// Rate limit contact form submissions to prevent spam abuse
router.post(
  '/',
  authLimiter,
  validateRequest(contactSchema),
  ContactController.submitContactMessage
);

export default router;
