import { Router } from 'express';
import { CommitteeController } from '../controllers/committeeController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createCommitteeMemberSchema,
  updateCommitteeMemberSchema,
  reorderCommitteeSchema,
} from '../validators/committeeValidators';

const router = Router();

// Public: Get active members
router.get('/', CommitteeController.getCommittee);

// Admin: Get all members
router.get('/all', authenticate, requireAdmin, CommitteeController.getAllMembersAdmin);

// Admin: Create member
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('photo'),
  validateRequest(createCommitteeMemberSchema),
  CommitteeController.createMember
);

// Admin: Reorder members
router.patch(
  '/reorder',
  authenticate,
  requireAdmin,
  validateRequest(reorderCommitteeSchema),
  CommitteeController.reorderMembers
);

// Admin: Update member
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('photo'),
  validateRequest(updateCommitteeMemberSchema),
  CommitteeController.updateMember
);

// Admin: Delete member
router.delete('/:id', authenticate, requireAdmin, CommitteeController.deleteMember);

export default router;
