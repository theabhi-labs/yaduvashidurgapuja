import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  RefreshCw,
  Clock,
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
import { LiveSessionInfo, LiveSessionJoinResponse } from '../types';
import { DonateButton } from '../components/donation/DonateButton';
import { DonationCard } from '../components/donation/DonationCard';
import { ArtiChatPanel } from '../components/chat/ArtiChatPanel';
import { useDonationSocket } from '../hooks/useDonationSocket';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

// Custom View-only Player inside LiveKit Room
const LiveStreamPlayer: React.FC<{ hostName?: string }> = ({
  hostName,
}) => {
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
          <h3 className="text-lg font-devanagari-heading font-bold text-gold-200 mb-1">
            लाइव आरती प्रसारण लोड हो रहा है...
          </h3>
          <p className="text-xs text-cream-300 font-devanagari-body max-w-sm">
            कृपया प्रतीक्षा करें, पुजारी जी का लाइव कैमरा स्ट्रीम कनेक्ट हो रहा है।
          </p>
        </div>
      )}

      {/* Floating Status Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-700/90 text-white font-bold text-xs shadow-lg backdrop-blur-md border border-red-500/40 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          लाइव आरती
        </span>
        {hostName && (
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dark-950/80 text-gold-300 font-medium text-xs backdrop-blur-md border border-gold-500/30">
            पुजारी/व्यवस्थापक: {hostName}
          </span>
        )}
      </div>
    </div>
  );
};

export const LiveDarshan: React.FC = () => {
  const toast = useToast();
  const [activeSession, setActiveSession] = useState<LiveSessionInfo | null>(null);
  const [joinData, setJoinData] = useState<LiveSessionJoinResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real-time donation socket hook
  const { latestDonation, clearLatestDonation } = useDonationSocket(
    activeSession?.roomName
  );

  const fetchLiveSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await liveDarshanService.listLiveSessions();
      const liveList = res.data || [];

      if (liveList.length > 0) {
        // Automatically select the first live session if not already joined
        if (!activeSession || !liveList.some((s) => s.roomName === activeSession.roomName)) {
          handleJoin(liveList[0]);
        }
      } else {
        setActiveSession(null);
        setJoinData(null);
      }
    } catch {
      toast.error('लाइव सत्र सूची लोड करने में समस्या आई');
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, toast]);

  useEffect(() => {
    fetchLiveSessions();
    // Poll for live broadcasts every 25 seconds
    const interval = setInterval(fetchLiveSessions, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (session: LiveSessionInfo) => {
    try {
      const res = await liveDarshanService.joinSession(session.roomName);
      setActiveSession(session);
      setJoinData(res.data);
    } catch (err: any) {
      toast.error(err.message || 'लाइव दर्शन से जुड़ने में समस्या आई');
    }
  };

  return (
    <div className="min-h-screen bg-cream-200 text-dark-900 pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon-900/10 border border-gold-600/30 text-maroon-800 text-xs sm:text-sm font-bold mb-3"
          >
            <Radio className="w-4 h-4 text-maroon-700 animate-pulse" />
            <span>माँ भगवती पावन दर्शन एवं आरती</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-devanagari-heading font-black text-maroon-900 tracking-tight">
            लाइव दर्शन — यदुवंशी दुर्गा पूजा
          </h1>
          <p className="text-sm sm:text-base text-muted font-devanagari-body mt-2 max-w-2xl mx-auto">
            कपूरिपुर पूजा पंडाल से सीधे अपने घर पर माँ दुर्गा की दिव्य आरती और मंगल दर्शन का पुण्य लाभ प्राप्त करें।
          </p>
        </div>

        {/* Real-time donation popup overlay container */}
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 pointer-events-none">
          <DonationCard
            donation={latestDonation}
            onDismiss={clearLatestDonation}
          />
        </div>

        {/* Content Section */}
        {isLoading && !activeSession ? (
          <div className="aspect-video max-w-4xl mx-auto bg-dark-900/10 rounded-2xl animate-pulse flex items-center justify-center border border-cream-300">
            <RefreshCw className="w-8 h-8 text-maroon-700 animate-spin" />
          </div>
        ) : activeSession && joinData ? (
          /* Active Live Stream with Video & Ephemeral Live Chat */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Video Player & Stream Info */}
            <div className="lg:col-span-2 space-y-6">
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
                />
              </LiveKitRoom>

              {/* Stream Info & Actions bar */}
              <div className="bg-cream-50 p-4 sm:p-6 rounded-2xl border border-gold-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-maroon-800 text-gold-300 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                    🕉️
                  </div>
                  <div>
                    <h3 className="font-devanagari-heading font-bold text-lg text-maroon-950">
                      यदुवंशी दुर्गा पूजा कपूरिपुर — महाआरती
                    </h3>
                    <p className="text-xs text-muted font-devanagari-body">
                      प्रसारणकर्ता: {activeSession.hostName} • कपूरिपुर, बिहार
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <DonateButton
                    liveSessionRoomName={activeSession.roomName}
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Ephemeral Live Chat Panel */}
            <div className="lg:col-span-1">
              <ArtiChatPanel
                roomName={activeSession.roomName}
                defaultExpanded={true}
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
              <h3 className="text-2xl sm:text-3xl font-devanagari-heading font-bold text-maroon-900">
                अभी कोई आरती लाइव प्रसारित नहीं है
              </h3>
              <p className="text-sm sm:text-base text-muted font-devanagari-body max-w-lg mx-auto">
                माँ भगवती की पावन आरती का प्रसारण समय अनुसार किया जाता है। कृपया आरती के समय पुनः पधारें।
              </p>
            </div>

            {/* Schedule Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
              <div className="p-4 rounded-xl bg-cream-100 border border-gold-500/20 text-center">
                <Clock className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <span className="text-xs font-bold uppercase text-dark-700 block font-devanagari-body">
                  प्रातः महाआरती
                </span>
                <span className="text-sm font-extrabold text-maroon-900">सुबह 08:00 बजे</span>
              </div>
              <div className="p-4 rounded-xl bg-cream-100 border border-gold-500/20 text-center">
                <Clock className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <span className="text-xs font-bold uppercase text-dark-700 block font-devanagari-body">
                  संध्या आरती एवं वंदना
                </span>
                <span className="text-sm font-extrabold text-maroon-900">शाम 07:30 बजे</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={fetchLiveSessions}
                className="flex items-center gap-2 border-maroon-800 text-maroon-900 hover:bg-maroon-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पुनः जाँच करें</span>
              </Button>
              <DonateButton label="पूजा सेवा में दान सहयोग करें" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
