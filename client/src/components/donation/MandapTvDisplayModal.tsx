import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Crown,
  Heart
} from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

interface DonorItem {
  _id: string;
  donorName: string;
  amount: number;
  message?: string;
  avatar?: string;
  username?: string;
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
  const sortedDonations = [...(donations || [])].sort((a, b) => (b.amount || 0) - (a.amount || 0));

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
  const donorUsername = currentDonor?.user?.username || currentDonor?.username;
  const rawAvatar = currentDonor?.user?.avatar || currentDonor?.avatar;
  const donorAvatar = rawAvatar ? getImageUrl(rawAvatar) : '';

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 bg-gradient-to-br from-dark-950 via-maroon-950 to-dark-950 text-cream-50 flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden"
    >
      {/* 1. TV Top Header Bar (Fully optimized for phones & desktops) */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-gold-500/30 pb-3">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-gold-400 text-maroon-950 flex items-center justify-center font-bold text-base sm:text-xl shadow-md border border-gold-300 shrink-0">
            🕉️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] sm:text-xs tracking-wider flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                MANDAP TV
              </span>
              <h1 className="text-xs sm:text-base font-serif font-bold text-gold-300 truncate">
                यदुवंशी दुर्गा पूजा कपूरिपुर
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls & Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {sortedDonations.length > 0 && (
            <span className="text-[11px] sm:text-xs text-gold-300 font-mono font-bold px-2 py-1 bg-dark-900/80 rounded-lg border border-gold-500/20">
              {currentIndex + 1}/{sortedDonations.length}
            </span>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 sm:p-2 rounded-xl bg-dark-900/80 hover:bg-maroon-900 text-cream-100 border border-gold-500/30 transition-all active:scale-95 cursor-pointer"
            title={isPaused ? 'स्लाइड शो चलाएं' : 'रोकें'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-dark-900/80 hover:bg-maroon-900 text-cream-100 border border-gold-500/30 transition-all active:scale-95 cursor-pointer"
            title={isFullscreen ? 'सामान्य स्क्रीन' : 'फुल स्क्रीन (TV Mode)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-gold-300" /> : <Maximize2 className="w-4 h-4 text-gold-300" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-95 shadow-md ml-0.5 cursor-pointer"
            title="स्क्रीन बंद करें"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main Large TV Display Area (Rotating Devotees) */}
      <div className="flex-1 flex items-center justify-center my-3 sm:my-6 relative px-2">
        <AnimatePresence mode="wait">
          {sortedDonations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-3 p-6 sm:p-10 bg-dark-900/80 rounded-3xl border border-gold-500/40 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-gold-400 text-maroon-950 font-black text-3xl flex items-center justify-center mx-auto shadow-lg">
                🕉️
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-gold-200">
                माँ भगवती के पावन सहयोगी
              </h2>
              <p className="text-cream-200 text-xs sm:text-sm font-body leading-relaxed">
                कपूरिपुर दुर्गा पूजा में अपने पावन सहयोग से सम्मिलित हों। जय माता दी 🙏
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={currentDonor?._id || currentIndex}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-gradient-to-b from-maroon-900/90 via-dark-900/95 to-maroon-950/90 border-2 border-gold-400/80 rounded-3xl p-5 sm:p-10 shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center relative overflow-hidden backdrop-blur-xl"
            >
              {/* Background ambient aura */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />

              {/* Devotee Rank / Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-gold-500/35 to-amber-500/25 border border-gold-400/60 text-gold-200 text-xs sm:text-sm font-bold tracking-wide mb-4 sm:mb-6">
                <Crown className="w-4 h-4 text-gold-300" />
                <span>माँ भगवती पावन सहयोगी #{currentIndex + 1}</span>
              </div>

              {/* Devotee Avatar Photo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-400 via-gold-300 to-amber-500 shadow-[0_0_25px_rgba(234,179,8,0.4)] mb-3 sm:mb-4">
                <div className="w-full h-full rounded-full overflow-hidden bg-dark-900 flex items-center justify-center">
                  {donorAvatar ? (
                    <img
                      src={donorAvatar}
                      alt={donorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-4xl font-serif font-black text-gold-300">
                      {currentDonor?.isAnonymous ? '?' : donorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Devotee Name & Handle */}
              <h2 className="text-xl sm:text-3xl font-heading font-black text-cream-50 tracking-tight mb-0.5">
                {donorName}
              </h2>
              {donorUsername && !currentDonor?.isAnonymous && (
                <p className="text-gold-400/90 font-mono text-xs sm:text-sm font-medium mb-2">
                  @{donorUsername}
                </p>
              )}

              {/* Amount Display */}
              <div className="my-3 sm:my-5 inline-block bg-gradient-to-r from-amber-500/20 via-gold-400/30 to-amber-500/20 border border-gold-400/80 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-[0_0_25px_rgba(234,179,8,0.25)]">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gold-300 font-bold block mb-0.5">
                  समर्पित पावन सेवा राशि
                </span>
                <span className="text-2xl sm:text-4xl font-heading font-black text-gold-100 tracking-tight">
                  ₹{(Number(currentDonor?.amount) || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Devotional Note / Blessing Message */}
              {currentDonor?.message && (
                <div className="max-w-lg mx-auto mt-1 p-2.5 sm:p-3 rounded-xl bg-dark-950/60 border border-gold-500/30 text-gold-200/90 italic text-xs sm:text-sm">
                  "{currentDonor.message}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Ticker Banner */}
      <div className="bg-dark-900/90 border border-gold-500/30 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 text-gold-300 font-bold truncate">
            <span className="text-amber-400">🪔</span>
            <span className="truncate">
              ॥ या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-cream-200 font-body text-[10px] sm:text-xs">
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/40" />
            <span className="hidden sm:inline">लाइव मंडप प्रसारण</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandapTvDisplayModal;
