import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  StopCircle,
  Play,
  Video,
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
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  ConnectionQualityIndicator,
} from '@livekit/components-react';
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
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDonationSocket } from '../../hooks/useDonationSocket';
import { DonationCard } from '../../components/donation/DonationCard';
import { getSocket } from '../../services/socket';
import { formatDate } from '../../utils/helpers';

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
  const [broadcastTitle, setBroadcastTitle] = useState<string>('माँ दुर्गा पावन महाआरती');
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
      toast.success('माँ दुर्गा की आरती का लाइव प्रसारण शुरू हो गया है!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'लाइव प्रसारण शुरू करने में समस्या आई');
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
      toast.success('लाइव आरती प्रसारण सफलतापूर्वक समाप्त कर दिया गया');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'लाइव प्रसारण समाप्त करने में समस्या आई');
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
      toast.info(nextState ? 'लाइव चैट चालू कर दी गई' : 'लाइव चैट बंद कर दी गई');
    } catch (err: any) {
      toast.error(err.message || 'चैट स्थिति बदलने में समस्या आई');
    }
  };

  // --- Toggle Donation for Active Stream ---
  const handleToggleDonation = async () => {
    if (!broadcastData?.roomName) return;
    try {
      const nextState = !isDonationEnabled;
      await liveDarshanService.toggleDonation(broadcastData.roomName, nextState);
      setIsDonationEnabled(nextState);
      toast.info(nextState ? 'दान सेवा चालू कर दी गई' : 'दान सेवा बंद कर दी गई');
    } catch (err: any) {
      toast.error(err.message || 'दान सेवा स्थिति बदलने में समस्या आई');
    }
  };

  // --- Create Schedule ---
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleTime) {
      toast.error('कृपया शीर्षक एवं निर्धारित समय भरें');
      return;
    }

    setIsScheduling(true);
    try {
      await liveDarshanService.scheduleSession({
        title: scheduleTitle.trim(),
        description: scheduleDesc.trim() || undefined,
        scheduledAt: new Date(scheduleTime).toISOString(),
      });
      toast.success('लाइव आरती कार्यक्रम सफलतापूर्वक शेड्यूल हुआ!');
      setIsScheduleModalOpen(false);
      setScheduleTitle('');
      setScheduleDesc('');
      setScheduleTime('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'शेड्यूल करने में समस्या आई');
    } finally {
      setIsScheduling(false);
    }
  };

  // --- Delete Schedule ---
  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('क्या आप वाकई इस शेड्यूल कार्यक्रम को रद्द करना चाहते हैं?')) return;
    try {
      await liveDarshanService.deleteScheduledSession(id);
      toast.success('शेड्यूल कार्यक्रम रद्द कर दिया गया');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'हटाने में समस्या आई');
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
      toast.success('मुख्य व्यवस्थापक: वैश्विक सेटिंग्स अपडेट हो गईं');
    } catch (err: any) {
      toast.error(err.message || 'सेटिंग्स अपडेट करने में समस्या आई');
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
            <h1 className="text-2xl font-devanagari-heading font-bold text-maroon-950">
              लाइव आरती नियंत्रण कक्ष (Live Broadcast Studio)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted font-devanagari-body">
            आरती का लाइव प्रसारण प्रारंभ करें, कार्यक्रम शेड्यूल करें, चैट/दान टॉगल करें और दर्शक सांख्यिकी देखें।
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
              <span>नया कार्यक्रम शेड्यूल करें</span>
            </Button>
          )}

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
                <h3 className="font-devanagari-heading font-bold text-base text-gold-300">
                  {broadcastData.title || 'माँ दुर्गा पावन महाआरती'}
                </h3>
                <p className="text-xs text-cream-300 font-devanagari-body">
                  प्रसारक: {user?.name} (Admin) • रूम: {broadcastData.roomName}
                </p>
              </div>
            </div>

            {/* Live Counters & Toggles */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Live Viewers Counter */}
              <div className="flex items-center gap-2 bg-dark-900/90 px-3.5 py-1.5 rounded-xl border border-gold-500/30">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>
                  वर्तमान दर्शक: <strong className="text-emerald-300 text-sm font-bold">{currentViewers}</strong>
                </span>
                <span className="text-muted">|</span>
                <span>
                  अधिकतम (Peak): <strong className="text-gold-300 text-sm font-bold">{peakViewers}</strong>
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
                <span>{isChatEnabled ? 'चैट: चालू' : 'चैट: बंद'}</span>
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
                <span>{isDonationEnabled ? 'दान: सक्रिय' : 'दान: बंद'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Broadcaster Video Stage (3 cols) */}
            <div className="lg:col-span-3 bg-dark-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-maroon-700 aspect-video relative flex flex-col">
              <LiveKitRoom
                video={true}
                audio={true}
                token={broadcastData.token}
                serverUrl={broadcastData.wsUrl}
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
                <h2 className="text-xl font-devanagari-heading font-bold text-maroon-950">
                  लाइव प्रसारण प्रारंभ करें (Go Live Now)
                </h2>
                <p className="text-xs text-muted font-devanagari-body">
                  मल्टीपल एडमिन एक साथ अलग-अलग कैमरों (पंडाल, आरती, हवन) से लाइव हो सकते हैं।
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5 font-devanagari-body uppercase">
                  आरती / कार्यक्रम का शीर्षक (Title/Topic)
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="उदा. संध्या महाआरती, दुर्गा सप्तशती पाठ, हवन दर्शन..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-100/70 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-semibold font-devanagari-body"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5 font-devanagari-body uppercase">
                  संक्षिप्त विवरण (वैकल्पिक)
                </label>
                <input
                  type="text"
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                  placeholder="उदा. कपूरिपुर मुख्य पंडाल से सीधा दिव्य दर्शन..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-100/70 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-devanagari-body"
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
                  <label htmlFor="enableChat" className="text-xs font-semibold text-dark-800 cursor-pointer font-devanagari-body">
                    लाइव चैट चालू रखें
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
                  <label htmlFor="enableDonation" className="text-xs font-semibold text-dark-800 cursor-pointer font-devanagari-body">
                    दान सेवा चालू रखें
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
                <span>तुरंत लाइव प्रसारण शुरू करें</span>
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
                    <h3 className="text-sm font-devanagari-heading font-bold text-gold-300">
                      मुख्य व्यवस्थापक मास्टर नियंत्रण (Global Controls)
                    </h3>
                    <p className="text-[11px] text-cream-300 font-devanagari-body">
                      पूरी वेबसाइट हेतु ग्लोबल स्तर पर पेमेंट या चैट बंद/चालू करें
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-devanagari-body">
                  {/* Global Payment Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-dark-700">
                    <div>
                      <span className="font-bold text-cream-100 block">ग्लोबल दान / पेमेंट गेटवे</span>
                      <span className="text-[11px] text-muted">Razorpay दान सेवा सक्रिय या निष्क्रिय करें</span>
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
                      {globalSettings.isDonationEnabled ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                    </button>
                  </div>

                  {/* Global Chat Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-dark-700">
                    <div>
                      <span className="font-bold text-cream-100 block">ग्लोबल लाइव चैट संवाद</span>
                      <span className="text-[11px] text-muted">सभी आरती स्ट्रीम्स में चैट ऑन या ऑफ करें</span>
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
                      {globalSettings.isLiveChatEnabled ? 'सक्रिय (ON)' : 'बंद (OFF)'}
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
                  <h3 className="font-devanagari-heading font-bold text-sm text-maroon-950">
                    आगामी शेड्यूल कार्यक्रम ({schedules.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-xs text-maroon-800 hover:underline font-bold"
                >
                  + नया जोड़ें
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {schedules.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6 font-devanagari-body">
                    अभी कोई कार्यक्रम शेड्यूल नहीं है।
                  </p>
                ) : (
                  schedules.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-xl bg-cream-100 border border-cream-300 flex items-center justify-between gap-3 text-xs font-devanagari-body"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-maroon-900 truncate">{s.title}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted mt-0.5">
                          <Clock className="w-3 h-3 text-gold-600" />
                          <span>{new Date(s.scheduledAt).toLocaleString('hi-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartBroadcast(s._id)}
                          className="py-1 px-2 text-[11px] bg-maroon-800 text-gold-300 font-bold"
                        >
                          लाइव करें
                        </Button>
                        <button
                          onClick={() => handleDeleteSchedule(s._id)}
                          className="p-1.5 text-muted hover:text-red-700 hover:bg-red-50 rounded"
                          title="रद्द करें"
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
              <h3 className="font-devanagari-heading font-bold text-lg text-maroon-950">
                लाइव प्रसारण इतिहास एवं दर्शक सांख्यिकी (Peak Viewers Overview)
              </h3>
            </div>
            <p className="text-xs text-muted font-devanagari-body mt-0.5">
              कब कितने लोग लाइव थे और किस दिन सबसे अधिक भक्तों ने दर्शन किए।
            </p>
          </div>

          <span className="text-xs font-bold text-maroon-900 bg-maroon-100 px-3 py-1 rounded-full border border-maroon-200">
            कुल सत्र: {historyTotal}
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
                  {stat.dailyPeak} भक्त
                </span>
                <span className="text-[10px] text-gold-700 font-devanagari-body">
                  {stat.sessionCount} आरती सत्र
                </span>
              </div>
            ))}
          </div>
        )}

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-devanagari-body">
            <thead className="bg-cream-200/80 text-dark-800 font-bold uppercase tracking-wider border-b border-cream-300">
              <tr>
                <th className="py-3 px-4">कार्यक्रम / शीर्षक</th>
                <th className="py-3 px-4">प्रसारक एडमिन</th>
                <th className="py-3 px-4">दिनांक एवं समय</th>
                <th className="py-3 px-4">पीक दर्शक (Peak Viewers)</th>
                <th className="py-3 px-4">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    अभी कोई पिछला लाइव प्रसारण रिकॉर्ड नहीं है।
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
                      👥 {item.peakViewers || 0} भक्त
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'live'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-cream-300 text-dark-800'
                        }`}
                      >
                        {item.status === 'live' ? 'लाइव' : 'समाप्त'}
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
        title="नया लाइव आरती कार्यक्रम शेड्यूल करें"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1.5 font-devanagari-body">
              कार्यक्रम / आरती का नाम *
            </label>
            <input
              type="text"
              required
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="उदा. प्रातः महाआरती, पुष्पांजलि एवं नवमी हवन..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-devanagari-body font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1.5 font-devanagari-body">
              निर्धारित दिनांक एवं समय (Date & Time) *
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
            <label className="block text-xs font-semibold text-dark-900 mb-1.5 font-devanagari-body">
              विवरण (वैकल्पिक)
            </label>
            <textarea
              rows={3}
              value={scheduleDesc}
              onChange={(e) => setScheduleDesc(e.target.value)}
              placeholder="कपूरिपुर पूजा पंडाल से सीधा पावन प्रसारण..."
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-devanagari-body"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              रद्द करें
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isScheduling}
              className="bg-maroon-900 hover:bg-maroon-950 text-gold-200"
            >
              कार्यक्रम सहेजें
            </Button>
          </div>
        </form>
      </Modal>

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
