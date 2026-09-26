import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { MandapTvDisplayModal } from '../components/donation/MandapTvDisplayModal';
import { getSocket } from '../services/socket';
import { getImageUrl } from '../utils/helpers';
import {
  LEGAL_ENTITY_NAME,
} from '../utils/constants';
import {
  Check,
  ShieldCheck,
  ArrowRight,
  HandHeart,
  X,
  FileText,
  Sparkles,
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

const PRESET_AMOUNTS = [51, 101, 251, 501, 1100, 2100, 5100];

const SEVA_CATEGORIES = [
  { id: 'general', name: 'सामान्य पूजा व्यवस्था (General Seva)' },
  { id: 'prasad', name: 'महाप्रसाद एवं भंडारा (Bhandara & Prasad)' },
  { id: 'aarti', name: 'महाआरती एवं पूजा सामग्री (Rituals & Aarti)' },
  { id: 'pandal', name: 'पंडाल, मंच व विद्युत सज्जा (Pandal & Lighting)' },
];

export const Donation: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const rzpInstanceRef = useRef<any>(null);

  // Modals state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState<boolean>(false);

  // Contribution Form States
  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [agreeDisplayWall, setAgreeDisplayWall] = useState<boolean>(true);
  const [agreeDisplayPhoto, setAgreeDisplayPhoto] = useState<boolean>(true);
  const [sevaCategory, setSevaCategory] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Contributors Wall State (Strictly sorted in decreasing order)
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [isLoadingWall, setIsLoadingWall] = useState<boolean>(true);

  // Sync logged in user details
  useEffect(() => {
    if (user?.name) setDonorName(user.name);
    if (user?.email) setDonorEmail(user.email);
  }, [user]);

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

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  // Close & Cancel payment process cleanly
  const handleCloseDonateModal = () => {
    if (rzpInstanceRef.current) {
      try {
        rzpInstanceRef.current.close();
      } catch {}
      rzpInstanceRef.current = null;
    }
    setIsSubmitting(false);
    setIsDonateModalOpen(false);
  };

  // Process Voluntary Contribution via Razorpay
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount < 1) {
      toast.error('कृपया न्यूनतम सहयोग राशि ₹1 दर्ज करें');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveAnonymous = isAnonymous || !agreeDisplayWall;
      const res = await donationService.createOrder({
        amount: finalAmount,
        donorName: effectiveAnonymous ? 'गुमनाम भक्त' : (donorName.trim() || user?.name || 'श्रद्धालु भक्त'),
        isAnonymous: effectiveAnonymous,
        type: 'donation',
        message: `${sevaCategory ? `[${sevaCategory.toUpperCase()}] ` : ''}${message.trim()}`.trim() || undefined,
      });

      const orderData = res.data;

      if (typeof (window as any).Razorpay === 'undefined') {
        toast.error('भुगतान गेटवे लोड नहीं हो पाया। कृपया पृष्ठ रीफ्रेश करें।');
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency || 'INR',
        name: LEGAL_ENTITY_NAME,
        description: 'Voluntary Contribution for Durga Puja Seva & Organization',
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: {
          name: effectiveAnonymous ? 'Anonymous' : (donorName || user?.name || ''),
          email: user?.email || donorEmail || '',
          contact: donorPhone || undefined,
        },
        theme: {
          color: '#700c0c',
        },
        handler: async (paymentResponse: any) => {
          try {
            await donationService.verifyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            toast.success('Thank you for supporting the Durga Puja celebration. जय माता दी 🙏');
            handleCloseDonateModal();
            setMessage('');
            fetchPublicWall();
          } catch (err: any) {
            toast.error(err.message || 'भुगतान सत्यापन में समस्या आई');
          } finally {
            setIsSubmitting(false);
            rzpInstanceRef.current = null;
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            rzpInstanceRef.current = null;
            toast.info('सहयोग भुगतान प्रक्रिया रद्द कर दी गई');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzpInstanceRef.current = rzp;

      rzp.on('payment.failed', (failRes: any) => {
        toast.error(failRes.error?.description || 'भुगतान प्रक्रिया पूरी नहीं हो सकी');
        setIsSubmitting(false);
        rzpInstanceRef.current = null;
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'सहयोग प्रक्रिया शुरू करने में त्रुटि आई');
      setIsSubmitting(false);
      rzpInstanceRef.current = null;
    }
  };

  const selectedFinalAmount = customAmount ? Number(customAmount) : amount;

  return (
    <div className="min-h-screen py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* Floating Cancel/Close Button during active Payment */}
      {isSubmitting && (
        <div className="fixed top-4 right-4 z-[99999] animate-fade-in">
          <button
            type="button"
            onClick={handleCloseDonateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs sm:text-sm shadow-2xl border-2 border-white/90 active:scale-95 transition-all cursor-pointer"
            title="रद्द करें"
          >
            <X className="w-4 h-4" />
            <span>✕ Cancel / Close</span>
          </button>
        </div>
      )}

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
            <span>⚠️</span>
            <span>सूचना (Notice)</span>
          </div>
          <p className="text-xs text-maroon-900 font-medium">
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
              onClick={() => {
                toast.info('वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।');
                setIsDonateModalOpen(true);
              }}
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
          <button
            onClick={() => setIsDonateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-gold-400 text-maroon-950 font-bold text-xs shadow-sm cursor-pointer"
          >
            Make a Contribution
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {donors.map((donor, idx) => {
            const isLastOdd = idx === donors.length - 1 && donors.length % 2 !== 0;
            const avatarUrl = donor.avatar ? getImageUrl(donor.avatar) : null;
            const displayName = donor.isAnonymous ? 'गुमनाम भक्त (Anonymous)' : (donor.donorName || 'श्रद्धालु भक्त');
            const formattedAmount = (Number(donor.amount) || 0).toLocaleString('en-IN');

            return (
              <motion.div
                key={donor._id || idx}
                initial={{ opacity: 0, y: 15 }}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="flex items-start gap-1.5 bg-white p-3 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              Contributions are voluntary and used exclusively for organizing Durga Puja festival events.
            </span>
          </div>
          <div className="flex items-start gap-1.5 bg-white p-3 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              Payment processing is handled securely by Razorpay. The Samiti does not store card/banking credentials.
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

      {/* 6. Contribution Modal with Consent Checkboxes and Compliance Notice */}
      <Modal
        isOpen={isDonateModalOpen}
        onClose={handleCloseDonateModal}
        title="Support Durga Puja — Voluntary Contribution"
        maxWidth="md"
      >
        <form onSubmit={handleDonate} className="space-y-4 text-xs font-body">
          <div className="bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 p-3 rounded-2xl border border-amber-400/40 text-center">
            <p className="font-semibold text-maroon-950">
              Your voluntary contribution will support the organization of Durga Puja and community activities in Kapooripur 🌸
            </p>
          </div>

          {/* Preset Amount Grid */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-2">
              Select Contribution Amount (INR ₹) *
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !customAmount && amount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-200 border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-cream-50 text-dark-800 border-cream-300 hover:border-amber-400/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="Other custom amount..."
                value={customAmount}
                onChange={handleCustomChange}
                min="1"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm font-bold"
              />
            </div>
          </div>

          {/* Seva Category Selection */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5">
              Contribution Purpose Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEVA_CATEGORIES.map((cat) => {
                const isSelected = sevaCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSevaCategory(cat.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                        : 'bg-cream-50 border-cream-300 hover:border-cream-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="modalSevaCategory"
                        checked={isSelected}
                        onChange={() => setSevaCategory(cat.id)}
                        className="text-maroon-800 focus:ring-maroon-700"
                      />
                      <span className="font-bold text-[11px] text-dark-900 truncate">{cat.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contributor Name */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1">
              Contributor Name *
            </label>
            <input
              type="text"
              disabled={isAnonymous}
              placeholder={isAnonymous ? 'Anonymous' : 'Full Name'}
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 ${
                isAnonymous ? 'opacity-50 cursor-not-allowed bg-cream-200' : ''
              }`}
            />
          </div>

          {/* Contributor Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
              />
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1">
              Optional Message / Devotional Note
            </label>
            <input
              type="text"
              placeholder="Jai Maa Durga! Bless our village and family..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
            />
          </div>

          {/* Consent Checkboxes */}
          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 space-y-2 text-[11px] text-dark-800">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeDisplayWall && !isAnonymous}
                disabled={isAnonymous}
                onChange={(e) => setAgreeDisplayWall(e.target.checked)}
                className="w-4 h-4 rounded text-maroon-800 border-cream-400 focus:ring-maroon-700 mt-0.5 cursor-pointer"
              />
              <span>Display my name on the Community Support Wall (I agree to the public display of my name and contribution amount).</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeDisplayPhoto && !isAnonymous}
                disabled={isAnonymous}
                onChange={(e) => setAgreeDisplayPhoto(e.target.checked)}
                className="w-4 h-4 rounded text-maroon-800 border-cream-400 focus:ring-maroon-700 mt-0.5 cursor-pointer"
              />
              <span>I agree to the public display of my profile photo.</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer select-none pt-1 border-t border-cream-200">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) {
                    setAgreeDisplayWall(false);
                    setAgreeDisplayPhoto(false);
                  } else {
                    setAgreeDisplayWall(true);
                    setAgreeDisplayPhoto(true);
                  }
                }}
                className="w-4 h-4 rounded text-maroon-800 border-cream-400 focus:ring-maroon-700 mt-0.5 cursor-pointer"
              />
              <span className="font-semibold text-maroon-900">Make this an Anonymous contribution (hide my name and photo from public view).</span>
            </label>
          </div>

          {/* Pre-Payment Acknowledgment Notice */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 leading-relaxed">
            By continuing, you acknowledge that this is a voluntary contribution towards the activities described above and agree to the{' '}
            <Link to="/contribution-policy" target="_blank" className="underline font-semibold text-maroon-900">
              Contribution Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms-and-conditions" target="_blank" className="underline font-semibold text-maroon-900">
              Terms & Conditions
            </Link>.
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-1 space-y-2">
            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSubmitting}
              className="w-full py-3 text-sm font-bold shadow-gold-glow flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 text-maroon-950 cursor-pointer"
            >
              <HandHeart className="w-4 h-4 text-maroon-950" />
              <span>
                Continue to Contribution (₹{selectedFinalAmount ? selectedFinalAmount.toLocaleString('en-IN') : 0})
              </span>
              <ArrowRight className="w-4 h-4 text-maroon-950 ml-1" />
            </Button>

            {isSubmitting && (
              <button
                type="button"
                onClick={handleCloseDonateModal}
                className="w-full py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Payment Process</span>
              </button>
            )}

            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Processed securely via Razorpay (UPI, GPay, PhonePe, Cards, NetBanking)</span>
            </div>
          </div>
        </form>
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
