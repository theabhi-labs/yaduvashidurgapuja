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
} from 'lucide-react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  ConnectionQualityIndicator,
  useLocalParticipant,
  useTracks,
  isTrackReference,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

import { liveDarshanService } from '../../services/liveDarshanService';
import {
  LiveSessionStartResponse,
  ScheduledSession,
  BroadcastHistoryItem,
  DailyBroadcastStat,
  GlobalSystemSettings,
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
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localCameraTrack = tracks.find(
    (t) => isTrackReference(t) && t.participant.isLocal && t.source === Track.Source.Camera
  );

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [duration, setDuration] = useState<number>(0);
  const [isTogglingCam, setIsTogglingCam] = useState<boolean>(false);
  const [isTogglingMic, setIsTogglingMic] = useState<boolean>(false);

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

      {/* Top Floating Status Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shadow-lg backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE ON-AIR
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-900/80 text-gold-300 font-mono text-xs backdrop-blur-md border border-gold-500/30">
            ⏱️ {formatDuration(duration)}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-900/80 text-emerald-300 font-semibold text-xs backdrop-blur-md border border-emerald-500/30">
            <Users className="w-3.5 h-3.5" />
            {currentViewers} Viewers (Peak: {peakViewers})
          </span>
        </div>

        <div className="pointer-events-auto">
          <ConnectionQualityIndicator />
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

          {/* Flip / Switch Camera (Back/Front for Smartphones) */}
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

  // Active Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastData, setBroadcastData] = useState<LiveSessionStartResponse | null>(null);
  const [currentViewers, setCurrentViewers] = useState<number>(0);
  const [peakViewers, setPeakViewers] = useState<number>(0);
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(true);
  const [isDonationEnabled, setIsDonationEnabled] = useState<boolean>(true);

  // Broadcaster Setup Form
  const [broadcastTitle, setBroadcastTitle] = useState<string>('Maa Durga Maha Aarti Live');
  const [broadcastDesc, setBroadcastDesc] = useState<string>('');

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

  // Modals & Loaders
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);

  // Live donations during admin broadcast
  const { latestDonation, clearLatestDonation, donationQueue } = useDonationSocket(
    broadcastData?.roomName
  );

  // Fetch Schedules & Global Settings & History
  const fetchData = useCallback(async () => {
    try {
      const [schedRes, settingsRes, histRes] = await Promise.all([
        liveDarshanService.listScheduledSessions(),
        liveDarshanService.getGlobalSettings(),
        liveDarshanService.getBroadcastHistory({ limit: 10 }),
      ]);

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
      toast.success('Live session scheduled successfully!');
      setIsScheduleModalOpen(false);
      setScheduleTitle('');
      setScheduleDesc('');
      setScheduleTime('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule session');
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

  // --- Super Admin Global Settings Toggle ---
  const handleUpdateGlobalSetting = async (field: 'isDonationEnabled' | 'isLiveChatEnabled', value: boolean) => {
    if (!isSuperAdmin) return;
    setIsUpdatingSettings(true);
    try {
      const res = await liveDarshanService.updateGlobalSettings({
        [field]: value,
      });
      setGlobalSettings(res.data);
      toast.success('Super Admin: Global settings updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update global settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-maroon-900/10 text-maroon-800">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-heading font-bold text-maroon-950">
              Live Broadcast Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted font-body">
            Start live Aarti streams, schedule upcoming broadcasts, toggle live chat/donations, and monitor audience analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isBroadcasting && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
              className="border-gold-600 text-maroon-900 hover:bg-gold-50 flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4 text-gold-600" />
              <span>Schedule New Broadcast</span>
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

      {/* ======================================================== */}
      {/* 1. ACTIVE LIVE BROADCAST STAGE                           */}
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
              {/* Live Viewers Counter */}
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
                  Live Aarti Offerings & Donations
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
                  {/* Global Payment Toggle */}
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

                  {/* Global Chat Toggle */}
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
      {/* 3. BROADCAST ANALYTICS & PEAK VIEWERS HISTORY            */}
      {/* ======================================================== */}
      <div className="bg-cream-50 rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-cream-300">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-maroon-800" />
              <h3 className="font-heading font-bold text-lg text-maroon-950">
                Broadcast History & Audience Analytics (Peak Viewers Overview)
              </h3>
            </div>
            <p className="text-xs text-muted font-body mt-0.5">
              Historical viewer counts and peak devotee participation records.
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
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No previous broadcast records found.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id} className="hover:bg-cream-100/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-maroon-950">{item.title}</td>
                    <td className="py-3 px-4 text-dark-900">{item.hostName}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
