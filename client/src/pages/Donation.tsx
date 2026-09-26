import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { SectionHeading } from '../components/common/SectionHeading';
import { MandapTvDisplayModal } from '../components/donation/MandapTvDisplayModal';
import { getSocket } from '../services/socket';
import { getImageUrl } from '../utils/helpers';
import {
  Sparkles,
  ShieldCheck,
  Check,
  QrCode,
  Flame,
  Crown,
  Tv,
  Heart,
  Receipt,
  FileCheck,
  Search,
  Landmark,
  Radio,
  ArrowRight,
  HandHeart,
  Filter,
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

interface WallSummary {
  totalAmount: number;
  totalDonors: number;
  highestDonation: number;
}

const PRESET_AMOUNTS = [51, 101, 251, 501, 1100, 2100, 5100];

const SEVA_CATEGORIES = [
  { id: 'general', name: 'सामान्य पूजा सेवा (General Seva)', desc: 'दैनिक पूजन, सामग्री व अखंड दीप' },
  { id: 'prasad', name: 'महाप्रसाद एवं भंडारा सेवा (Bhandara Seva)', desc: 'भक्तों हेतु पावन प्रसाद वितरण' },
  { id: 'aarti', name: 'महाआरती एवं पुष्प सेवा (Maha Aarti & Flowers)', desc: 'दैनिक संध्या व महाआरती व्यवस्था' },
  { id: 'pandal', name: 'पंडाल व विद्युत सज्जा (Pandal & Lighting)', desc: 'प्रांगण, सजावट व सुरक्षा व्यवस्था' },
];

export const Donation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  // Modals state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState<boolean>(false);

  // Donation Form States (Inside Modal)
  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [sevaCategory, setSevaCategory] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDirectUpi, setShowDirectUpi] = useState<boolean>(false);

  // Contributors Wall States
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [summary, setSummary] = useState<WallSummary>({
    totalAmount: 0,
    totalDonors: 0,
    highestDonation: 0,
  });
  const [isLoadingWall, setIsLoadingWall] = useState<boolean>(true);
  const [donorSearch, setDonorSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'donation' | 'dakshina'>('all');

  // Devotee's Personal Receipts
  const [myReceipts, setMyReceipts] = useState<any[]>([]);
  const [showMyReceipts, setShowMyReceipts] = useState<boolean>(false);

  // Sync logged in user details
  useEffect(() => {
    if (user?.name) setDonorName(user.name);
    if (user?.email) setDonorEmail(user.email);
  }, [user]);

  // Fetch Public Contributors Wall (Sorted strictly decreasing)
  const fetchPublicWall = useCallback(async () => {
    try {
      setIsLoadingWall(true);
      const res = await donationService.getPublicWall();
      if (res.success && res.data) {
        // Ensure strictly sorted descending by amount
        const rawDonors = (res.data.donors || []).sort((a, b) => (b.amount || 0) - (a.amount || 0));
        setDonors(rawDonors);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
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

  // Fetch My Receipts if logged in
  useEffect(() => {
    if (isAuthenticated) {
      donationService
        .getMyDonations()
        .then((res) => {
          if (res.success && res.data?.donations) {
            setMyReceipts(res.data.donations);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

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
        return next.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      });

      setSummary((prev) => ({
        totalAmount: prev.totalAmount + (Number(newDonation.amount) || 0),
        totalDonors: prev.totalDonors + 1,
        highestDonation: Math.max(prev.highestDonation, Number(newDonation.amount) || 0),
      }));
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
      // 1. Create order on backend
      const res = await donationService.createOrder({
        amount: finalAmount,
        donorName: isAnonymous ? 'गुमनाम भक्त' : (donorName.trim() || user?.name || 'श्रद्धालु भक्त'),
        isAnonymous,
        type: 'donation',
        message: `${sevaCategory ? `[${sevaCategory.toUpperCase()}] ` : ''}${message.trim()}`.trim() || undefined,
      });

      const orderData = res.data;

      // 2. Check if Razorpay SDK is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        toast.error('भुगतान गेटवे लोड नहीं हो पाया। कृपया पृष्ठ रीफ्रेश करें।');
        setIsSubmitting(false);
        return;
      }

      // 3. Trigger Razorpay Checkout Popup
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

  // Filtered contributors strictly sorted decreasing
  const filteredDonors = donors
    .filter((d) => {
      // Type filter
      if (typeFilter === 'dakshina' && d.type !== 'dakshina' && !d.liveSessionRoomName) return false;
      if (typeFilter === 'donation' && (d.type === 'dakshina' || Boolean(d.liveSessionRoomName))) return false;

      // Search query
      if (!donorSearch.trim()) return true;
      const q = donorSearch.toLowerCase();
      return (
        d.donorName.toLowerCase().includes(q) ||
        (d.username && d.username.toLowerCase().includes(q)) ||
        (d.message && d.message.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* 1. Header & Shloka Banner */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/25 to-amber-500/15 border border-amber-400/50 text-amber-950 text-xs sm:text-sm font-semibold font-body shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>॥ श्री यदुवंशी दुर्गा पूजा पावन सहयोगी एवं दानदाता ॥</span>
        </motion.div>

        <SectionHeading
          title="माँ भगवती के पावन सहयोगी (Contributors Wall)"
          subtitle="कपूरिपुर दुर्गा पूजा के पावन अनुष्ठानों, महाआरती, प्रसाद वितरण एवं भव्य पंडाल व्यवस्था में अपनी सामर्थ्यानुसार श्रद्धा सुमन अर्पित करने वाले समस्त पुण्यात्माओं का गौरव स्थल।"
        />

        <div className="text-xs sm:text-sm font-body text-maroon-800 italic bg-amber-50/90 border border-amber-300/80 rounded-2xl py-2 px-4 max-w-lg mx-auto shadow-xs">
          "दानेन प्राप्यते सर्वं दानेन सुखमेधते । दानेन परमो धर्मो दानं हि परमो निधिः ॥"
        </div>
      </div>

      {/* 2. Top Live Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-tr from-maroon-900 via-maroon-800 to-maroon-950 text-gold-200 p-4 sm:p-5 rounded-3xl border border-gold-500/40 shadow-md text-center">
          <span className="text-xs uppercase tracking-wider block font-body text-gold-300/80 font-bold">
            कुल संकलित सेवा राशि (Total Seva)
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white block mt-1">
            ₹{summary.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-gradient-to-tr from-amber-500/20 via-gold-500/20 to-cream-100 text-maroon-950 p-4 sm:p-5 rounded-3xl border border-amber-400/60 shadow-sm text-center">
          <span className="text-xs uppercase tracking-wider block font-body text-maroon-900 font-bold">
            समर्पित सहयोगी भक्त (Total Contributors)
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-maroon-950 block mt-1">
            {summary.totalDonors || donors.length} भक्त
          </span>
        </div>

        <div className="bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cream-100 text-emerald-950 p-4 sm:p-5 rounded-3xl border border-emerald-400/60 shadow-sm text-center">
          <span className="text-xs uppercase tracking-wider block font-body text-emerald-900 font-bold">
            सर्वोच्च समर्पण (Top Offering)
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-emerald-950 block mt-1">
            ₹{summary.highestDonation.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY TOP ACTION BUTTONS (दान करें & टीवी लाइव डिस्प्ले)                */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-cream-100 via-amber-50 to-cream-100 p-4 sm:p-6 rounded-3xl border-2 border-gold-500/50 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-heading font-black text-maroon-950 flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-amber-600" />
              <span>माँ दुर्गा पूजा सेवा में सम्मिलित हों</span>
            </h3>
            <p className="text-xs text-muted font-body mt-0.5">
              अपना पावन सहयोग समर्पित करें अथवा मंडप लाइव टीवी डिस्प्ले पर समस्त सहयोगियों को देखें
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* Button 1: Donate / Contribute (दान / सहयोग करें) */}
            <Button
              variant="gold"
              size="lg"
              onClick={() => setIsDonateModalOpen(true)}
              leftIcon={<Heart className="w-5 h-5 text-maroon-900 fill-maroon-900/20" />}
              className="flex-1 sm:flex-none font-heading font-bold text-sm sm:text-base px-6 py-3.5 shadow-gold-glow bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 hover:from-amber-500 hover:to-gold-500 border border-gold-300 text-maroon-950 active:scale-95"
            >
              ❤️ दान / सहयोग करें
            </Button>

            {/* Button 2: TV Live / Mandap Screen (टीवी लाइव डिस्प्ले) */}
            <button
              onClick={() => setIsTvModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-maroon-900 via-dark-950 to-maroon-950 hover:from-maroon-950 hover:to-black text-gold-300 border border-gold-400/80 font-heading font-bold text-sm sm:text-base shadow-md transition-all active:scale-95 group"
              title="मंडप लाइव टीवी डिस्प्ले खोलें"
            >
              <Tv className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
              <span>📺 TV Live (मंडप स्क्रीन)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            </button>
          </div>
        </div>

        {/* My Receipts Quick Toggle for Logged-in Devotees */}
        {isAuthenticated && myReceipts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-amber-300/40 flex items-center justify-between text-xs font-body">
            <span className="text-dark-800">
              आपके द्वारा कुल <strong>{myReceipts.length}</strong> दान समर्पित किए गए हैं
            </span>
            <button
              onClick={() => setShowMyReceipts(!showMyReceipts)}
              className="inline-flex items-center gap-1.5 font-bold text-maroon-800 hover:text-maroon-950 underline cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-700" />
              <span>{showMyReceipts ? 'रसीदें छिपाएं' : 'मेरी दान रसीदें देखें'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Devotee's Personal Receipts Drawer */}
      <AnimatePresence>
        {showMyReceipts && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-3xl bg-amber-50/90 border border-amber-300 shadow-soft space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-sm text-maroon-950 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>आपकी दान पावती रसीदें (Digital Receipts)</span>
              </h4>
              <span className="text-xs text-muted">ईमेल पर भी भेजी जा चुकी हैं</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {myReceipts.map((rcpt) => (
                <div key={rcpt._id} className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs font-body space-y-1 shadow-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-maroon-900 text-sm font-black">₹{rcpt.amount.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">सफल (Paid)</span>
                  </div>
                  <p className="text-muted font-mono text-[11px] truncate">ID: {rcpt.razorpayPaymentId || rcpt.razorpayOrderId}</p>
                  <p className="text-[10px] text-muted">{new Date(rcpt.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. FULL LIST OF CONTRIBUTORS (दानदाता / सहयोगी सूची — DECREASING SORT)    */}
      {/* ========================================================================= */}
      <div className="bg-cream-100 rounded-3xl border-2 border-gold-500/40 shadow-soft p-4 sm:p-7 space-y-5">
        {/* Leaderboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-maroon-900 to-amber-600 text-gold-300 flex items-center justify-center font-bold text-lg shadow-sm border border-gold-400">
              👑
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-maroon-950 flex items-center gap-2">
                <span>समस्त सहयोगी एवं दानदाता गौरव सूची</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-muted font-body">
                सर्वोच्च सहयोग राशि से न्यूनतम क्रम में (Decreasing Order) • स्वतः लाइव अपडेट
              </p>
            </div>
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted font-body flex items-center gap-1 mr-1 hidden sm:inline-flex">
              <Filter className="w-3.5 h-3.5" />
            </span>
            {[
              { id: 'all', label: 'सभी सहयोगी' },
              { id: 'donation', label: '🏛️ पूजा दान' },
              { id: 'dakshina', label: '🪔 पावन दक्षिणा' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-body whitespace-nowrap transition-all ${
                  typeFilter === tab.id
                    ? 'bg-maroon-800 text-cream-50 shadow-xs font-bold'
                    : 'bg-cream-200 text-dark-800 hover:bg-cream-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input for Contributors */}
        <div className="relative">
          <input
            type="text"
            placeholder="सहयोगी भक्त का नाम, @username या संदेश से खोजें..."
            value={donorSearch}
            onChange={(e) => setDonorSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs sm:text-sm font-body focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-3.5" />
          {donorSearch && (
            <button
              onClick={() => setDonorSearch('')}
              className="absolute right-3 top-3 text-xs text-muted hover:text-dark-900"
            >
              ✕
            </button>
          )}
        </div>

        {/* List of Contributors (Strictly Decreasing by Amount) */}
        <div className="space-y-2.5">
          {isLoadingWall ? (
            <div className="py-16 text-center text-muted text-xs font-body animate-pulse">
              <span>सहयोगी सूची लोड हो रही है...</span>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="py-16 text-center text-muted text-xs font-body space-y-3">
              <Heart className="w-10 h-10 text-amber-500/40 mx-auto" />
              <p className="font-semibold text-dark-900 text-sm">
                {donorSearch ? 'दिए गए खोज शब्दों के अनुसार कोई सहयोगी नहीं मिला' : 'माँ के चरणों में प्रथम दान समर्पित करें 🙏'}
              </p>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsDonateModalOpen(true)}
              >
                दान समर्पित करें
              </Button>
            </div>
          ) : (
            filteredDonors.map((donor, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;
              const isDakshina = donor.type === 'dakshina' || Boolean(donor.liveSessionRoomName);

              return (
                <motion.div
                  key={donor._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isTop1
                      ? 'bg-gradient-to-r from-amber-100/90 via-cream-50 to-amber-50/90 border-gold-400 shadow-md ring-1 ring-gold-400/50'
                      : isTop2
                      ? 'bg-gradient-to-r from-slate-100/80 to-cream-50 border-slate-300 shadow-xs'
                      : isTop3
                      ? 'bg-gradient-to-r from-amber-50/60 to-cream-50 border-amber-300 shadow-xs'
                      : 'bg-cream-50/90 border-cream-200 hover:border-cream-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div className="shrink-0 text-center w-7">
                      {isTop1 ? (
                        <Crown className="w-6 h-6 text-amber-600 fill-amber-500 mx-auto animate-bounce" />
                      ) : isTop2 ? (
                        <span className="text-xs font-black font-mono text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded-full">#2</span>
                      ) : isTop3 ? (
                        <span className="text-xs font-black font-mono text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded-full">#3</span>
                      ) : (
                        <span className="text-xs font-bold font-mono text-muted">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar Photo or Letter Emblem */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden shadow-xs ${
                        isTop1
                          ? 'ring-2 ring-gold-500 bg-maroon-900 text-gold-200'
                          : 'bg-maroon-800 text-cream-100 border border-gold-500/30'
                      }`}
                    >
                      {donor.avatar ? (
                        <img
                          src={getImageUrl(donor.avatar)}
                          alt={donor.donorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{donor.isAnonymous ? '?' : donor.donorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Contributor Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-bold text-dark-950 text-xs sm:text-sm truncate">
                          {donor.isAnonymous ? 'गुमनाम भक्त' : donor.donorName}
                        </span>
                        {donor.isAnonymous && (
                          <span className="text-[9px] text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded font-semibold border border-amber-300">
                            Anonymous
                          </span>
                        )}
                        {!donor.isAnonymous && donor.username && (
                          <span className="text-[11px] font-mono text-muted font-bold">
                            @{donor.username}
                          </span>
                        )}
                        {/* Seva Type Badge */}
                        {isDakshina ? (
                          <span className="text-[9px] font-bold text-rose-900 bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                            पावन दक्षिणा
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                            <Landmark className="w-2.5 h-2.5 text-amber-700" />
                            पूजा दान
                          </span>
                        )}
                      </div>
                      {donor.message && (
                        <p className="text-[11px] text-dark-700 italic truncate max-w-[190px] sm:max-w-md mt-0.5">
                          "{donor.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contribution Amount Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-2xl font-heading font-black text-xs sm:text-base shadow-xs ${
                        isTop1
                          ? 'bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-300 border border-gold-400'
                          : 'bg-gradient-to-r from-amber-500/20 to-gold-500/20 text-maroon-950 border border-amber-400/50'
                      }`}
                    >
                      ₹{donor.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Transparency & Direct Bank / UPI Transfer Section */}
      <div className="bg-cream-100 rounded-3xl border border-cream-300 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-maroon-800 text-amber-400 flex items-center justify-center shadow-sm">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-dark-950 text-sm sm:text-base">
              पारदर्शिता एवं सेवा संकल्प
            </h3>
            <p className="text-xs text-muted font-body">यदुवंशी दुर्गा पूजा समिति कपूरिपुर</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-body text-dark-800 pt-1">
          <div className="flex items-start gap-2 bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>समस्त दान राशि सीधे पूजा, महाआरती एवं भंडारा व्यवस्था में उपयोग होती है।</span>
          </div>
          <div className="flex items-start gap-2 bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>डिजिटल पावती एवं रसीद रिकॉर्ड तुरंत आपके ईमेल पर प्रेषित की जाती है।</span>
          </div>
          <div className="flex items-start gap-2 bg-cream-50 p-3 rounded-2xl border border-cream-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>दानदाता का नाम, प्रोफ़ाइल फ़ोटो एवं राशि गौरव सूची में लाइव सम्मिलित होती है।</span>
          </div>
        </div>

        {/* Direct Bank / UPI QR Accordion */}
        <div className="pt-2 border-t border-cream-200">
          <button
            type="button"
            onClick={() => setShowDirectUpi(!showDirectUpi)}
            className="w-full flex items-center justify-between text-xs font-bold text-maroon-800 hover:text-maroon-950 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>समिति बैंक खाता व प्रत्यक्ष UPI विवरण</span>
            </span>
            <span>{showDirectUpi ? '▲' : '▼'}</span>
          </button>

          {showDirectUpi && (
            <div className="mt-3 p-3.5 rounded-2xl bg-cream-50 border border-cream-300 text-xs font-body space-y-2 animate-fade-in">
              <div className="flex justify-between">
                <span className="text-muted">समिति:</span>
                <span className="font-semibold text-dark-900">यदुवंशी दुर्गा पूजा समिति</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">स्थान:</span>
                <span className="font-semibold text-dark-900">कपूरिपुर, सुरियावां, भदोही (UP)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">UPI ID:</span>
                <span className="font-mono font-bold text-maroon-900">kapooripur@upi</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. DONATION CONTRIBUTION POPUP MODAL                                      */}
      {/* ========================================================================= */}
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

          {/* 1. Preset Amount Grid */}
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

          {/* 2. Seva Category Selection */}
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

          {/* 3. Devotee Name & Anonymous */}
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

          {/* 4. Devotional Blessing Note */}
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

          {/* 5. Submit Action Button */}
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

      {/* ========================================================================= */}
      {/* 7. FULLSCREEN MANDAP TV MODAL                                             */}
      {/* ========================================================================= */}
      <MandapTvDisplayModal
        isOpen={isTvModalOpen}
        onClose={() => setIsTvModalOpen(false)}
        donations={donors}
        totalAmount={summary.totalAmount}
      />
    </div>
  );
};

export default Donation;
