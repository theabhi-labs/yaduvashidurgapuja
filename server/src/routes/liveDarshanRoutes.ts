import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminMiddleware';
import {
  scheduleLiveSession,
  listScheduledSessions,
  deleteScheduledSession,
  startLiveSession,
  endLiveSession,
  endAllLiveSessions,
  listLiveSessions,
  joinLiveSession,
  getRoomComments,
  toggleLiveChat,
  toggleLiveDonation,
  getGlobalSettings,
  updateGlobalSettings,
  getBroadcastHistory,
  getSessionLogs,
} from '../controllers/liveDarshanController';

const router = Router();

// ---- PUBLIC ENDPOINTS ----
router.get('/', listLiveSessions); // list currently live streams
router.get('/schedules', listScheduledSessions); // list upcoming scheduled aarti
router.get('/global-settings', getGlobalSettings);
router.get('/:roomName/join', optionalAuthenticate, joinLiveSession);
router.get('/:roomName/comments', getRoomComments);

// ---- ADMIN PROTECTED BROADCASTING, CONTROLS & LOGS ----
router.post('/start', authenticate, requireAdmin, startLiveSession);
router.post('/end-all-live', authenticate, requireAdmin, endAllLiveSessions);
router.post('/:roomName/end', authenticate, requireAdmin, endLiveSession);
router.post('/schedule', authenticate, requireAdmin, scheduleLiveSession);
router.delete('/schedule/:id', authenticate, requireAdmin, deleteScheduledSession);
router.patch('/:roomName/toggle-chat', authenticate, requireAdmin, toggleLiveChat);
router.patch('/:roomName/toggle-donation', authenticate, requireAdmin, toggleLiveDonation);
router.get('/history', authenticate, requireAdmin, getBroadcastHistory);
router.get('/session/:roomName/logs', authenticate, requireAdmin, getSessionLogs);

// ---- SUPER ADMIN ONLY CONTROLS ----
router.patch('/global-settings', authenticate, requireSuperAdmin, updateGlobalSettings);

export default router;
