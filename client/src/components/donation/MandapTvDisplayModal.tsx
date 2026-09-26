import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Sparkles, 
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
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-gold-300 tracking-wide mt-0.5">
              यदुवंशी दुर्गा पूजा समिति कपूरिपुर
            </h1>
          </div>
        </div>

        {/* TV Top Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-dark-900/80 hover:bg-maroon-900 text-cream-100 border border-gold-500/30 transition-all active:scale-95"
            title={isPaused ? 'स्लाइड शो चलाएं' : 'रोकें'}
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5 text-amber-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-dark-900/80 hover:bg-maroon-900 text-cream-100 border border-gold-500/30 transition-all active:scale-95"
            title={isFullscreen ? 'सामान्य स्क्रीन' : 'फुल स्क्रीन (TV Mode)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-gold-300" /> : <Maximize2 className="w-5 h-5 text-gold-300" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 transition-all active:scale-95 ml-1"
            title="स्क्रीन बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main Large TV Display Area (Rotating Devotees) */}
      <div className="flex-1 flex items-center justify-center my-4 sm:my-8 relative">
        <AnimatePresence mode="wait">
          {sortedDonations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4 p-8 bg-dark-900/60 rounded-3xl border border-gold-500/20 max-w-lg"
            >
              <Sparkles className="w-16 h-16 text-gold-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-serif text-gold-200">माँ भगवती के पावन सहयोगी</h2>
              <p className="text-cream-200 text-sm">
                कपूरिपुर दुर्गा पूजा में अपने पावन सहयोग से सम्मिलित हों। जय माता दी 🙏
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={currentDonor?._id || currentIndex}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-3xl bg-gradient-to-b from-maroon-900/90 via-dark-900/95 to-maroon-950/90 border-2 border-gold-400/80 rounded-3xl p-6 sm:p-12 shadow-[0_0_60px_rgba(234,179,8,0.35)] text-center relative overflow-hidden backdrop-blur-xl"
            >
              {/* Background ambient aura */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />

              {/* Devotee Rank / Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 via-gold-500/40 to-amber-500/30 border border-gold-400/60 text-gold-200 text-xs sm:text-sm font-bold tracking-wide mb-6">
                <Crown className="w-4 h-4 text-gold-300 animate-pulse" />
                <span>माँ भगवती पावन सहयोगी #{currentIndex + 1}</span>
              </div>

              {/* Devotee Avatar Photo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-gold-300 to-amber-500 shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-5">
                <div className="w-full h-full rounded-full overflow-hidden bg-dark-900 flex items-center justify-center">
                  {donorAvatar ? (
                    <img
                      src={donorAvatar}
                      alt={donorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-serif font-black text-gold-300">
                      {currentDonor?.isAnonymous ? '?' : donorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Devotee Name & Handle */}
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-cream-50 tracking-tight mb-1">
                {donorName}
              </h2>
              {donorUsername && !currentDonor?.isAnonymous && (
                <p className="text-gold-400/90 font-mono text-sm sm:text-base font-medium mb-3">
                  @{donorUsername}
                </p>
              )}

              {/* Amount Display */}
              <div className="my-6 inline-block bg-gradient-to-r from-amber-500/20 via-gold-400/30 to-amber-500/20 border-2 border-gold-400/80 px-8 py-4 rounded-3xl shadow-[0_0_35px_rgba(234,179,8,0.3)]">
                <span className="text-xs uppercase tracking-widest text-gold-300 font-bold block mb-1">
                  समर्पित पावन सेवा राशि
                </span>
                <span className="text-3xl sm:text-5xl font-serif font-black text-gold-100 tracking-tight">
                  ₹{(currentDonor?.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Devotional Note / Blessing Message */}
              {currentDonor?.message && (
                <div className="max-w-xl mx-auto mt-2 p-3.5 rounded-2xl bg-dark-950/60 border border-gold-500/30 text-gold-200/90 italic text-sm sm:text-base">
                  "{currentDonor.message}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Ticker Banner */}
      <div className="bg-dark-900/90 border border-gold-500/30 rounded-2xl p-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-gold-300 font-bold truncate">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              ॥ या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-cream-200">
            <Heart className="w-4 h-4 text-red-400 fill-red-400/40" />
            <span>लाइव मंडप प्रसारण</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandapTvDisplayModal;
