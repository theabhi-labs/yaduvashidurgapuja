import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
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
  ArrowRight,
  HandHeart,
  Crown,
  Tv,
  Heart,
  LogIn,
  Receipt,
  FileCheck,
  Search,
} from 'lucide-react';

interface DonorItem {
  _id: string;
  donorName: string;
  username?: string;
  avatar?: string;
  amount: number;
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

  // Donation Form States
  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [sevaCategory, setSevaCategory] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDirectUpi, setShowDirectUpi] = useState<boolean>(false);

  // Public Donors Wall States
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [summary, setSummary] = useState<WallSummary>({
    totalAmount: 0,
    totalDonors: 0,
    highestDonation: 0,
  });
  const [isLoadingWall, setIsLoadingWall] = useState<boolean>(true);
  const [isTvModalOpen, setIsTvModalOpen] = useState<boolean>(false);
  const [donorSearch, setDonorSearch] = useState<string>('');

  // User's own receipts
  const [myReceipts, setMyReceipts] = useState<any[]>([]);
  const [showMyReceipts, setShowMyReceipts] = useState<boolean>(false);

  // Sync user name
  useEffect(() => {
    if (user?.name) {
      setDonorName(user.name);
    }
  }, [user]);

  // Fetch Public Donors Wall (Sorted Descending)
  const fetchPublicWall = useCallback(async () => {
    try {
      setIsLoadingWall(true);
      const res = await donationService.getPublicWall();
      if (res.success && res.data) {
        setDonors(res.data.donors || []);
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
        message: newDonation.message,
        createdAt: newDonation.timestamp || new Date().toISOString(),
        isAnonymous: Boolean(newDonation.isAnonymous),
      };

      setDonors((prev) => {
        const next = [formattedItem, ...prev.filter((d) => d._id !== formattedItem._id)];
        return next.sort((a, b) => b.amount - a.amount);
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

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('कृपया दान व पावती रसीद प्राप्त करने के लिए पहले लॉगिन करें');
      return;
    }

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
          email: user?.email || '',
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
            toast.success('माँ दुर्गा की कृपा से आपका दान सफलतापूर्वक प्राप्त हुआ! पावती आपके ईमेल पर भेज दी गई है। जय माता दी 🙏');
            setMessage('');
            setCustomAmount('');
            fetchPublicWall();
          } catch (err: any) {
            toast.error(err.message || 'भुगतान सत्यापन असफल रहा');
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

  const filteredDonors = donors.filter((d) => {
    if (!donorSearch.trim()) return true;
    const q = donorSearch.toLowerCase();
    return (
      d.donorName.toLowerCase().includes(q) ||
      (d.username && d.username.toLowerCase().includes(q)) ||
      (d.message && d.message.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* 1. Header & Shloka Banner */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-950 text-xs sm:text-sm font-semibold font-body shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>॥ श्री यदुवंशी दुर्गा पूजा सेवा समर्पण एवं दान ॥</span>
        </motion.div>

        <SectionHeading
          title="माँ भगवती के पावन उत्सव में अपना योगदान दें"
          subtitle="कपूरिपुर दुर्गा पूजा के पावन अनुष्ठानों, महाआरती, प्रसाद वितरण एवं भव्य पंडाल व्यवस्था में अपनी सामर्थ्यानुसार श्रद्धा सुमन अर्पित करें।"
        />

        <div className="text-xs sm:text-sm font-body text-maroon-800 italic bg-amber-50/80 border border-amber-200 rounded-2xl py-2 px-4 max-w-lg mx-auto shadow-xs">
          "दानेन प्राप्यते सर्वं दानेन सुखमेधते । दानेन परमो धर्मो दानं हि परमो निधिः ॥"
        </div>
      </div>

      {/* 2. Top Live Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-tr from-maroon-900 to-maroon-950 text-gold-200 p-4 sm:p-5 rounded-3xl border border-gold-500/40 shadow-md text-center">
          <span className="text-xs uppercase tracking-wider block font-body text-gold-300/80">
            कुल संकलित सेवा राशि (Total Seva)
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white block mt-1">
            ₹{summary.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-gradient-to-tr from-amber-500/20 to-gold-500/20 text-maroon-950 p-4 sm:p-5 rounded-3xl border border-amber-400/60 shadow-sm text-center">
          <span className="text-xs uppercase tracking-wider block font-body text-maroon-900 font-semibold">
            समर्पित भक्त संख्या (Total Devotees)
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-maroon-950 block mt-1">
            {summary.totalDonors || donors.length} भक्त
          </span>
        </div>

        <div className="bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-950 p-4 sm:p-5 rounded-3xl border border-emerald-400/60 shadow-sm text-center">
          <span className="text-xs uppercase tracking-wider block font-body text-emerald-900 font-semibold">
            सर्वोच्च दान समर्पण (Top Offering)
          </span>
          <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-emerald-950 block mt-1">
            ₹{summary.highestDonation.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WALL OF DEVOTEES (सदा सर्वदा दानदाता सूची — Highest on top)             */}
      {/* ========================================================================= */}
      <div className="bg-cream-100 rounded-3xl border-2 border-gold-500/40 shadow-soft p-5 sm:p-7 space-y-4">
        {/* Leaderboard Header + Mandap TV Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-maroon-900 to-amber-600 text-gold-300 flex items-center justify-center font-bold text-lg shadow-sm border border-gold-400">
              👑
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-maroon-950 flex items-center gap-2">
                <span>पावन दानदाता गौरव सूची</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-muted font-body">
                दान राशि के क्रम में (अधिकतम से न्यूनतम) • स्वतः लाइव अपडेट
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 📺 Mandap TV Display Mode Button */}
            <button
              onClick={() => setIsTvModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-maroon-900 to-dark-950 hover:from-maroon-950 hover:to-black text-gold-300 border border-gold-400 font-heading font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 group"
              title="मंडप लाइव टीवी / Wall of Honor डिस्प्ले खोलें"
            >
              <Tv className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
              <span>📺 मंडप टीवी डिस्प्ले</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </button>

            {/* My Receipts Toggle if Logged in */}
            {isAuthenticated && myReceipts.length > 0 && (
              <button
                onClick={() => setShowMyReceipts(!showMyReceipts)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cream-50 hover:bg-cream-200 border border-cream-300 text-maroon-950 font-bold text-xs font-body transition-colors"
              >
                <Receipt className="w-4 h-4 text-amber-700" />
                <span>मेरी रसीदें ({myReceipts.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Devotee's Personal Receipts Drawer */}
        {showMyReceipts && isAuthenticated && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-sm text-maroon-950 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>आपकी दान पावती रसीदें (Digital Receipts)</span>
              </h4>
              <span className="text-xs text-muted">ईमेल पर भी भेजी जा चुकी हैं</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {myReceipts.map((rcpt) => (
                <div key={rcpt._id} className="p-3 rounded-xl bg-white border border-amber-200 text-xs font-body space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-maroon-900 text-sm">₹{rcpt.amount.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">सफल (Paid)</span>
                  </div>
                  <p className="text-muted font-mono text-[11px] truncate">ID: {rcpt.razorpayPaymentId || rcpt.razorpayOrderId}</p>
                  <p className="text-[10px] text-muted">{new Date(rcpt.createdAt).toLocaleDateString('hi-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Input for Donors */}
        <div className="relative">
          <input
            type="text"
            placeholder="दानदाता का नाम या यूजरनेम से खोजें..."
            value={donorSearch}
            onChange={(e) => setDonorSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
        </div>

        {/* Scrollable Wall of Donors (Sorted Descending) */}
        <div className="max-h-96 overflow-y-auto pr-1 space-y-2.5">
          {isLoadingWall ? (
            <div className="py-12 text-center text-muted text-xs font-body animate-pulse">
              <span>दानदाता सूची लोड हो रही है...</span>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs font-body space-y-2">
              <Heart className="w-8 h-8 text-amber-500/40 mx-auto" />
              <p className="font-semibold text-dark-900">
                {donorSearch ? 'कोई दानदाता नहीं मिला' : 'माँ के चरणों में प्रथम दान समर्पित करें 🙏'}
              </p>
            </div>
          ) : (
            filteredDonors.map((donor, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <motion.div
                  key={donor._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
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
                    <div className="shrink-0 text-center w-6">
                      {isTop1 ? (
                        <Crown className="w-5 h-5 text-amber-600 fill-amber-500 mx-auto" />
                      ) : (
                        <span className={`text-xs font-black font-mono ${rank <= 3 ? 'text-maroon-900' : 'text-muted'}`}>
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar Photo or Initial */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden ${
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
                        <span>{donor.donorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Donor Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-bold text-dark-950 text-xs sm:text-sm truncate">
                          {donor.donorName}
                        </span>
                        {donor.username && (
                          <span className="text-[11px] font-mono text-muted font-bold">
                            @{donor.username}
                          </span>
                        )}
                      </div>
                      {donor.message && (
                        <p className="text-[11px] text-dark-700 italic truncate max-w-[200px] sm:max-w-md mt-0.5">
                          "{donor.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-heading font-black text-xs sm:text-sm shadow-xs ${
                        isTop1
                          ? 'bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-300 border border-gold-400'
                          : 'bg-amber-500/15 text-maroon-950 border border-amber-400/40'
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

      {/* ========================================================================= */}
      {/* 4. DONATION CONTRIBUTION FORM WITH LOGIN GATEWAY                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Donation Payment Form */}
        <div className="lg:col-span-7 bg-cream-100 rounded-3xl border border-cream-300 shadow-soft p-5 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <h3 className="font-heading font-black text-lg text-maroon-950 flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-amber-600" />
              <span>माँ के चरणों में दान समर्पण करें</span>
            </h3>
            <span className="text-xs text-muted font-body">सुरक्षित व पारदर्शी</span>
          </div>

          {/* Login Gate Check */}
          {!isAuthenticated ? (
            <div className="p-6 rounded-2xl bg-amber-50/90 border-2 border-dashed border-amber-400 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-maroon-900 text-gold-300 flex items-center justify-center mx-auto shadow-md">
                <LogIn className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-base text-dark-950">
                दान समर्पण हेतु लॉगिन आवश्यक है
              </h4>
              <p className="text-xs text-muted font-body max-w-md mx-auto">
                दान पावती रसीद सीधे आपके ईमेल एवं प्रोफ़ाइल खाते में स्वतः सुरक्षित हो जाएगी।
              </p>
              <div className="pt-2">
                <Link to="/login?redirect=/donate">
                  <Button variant="gold" size="md" className="font-bold">
                    लॉगिन / पंजीकरण करें (Login to Donate)
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDonate} className="space-y-5">
              {/* 1. Amount Preset Grid */}
              <div>
                <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-2 font-body">
                  दान राशि चुनें (INR ₹) *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = !customAmount && amount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectPreset(amt)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-1 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-maroon-800 to-maroon-900 text-gold-200 border-amber-400 shadow-md scale-[1.02]'
                            : 'bg-cream-50 text-dark-800 border-cream-300 hover:border-amber-400/60'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-base">₹</span>
                  <input
                    type="number"
                    placeholder="अन्य राशि (Custom Amount)..."
                    value={customAmount}
                    onChange={handleCustomChange}
                    min="1"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm font-bold placeholder:text-muted/60"
                  />
                </div>
              </div>

              {/* 2. Seva Category Selection */}
              <div>
                <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-2 font-body">
                  सेवा का उद्देश्य (Seva Purpose)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SEVA_CATEGORIES.map((cat) => {
                    const isSelected = sevaCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSevaCategory(cat.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                            : 'bg-cream-50 border-cream-300 hover:border-cream-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="sevaCategory"
                            checked={isSelected}
                            onChange={() => setSevaCategory(cat.id)}
                            className="text-maroon-800 focus:ring-maroon-700"
                          />
                          <span className="font-bold text-xs text-dark-900">{cat.name}</span>
                        </div>
                        <p className="text-[11px] text-muted mt-1 ml-5">{cat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Donor Name & Anonymous Toggle */}
              <div>
                <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5 font-body">
                  श्रद्धालु का नाम (Devotee Name)
                </label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? 'गुमनाम भक्त' : 'अपना पूरा नाम दर्ज करें...'}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm ${
                    isAnonymous ? 'opacity-50 cursor-not-allowed bg-cream-200' : ''
                  }`}
                />

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="anonymous-donation"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-maroon-800 border-cream-400 focus:ring-maroon-700 cursor-pointer"
                  />
                  <label
                    htmlFor="anonymous-donation"
                    className="text-xs text-muted font-medium cursor-pointer select-none font-body"
                  >
                    नाम गुप्त रखें (Donate Anonymously)
                  </label>
                </div>
              </div>

              {/* 4. Blessing Message / Prayer Note */}
              <div>
                <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5 font-body">
                  माँ दुर्गा से प्रार्थना / शुभ संदेश (Optional)
                </label>
                <input
                  type="text"
                  placeholder="जय माता दी! माँ दुर्गा सब पर कृपा बनाए रखें..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm"
                />
              </div>

              {/* 5. Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full py-3.5 text-base font-bold shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <HandHeart className="w-5 h-5 text-dark-950" />
                  <span>
                    ₹{selectedFinalAmount ? selectedFinalAmount.toLocaleString('en-IN') : 0} का दान समर्पण करें
                  </span>
                  <ArrowRight className="w-4 h-4 text-dark-950 ml-1" />
                </Button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted font-body">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>सुरक्षित भुगतान: UPI (GPay, PhonePe, Paytm), कार्ड व नेट बैंकिंग</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Transparency & Direct Bank Transfer */}
        <div className="lg:col-span-5 space-y-6">
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

            <div className="space-y-2.5 text-xs font-body text-dark-800 pt-1">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>समस्त दान राशि सीधे पूजा, महाआरती एवं भंडारा व्यवस्था में उपयोग होती है।</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>डिजिटल पावती एवं रसीद रिकॉर्ड तुरंत आपके ईमेल पर प्रेषित की जाती है।</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>दानदाता का नाम, प्रोफ़ाइल फ़ोटो एवं राशि गौरव सूची में लाइव सम्मिलित होती है।</span>
              </div>
            </div>

            {/* Direct Bank / UPI QR Accordion Toggle */}
            <div className="pt-3 border-t border-cream-200">
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
        </div>
      </div>

      {/* 5. Fullscreen Mandap TV Modal */}
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
