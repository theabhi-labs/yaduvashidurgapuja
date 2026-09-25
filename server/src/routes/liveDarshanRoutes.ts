import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import {
  startLiveSession,
  endLiveSession,
  listLiveSessions,
  joinLiveSession,
} from '../controllers/liveDarshanController';

const router = Router();

// Admin / Superadmin only — start or end a broadcast
router.post('/start', authenticate, requireAdmin, startLiveSession);
router.post('/:roomName/end', authenticate, requireAdmin, endLiveSession);

// Public — see what's live right now, join as viewer (guests allowed)
router.get('/', listLiveSessions);
router.get('/:roomName/join', optionalAuthenticate, joinLiveSession);

export default router;
