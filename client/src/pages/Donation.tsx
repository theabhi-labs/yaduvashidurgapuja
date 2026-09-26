import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { MandapTvDisplayModal } from '../components/donation/MandapTvDisplayModal';
import { getSocket } from '../services/socket';
import { getImageUrl } from '../utils/helpers';
import {
  Check,
  ShieldCheck,
  ArrowRight,
  HandHeart,
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
  { id: 'general', name: 'सामान्य पूजा सेवा (General Seva)' },
  { id: 'prasad', name: 'महाप्रसाद एवं भंडारा सेवा (Bhandara)' },
  { id: 'aarti', name: 'महाआरती एवं पुष्प सेवा (Aarti Seva)' },
  { id: 'pandal', name: 'पंडाल व विद्युत सज्जा (Pandal Seva)' },
];

export const Donation: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Modals state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState<boolean>(false);

  // Donation Form States
  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
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

  // Real-time live socket listener for new donations
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

  // Process Donation via Razorpay
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount < 1) {
      toast.error('कृपया दान राशि न्यूनतम ₹1 दर्ज करें');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await donationService.createOrder({
        amount: finalAmount,
        donorName: isAnonymous ? 'गुमनाम भक्त' : (donorName.trim() || user?.name || 'श्रद्धालु भक्त'),
        isAnonymous,
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
        name: 'यदुवंशी दुर्गा पूजा समिति कपूरिपुर',
        description: 'माँ दुर्गा पूजा सेवा एवं महाप्रसाद समर्पण',
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: {
          name: isAnonymous ? 'Anonymous' : (donorName || user?.name || ''),
          email: user?.email || donorEmail || '',
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

            toast.success('माँ दुर्गा की कृपा से आपका दान सफलतापूर्वक समर्पित हुआ! जय माता दी 🙏');
            setIsDonateModalOpen(false);
            setMessage('');
            fetchPublicWall();
          } catch (err: any) {
            toast.error(err.message || 'भुगतान सत्यापन में समस्या आई');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info('दान भुगतान प्रक्रिया रद्द कर दी गई');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (failRes: any) => {
        toast.error(failRes.error?.description || 'भुगतान प्रक्रिया पूरी नहीं हो सकी');
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'दान प्रक्रिया शुरू करने में त्रुटि आई');
      setIsSubmitting(false);
    }
  };

  const selectedFinalAmount = customAmount ? Number(customAmount) : amount;

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* 1. Header & Shloka Section */}
      <div className="text-center space-y-2 sm:space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold shadow-2xs"
        >
          <span>॥ श्री यदुवंशी दुर्गा पूजा पावन सहयोगी एवं दानदाता ॥</span>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-dark-950 tracking-tight">
          माँ भगवती के पावन सहयोगी (Contributors Wall)
        </h1>

        <p className="text-xs sm:text-sm text-dark-700 max-w-2xl mx-auto leading-relaxed font-normal">
          कपूरिपुर दुर्गा पूजा के पावन सहयोगियों, दानदाताओं, प्रत्यक्ष विकास एवं भव्य पावन आयोजन में अपनी अक्षुण्ण/अमूल्य श्रद्धा पूजन कमेटी अपने सभी सम्भ्रान्त दानकर्ताओं को वंदन करता।
        </p>

        <div className="inline-block text-xs sm:text-sm font-body text-maroon-900 italic bg-amber-50/80 border border-amber-300/80 rounded-2xl py-1.5 px-4 shadow-2xs">
          "दानेन प्राप्यते सर्वं दानेन सुखमेधते । दानेन परमो धर्मो दानं हि परमो निधिः ॥"
        </div>
      </div>

      {/* 2. Seva Participation Card (Clean compact action bar) */}
      <div className="bg-cream-100/90 p-4 sm:p-5 rounded-3xl border border-gold-400/50 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-0.5">
            <h3 className="text-sm sm:text-base font-heading font-bold text-dark-950 flex items-center justify-center sm:justify-start gap-1.5">
              <span>🪔</span>
              <span>माँ दुर्गा पूजा सेवा में सम्मिलित हों</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-dark-600">
              अपना शुभ सहयोग समर्पित करें तथा देवी सिंदूर एवं पावन प्रसादी का आशीष प्राप्त करें।
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
            {/* Button 1: Donate */}
            <button
              onClick={() => setIsDonateModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 hover:from-amber-500 hover:to-gold-500 text-maroon-950 font-heading font-bold text-xs sm:text-sm border border-gold-300 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>❤️ दान / सहयोग करें</span>
            </button>

            {/* Button 2: TV Live */}
            <button
              onClick={() => setIsTvModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-900 via-dark-950 to-maroon-950 hover:from-maroon-950 hover:to-black text-gold-300 font-heading font-bold text-xs sm:text-sm border border-gold-500/60 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>📺 TV Live (मंडप स्क्रीन)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Section Title: समस्त सहयोगी गौरव कार्ड्स */}
      <div className="pt-2">
        <h2 className="text-base sm:text-lg font-heading font-bold text-dark-950 flex items-center gap-2">
          <span className="text-amber-600">🪔</span>
          <span>समस्त सहयोगी गौरव कार्ड्स</span>
        </h2>
      </div>

      {/* 4. Devotee Cards Grid (Exact matching layout from mockup) */}
      {isLoadingWall ? (
        <div className="py-16 text-center text-xs text-muted animate-pulse">
          सहयोगी गौरव कार्ड्स लोड हो रहे हैं...
        </div>
      ) : donors.length === 0 ? (
        <div className="py-14 text-center bg-white rounded-3xl border border-cream-300 p-6 space-y-3">
          <p className="text-sm font-bold text-dark-800">
            माँ भगवती के चरणों में प्रथम पावन दान समर्पित करें 🙏
          </p>
          <button
            onClick={() => setIsDonateModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-gold-400 text-maroon-950 font-bold text-xs shadow-sm cursor-pointer"
          >
            ❤️ दान / सहयोग करें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {donors.map((donor, idx) => {
            const isLastOdd = idx === donors.length - 1 && donors.length % 2 !== 0;
            const avatarUrl = donor.avatar ? getImageUrl(donor.avatar) : null;
            const displayName = donor.isAnonymous ? 'गुमनाम भक्त' : (donor.donorName || 'श्रद्धालु भक्त');
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
                  {avatarUrl ? (
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

      {/* 5. Bottom Transparency Note Card */}
      <div className="bg-cream-100/80 rounded-3xl border border-cream-300 p-4 sm:p-5 text-xs font-body space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-maroon-800 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
            🪔
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-dark-950">
              पारदर्शिता एवं सेवा संकल्प
            </h4>
            <p className="text-[10px] text-muted">यदुवंशी दुर्गा पूजा समिति कपूरिपुर</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="flex items-start gap-1.5 bg-white p-2.5 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              पावन दान सूची केवल पूजा व भगवती जन कल्याण सम्मानार्थ समर्पित है।
            </span>
          </div>
          <div className="flex items-start gap-1.5 bg-white p-2.5 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              डिजिटल दान का पाई-पाई रिकॉर्ड तुरंत मंडप स्क्रीन और ऑनलाइन पोर्टल पर प्रदर्शित होता है।
            </span>
          </div>
          <div className="flex items-start gap-1.5 bg-white p-2.5 rounded-xl border border-cream-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-dark-800">
              सच्चा भाव व निष्ठा: यदुवंशी कमेटी हर पावन आहुति और स्मृति के प्रति कृतज्ञ एवं उत्तरदायी है।
            </span>
          </div>
        </div>
      </div>

      {/* 6. Donation Modal */}
      <Modal
        isOpen={isDonateModalOpen}
        onClose={() => !isSubmitting && setIsDonateModalOpen(false)}
        title="माँ दुर्गा के चरणों में दान समर्पण"
        maxWidth="md"
      >
        <form onSubmit={handleDonate} className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 p-3 rounded-2xl border border-amber-400/40 text-center">
            <p className="text-xs font-body text-maroon-950 font-semibold">
              आपकी सहयोग राशि कपूरिपुर दुर्गा पूजा के पावन अनुष्ठानों व भंडारा सेवा में समर्पित होगी 🌸
            </p>
          </div>

          {/* Preset Amount Grid */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-2 font-body">
              दान राशि चुनें (INR ₹) *
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !customAmount && amount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center justify-center gap-1 active:scale-95 ${
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
                placeholder="अन्य इच्छित राशि..."
                value={customAmount}
                onChange={handleCustomChange}
                min="1"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm font-bold"
              />
            </div>
          </div>

          {/* Seva Category Selection */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5 font-body">
              सेवा का उद्देश्य (Seva Purpose)
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

          {/* Devotee Name & Anonymous */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1 font-body">
              श्रद्धालु का नाम (Devotee Name)
            </label>
            <input
              type="text"
              disabled={isAnonymous}
              placeholder={isAnonymous ? 'गुमनाम भक्त' : 'अपना पूरा नाम...'}
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 ${
                isAnonymous ? 'opacity-50 cursor-not-allowed bg-cream-200' : ''
              }`}
            />

            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="checkbox"
                id="modal-anonymous-check"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-maroon-800 border-cream-400 focus:ring-maroon-700 cursor-pointer"
              />
              <label
                htmlFor="modal-anonymous-check"
                className="text-xs text-muted font-medium cursor-pointer select-none font-body"
              >
                नाम गुप्त रखें (Donate Anonymously)
              </label>
            </div>
          </div>

          {/* Devotional Note */}
          <div>
            <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1 font-body">
              माँ दुर्गा से प्रार्थना / शुभ संदेश (Optional)
            </label>
            <input
              type="text"
              placeholder="जय माता दी! माँ दुर्गा सब पर कृपा बनाए रखें..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSubmitting}
              className="w-full py-3 text-sm font-bold shadow-gold-glow flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 text-maroon-950"
            >
              <HandHeart className="w-4 h-4 text-maroon-950" />
              <span>
                ₹{selectedFinalAmount ? selectedFinalAmount.toLocaleString('en-IN') : 0} दान समर्पित करें
              </span>
              <ArrowRight className="w-4 h-4 text-maroon-950 ml-1" />
            </Button>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-muted font-body">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>सुरक्षित Razorpay गेटवे (UPI, GPay, PhonePe, Cards)</span>
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
