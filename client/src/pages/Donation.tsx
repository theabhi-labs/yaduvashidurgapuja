import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { MandapTvDisplayModal } from '../components/donation/MandapTvDisplayModal';
import { getSocket } from '../services/socket';
import { getImageUrl } from '../utils/helpers';
import { LEGAL_ENTITY_NAME } from '../utils/constants';
import {
  Check,
  HandHeart,
  FileText,
  Sparkles,
  Info,
} from 'lucide-react';

interface DonorItem {
  _id: string;
  donorName: string;
  username?: string;
  avatar?: string;
  amount: number;
  type?: 'donation' | 'dakshina';
  liveSessionRoomName?: string;
  message?: string;
  createdAt?: string;
  isAnonymous?: boolean;
}

export const Donation: React.FC = () => {
  const toast = useToast();

  // Modals state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState<boolean>(false);

  // Contributors Wall State (Strictly sorted in decreasing order)
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [isLoadingWall, setIsLoadingWall] = useState<boolean>(true);

  // Fetch Public Contributors Wall
  const fetchPublicWall = useCallback(async () => {
    try {
      setIsLoadingWall(true);
      const res = await donationService.getPublicWall();
      if (res.success && res.data) {
        // Strictly sort decreasing by amount
        const sorted = (res.data.donors || []).sort(
          (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0)
        );
        setDonors(sorted);
      }
    } catch {
      // quiet fallback
    } finally {
      setIsLoadingWall(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicWall();
  }, [fetchPublicWall]);

  // Real-time live socket listener for new contributions
  useEffect(() => {
    const socket = getSocket();

    const handleNewDonation = (newDonation: any) => {
      if (!newDonation) return;

      const formattedItem: DonorItem = {
        _id: `live_${Date.now()}`,
        donorName: newDonation.donorName || 'श्रद्धालु भक्त',
        username: newDonation.username,
        avatar: newDonation.avatar,
        amount: Number(newDonation.amount) || 0,
        type: newDonation.type || (newDonation.roomName ? 'dakshina' : 'donation'),
        liveSessionRoomName: newDonation.roomName,
        message: newDonation.message,
        createdAt: newDonation.timestamp || new Date().toISOString(),
        isAnonymous: Boolean(newDonation.isAnonymous),
      };

      setDonors((prev) => {
        const next = [formattedItem, ...prev.filter((d) => d._id !== formattedItem._id)];
        return next.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
      });
    };

    socket.on('donation_global', handleNewDonation);
    socket.on('donation', handleNewDonation);

    return () => {
      socket.off('donation_global', handleNewDonation);
      socket.off('donation', handleNewDonation);
    };
  }, []);

  const handleOpenContributeModal = () => {
    toast.info('वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।');
    setIsDonateModalOpen(true);
  };

  const handleCloseDonateModal = () => {
    setIsDonateModalOpen(false);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* 1. Official Header & Voluntary Contribution Disclosures */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>॥ {LEGAL_ENTITY_NAME} ॥</span>
        </motion.div>

        <h1 className="text-2xl sm:text-4xl font-heading font-black text-dark-950 tracking-tight">
          Support Durga Puja
        </h1>

        <p className="text-xs sm:text-sm text-dark-800 max-w-2xl mx-auto leading-relaxed">
          Community members and well-wishers may make voluntary contributions to support the organization of Durga Puja and related community activities.
        </p>

        <div className="bg-amber-500/15 border-2 border-amber-500/60 p-4 rounded-2xl text-amber-950 max-w-2xl mx-auto space-y-1 text-center shadow-sm">
          <div className="font-bold text-sm text-maroon-950 flex items-center justify-center gap-1.5">
            <Info className="w-4 h-4 text-amber-700" />
            <span>सूचना (Official Notice)</span>
          </div>
          <p className="text-xs text-maroon-900 font-medium leading-relaxed">
            वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।
          </p>
        </div>
      </div>

      {/* 2. Action Card: Make Contribution & Mandap TV Display */}
      <div className="bg-cream-100 p-5 sm:p-6 rounded-3xl border border-gold-400/50 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-base sm:text-lg font-heading font-bold text-dark-950 flex items-center justify-center sm:justify-start gap-1.5">
              <span>🪔</span>
              <span>Voluntary Puja Seva & Support</span>
            </h2>
            <p className="text-xs text-dark-700">
              Contribute towards the upcoming Sharadotsav festival and view the live community recognition wall.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
            {/* Make a Contribution Button */}
            <button
              onClick={handleOpenContributeModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 hover:from-amber-500 hover:to-gold-500 text-maroon-950 font-heading font-bold text-xs sm:text-sm border border-gold-300 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <HandHeart className="w-4 h-4 text-maroon-950" />
              <span>Make a Contribution</span>
            </button>

            {/* Mandap TV Screen Button */}
            <button
              onClick={() => setIsTvModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-maroon-900 via-dark-950 to-maroon-950 hover:from-maroon-950 hover:to-black text-gold-300 font-heading font-bold text-xs sm:text-sm border border-gold-500/60 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>📺 TV Live Screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Community Support Wall Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base sm:text-lg font-heading font-bold text-dark-950 flex items-center gap-2">
          <span className="text-amber-600">🪔</span>
          <span>Community Support Wall (सहयोगी सूची)</span>
        </h2>
        <span className="text-xs text-muted">
          Decreasing order by contribution
        </span>
      </div>

      {/* 4. Contributor Cards Grid */}
      {isLoadingWall ? (
        <div className="py-16 text-center text-xs text-muted animate-pulse">
          Community Support Wall लोड हो रही है...
        </div>
      ) : donors.length === 0 ? (
        <div className="py-14 text-center bg-white rounded-3xl border border-cream-300 p-6 space-y-3">
          <p className="text-sm font-bold text-dark-800">
            Be the first well-wisher to make a voluntary contribution for Durga Puja! 🙏
          </p>
          <p className="text-xs text-muted max-w-md mx-auto">
            Your support helps maintain traditional Vedic rituals, daily Maha Aarti, and community Bhandara at Kapooripur Ground.
          </p>
          <button
            onClick={handleOpenContributeModal}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-gold-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <HandHeart className="w-3.5 h-3.5" />
            <span>Make a Contribution</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {donors.map((donor, idx) => {
            const avatarUrl = donor.avatar ? getImageUrl(donor.avatar) : null;
            const displayName = donor.isAnonymous ? 'गुमनाम भक्त' : (donor.donorName || 'श्रद्धालु भक्त');
            const formattedAmount = Number(donor.amount || 0).toLocaleString('en-IN');
            const isLastOdd = donors.length % 2 !== 0 && idx === donors.length - 1;

            return (
              <motion.div
                key={donor._id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
                className={`bg-white rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-md transition-all duration-300 p-4 sm:p-6 text-center flex flex-col items-center justify-center group ${
                  isLastOdd ? 'col-span-2 max-w-[280px] sm:max-w-xs mx-auto w-full' : ''
                }`}
              >
                {/* Devotee Avatar Photo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-300 ring-2 sm:ring-4 ring-amber-100/80 shadow-xs mb-2.5 sm:mb-3 shrink-0 flex items-center justify-center bg-gradient-to-tr from-amber-100 to-cream-100">
                  {avatarUrl && !donor.isAnonymous ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-maroon-800 to-amber-700 text-gold-200 font-bold flex items-center justify-center text-lg sm:text-xl font-heading">
                      {donor.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Devotee Name */}
                <h3 className="font-heading font-bold text-sm sm:text-base text-dark-900 truncate max-w-full px-1">
                  {displayName}
                </h3>

                {/* Fine Golden Divider */}
                <div className="h-[1px] w-24 sm:w-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent my-2" />

                {/* Contribution Amount */}
                <p className="font-heading font-black text-base sm:text-xl text-dark-950 tracking-tight">
                  ₹{formattedAmount}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. Policy Links & Transparency Card */}
      <div className="bg-cream-100/80 rounded-3xl border border-cream-300 p-4 sm:p-6 text-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-maroon-800 text-amber-300 flex items-center justify-center font-bold shrink-0">
            🪔
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-dark-950">
              Transparency & Contribution Disclosures
            </h4>
            <p className="text-[10px] text-muted">{LEGAL_ENTITY_NAME}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="flex items-start gap-1.5 bg-white p-3 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              Contributions are voluntary and used exclusively for organizing Durga Puja festival events.
            </span>
          </div>
          <div className="flex items-start gap-1.5 bg-white p-3 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              Contributor details on the wall are displayed only with voluntary consent. Anonymous options are fully respected.
            </span>
          </div>
        </div>

        <div className="pt-2 text-center border-t border-cream-200">
          <Link
            to="/contribution-policy"
            className="text-maroon-800 hover:text-maroon-900 font-semibold underline text-xs inline-flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read Complete Contribution Policy & Terms</span>
          </Link>
        </div>
      </div>

      {/* 6. Clean Information Modal When Devotee Clicks Make a Contribution */}
      <Modal
        isOpen={isDonateModalOpen}
        onClose={handleCloseDonateModal}
        title="॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥"
        maxWidth="md"
      >
        <div className="space-y-4 text-center font-body py-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-800 text-3xl shadow-sm">
            🪔
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-heading font-bold text-maroon-950">
              ऑनलाइन सहयोग / दान सेवा सूचना
            </h3>
            <div className="bg-amber-500/15 border border-amber-400/60 p-4 rounded-2xl text-maroon-950 space-y-2 text-xs leading-relaxed">
              <p className="font-semibold text-sm">
                वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।
              </p>
              <p className="text-dark-700">
                माँ दुर्गा के पावन अनुष्ठान एवं आयोजन में आपके सहयोग की सद्भावना के लिए हार्दिक धन्यवाद। जय माता दी 🙏
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleCloseDonateModal}
              className="w-full bg-gradient-to-r from-maroon-800 via-maroon-900 to-maroon-950 text-gold-200 border border-gold-400/60 shadow-lg font-bold"
            >
              <span>समझ गए / वापस जाएँ (Close)</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Mandap TV Display Modal */}
      <MandapTvDisplayModal
        isOpen={isTvModalOpen}
        onClose={() => setIsTvModalOpen(false)}
        donations={donors}
      />
    </div>
  );
};

export default Donation;
