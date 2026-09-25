import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { DonationEvent } from '../../hooks/useDonationSocket';

interface DonationCardProps {
  donation: DonationEvent | null;
  onDismiss?: () => void;
  autoDismissTime?: number;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onDismiss,
  autoDismissTime = 5500,
}) => {
  useEffect(() => {
    if (!donation) return;

    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, autoDismissTime);

    return () => clearTimeout(timer);
  }, [donation, onDismiss, autoDismissTime]);

  return (
    <AnimatePresence>
      {donation && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative z-40 max-w-sm w-full mx-auto p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-maroon-950/95 via-maroon-900/95 to-maroon-950/95 text-cream-50 border-2 border-gold-500/80 shadow-2xl backdrop-blur-md overflow-hidden"
        >
          {/* Shimmer background accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-transparent animate-pulse pointer-events-none" />

          <div className="relative flex items-center gap-3.5">
            {/* Devotional Icon badge */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shrink-0 shadow-md text-maroon-950 font-bold border border-gold-300">
              <Heart className="w-6 h-6 fill-maroon-950 text-maroon-950" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-devanagari-heading font-bold text-gold-300 truncate">
                  {donation.donorName || 'श्रद्धालु भक्त'}
                </h4>
                <span className="inline-flex items-center gap-1 text-sm sm:text-base font-black text-gold-400 bg-gold-950/60 px-2.5 py-0.5 rounded-full border border-gold-500/40">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  ₹{donation.amount}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-cream-200/90 font-devanagari-body truncate mt-0.5">
                {donation.message ? `"${donation.message}"` : 'माँ दुर्गा पूजा सेवा में दान अर्पण किया 🙏'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
