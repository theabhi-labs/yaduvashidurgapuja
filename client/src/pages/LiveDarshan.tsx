import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  RefreshCw,
  Clock,
  Users,
  Calendar,
  Sparkles,
  Layers,
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
import { ArtiChatPanel } from '../components/chat/ArtiChatPanel';
import { useDonationSocket } from '../hooks/useDonationSocket';
import { getSocket } from '../services/socket';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

// Custom View-only Player inside LiveKit Room
const LiveStreamPlayer: React.FC<{
  hostName?: string;
  title?: string;
  currentViewers?: number;
}> = ({ hostName, title, currentViewers = 0 }) => {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const cameraTrack = tracks[0];

  return (
    <div className="relative w-full aspect-video bg-dark-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-500/50 flex items-center justify-center">
      {/* Live Audio */}
      <RoomAudioRenderer />

      {cameraTrack && isTrackReference(cameraTrack) ? (
        <VideoTrack
          trackRef={cameraTrack}
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon-900/60 border border-gold-500/40 flex items-center justify-center mb-4 animate-pulse">
            <Radio className="w-8 h-8 text-gold-400" />
          </div>
          <h3 className="text-lg font-heading font-bold text-gold-200 mb-1">
            {title ? `${title} — Connecting Stream...` : 'Loading Live Stream...'}
          </h3>
          <p className="text-xs text-cream-300 font-body max-w-sm">
            Please wait while the camera broadcast connects from the puja mandap.
          </p>
        </div>
      )}

      {/* Floating Status Badges */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-700/90 text-white font-bold text-xs shadow-lg backdrop-blur-md border border-red-500/40 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          LIVE AARTI
        </span>

        {/* Real-time viewer count badge on top of video player */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950/80 text-emerald-300 font-semibold text-xs backdrop-blur-md border border-emerald-500/40 shadow-sm">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentViewers} Viewers Live</span>
        </span>

        {hostName && (
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dark-950/80 text-gold-300 font-medium text-xs backdrop-blur-md border border-gold-500/30">
            Host: {hostName}
          </span>
        )}
      </div>
    </div>
  );
};

export const LiveDarshan: React.FC = () => {
  const toast = useToast();
  const [allLiveSessions, setAllLiveSessions] = useState<LiveSessionInfo[]>([]);
  const [activeSession, setActiveSession] = useState<LiveSessionInfo | null>(null);
  const [joinData, setJoinData] = useState<LiveSessionJoinResponse | null>(null);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [liveViewerCount, setLiveViewerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real-time donation socket hook
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
          // Refresh active session metadata (such as chat/donation toggles)
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
    // Poll for live broadcasts every 25 seconds
    const interval = setInterval(fetchLiveAndScheduledSessions, 25000);
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

  return (
    <div className="min-h-screen bg-cream-200 text-dark-900 pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Title */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon-900/10 border border-gold-600/30 text-maroon-800 text-xs sm:text-sm font-bold mb-3"
          >
            <Radio className="w-4 h-4 text-maroon-700 animate-pulse" />
            <span>Divine Darshan & Maha Aarti</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-maroon-900 tracking-tight">
            Live Darshan — Yaduvanshi Durga Puja
          </h1>
          <p className="text-sm sm:text-base text-muted font-body mt-2 max-w-2xl mx-auto">
            Experience divine aarti, sacred darshan, and rituals directly from the Kapooripur Durga Puja mandap.
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
          <div className="bg-cream-50 p-4 rounded-2xl border-2 border-gold-500/40 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-maroon-700" />
              <span className="text-xs sm:text-sm font-bold font-heading text-maroon-950">
                {allLiveSessions.length} Active Broadcasts Available — Select Stream:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allLiveSessions.map((session) => {
                const isSelected = activeSession?.roomName === session.roomName;
                return (
                  <button
                    key={session.roomName}
                    onClick={() => handleJoin(session)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
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
                        <span>{session.currentViewers || 0} viewers</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Section */}
        {isLoading && !activeSession ? (
          <div className="aspect-video max-w-4xl mx-auto bg-dark-900/10 rounded-2xl animate-pulse flex items-center justify-center border border-cream-300">
            <RefreshCw className="w-8 h-8 text-maroon-700 animate-spin" />
          </div>
        ) : activeSession && joinData ? (
          /* Active Live Stream with Video & Ephemeral Live Chat */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Video Player & Stream Info */}
            <div className="lg:col-span-2 space-y-4">
              <LiveKitRoom
                video={false}
                audio={false}
                token={joinData.token}
                serverUrl={joinData.wsUrl}
                connect={true}
                data-lk-theme="default"
                className="w-full"
              >
                <LiveStreamPlayer
                  hostName={activeSession.hostName}
                  title={activeSession.title}
                  currentViewers={liveViewerCount}
                />
              </LiveKitRoom>

              {/* Stream Info & Actions bar */}
              <div className="bg-cream-50 p-4 sm:p-6 rounded-2xl border border-gold-500/30 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-maroon-800 text-gold-300 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                      🕉️
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg sm:text-xl text-maroon-950 leading-snug">
                        {activeSession.title || 'Yaduvanshi Durga Puja Kapooripur — Maha Aarti'}
                      </h3>
                      <p className="text-xs text-muted font-body mt-0.5">
                        Broadcaster: <span className="font-semibold text-dark-900">{activeSession.hostName}</span> • Kapooripur, Suriyanwa, Bhadohi
                      </p>
                      {activeSession.description && (
                        <p className="text-xs text-dark-700 font-body mt-1 bg-cream-100 p-2 rounded-lg border border-cream-200">
                          {activeSession.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Real-time Devotees Counter Badge */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-xs uppercase tracking-wider block font-body text-emerald-800 font-bold">
                        Live Viewers
                      </span>
                      <span className="text-lg font-black font-heading text-emerald-950">
                        {liveViewerCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Donation and Actions Bar */}
                <div className="pt-2 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted font-body flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                    <span>Contribute to puja seva during the sacred aarti</span>
                  </div>

                  {/* Conditional Donation Button based on Admin / SuperAdmin toggle */}
                  {activeSession.isDonationEnabled !== false ? (
                    <DonateButton
                      liveSessionRoomName={activeSession.roomName}
                      size="lg"
                      className="w-full sm:w-auto"
                    />
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-200 text-muted text-xs font-body border border-cream-300">
                      <HeartHandshake className="w-4 h-4 text-muted" />
                      <span>Donations are disabled for this broadcast</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Ephemeral Live Chat Panel */}
            <div className="lg:col-span-1">
              <ArtiChatPanel
                roomName={activeSession.roomName}
                defaultExpanded={true}
                initialChatEnabled={activeSession.isChatEnabled ?? true}
              />
            </div>
          </div>
        ) : (
          /* Empty State — No Active Stream */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto bg-cream-50 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-gold-500/40 shadow-xl space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-maroon-900 to-maroon-950 text-gold-300 flex items-center justify-center shadow-lg border-2 border-gold-400">
              <Radio className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-maroon-900">
                No Aarti Currently Streaming Live
              </h3>
              <p className="text-sm sm:text-base text-muted font-body max-w-lg mx-auto">
                Live broadcasts stream during scheduled aarti and puja hours. Please check the timings below or re-visit during the aarti session.
              </p>
            </div>

            {/* Daily Schedule Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
              <div className="p-4 rounded-xl bg-cream-100 border border-gold-500/20 text-center">
                <Clock className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <span className="text-xs font-bold uppercase text-dark-700 block font-body">
                  Morning Maha Aarti
                </span>
                <span className="text-sm font-extrabold text-maroon-900">08:00 AM</span>
              </div>
              <div className="p-4 rounded-xl bg-cream-100 border border-gold-500/20 text-center">
                <Clock className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <span className="text-xs font-bold uppercase text-dark-700 block font-body">
                  Evening Aarti & Vandana
                </span>
                <span className="text-sm font-extrabold text-maroon-900">07:30 PM</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={fetchLiveAndScheduledSessions}
                className="flex items-center gap-2 border-maroon-800 text-maroon-900 hover:bg-maroon-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </Button>
              <DonateButton label="Donate to Puja Seva" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 📅 UPCOMING SCHEDULED LIVE BROADCASTS SECTION (Scheduled by Admins) */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-maroon-800" />
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon-950">
                Upcoming Live Broadcast Schedule
              </h2>
            </div>
            <span className="text-xs font-body text-muted bg-cream-100 px-3 py-1 rounded-full border border-cream-300">
              {scheduledSessions.length} Scheduled
            </span>
          </div>

          {scheduledSessions.length === 0 ? (
            <div className="p-6 bg-cream-50 rounded-2xl border border-cream-300 text-center text-xs sm:text-sm font-body text-muted">
              No special live events scheduled right now. Daily recurring aartis stream at 08:00 AM and 07:30 PM.
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
                        Scheduled
                      </span>
                      <span className="text-[11px] font-body text-muted">
                        {schedDate.toLocaleDateString('en-US', {
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
                      <span className="text-muted">
                        By: {item.hostName}
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

