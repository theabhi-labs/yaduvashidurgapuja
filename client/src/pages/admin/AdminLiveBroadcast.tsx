import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  StopCircle,
  Play,
  Video,
  VideoOff,
  Mic,
  MicOff,
  RefreshCw,
  AlertTriangle,
  Heart,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Users,
  MessageSquare,
  DollarSign,
  Settings,
  Plus,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useLocalParticipant,
  useConnectionState,
  useTracks,
  isTrackReference,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

import { liveDarshanService } from '../../services/liveDarshanService';
import {
  LiveSessionInfo,
  LiveSessionStartResponse,
  ScheduledSession,
  BroadcastHistoryItem,
  DailyBroadcastStat,
  GlobalSystemSettings,
  SessionLogsResponse,
} from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDonationSocket } from '../../hooks/useDonationSocket';
import { DonationCard } from '../../components/donation/DonationCard';
import { getSocket } from '../../services/socket';
import { formatDate } from '../../utils/helpers';

// =========================================================================
// CUSTOM CRASH-PROOF BROADCASTER STAGE (CAMERA & AUDIO BROADCASTER STUDIO)
// =========================================================================
interface BroadcasterStageProps {
  onEndBroadcast: () => void;
  title: string;
  hostName?: string;
  currentViewers: number;
  peakViewers: number;
}

const BroadcasterStage: React.FC<BroadcasterStageProps> = ({
  onEndBroadcast,
  currentViewers,
  peakViewers,
}) => {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const connectionState = useConnectionState();
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localCameraTrack = tracks.find(
    (t) => isTrackReference(t) && t.participant.isLocal && t.source === Track.Source.Camera
  );

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [duration, setDuration] = useState<number>(0);
  const [isTogglingCam, setIsTogglingCam] = useState<boolean>(false);
  const [isTogglingMic, setIsTogglingMic] = useState<boolean>(false);

  // Auto-request camera on broadcaster mount
  useEffect(() => {
    if (localParticipant) {
      if (!localParticipant.isCameraEnabled) {
        localParticipant.setCameraEnabled(true).catch((err) => {
          console.warn('Initial camera enable error:', err);
        });
      }
      if (!localParticipant.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(true).catch((err) => {
          console.warn('Initial mic enable error:', err);
        });
      }
    }
  }, [localParticipant]);

  // Broadcast duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleCamera = async () => {
    if (!localParticipant) return;
    try {
      setIsTogglingCam(true);
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (err: any) {
      console.error('Camera toggle error:', err);
    } finally {
      setIsTogglingCam(false);
    }
  };

  const toggleMicrophone = async () => {
    if (!localParticipant) return;
    try {
      setIsTogglingMic(true);
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err: any) {
      console.error('Microphone toggle error:', err);
    } finally {
      setIsTogglingMic(false);
    }
  };

  const flipCamera = async () => {
    if (!localParticipant) return;
    try {
      const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextFacing);
      await localParticipant.setCameraEnabled(false);
      await localParticipant.setCameraEnabled(true, {
        facingMode: nextFacing,
      });
    } catch (err) {
      console.error('Flip camera error:', err);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-dark-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-500/50 flex flex-col justify-between">
      {/* Video Stream Preview Display */}
      {isCameraEnabled && localCameraTrack && isTrackReference(localCameraTrack) ? (
        <VideoTrack
          trackRef={localCameraTrack}
          className="w-full h-full object-cover bg-black"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-dark-900 via-maroon-950/80 to-dark-950">
          <div className="w-16 h-16 rounded-full bg-maroon-900/80 border border-gold-500/40 flex items-center justify-center mb-3">
            <VideoOff className="w-8 h-8 text-gold-400" />
          </div>
          <h4 className="text-base font-heading font-bold text-cream-100 mb-1">
            {isCameraEnabled ? 'कैमरा शुरू हो रहा है (Starting Camera...)' : 'कैमरा बंद है (Camera is Off)'}
          </h4>
          <p className="text-xs text-cream-300 font-body max-w-md mb-4">
            भक्तों को लाइव आरती दिखाने के लिए नीचे दिए गए बटन से कैमरा चालू करें।
          </p>
          <Button
            size="sm"
            onClick={toggleCamera}
            isLoading={isTogglingCam}
            className="bg-gold-500 hover:bg-gold-600 text-maroon-950 font-bold border border-gold-300 shadow-lg"
          >
            <Video className="w-4 h-4 mr-1.5" />
            कैमरा चालू करें (Turn On Camera)
          </Button>
        </div>
      )}

      {/* Top Floating Status Info */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shadow-lg animate-pulse pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-white" />
            ON-AIR LIVE
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dark-900/80 text-cream-100 text-xs font-mono font-bold backdrop-blur-md border border-gold-500/30 pointer-events-auto">
            ⏱️ {formatDuration(duration)}
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dark-900/80 text-emerald-400 text-xs font-bold backdrop-blur-md border border-emerald-500/30 pointer-events-auto">
            <Users className="w-3.5 h-3.5" />
            <span>{currentViewers} Live</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-900/80 text-gold-300 text-xs font-bold backdrop-blur-md border border-gold-500/30 pointer-events-auto">
            <span>Peak: {peakViewers}</span>
          </span>
        </div>

        <div className="pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-900/80 text-xs backdrop-blur-md border border-gold-500/30">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-cream-100 font-bold text-[11px]">
              {connectionState === 'connected' ? 'HD Stream' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-xl bg-dark-950/85 backdrop-blur-md border border-gold-500/30 z-20">
        {/* Left: Device Controls */}
        <div className="flex items-center gap-2">
          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            disabled={isTogglingCam}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isCameraEnabled
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
            title={isCameraEnabled ? 'कैमरा बंद करें' : 'कैमरा चालू करें'}
          >
            {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isCameraEnabled ? 'Cam On' : 'Cam Off'}</span>
          </button>

          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={isTogglingMic}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isMicrophoneEnabled
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
            title={isMicrophoneEnabled ? 'माइक म्यूट करें' : 'माइक चालू करें'}
          >
            {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMicrophoneEnabled ? 'Mic On' : 'Muted'}</span>
          </button>

          {/* Flip Camera */}
          <button
            type="button"
            onClick={flipCamera}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-dark-800 hover:bg-dark-700 text-gold-300 border border-gold-500/30 shadow-md transition-all"
            title="कैमरा बदलें (Flip Camera)"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Flip Camera</span>
          </button>
        </div>

        {/* Right: End Broadcast Button */}
        <button
          type="button"
          onClick={onEndBroadcast}
          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-400 shadow-md transition-all"
        >
          <StopCircle className="w-4 h-4" />
          <span>End Live</span>
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN ADMIN LIVE BROADCAST CONTROLLER COMPONENT
// =========================================================================
export const AdminLiveBroadcast: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const toast = useToast();

  // Active Broadcast State (Local Studio)
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastData, setBroadcastData] = useState<LiveSessionStartResponse | null>(null);
  const [currentViewers, setCurrentViewers] = useState<number>(0);
  const [peakViewers, setPeakViewers] = useState<number>(0);
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(true);
  const [isDonationEnabled, setIsDonationEnabled] = useState<boolean>(true);

  // Broadcaster Setup Form
  const [broadcastTitle, setBroadcastTitle] = useState<string>('Maa Durga Maha Aarti Live');
  const [broadcastDesc, setBroadcastDesc] = useState<string>('');

  // Active Live Broadcasts Across All Admins
  const [activeLiveStreams, setActiveLiveStreams] = useState<LiveSessionInfo[]>([]);

  // Schedules State
  const [schedules, setSchedules] = useState<ScheduledSession[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [scheduleTitle, setScheduleTitle] = useState<string>('');
  const [scheduleDesc, setScheduleDesc] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState<boolean>(false);

  // Global Settings (Super Admin)
  const [globalSettings, setGlobalSettings] = useState<GlobalSystemSettings | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState<boolean>(false);

  // Broadcast History & Analytics
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyBroadcastStat[]>([]);
  const [historyTotal, setHistoryTotal] = useState<number>(0);

  // Per-Broadcast Logs Modal State
  const [selectedRoomForLogs, setSelectedRoomForLogs] = useState<string | null>(null);
  const [sessionLogsData, setSessionLogsData] = useState<SessionLogsResponse | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [activeLogsTab, setActiveLogsTab] = useState<'donations' | 'chat'>('donations');

  // Modals & Loaders
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [isTerminatingAll, setIsTerminatingAll] = useState<boolean>(false);

  // Live donations during admin broadcast
  const { latestDonation, clearLatestDonation, donationQueue } = useDonationSocket(
    broadcastData?.roomName
  );

  // Fetch Schedules, Active Streams, Global Settings & History
  const fetchData = useCallback(async () => {
    try {
      const [liveRes, schedRes, settingsRes, histRes] = await Promise.all([
        liveDarshanService.listLiveSessions(),
        liveDarshanService.listScheduledSessions(),
        liveDarshanService.getGlobalSettings(),
        liveDarshanService.getBroadcastHistory({ limit: 15 }),
      ]);

      if (liveRes.success) setActiveLiveStreams(liveRes.data || []);
      if (schedRes.success) setSchedules(schedRes.data || []);
      if (settingsRes.success) setGlobalSettings(settingsRes.data);
      if (histRes.success) {
        setHistory(histRes.data.history || []);
        setDailyStats(histRes.data.dailyStats || []);
        setHistoryTotal(histRes.pagination?.total || 0);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Real-time viewer count & status updates for broadcaster
  useEffect(() => {
    if (!broadcastData?.roomName) return;

    const socket = getSocket();
    socket.emit('join-arti-room', { roomName: broadcastData.roomName });

    const handleViewerCount = (data: { roomName: string; count: number }) => {
      if (data.roomName === broadcastData.roomName) {
        setCurrentViewers(data.count);
        setPeakViewers((prev) => Math.max(prev, data.count));
      }
    };

    socket.on('viewer-count-update', handleViewerCount);

    return () => {
      socket.off('viewer-count-update', handleViewerCount);
    };
  }, [broadcastData?.roomName]);

  // --- Start Broadcast ---
  const handleStartBroadcast = async (scheduledId?: string) => {
    try {
      setIsLoading(true);
      const res = await liveDarshanService.startSession({
        title: broadcastTitle,
        description: broadcastDesc,
        scheduledId,
        isChatEnabled,
        isDonationEnabled,
      });

      setBroadcastData(res.data);
      setIsChatEnabled(res.data.isChatEnabled !== false);
      setIsDonationEnabled(res.data.isDonationEnabled !== false);
      setIsBroadcasting(true);
      toast.success('Live Aarti broadcast is now on air!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start live broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  // --- End Broadcast ---
  const handleEndBroadcast = async () => {
    if (!broadcastData?.roomName) return;
    try {
      setIsLoading(true);
      await liveDarshanService.endSession(broadcastData.roomName);
      setIsBroadcasting(false);
      setBroadcastData(null);
      setShowEndModal(false);
      toast.success('Live broadcast ended successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to end live broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Force End an Active Session by roomName ---
  const handleForceEndActiveSession = async (roomName: string, title?: string) => {
    if (!window.confirm(`क्या आप सच में "${title || roomName}" प्रसारण को बंद करना चाहते हैं?`)) {
      return;
    }
    try {
      await liveDarshanService.endSession(roomName);
      toast.success('लाइव प्रसारण बंद कर दिया गया (Broadcast Terminated)');
      if (broadcastData?.roomName === roomName) {
        setIsBroadcasting(false);
        setBroadcastData(null);
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'लाइव बंद करने में समस्या आई');
    }
  };

  // --- SuperAdmin / Admin: End All Active Streams ---
  const handleEndAllStreams = async () => {
    if (!window.confirm('चेतावनी: क्या आप सभी सक्रिय लाइव प्रसारणों को तुरंत बंद करना चाहते हैं? (Force end all active broadcasts?)')) {
      return;
    }
    try {
      setIsTerminatingAll(true);
      await liveDarshanService.endAllLiveSessions();
      toast.success('सभी लाइव प्रसारण सफलतापूर्वक बंद कर दिए गए (All streams ended)');
      setIsBroadcasting(false);
      setBroadcastData(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'सभी लाइव बंद करने में समस्या आई');
    } finally {
      setIsTerminatingAll(false);
    }
  };

  // --- Inspect Per-Broadcast Logs (Donations & Chat Transcripts) ---
  const handleViewSessionLogs = async (roomName: string) => {
    try {
      setSelectedRoomForLogs(roomName);
      setIsLoadingLogs(true);
      const res = await liveDarshanService.getSessionLogs(roomName);
      if (res.success) {
        setSessionLogsData(res.data);
      } else {
        toast.error('इस प्रसारण का विवरण प्राप्त नहीं हो सका');
      }
    } catch (err: any) {
      toast.error(err.message || 'लॉग लोड करने में त्रुटि');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // --- Toggle Chat for Active Stream ---
  const handleToggleChat = async () => {
    if (!broadcastData?.roomName) return;
    try {
      const nextState = !isChatEnabled;
      await liveDarshanService.toggleChat(broadcastData.roomName, nextState);
      setIsChatEnabled(nextState);
      toast.info(nextState ? 'Live chat enabled' : 'Live chat disabled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update chat state');
    }
  };

  // --- Toggle Donation for Active Stream ---
  const handleToggleDonation = async () => {
    if (!broadcastData?.roomName) return;
    try {
      const nextState = !isDonationEnabled;
      await liveDarshanService.toggleDonation(broadcastData.roomName, nextState);
      setIsDonationEnabled(nextState);
      toast.info(nextState ? 'Donation service enabled' : 'Donation service disabled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update donation state');
    }
  };

  // --- Create Schedule ---
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleTime) {
      toast.error('Please provide a title and scheduled time');
      return;
    }

    setIsScheduling(true);
    try {
      await liveDarshanService.scheduleSession({
        title: scheduleTitle.trim(),
        description: scheduleDesc.trim() || undefined,
        scheduledAt: new Date(scheduleTime).toISOString(),
      });

      toast.success('Aarti broadcast scheduled successfully!');
      setIsScheduleModalOpen(false);
      setScheduleTitle('');
      setScheduleDesc('');
      setScheduleTime('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule broadcast');
    } finally {
      setIsScheduling(false);
    }
  };

  // --- Delete Schedule ---
  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled broadcast?')) return;
    try {
      await liveDarshanService.deleteScheduledSession(id);
      toast.success('Scheduled broadcast cancelled');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete schedule');
    }
  };

  // --- Super Admin Global Settings Update ---
  const handleUpdateGlobalSetting = async (
    key: 'isDonationEnabled' | 'isLiveChatEnabled',
    value: boolean
  ) => {
    try {
      setIsUpdatingSettings(true);
      const res = await liveDarshanService.updateGlobalSettings({ [key]: value });
      if (res.success) {
        setGlobalSettings(res.data);
        toast.success(`Global ${key === 'isDonationEnabled' ? 'Donation' : 'Live Chat'} updated`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update global setting');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-maroon-900/10 text-maroon-800">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-heading font-bold text-maroon-950">
              Live Broadcast Studio & Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted font-body">
            Start live Aarti streams, monitor real-time devotee offerings, inspect per-broadcast chat & donation logs, and manage active sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeLiveStreams.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndAllStreams}
              isLoading={isTerminatingAll}
              className="border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-bold"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>End All Live ({activeLiveStreams.length})</span>
            </Button>
          )}

          {!isBroadcasting && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
              className="border-gold-600 text-maroon-900 hover:bg-gold-50 flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4 text-gold-600" />
              <span>Schedule Aarti</span>
            </Button>
          )}

          {isBroadcasting && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shadow-md animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                Live On-Air
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEndModal(true)}
                className="border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Broadcast</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Realtime Donation Overlay Banner */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none">
        <DonationCard
          donation={latestDonation}
          onDismiss={clearLatestDonation}
        />
      </div>

      {/* ========================================================================= */}
      {/* 🔴 ACTIVE LIVE BROADCASTS MANAGER (Force Stop Orphaned / Running Streams) */}
      {/* ========================================================================= */}
      {activeLiveStreams.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/90 via-maroon-950/95 to-dark-950 p-5 rounded-3xl border-2 border-red-500/50 shadow-xl space-y-4 text-cream-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-red-500/30">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-base font-heading font-bold text-red-200">
                Active Live Broadcasts Right Now ({activeLiveStreams.length} On-Air)
              </h3>
            </div>
            <span className="text-xs font-body text-cream-300">
              यदि कोई प्रसारण अधूरा या बिना कैमरे के चल रहा हो, तो नीचे दिए गए बटन से तुरंत बंद करें।
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeLiveStreams.map((stream) => (
              <div
                key={stream.roomName}
                className="p-4 rounded-2xl bg-dark-900/90 border border-red-500/30 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
                      LIVE
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {stream.currentViewers || 0} Viewers
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-gold-200 truncate">
                    {stream.title || 'Maa Durga Maha Aarti'}
                  </h4>
                  <p className="text-xs text-cream-300 font-body truncate mt-0.5">
                    Host: <strong className="text-white">{stream.hostName}</strong> • Room: <span className="font-mono text-[11px] text-gold-400">{stream.roomName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-dark-700">
                  <button
                    type="button"
                    onClick={() => handleForceEndActiveSession(stream.roomName, stream.title)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Force End (बंद करें)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewSessionLogs(stream.roomName)}
                    className="py-1.5 px-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-maroon-950 font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. ACTIVE LIVE BROADCAST STAGE (Local Studio)            */}
      {/* ======================================================== */}
      {isBroadcasting && broadcastData ? (
        <div className="space-y-6">
          {/* Live Monitor Bar */}
          <div className="bg-gradient-to-r from-dark-950 via-maroon-950 to-dark-950 text-cream-50 p-4 rounded-2xl border border-gold-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <h3 className="font-heading font-bold text-base text-gold-300">
                  {broadcastData.title || 'Maa Durga Maha Aarti Live'}
                </h3>
                <p className="text-xs text-cream-300 font-body">
                  Broadcaster: {user?.name} (Admin) • Room: {broadcastData.roomName}
                </p>
              </div>
            </div>

            {/* Live Counters & Toggles */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-dark-900/90 px-3.5 py-1.5 rounded-xl border border-gold-500/30">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>
                  Current Viewers: <strong className="text-emerald-300 text-sm font-bold">{currentViewers}</strong>
                </span>
                <span className="text-muted">|</span>
                <span>
                  Peak Viewers: <strong className="text-gold-300 text-sm font-bold">{peakViewers}</strong>
                </span>
              </div>

              {/* Chat Toggle Button */}
              <button
                type="button"
                onClick={handleToggleChat}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-all ${
                  isChatEnabled
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/80 border-red-500/40 text-red-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isChatEnabled ? 'Chat: ON' : 'Chat: OFF'}</span>
              </button>

              {/* Donation Toggle Button */}
              <button
                type="button"
                onClick={handleToggleDonation}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-all ${
                  isDonationEnabled
                    ? 'bg-gold-950/80 border-gold-500/40 text-gold-300'
                    : 'bg-red-950/80 border-red-500/40 text-red-300'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{isDonationEnabled ? 'Donations: ON' : 'Donations: OFF'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Broadcaster Video Stage (3 cols) */}
            <div className="lg:col-span-3">
              <ErrorBoundary
                fallbackTitle="लाइव प्रसारण कैमरा त्रुटि (Camera Studio Error)"
                fallbackMessage="कैमरा या लाइवकिट कनेक्शन में समस्या आई। पुनः प्रयास करें।"
              >
                <LiveKitRoom
                  video={true}
                  audio={true}
                  token={broadcastData.token}
                  serverUrl={broadcastData.wsUrl}
                  connect={true}
                  data-lk-theme="default"
                  onError={(err) => {
                    console.error('LiveKit Broadcaster Error:', err);
                  }}
                  className="w-full"
                >
                  <RoomAudioRenderer />
                  <BroadcasterStage
                    title={broadcastData.title || 'Maa Durga Maha Aarti Live'}
                    hostName={user?.name}
                    currentViewers={currentViewers}
                    peakViewers={peakViewers}
                    onEndBroadcast={() => setShowEndModal(true)}
                  />
                </LiveKitRoom>
              </ErrorBoundary>
            </div>

            {/* Live Donations Feed Sidebar (1 col) */}
            <div className="bg-cream-50 rounded-2xl p-4 border border-gold-500/30 shadow-md flex flex-col h-[480px]">
              <div className="flex items-center gap-2 pb-3 border-b border-cream-300">
                <Heart className="w-4 h-4 text-maroon-700 fill-maroon-700" />
                <h3 className="font-heading font-bold text-sm text-maroon-900">
                  Live Aarti Offerings & Super Chats
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {donationQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted text-xs font-body">
                    <Sparkles className="w-6 h-6 text-gold-500 mb-1" />
                    <span>Devotee offerings made during the live stream will appear here in real time.</span>
                  </div>
                ) : (
                  donationQueue.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-cream-100 border border-gold-500/30 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-maroon-900 truncate">
                          {item.donorName}
                        </p>
                        {item.message && (
                          <p className="text-[11px] text-muted truncate">
                            "{item.message}"
                          </p>
                        )}
                      </div>
                      <span className="font-black text-maroon-800 bg-gold-400/20 px-2 py-0.5 rounded border border-gold-500/40 shrink-0">
                        ₹{item.amount}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. BROADCAST LAUNCHPAD (Start Instant or Pick Schedule)  */
        /* ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Go Live Card */}
          <div className="lg:col-span-7 bg-cream-50 rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-lg space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-maroon-900 text-gold-300 flex items-center justify-center shadow-md">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-maroon-950">
                  Start Live Broadcast (Go Live Now)
                </h2>
                <p className="text-xs text-muted font-body">
                  Multiple admins can broadcast simultaneously from various angles (Pandal, Aarti, Hawan).
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5 font-body uppercase">
                  Broadcast / Aarti Title *
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., Evening Maha Aarti, Durga Saptashati Recitation, Hawan Darshan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-100/70 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-semibold font-body"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5 font-body uppercase">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                  placeholder="e.g., Sacred live darshan from Kapooripur main pandal..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-100/70 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-cream-100 border border-cream-300">
                  <input
                    type="checkbox"
                    id="enableChat"
                    checked={isChatEnabled}
                    onChange={(e) => setIsChatEnabled(e.target.checked)}
                    className="w-4 h-4 text-maroon-800 rounded"
                  />
                  <label htmlFor="enableChat" className="text-xs font-semibold text-dark-800 cursor-pointer font-body">
                    Enable Live Chat
                  </label>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-cream-100 border border-cream-300">
                  <input
                    type="checkbox"
                    id="enableDonation"
                    checked={isDonationEnabled}
                    onChange={(e) => setIsDonationEnabled(e.target.checked)}
                    className="w-4 h-4 text-maroon-800 rounded"
                  />
                  <label htmlFor="enableDonation" className="text-xs font-semibold text-dark-800 cursor-pointer font-body">
                    Enable Devotee Donations
                  </label>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => handleStartBroadcast()}
                isLoading={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-200 border border-gold-500/40 shadow-lg text-base font-bold flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-gold-400 text-gold-400" />
                <span>Go Live Now</span>
              </Button>
            </div>
          </div>

          {/* Super Admin Global Controls & Upcoming Schedules */}
          <div className="lg:col-span-5 space-y-6">
            {/* Super Admin Master Controls Card */}
            {isSuperAdmin && globalSettings && (
              <div className="bg-gradient-to-br from-dark-950 via-maroon-950 to-dark-900 text-cream-50 p-5 rounded-3xl border border-gold-500/50 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gold-500/30">
                  <Settings className="w-5 h-5 text-gold-400" />
                  <div>
                    <h3 className="text-sm font-heading font-bold text-gold-300">
                      Super Admin Master Controls (Global Controls)
                    </h3>
                    <p className="text-[11px] text-cream-300 font-body">
                      Toggle donation payments or live chat globally across all website streams
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-body">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-dark-700">
                    <div>
                      <span className="font-bold text-cream-100 block">Global Donation Gateway</span>
                      <span className="text-[11px] text-muted">Enable or disable Razorpay devotee donation gateway</span>
                    </div>
                    <button
                      type="button"
                      disabled={isUpdatingSettings}
                      onClick={() => handleUpdateGlobalSetting('isDonationEnabled', !globalSettings.isDonationEnabled)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        globalSettings.isDonationEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-700 text-white'
                      }`}
                    >
                      {globalSettings.isDonationEnabled ? 'Enabled (ON)' : 'Disabled (OFF)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-dark-700">
                    <div>
                      <span className="font-bold text-cream-100 block">Global Live Chat Feature</span>
                      <span className="text-[11px] text-muted">Enable or disable live chat messaging across all streams</span>
                    </div>
                    <button
                      type="button"
                      disabled={isUpdatingSettings}
                      onClick={() => handleUpdateGlobalSetting('isLiveChatEnabled', !globalSettings.isLiveChatEnabled)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        globalSettings.isLiveChatEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-700 text-white'
                      }`}
                    >
                      {globalSettings.isLiveChatEnabled ? 'Enabled (ON)' : 'Disabled (OFF)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Schedules List */}
            <div className="bg-cream-50 rounded-3xl p-5 border border-cream-300 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-maroon-700" />
                  <h3 className="font-heading font-bold text-sm text-maroon-950">
                    Upcoming Scheduled Broadcasts ({schedules.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-xs text-maroon-800 hover:underline font-bold"
                >
                  + Add New
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {schedules.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6 font-body">
                    No upcoming broadcasts scheduled.
                  </p>
                ) : (
                  schedules.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-xl bg-cream-100 border border-cream-300 flex items-center justify-between gap-3 text-xs font-body"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-maroon-900 truncate">{s.title}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted mt-0.5">
                          <Clock className="w-3 h-3 text-gold-600" />
                          <span>{new Date(s.scheduledAt).toLocaleString('en-US')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartBroadcast(s._id)}
                          className="py-1 px-2 text-[11px] bg-maroon-800 text-gold-300 font-bold"
                        >
                          Go Live
                        </Button>
                        <button
                          onClick={() => handleDeleteSchedule(s._id)}
                          className="p-1.5 text-muted hover:text-red-700 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BROADCAST HISTORY & PER-BROADCAST LOGS TABLE          */}
      {/* ======================================================== */}
      <div className="bg-cream-50 rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-cream-300">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-maroon-800" />
              <h3 className="font-heading font-bold text-lg text-maroon-950">
                Broadcast History & Session Logs (प्रसारण इतिहास एवं दान/चैट रिकॉर्ड)
              </h3>
            </div>
            <p className="text-xs text-muted font-body mt-0.5">
              प्रत्येक लाइव आरती का अलग-अलग दान व चैट विवरण देखने के लिए <strong>"View Logs (लॉग देखें)"</strong> पर क्लिक करें।
            </p>
          </div>

          <span className="text-xs font-bold text-maroon-900 bg-maroon-100 px-3 py-1 rounded-full border border-maroon-200">
            Total Sessions: {historyTotal}
          </span>
        </div>

        {/* Daily Peak Summary Badges */}
        {dailyStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {dailyStats.map((stat) => (
              <div
                key={stat._id}
                className="p-2.5 rounded-xl bg-cream-100 border border-gold-500/30 text-center"
              >
                <span className="text-[10px] text-muted block font-mono">{stat._id}</span>
                <span className="text-sm font-black text-maroon-900 block mt-0.5">
                  {stat.dailyPeak} Devotees
                </span>
                <span className="text-[10px] text-gold-700 font-body">
                  {stat.sessionCount} Sessions
                </span>
              </div>
            ))}
          </div>
        )}

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-cream-200/80 text-dark-800 font-bold uppercase tracking-wider border-b border-cream-300">
              <tr>
                <th className="py-3 px-4">Program / Title</th>
                <th className="py-3 px-4">Broadcaster Admin</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Peak Viewers</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Session Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No previous broadcast records found.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id} className="hover:bg-cream-100/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-maroon-950">
                      <div>{item.title}</div>
                      <div className="text-[10px] text-muted font-mono">{item.roomName}</div>
                    </td>
                    <td className="py-3 px-4 text-dark-900 font-semibold">{item.hostName}</td>
                    <td className="py-3 px-4 text-muted font-mono">
                      {formatDate(item.startedAt)}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-800">
                      👥 {item.peakViewers || 0} devotees
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'live'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-cream-300 text-dark-800'
                        }`}
                      >
                        {item.status === 'live' ? 'Live' : 'Ended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewSessionLogs(item.roomName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-maroon-900 text-gold-200 hover:bg-maroon-950 font-bold text-xs shadow-sm border border-gold-500/30 transition-all active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5 text-gold-400" />
                        <span>View Logs (लॉग देखें)</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📜 PER-BROADCAST SESSION LOGS MODAL (Donations + Chat Transcript)        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedRoomForLogs)}
        onClose={() => {
          setSelectedRoomForLogs(null);
          setSessionLogsData(null);
        }}
        title="Broadcast Session Records & Logs (प्रसारण विवरण)"
        maxWidth="2xl"
      >
        {isLoadingLogs ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-maroon-700 animate-spin" />
            <span className="text-xs font-body text-muted">Loading broadcast transcript and donation records...</span>
          </div>
        ) : sessionLogsData ? (
          <div className="space-y-5">
            {/* Header Summary Card */}
            <div className="bg-cream-100 p-4 rounded-2xl border border-gold-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-black text-base text-maroon-950">
                    {sessionLogsData.session?.title || 'Live Aarti Session'}
                  </h3>
                  <p className="text-xs text-muted font-body mt-0.5">
                    Host: <strong className="text-dark-900">{sessionLogsData.session?.hostName}</strong> • Room: <span className="font-mono text-gold-700">{sessionLogsData.session?.roomName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-cream-200 text-maroon-900 font-bold text-xs">
                    👥 Peak: {sessionLogsData.session?.peakViewers || 0}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs">
                    ₹{sessionLogsData.totalDonationAmount} Total Seva
                  </span>
                </div>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-cream-50 p-2.5 rounded-xl border border-cream-300 text-center">
                  <span className="text-[10px] text-muted block uppercase">Total Donations</span>
                  <span className="text-base font-black text-maroon-900">₹{sessionLogsData.totalDonationAmount}</span>
                  <span className="text-[10px] text-gold-700 block">({sessionLogsData.totalDonationCount} offerings)</span>
                </div>
                <div className="bg-cream-50 p-2.5 rounded-xl border border-cream-300 text-center">
                  <span className="text-[10px] text-muted block uppercase">Live Comments</span>
                  <span className="text-base font-black text-maroon-900">{sessionLogsData.totalMessagesCount}</span>
                  <span className="text-[10px] text-muted block">messages logged</span>
                </div>
                <div className="bg-cream-50 p-2.5 rounded-xl border border-cream-300 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-muted block uppercase">Stream Started</span>
                  <span className="text-xs font-bold text-dark-800 block mt-1">
                    {sessionLogsData.session?.startedAt ? formatDate(sessionLogsData.session.startedAt) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-cream-300 pb-2">
              <button
                type="button"
                onClick={() => setActiveLogsTab('donations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeLogsTab === 'donations'
                    ? 'bg-maroon-900 text-gold-200 shadow-md'
                    : 'bg-cream-100 text-dark-800 hover:bg-cream-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Donations & Super Chats ({sessionLogsData.totalDonationCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLogsTab('chat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeLogsTab === 'chat'
                    ? 'bg-maroon-900 text-gold-200 shadow-md'
                    : 'bg-cream-100 text-dark-800 hover:bg-cream-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Transcript ({sessionLogsData.totalMessagesCount})</span>
              </button>
            </div>

            {/* Tab 1: Donations List */}
            {activeLogsTab === 'donations' && (
              <div className="space-y-3">
                {sessionLogsData.donations.length === 0 ? (
                  <div className="py-10 text-center text-xs font-body text-muted bg-cream-50 rounded-2xl border border-cream-300">
                    No devotee donations or Super Chats recorded during this live stream.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs font-body">
                      <thead className="bg-cream-200 text-dark-900 font-bold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Donor Name</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Message / Prayer</th>
                          <th className="py-2.5 px-3">Payment ID</th>
                          <th className="py-2.5 px-3">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-200">
                        {sessionLogsData.donations.map((don) => (
                          <tr key={don._id} className="hover:bg-cream-100">
                            <td className="py-2.5 px-3 font-bold text-maroon-950">
                              {don.isAnonymous ? 'गुप्त भक्त (Anonymous)' : don.donorName}
                            </td>
                            <td className="py-2.5 px-3 font-black text-emerald-800">
                              ₹{don.amount}
                            </td>
                            <td className="py-2.5 px-3 text-dark-800 max-w-xs truncate">
                              {don.message || '—'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-muted">
                              {don.razorpayPaymentId || don.razorpayOrderId}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-muted font-mono">
                              {new Date(don.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Live Chat Transcript */}
            {activeLogsTab === 'chat' && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {sessionLogsData.messages.length === 0 ? (
                  <div className="py-10 text-center text-xs font-body text-muted bg-cream-50 rounded-2xl border border-cream-300">
                    No comments were sent in live chat during this broadcast.
                  </div>
                ) : (
                  sessionLogsData.messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        msg.isSuperChat
                          ? 'bg-amber-50 border-gold-400 text-amber-950 shadow-sm'
                          : 'bg-cream-50 border-cream-300 text-dark-900'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          msg.isSuperChat
                            ? 'bg-gold-500 text-maroon-950 font-black'
                            : 'bg-maroon-800 text-cream-100'
                        }`}
                      >
                        {msg.name ? msg.name.charAt(0).toUpperCase() : 'भ'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-maroon-950">{msg.name}</span>
                          {msg.isSuperChat && (
                            <span className="px-1.5 py-0.2 rounded bg-gold-500 text-maroon-950 font-black text-[10px]">
                              🪙 Super Chat ₹{msg.donationAmount}
                            </span>
                          )}
                          <span className="text-[10px] text-muted font-mono ml-auto">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-dark-800 font-body mt-0.5 break-words leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted text-xs">No records available for this session.</div>
        )}
      </Modal>

      {/* Schedule Live Broadcast Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Live Aarti Broadcast"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1.5 font-body">
              Program / Aarti Title *
            </label>
            <input
              type="text"
              required
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="e.g., Morning Maha Aarti, Pushpanjali & Navami Hawan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-body font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1.5 font-body">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1.5 font-body">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={scheduleDesc}
              onChange={(e) => setScheduleDesc(e.target.value)}
              placeholder="Live sacred darshan directly from Kapooripur Pandal..."
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-body"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isScheduling}
              className="bg-maroon-900 hover:bg-maroon-950 text-gold-200"
            >
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal to End Broadcast */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End Live Broadcast?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-maroon-700 mx-auto" />
          <p className="text-sm font-body text-dark-800">
            Are you sure you want to end this live broadcast? All connected devotees will be disconnected.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowEndModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEndBroadcast}
              isLoading={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              Yes, End Broadcast
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLiveBroadcast;
