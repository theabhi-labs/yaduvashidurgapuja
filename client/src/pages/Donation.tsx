import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { SectionHeading } from '../components/common/SectionHeading';
import {
  Sparkles,
  ShieldCheck,
  Check,
  QrCode,
  Flame,
  ArrowRight,
  HandHeart,
  Gift,
} from 'lucide-react';

const PRESET_AMOUNTS = [51, 101, 251, 501, 1100, 2100, 5100];

const SEVA_CATEGORIES = [
  { id: 'general', name: 'सामान्य पूजा सेवा (General Seva)', desc: 'दैनिक पूजन, सामग्री व अखंड दीप' },
  { id: 'prasad', name: 'महाप्रसाद एवं भंडारा सेवा (Bhandara Seva)', desc: 'भक्तों हेतु पावन प्रसाद वितरण' },
  { id: 'aarti', name: 'महाआरती एवं पुष्प सेवा (Maha Aarti & Flowers)', desc: 'दैनिक संध्या व महाआरती व्यवस्था' },
  { id: 'pandal', name: 'पंडाल व विद्युत सज्जा (Pandal & Lighting)', desc: 'प्रांगण, सजावट व सुरक्षा व्यवस्था' },
];

export const Donation: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [sevaCategory, setSevaCategory] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDirectUpi, setShowDirectUpi] = useState<boolean>(false);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  // Load recent successful donations for community inspiration
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await donationService.getDonations({ limit: 6, status: 'paid' });
        if (res.success && res.data?.donations) {
          setRecentDonations(res.data.donations);
        }
      } catch {
        // quiet fallback
      }
    };
    fetchRecent();
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
        donorName: isAnonymous ? 'गुमनाम भक्त' : (donorName.trim() || 'श्रद्धालु भक्त'),
        isAnonymous,
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
            toast.success('माँ दुर्गा की कृपा से आपका दान सफलतापूर्वक प्राप्त हुआ! जय माता दी 🙏');
            setMessage('');
            setCustomAmount('');
          } catch (err: any) {
            toast.error(err.message || 'भुगतान सत्यापन असफल रहा');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
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
    <div className="min-h-screen py-8 sm:py-14 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* 1. Header & Shloka */}
      <div className="text-center mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-900 text-xs sm:text-sm font-semibold mb-3 font-body shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>॥ श्री यदुवंशी दुर्गा पूजा सेवा समर्पण ॥</span>
        </motion.div>

        <SectionHeading
          title="माँ भगवती के पावन उत्सव में अपना योगदान दें"
          subtitle="कपूरिपुर दुर्गा पूजा के पावन अनुष्ठानों, महाआरती, प्रसाद वितरण एवं भव्य पंडाल व्यवस्था में अपनी सामर्थ्यानुसार श्रद्धा सुमन अर्पित करें।"
        />

        <div className="mt-2 text-xs sm:text-sm font-body text-maroon-800/90 italic bg-amber-50/70 border border-amber-200/80 rounded-2xl py-2 px-4 max-w-lg mx-auto">
          "दानेन प्राप्यते सर्वं दानेन सुखमेधते । दानेन परमो धर्मो दानं हि परमो निधिः ॥"
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Razorpay Donation Form                                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-cream-100 rounded-3xl border border-cream-300 shadow-soft p-5 sm:p-8">
          <form onSubmit={handleDonate} className="space-y-6">
            {/* 1. Amount Preset Grid */}
            <div>
              <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-2 font-body">
                दान राशि चुनें (INR ₹)
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

            {/* 5. Secure Razorpay Submit Button */}
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
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Transparency, Direct UPI QR & Recent Blessings              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Seva Transparency & Trust Card */}
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
                <span>समस्त दान राशि सीधे पूजा, महाआरती एवं प्रसाद व्यवस्था में उपयोग होती है।</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>डिजिटल पावती एवं रसीद रिकॉर्ड सुरक्षित रूप से संकलित रहता है।</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>प्रत्येक दानदाता का नाम (यदि गुप्त न हो) आशीर्वाद सूची में सम्मिलित होता है।</span>
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
                  <p className="text-[11px] text-muted/80 pt-1 border-t border-cream-200">
                    * ऑनलाइन गेटवे से दान करने पर पावती स्वतः तुरंत जेनरेट होती है।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Devotees / Blessings Wall */}
          {recentDonations.length > 0 && (
            <div className="bg-cream-100 rounded-3xl border border-cream-300 p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <h4 className="font-heading font-bold text-dark-950 text-xs sm:text-sm">
                    हाल के पावन समर्पण
                  </h4>
                </div>
                <span className="text-[10px] text-muted font-body">माँ की कृपा</span>
              </div>

              <div className="divide-y divide-cream-200/80 space-y-2">
                {recentDonations.map((d: any) => (
                  <div key={d._id} className="pt-2 flex items-center justify-between text-xs font-body">
                    <div>
                      <p className="font-bold text-dark-900">
                        {d.isAnonymous ? 'गुमनाम भक्त' : d.donorName}
                      </p>
                      {d.message && (
                        <p className="text-[11px] text-muted truncate max-w-[180px] sm:max-w-[220px]">
                          "{d.message}"
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-maroon-800 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                        ₹{d.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
