import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  RefreshCw,
  Clock,
  Users,
  Calendar,
  Sparkles,
  Layers,
  Send,
  Maximize2,
  Minimize2,
  ShieldAlert,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
  isTrackReference,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

import { liveDarshanService } from '../services/liveDarshanService';
import { LiveSessionInfo, LiveSessionJoinResponse, ScheduledSession } from '../types';
import { DonateButton } from '../components/donation/DonateButton';
import { DonationCard } from '../components/donation/DonationCard';
import { LiveSuperChatModal } from '../components/donation/LiveSuperChatModal';
import { useArtiChat } from '../hooks/useArtiChat';
import { useDonationSocket } from '../hooks/useDonationSocket';
import { getSocket } from '../services/socket';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Preset quick chant comments for devotees
const QUICK_CHANTS = [
  '🚩 जय माता दी!',
  '🌸 जय माँ दुर्गे!',
  '🪔 शुभ आरती दर्शन!',
  '🕉️ हर हर महादेव!',
  '🙏 माँ कृपा बनाए रखना',
];

// Devotional floating emojis
const REACTION_EMOJIS = ['❤️', '🌸', '🚩', '🪔', '🕉️'];

import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';

// =========================================================================
// INSTAGRAM LIVE STYLE VIDEO PLAYER & IMMERSIVE OVERLAYS
// =========================================================================
const InstagramLivePlayer: React.FC<{
  session: LiveSessionInfo;
  currentViewers: number;
  onForceEnd?: () => void;
  canManageStream?: boolean;
}> = ({ session, currentViewers, onForceEnd, canManageStream }) => {
  const { user, isAuthenticated } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSuperChatOpen, setIsSuperChatOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // LiveKit tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const cameraTrack =
    tracks.find(
      (t) =>
        isTrackReference(t) &&
        (t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare)
    ) || tracks[0];

  // Chat & Dakshina Socket hook
  const {
    comments,
    activeSuperChats,
    reactions,
    isChatEnabled,
    sendComment,
    sendReaction,
  } = useArtiChat({
    roomName: session.roomName,
    defaultName: user?.name || 'भक्त',
    initialChatEnabled: session.isChatEnabled ?? true,
  });

  // Smooth scroll strictly INSIDE the chat container (prevents window jumping)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [comments]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !isAuthenticated) return;
    sendComment(inputMessage.trim(), user?.name || 'भक्त', {
      username: user?.username,
      avatar: user?.avatar,
      userId: user?._id,
    });
    setInputMessage('');
  };

  const handleQuickChant = (chant: string) => {
    if (!isAuthenticated) return;
    sendComment(chant, user?.name || 'भक्त', {
      username: user?.username,
      avatar: user?.avatar,
      userId: user?._id,
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-black shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen rounded-none'
          : 'aspect-[9/16] sm:aspect-[4/3] md:aspect-video max-h-[82vh] rounded-3xl border-2 border-gold-500/50'
      }`}
    >
      {/* LiveKit Audio Renderer */}
      <RoomAudioRenderer />

      {/* Video Content */}
      {cameraTrack && isTrackReference(cameraTrack) ? (
        <VideoTrack
          trackRef={cameraTrack}
          className="w-full h-full object-cover sm:object-contain bg-black"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-dark-950 via-maroon-950 to-dark-900">
          <div className="w-20 h-20 rounded-full bg-maroon-900/80 border-2 border-gold-500/50 flex items-center justify-center mb-4 shadow-xl animate-pulse">
            <Radio className="w-10 h-10 text-gold-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-black text-gold-200 mb-2">
            {session.title || 'Maa Durga Maha Aarti — Connecting Stream...'}
          </h3>
          <p className="text-xs sm:text-sm text-cream-300 font-body max-w-md">
            कपूरीपुर पूजा मंडप से कैमरा ब्रॉडकास्ट कनेक्ट हो रहा है, कृपया प्रतीक्षा करें...
          </p>
        </div>
      )}

      {/* Top & Bottom Gradient Vignettes for Readability */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10" />

      {/* ========================================================================= */}
      {/* 1. TOP BAR OVERLAY (Instagram Live Style Header) */}
      {/* ========================================================================= */}
      <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-center justify-between z-20 gap-2">
        {/* Broadcaster Profile Pill */}
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-maroon-800 to-gold-600 flex items-center justify-center text-sm font-bold text-white border border-gold-400 shrink-0 shadow-inner">
            🕉️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-heading font-bold text-white truncate max-w-[130px] sm:max-w-[180px]">
                {session.hostName || 'यदुवंशी दुर्गा पूजा'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            </div>
            <span className="text-[10px] text-gold-300 font-body block truncate">
              {session.title || 'महाआरती लाइव'}
            </span>
          </div>
        </div>

        {/* Live Status & Viewers Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-[11px] sm:text-xs tracking-wider shadow-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-black/60 text-emerald-300 font-bold text-[11px] sm:text-xs backdrop-blur-md border border-white/20 shadow-md">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentViewers}</span>
          </span>

          {/* Admin Force-End Stream Button */}
          {canManageStream && onForceEnd && (
            <button
              onClick={onForceEnd}
              type="button"
              className="px-2.5 sm:px-3 py-1 rounded-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-lg border border-red-400 flex items-center gap-1 transition-all active:scale-95"
              title="End Broadcast (लाइव बंद करें)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Broadcast</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-1.5 rounded-full bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all active:scale-90"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PINNED DAKSHINA / SACRED OFFERING BANNER (Top Pin Highlight) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeSuperChats.length > 0 && (
          <motion.div
            key={activeSuperChats[0].id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="absolute top-16 sm:top-20 inset-x-3 sm:inset-x-6 z-20 pointer-events-auto"
          >
            <div className="bg-gradient-to-r from-amber-950/95 via-maroon-950/95 to-amber-900/95 backdrop-blur-xl border-2 border-gold-400 p-3 sm:p-3.5 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.45)] text-cream-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-500 to-amber-400 text-maroon-950 font-black flex items-center justify-center text-base shrink-0 shadow-lg border border-gold-200 animate-bounce">
                  🪙
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-xs sm:text-sm text-gold-300 truncate">
                      {activeSuperChats[0].name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gold-500 text-maroon-950 text-[10px] font-black shrink-0 shadow-sm">
                      ₹{activeSuperChats[0].amount} पावन दक्षिणा
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-body text-cream-100 font-semibold truncate mt-0.5">
                    "{activeSuperChats[0].message}"
                  </p>
                </div>
              </div>

              <Sparkles className="w-5 h-5 text-gold-400 shrink-0 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. FLOATING INSTAGRAM LIVE CHAT STREAM (Bottom-Left Overlay) */}
      {/* ========================================================================= */}
      <div
        ref={chatContainerRef}
        className="absolute bottom-24 sm:bottom-28 left-3 right-16 sm:right-auto sm:max-w-md max-h-56 sm:max-h-72 overflow-y-auto pointer-events-none z-20 pr-2 scrollbar-none flex flex-col justify-end space-y-2"
      >
        <div className="space-y-2">
          {comments.slice(-30).map((item) => {
            const isDakshina = Boolean(item.isSuperChat || (item as any).amount);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`pointer-events-auto flex items-start gap-2.5 max-w-full rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur-md transition-all ${
                  isDakshina
                    ? 'bg-gradient-to-r from-amber-950/90 to-maroon-900/90 border-2 border-gold-400 text-gold-100 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                    : 'bg-black/60 border border-white/15 text-white'
                }`}
              >
                {/* Profile Avatar with Photo or Colored Initials */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 overflow-hidden ${
                    isDakshina
                      ? 'ring-2 ring-gold-400 bg-gold-500 text-maroon-950 font-black'
                      : 'bg-maroon-700 text-cream-100 border border-gold-500/40'
                  }`}
                >
                  {item.avatar ? (
                    <img
                      src={getImageUrl(item.avatar)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : item.name ? (
                    item.name.charAt(0).toUpperCase()
                  ) : (
                    'भ'
                  )}
                </div>

                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-heading font-bold truncate ${
                        isDakshina ? 'text-gold-300 font-black' : 'text-gold-400'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.username && (
                      <span className="text-[10px] text-white/60 font-mono">
                        @{item.username}
                      </span>
                    )}
                    {isDakshina && (
                      <span className="px-1.5 py-0.2 rounded bg-gold-500 text-maroon-950 font-black text-[10px]">
                        ₹{(item as any).amount || (item as any).donationAmount} दक्षिणा
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-body leading-snug break-words ${
                      isDakshina ? 'text-cream-50 font-semibold' : 'text-cream-100'
                    }`}
                  >
                    {item.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FLOATING DEVOTIONAL REACTIONS (Instagram Live Hearts on Right) */}
      {/* ========================================================================= */}
      <div className="absolute bottom-24 right-3 sm:right-5 w-16 h-80 pointer-events-none z-20 overflow-hidden">
        <AnimatePresence>
          {reactions.map((react) => (
            <motion.div
              key={react.id}
              initial={{ opacity: 0, y: 50, scale: 0.4, x: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -280,
                scale: [0.4, 1.3, 1, 0.7],
                x: [0, (react.leftOffset % 2 === 0 ? 15 : -15), 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              style={{ left: `${react.leftOffset}%` }}
              className="absolute bottom-0 text-2xl sm:text-3xl select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              {react.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM INTERACTIVE BAR (Comment Input, Quick Chants, Dakshina & Reactions) */}
      {/* ========================================================================= */}
      <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-20 space-y-2 pointer-events-auto">
        {/* Quick Devotional Chants Pills (Horizontal scrollable) */}
        {isAuthenticated && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_CHANTS.map((chant) => (
              <button
                key={chant}
                type="button"
                onClick={() => handleQuickChant(chant)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-black/60 hover:bg-maroon-900/80 border border-white/20 text-cream-100 text-[11px] font-bold font-body backdrop-blur-md transition-all active:scale-95 shadow-sm hover:border-gold-400"
              >
                {chant}
              </button>
            ))}
          </div>
        )}

        {/* Main Action Bar */}
        <div className="flex items-center gap-2">
          {/* Live Dakshina Offering Golden Button */}
          {session.isDonationEnabled !== false && (
            <button
              type="button"
              onClick={() => setIsSuperChatOpen(true)}
              className="shrink-0 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-maroon-950 font-heading font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(234,179,8,0.5)] border-2 border-gold-200 flex items-center gap-1.5 transition-all active:scale-95 animate-pulse"
              title="पावन दक्षिणा अर्पित करें"
            >
              <Sparkles className="w-4 h-4 text-maroon-950" />
              <span>पावन दक्षिणा 🪙</span>
            </button>
          )}

          {/* Comment Form or Login Gate */}
          {isAuthenticated ? (
            <form
              onSubmit={handleSendMessage}
              className="flex-1 flex items-center bg-black/60 backdrop-blur-md rounded-full border border-white/20 focus-within:border-gold-400 px-3 py-1.5 shadow-lg min-w-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isChatEnabled ? 'लाइव चैट में जयकारा लगाएं...' : 'चैट बंद है...'
                }
                disabled={!isChatEnabled}
                className="flex-1 bg-transparent text-white placeholder-white/50 text-xs sm:text-sm focus:outline-none min-w-0 font-body"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isChatEnabled}
                className="p-1.5 rounded-full text-gold-400 hover:text-gold-200 disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <Link
              to="/login?redirect=/live-darshan"
              className="flex-1 py-2 px-3 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-gold-400/60 rounded-full text-center text-xs font-bold text-gold-300 transition-all flex items-center justify-center gap-1.5 shadow-md truncate"
            >
              <span>🌸 चैट हेतु लॉगिन करें (Login to Chat)</span>
            </Link>
          )}

          {/* Devotional Reaction Emojis (Tap to float) */}
          <div className="flex items-center gap-1 shrink-0">
            {REACTION_EMOJIS.slice(0, 3).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => sendReaction(emoji)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-base sm:text-lg transition-all active:scale-125 shadow-md"
                title={`Send ${emoji} Reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dakshina Modal */}
      <LiveSuperChatModal
        isOpen={isSuperChatOpen}
        onClose={() => setIsSuperChatOpen(false)}
        roomName={session.roomName}
        streamTitle={session.title}
      />
    </div>
  );
};

// =========================================================================
// MAIN LIVE DARSHAN COMPONENT
// =========================================================================
export const LiveDarshan: React.FC = () => {
  const toast = useToast();
  const { isAdmin, isSuperAdmin } = useAuth();
  const [allLiveSessions, setAllLiveSessions] = useState<LiveSessionInfo[]>([]);
  const [activeSession, setActiveSession] = useState<LiveSessionInfo | null>(null);
  const [joinData, setJoinData] = useState<LiveSessionJoinResponse | null>(null);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [liveViewerCount, setLiveViewerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const canManageStream = Boolean(isAdmin || isSuperAdmin);

  // Real-time donation socket hook for toast popups
  const { latestDonation, clearLatestDonation } = useDonationSocket(
    activeSession?.roomName
  );

  const fetchLiveAndScheduledSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [liveRes, schedRes] = await Promise.all([
        liveDarshanService.listLiveSessions(),
        liveDarshanService.listScheduledSessions(),
      ]);

      const liveList = liveRes.data || [];
      setAllLiveSessions(liveList);
      setScheduledSessions(schedRes.data || []);

      if (liveList.length > 0) {
        // If no active session or current active session is no longer live, switch to first available
        if (!activeSession || !liveList.some((s) => s.roomName === activeSession.roomName)) {
          handleJoin(liveList[0]);
        } else {
          // Refresh active session metadata
          const updatedActive = liveList.find((s) => s.roomName === activeSession.roomName);
          if (updatedActive) {
            setActiveSession(updatedActive);
            setLiveViewerCount(updatedActive.currentViewers || 0);
          }
        }
      } else {
        setActiveSession(null);
        setJoinData(null);
        setLiveViewerCount(0);
      }
    } catch {
      toast.error('Could not load live broadcast sessions');
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, toast]);

  useEffect(() => {
    fetchLiveAndScheduledSessions();
    const interval = setInterval(fetchLiveAndScheduledSessions, 20000);
    return () => clearInterval(interval);
  }, []);

  // Socket listener for real-time viewer count & chat status changes for active room
  useEffect(() => {
    if (!activeSession?.roomName) return;

    const socket = getSocket();
    socket.emit('join-arti-room', { roomName: activeSession.roomName });

    const handleViewerUpdate = (data: { roomName: string; count: number }) => {
      if (data?.roomName === activeSession.roomName) {
        setLiveViewerCount(data.count);
      }
    };

    const handleChatStatus = (data: { roomName: string; isChatEnabled: boolean }) => {
      if (data?.roomName === activeSession.roomName) {
        setActiveSession((prev) => (prev ? { ...prev, isChatEnabled: data.isChatEnabled } : null));
      }
    };

    const handleDonationStatus = (data: { roomName: string; isDonationEnabled: boolean }) => {
      if (data?.roomName === activeSession.roomName) {
        setActiveSession((prev) => (prev ? { ...prev, isDonationEnabled: data.isDonationEnabled } : null));
      }
    };

    socket.on('viewer-count-update', handleViewerUpdate);
    socket.on('chat-status-changed', handleChatStatus);
    socket.on('donation-status-changed', handleDonationStatus);

    return () => {
      socket.off('viewer-count-update', handleViewerUpdate);
      socket.off('chat-status-changed', handleChatStatus);
      socket.off('donation-status-changed', handleDonationStatus);
    };
  }, [activeSession?.roomName]);

  const handleJoin = async (session: LiveSessionInfo) => {
    try {
      const res = await liveDarshanService.joinSession(session.roomName);
      setActiveSession(session);
      setJoinData(res.data);
      setLiveViewerCount(res.data.currentViewers || 0);
    } catch (err: any) {
      toast.error(err.message || 'Could not join live broadcast');
    }
  };

  // Admin Quick Action: Force-End Broadcast directly from public view
  const handleForceEndStream = async () => {
    if (!activeSession) return;
    if (!window.confirm('क्या आप सच में इस लाइव प्रसारण को बंद करना चाहते हैं? (Are you sure you want to end this live stream?)')) {
      return;
    }

    try {
      await liveDarshanService.endSession(activeSession.roomName);
      toast.success('लाइव प्रसारण सफलतापूर्वक बंद कर दिया गया (Broadcast ended successfully)');
      setActiveSession(null);
      setJoinData(null);
      await fetchLiveAndScheduledSessions();
    } catch (err: any) {
      toast.error(err.message || 'लाइव बंद करने में समस्या आई');
    }
  };

  return (
    <div className="min-h-screen bg-cream-200 text-dark-900 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon-900/10 border border-gold-600/30 text-maroon-800 text-xs sm:text-sm font-bold"
          >
            <Radio className="w-4 h-4 text-maroon-700 animate-pulse" />
            <span>Divine Darshan & Maha Aarti Live</span>
          </motion.div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black text-maroon-900 tracking-tight">
            लाइव दर्शन — यदुवंशी दुर्गा पूजा कपूरीपुर
          </h1>
          <p className="text-xs sm:text-base text-muted font-body max-w-2xl mx-auto">
            माँ दुर्गा की पावन महाआरती एवं अनुष्ठानों का सजीव दर्शन। आरती के दौरान पावन दान एवं सुपर चैट समर्पित करें।
          </p>
        </div>

        {/* Real-time donation popup overlay container */}
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 pointer-events-none">
          <DonationCard
            donation={latestDonation}
            onDismiss={clearLatestDonation}
          />
        </div>

        {/* ========================================================================= */}
        {/* 🔴 MULTI-ADMIN LIVE BROADCAST SELECTOR (When 2+ Admins are Live Concurrently) */}
        {/* ========================================================================= */}
        {allLiveSessions.length > 1 && (
          <div className="bg-cream-50 p-3 sm:p-4 rounded-2xl border-2 border-gold-500/40 shadow-md">
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-4 h-4 text-maroon-700" />
              <span className="text-xs sm:text-sm font-bold font-heading text-maroon-950">
                {allLiveSessions.length} लाइव प्रसारण सक्रिय हैं — स्ट्रीम चुनें:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {allLiveSessions.map((session) => {
                const isSelected = activeSession?.roomName === session.roomName;
                return (
                  <button
                    key={session.roomName}
                    onClick={() => handleJoin(session)}
                    className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-maroon-900 text-cream-50 border-gold-400 shadow-md ring-2 ring-gold-400/50'
                        : 'bg-cream-100 hover:bg-cream-200 text-dark-900 border-cream-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold font-heading truncate">
                        {session.title || 'Maa Durga Maha Aarti'}
                      </div>
                      <div
                        className={`text-[11px] font-body ${
                          isSelected ? 'text-gold-200' : 'text-muted'
                        }`}
                      >
                        Host: {session.hostName}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{session.currentViewers || 0} दर्शक</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIVE BROADCAST STREAM CONTENT (INSTAGRAM LIVE UI EXPERIENCE)              */}
        {/* ========================================================================= */}
        {isLoading && !activeSession ? (
          <div className="aspect-[9/16] sm:aspect-video max-w-4xl mx-auto bg-dark-900/10 rounded-3xl animate-pulse flex items-center justify-center border border-cream-300">
            <RefreshCw className="w-8 h-8 text-maroon-700 animate-spin" />
          </div>
        ) : activeSession && joinData ? (
          <div className="max-w-4xl mx-auto space-y-4">
            <ErrorBoundary
              fallbackTitle="लाइव दर्शन प्लेयर त्रुटि (Live Player Error)"
              fallbackMessage="लाइव प्रसारण लोड करने में समस्या आई। पुनः प्रयास करें।"
            >
              <LiveKitRoom
                video={false}
                audio={false}
                token={joinData.token}
                serverUrl={joinData.wsUrl}
                connect={true}
                data-lk-theme="default"
                className="w-full flex justify-center"
              >
                <InstagramLivePlayer
                  session={activeSession}
                  currentViewers={liveViewerCount}
                  onForceEnd={handleForceEndStream}
                  canManageStream={canManageStream}
                />
              </LiveKitRoom>
            </ErrorBoundary>

            {/* Broadcast Details and Seva Card below video for desktop */}
            <div className="bg-cream-50 p-4 sm:p-6 rounded-3xl border border-gold-500/30 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-maroon-900 to-maroon-800 text-gold-300 flex items-center justify-center font-bold text-2xl shrink-0 shadow-md border border-gold-400">
                    🕉️
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg sm:text-xl text-maroon-950 leading-snug">
                      {activeSession.title || 'यदुवंशी दुर्गा पूजा कपूरीपुर — पावन महाआरती'}
                    </h3>
                    <p className="text-xs text-muted font-body mt-0.5">
                      ब्रॉडकास्टर: <span className="font-bold text-dark-900">{activeSession.hostName}</span> • कपूरीपुर, सुरियावां, भदोही
                    </p>
                    {activeSession.description && (
                      <p className="text-xs text-dark-700 font-body mt-1.5 bg-cream-100 p-2.5 rounded-xl border border-cream-200">
                        {activeSession.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Devotees Counter Badge */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block font-body text-emerald-800 font-bold">
                      सक्रिय भक्त (Live Devotees)
                    </span>
                    <span className="text-xl font-black font-heading text-emerald-950">
                      {liveViewerCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seva Donation Action Bar */}
              <div className="pt-3 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted font-body flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span>माँ के चरणों में पावन दान एवं सेवा समर्पण करें</span>
                </div>

                {activeSession.isDonationEnabled !== false ? (
                  <DonateButton
                    liveSessionRoomName={activeSession.roomName}
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-200 text-muted text-xs font-body border border-cream-300">
                    <HeartHandshake className="w-4 h-4 text-muted" />
                    <span>इस प्रसारण के लिए दान बंद है</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* EMPTY STATE — NO LIVE BROADCAST RUNNING                                   */
          /* ========================================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto bg-cream-50 rounded-3xl p-6 sm:p-12 text-center border-2 border-dashed border-gold-500/40 shadow-xl space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-maroon-900 to-maroon-950 text-gold-300 flex items-center justify-center shadow-lg border-2 border-gold-400">
              <Radio className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-maroon-900">
                वर्तमान में कोई लाइव आरती नहीं चल रही है
              </h3>
              <p className="text-xs sm:text-base text-muted font-body max-w-lg mx-auto">
                लाइव प्रसारण निर्धारित आरती एवं पूजा के समय शुरू होता है। नीचे दिए गए समय के अनुसार लाइव दर्शन का आनंद लें।
              </p>
            </div>

            {/* Daily Schedule Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-cream-100 border border-gold-500/30 text-center shadow-sm">
                <Clock className="w-5 h-5 text-maroon-700 mx-auto mb-1.5" />
                <span className="text-xs font-bold uppercase text-dark-700 block font-body">
                  प्रातः महाआरती (Morning Aarti)
                </span>
                <span className="text-base font-black text-maroon-900">08:00 AM</span>
              </div>
              <div className="p-4 rounded-2xl bg-cream-100 border border-gold-500/30 text-center shadow-sm">
                <Clock className="w-5 h-5 text-maroon-700 mx-auto mb-1.5" />
                <span className="text-xs font-bold uppercase text-dark-700 block font-body">
                  संध्या आरती एवं वंदना (Evening Aarti)
                </span>
                <span className="text-base font-black text-maroon-900">07:30 PM</span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={fetchLiveAndScheduledSessions}
                className="flex items-center gap-2 border-maroon-800 text-maroon-900 hover:bg-maroon-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>स्थिति रिफ्रेश करें (Refresh)</span>
              </Button>
              <DonateButton label="माँ के चरणों में दान करें" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 📅 UPCOMING SCHEDULED LIVE BROADCASTS SECTION                             */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-maroon-800" />
              <h2 className="text-xl sm:text-2xl font-heading font-black text-maroon-950">
                आगामी लाइव प्रसारण समय सारणी (Upcoming Schedule)
              </h2>
            </div>
            <span className="text-xs font-body text-muted bg-cream-100 px-3 py-1 rounded-full border border-cream-300">
              {scheduledSessions.length} निर्धारित
            </span>
          </div>

          {scheduledSessions.length === 0 ? (
            <div className="p-6 bg-cream-50 rounded-2xl border border-cream-300 text-center text-xs sm:text-sm font-body text-muted">
              वर्तमान में कोई विशेष लाइव शेड्यूल नहीं है। दैनिक आरती सुबह 08:00 AM और शाम 07:30 PM पर प्रसारित होती है।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledSessions.map((item) => {
                const schedDate = new Date(item.scheduledAt);
                return (
                  <div
                    key={item._id}
                    className="p-5 bg-cream-50 rounded-2xl border border-gold-500/30 shadow-soft hover:shadow-md transition-shadow space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold font-body border border-amber-300">
                        <Clock className="w-3 h-3" />
                        शेड्यूल
                      </span>
                      <span className="text-[11px] font-body text-muted font-mono">
                        {schedDate.toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-base text-maroon-950">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs font-body text-muted mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs font-body">
                      <span className="text-maroon-800 font-bold">
                        ⏰ {schedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-muted truncate max-w-[120px]">
                        द्वारा: {item.hostName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDarshan;
