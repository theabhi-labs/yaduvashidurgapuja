import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Sparkles, 
  Crown
} from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

interface DonorItem {
  _id: string;
  donorName: string;
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  createdAt?: string;
  user?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
}

interface MandapTvDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  donations: DonorItem[];
  totalAmount?: number;
}

export const MandapTvDisplayModal: React.FC<MandapTvDisplayModalProps> = ({
  isOpen,
  onClose,
  donations,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const speed = 4000; // 4s per donor
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Filter and sort donations: highest amount first, valid paid donations
  const sortedDonations = [...donations].sort((a, b) => (b.amount || 0) - (a.amount || 0));

  // Auto cycle timer
  useEffect(() => {
    if (!isOpen || sortedDonations.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedDonations.length);
    }, speed);

    return () => clearInterval(interval);
  }, [isOpen, sortedDonations.length, isPaused, speed]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const currentDonor = sortedDonations[currentIndex] || sortedDonations[0];
  const donorName = currentDonor?.isAnonymous
    ? 'गुमनाम भक्त'
    : currentDonor?.user?.name || currentDonor?.donorName || 'श्रद्धालु भक्त';
  const donorUsername = currentDonor?.user?.username;
  const donorAvatar = currentDonor?.user?.avatar;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 bg-gradient-to-br from-dark-950 via-maroon-950 to-dark-950 text-cream-50 flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden"
    >
      {/* 1. TV Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-gold-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-gold-400 text-maroon-950 flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-gold-300 animate-pulse">
            🕉️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white" />
                MANDAP TV LIVE
              </span>
              <span className="text-xs text-gold-400 font-mono">
                {currentIndex + 1} / {sortedDonations.length || 1}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-heading font-black text-gold-200 mt-0.5">
              ॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर — पावन दानदाता एवं सेवा समर्पण ॥
            </h1>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-maroon-900/80 hover:bg-maroon-800 text-gold-300 border border-gold-500/30 transition-all active:scale-90"
            title={isPaused ? 'चलाएं (Play)' : 'रोकें (Pause)'}
          >
            {isPaused ? <Play className="w-5 h-5 fill-gold-400" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-maroon-900/80 hover:bg-maroon-800 text-gold-300 border border-gold-500/30 transition-all active:scale-90"
            title="फ़ुलस्क्रीन"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-rose-300 border border-red-500/40 transition-all active:scale-90"
            title="बंद करें (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main TV Spotlight Showcase Card */}
      <div className="flex-1 flex items-center justify-center my-6 max-w-4xl mx-auto w-full">
        {currentDonor ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDonor._id + currentIndex}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full bg-gradient-to-b from-maroon-900/90 via-dark-900/95 to-maroon-950/90 border-2 border-gold-400/80 rounded-3xl p-6 sm:p-12 shadow-[0_0_60px_rgba(234,179,8,0.35)] text-center relative overflow-hidden backdrop-blur-xl"
            >
              {/* Floating Temple Shimmer Accent */}
              <div className="absolute top-3 left-6 text-gold-500/30 text-3xl font-serif">
                🪔
              </div>
              <div className="absolute top-3 right-6 text-gold-500/30 text-3xl font-serif">
                🪔
              </div>

              {/* Devotee Avatar with Golden Ring */}
              <div className="relative inline-block mb-4">
                <div className="p-1 rounded-full bg-gradient-to-tr from-gold-400 via-amber-300 to-amber-600 shadow-xl animate-pulse">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-maroon-950 text-gold-300 flex items-center justify-center font-heading font-black text-4xl sm:text-5xl border-4 border-maroon-900 overflow-hidden shadow-inner">
                    {donorAvatar ? (
                      <img
                        src={getImageUrl(donorAvatar)}
                        alt={donorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{donorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                {/* Rank / Crown Badge */}
                <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-gold-500 to-amber-400 text-maroon-950 shadow-md border-2 border-cream-100">
                  <Crown className="w-5 h-5 fill-maroon-950" />
                </div>
              </div>

              {/* Devotee Name & @Username */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-4xl font-heading font-black text-cream-50 tracking-wide drop-shadow-md">
                  {donorName}
                </h2>
                {donorUsername && (
                  <p className="text-sm sm:text-base font-mono font-bold text-gold-400">
                    @{donorUsername}
                  </p>
                )}
              </div>

              {/* Big Golden Donation Amount */}
              <div className="my-6 inline-block">
                <div className="bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 text-maroon-950 px-8 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.6)] border-2 border-gold-200">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider block text-maroon-900">
                    पावन दान एवं सेवा समर्पण
                  </span>
                  <span className="text-3xl sm:text-5xl font-heading font-black tracking-tight">
                    ₹{currentDonor.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Devotee Prayer / Blessing Note */}
              {currentDonor.message ? (
                <div className="max-w-xl mx-auto bg-black/40 border border-gold-500/30 p-3.5 rounded-2xl">
                  <p className="text-sm sm:text-base font-body text-cream-100 italic leading-relaxed">
                    "{currentDonor.message}"
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-body text-gold-300/80 italic">
                  "माँ दुर्गा की असीम कृपा आप व आपके परिवार पर सदैव बनी रहे।"
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center text-muted">
            <p>कोई दानदाता रिकॉर्ड लोड नहीं हुआ</p>
          </div>
        )}
      </div>

      {/* 3. Bottom Continuous Ticker Marquee */}
      <div className="bg-dark-900/90 border border-gold-500/30 rounded-2xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 bg-maroon-900 rounded-lg border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>दानदाता सूची</span>
          </span>

          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 text-xs sm:text-sm font-body text-cream-100">
            {sortedDonations.map((d, i) => (
              <button
                key={d._id}
                onClick={() => setCurrentIndex(i)}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl transition-all ${
                  i === currentIndex
                    ? 'bg-gold-500 text-maroon-950 font-bold shadow-md'
                    : 'bg-cream-100/10 hover:bg-cream-100/20 text-cream-200'
                }`}
              >
                <span>{d.isAnonymous ? 'गुमनाम भक्त' : d.donorName}</span>
                <span className="font-mono font-bold">₹{d.amount.toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
