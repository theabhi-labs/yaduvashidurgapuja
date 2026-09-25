import React, { useState } from 'react';
import {
  Radio,
  StopCircle,
  Play,
  Video,
  AlertTriangle,
  Heart,
  Sparkles,
  Shield,
} from 'lucide-react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  ConnectionQualityIndicator,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { liveDarshanService } from '../../services/liveDarshanService';
import { LiveSessionStartResponse } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useDonationSocket } from '../../hooks/useDonationSocket';
import { DonationCard } from '../../components/donation/DonationCard';

export const AdminLiveBroadcast: React.FC = () => {
  const toast = useToast();
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastData, setBroadcastData] = useState<LiveSessionStartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);

  // Live donations during admin broadcast
  const { latestDonation, clearLatestDonation, donationQueue } = useDonationSocket(
    broadcastData?.roomName
  );

  const handleStartBroadcast = async () => {
    try {
      setIsLoading(true);
      const res = await liveDarshanService.startSession();
      setBroadcastData(res.data);
      setIsBroadcasting(true);
      toast.success('माँ दुर्गा की आरती का लाइव प्रसारण शुरू हो गया है!');
    } catch (err: any) {
      toast.error(err.message || 'लाइव प्रसारण शुरू करने में समस्या आई');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndBroadcast = async () => {
    if (!broadcastData?.roomName) return;
    try {
      setIsLoading(true);
      await liveDarshanService.endSession(broadcastData.roomName);
      setIsBroadcasting(false);
      setBroadcastData(null);
      setShowEndModal(false);
      toast.success('लाइव आरती प्रसारण सफलतापूर्वक समाप्त कर दिया गया');
    } catch (err: any) {
      toast.error(err.message || 'लाइव प्रसारण समाप्त करने में समस्या आई');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-maroon-900/10 text-maroon-800">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-devanagari-heading font-bold text-maroon-950">
              लाइव आरती प्रसारण नियंत्रण (Live Darshan Studio)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted font-devanagari-body">
            यहाँ से व्यवस्थापक सीधे पंडाल से आरती एवं पूजा का लाइव प्रसारण प्रारंभ या समाप्त कर सकते हैं।
          </p>
        </div>

        {isBroadcasting && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shadow-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              लाइव ऑन-एयर
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEndModal(true)}
              className="border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
            >
              <StopCircle className="w-4 h-4" />
              <span>प्रसारण समाप्त करें</span>
            </Button>
          </div>
        )}
      </div>

      {/* Realtime Donation Overlay Banner */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none">
        <DonationCard
          donation={latestDonation}
          onDismiss={clearLatestDonation}
        />
      </div>

      {/* Main Broadcast Screen */}
      {!isBroadcasting ? (
        <div className="max-w-2xl mx-auto my-8 bg-cream-50 rounded-3xl p-8 text-center border border-gold-500/30 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-maroon-900 text-gold-300 mx-auto flex items-center justify-center border-2 border-gold-400 shadow-md">
            <Video className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-devanagari-heading font-bold text-maroon-900">
              लाइव आरती प्रसारण शुरू करने के लिए तैयार हैं?
            </h2>
            <p className="text-sm text-muted font-devanagari-body max-w-md mx-auto">
              प्रसारण शुरू करते ही कैमरा और माइक्रोफ़ोन ऑन हो जाएगा तथा सभी भक्त लाइव दर्शन पेज पर जुड़ सकेंगे।
            </p>
          </div>

          <div className="bg-cream-100/80 p-4 rounded-xl border border-cream-300 text-left text-xs text-dark-800 space-y-2 max-w-md mx-auto font-devanagari-body">
            <div className="flex items-center gap-2 text-maroon-900 font-bold">
              <Shield className="w-4 h-4 text-maroon-700" />
              <span>प्रसारण निर्देश:</span>
            </div>
            <p>1. स्थिर इंटरनेट कनेक्शन सुनिश्चित करें।</p>
            <p>2. आरती की स्पष्ट ध्वनि हेतु माइक्रोफ़ोन को पंडाल के मुख्य लाउडस्पीकर के पास रखें।</p>
            <p>3. कैमरा को माँ दुर्गा की मुख्य प्रतिमा के सम्मुख स्थापित करें।</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleStartBroadcast}
            isLoading={isLoading}
            className="w-full max-w-md mx-auto py-3.5 bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-200 border border-gold-500/40 shadow-lg text-base font-bold flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-gold-400 text-gold-400" />
            <span>लाइव आरती प्रसारण शुरू करें (Go Live)</span>
          </Button>
        </div>
      ) : (
        /* Live Broadcasting Active Studio */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Broadcaster Video Stage (3 cols) */}
            <div className="lg:col-span-3 bg-dark-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-maroon-700 aspect-video relative flex flex-col">
              <LiveKitRoom
                video={true}
                audio={true}
                token={broadcastData!.token}
                serverUrl={broadcastData!.wsUrl}
                connect={true}
                data-lk-theme="default"
                className="w-full h-full flex flex-col justify-between"
              >
                <RoomAudioRenderer />
                <div className="flex-1 w-full relative">
                  <VideoConference />
                </div>
                <div className="bg-dark-900/90 border-t border-dark-800 p-2 flex items-center justify-between">
                  <ControlBar controls={{ chat: false, screenShare: false }} />
                  <div className="flex items-center gap-2 pr-4 text-xs text-gold-300 font-semibold">
                    <span>नेटवर्क गुणवत्ता:</span>
                    <ConnectionQualityIndicator />
                  </div>
                </div>
              </LiveKitRoom>
            </div>

            {/* Live Donations Feed Sidebar (1 col) */}
            <div className="bg-cream-50 rounded-2xl p-4 border border-gold-500/30 shadow-md flex flex-col h-[480px]">
              <div className="flex items-center gap-2 pb-3 border-b border-cream-300">
                <Heart className="w-4 h-4 text-maroon-700 fill-maroon-700" />
                <h3 className="font-devanagari-heading font-bold text-sm text-maroon-900">
                  लाइव आरती दान अर्पण
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {donationQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted text-xs font-devanagari-body">
                    <Sparkles className="w-6 h-6 text-gold-500 mb-1" />
                    <span>प्रसारण के दौरान भक्तों द्वारा किए गए दान यहाँ रीयल-टाइम में दिखेंगे।</span>
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
      )}

      {/* Confirmation Modal to End Broadcast */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="लाइव आरती प्रसारण समाप्त करें?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-maroon-700 mx-auto" />
          <p className="text-sm font-devanagari-body text-dark-800">
            क्या आप निश्चित हैं कि आप इस लाइव आरती प्रसारण को समाप्त करना चाहते हैं? सभी जुड़े हुए भक्त डिस्कनेक्ट हो जाएँगे।
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowEndModal(false)}
              className="w-full"
            >
              रद्द करें
            </Button>
            <Button
              variant="primary"
              onClick={handleEndBroadcast}
              isLoading={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              हाँ, समाप्त करें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
