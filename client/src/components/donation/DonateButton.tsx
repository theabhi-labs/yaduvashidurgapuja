import React, { useState } from 'react';
import { Heart, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface DonateButtonProps {
  liveSessionRoomName?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const PRESET_AMOUNTS = [51, 101, 501, 1001, 2100, 5100];

export const DonateButton: React.FC<DonateButtonProps> = ({
  liveSessionRoomName,
  variant = 'primary',
  size = 'md',
  className = '',
  label = 'माँ दुर्गा सेवा दान करें',
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      toast.error('कृपया मान्य दान राशि दर्ज करें (कम से कम ₹1)');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create order on backend
      const res = await donationService.createOrder({
        amount: finalAmount,
        donorName: isAnonymous ? 'गुमनाम भक्त' : (donorName.trim() || 'श्रद्धालु'),
        isAnonymous,
        liveSessionRoomName,
        message: message.trim() || undefined,
      });

      const orderData = res.data;

      // 2. Check if Razorpay SDK loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        toast.error('भुगतान गेटवे लोड नहीं हो सका। कृपया पृष्ठ को रीफ्रेश करें।');
        setIsSubmitting(false);
        return;
      }

      // 3. Open Razorpay Checkout Popup
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency || 'INR',
        name: 'यदुवंशी दुर्गा पूजा कपूरिपुर',
        description: 'माँ भगवती दुर्गा पूजा सेवा दान',
        order_id: orderData.orderId,
        prefill: {
          name: isAnonymous ? 'Anonymous' : (donorName || user?.name || ''),
          email: user?.email || '',
        },
        notes: {
          roomName: liveSessionRoomName || 'global',
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
            setIsOpen(false);
            setMessage('');
          } catch (err: any) {
            toast.error(err.message || 'भुगतान सत्यापन में समस्या आई');
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
        toast.error(failRes.error?.description || 'भुगतान असफल रहा');
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'दान प्रक्रिया शुरू करने में त्रुटि हुई');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 font-semibold shadow-md bg-gradient-to-r from-maroon-700 to-maroon-900 hover:from-maroon-800 hover:to-maroon-950 text-gold-200 border border-gold-500/40 ${className}`}
      >
        <Heart className="w-4 h-4 text-gold-400 fill-gold-400/20" />
        <span>{label}</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title="माँ दुर्गा सेवा में दान अर्पण"
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-maroon-900/10 via-gold-500/5 to-cream-100 p-4 rounded-xl border border-gold-500/20 text-center">
            <Sparkles className="w-6 h-6 text-gold-600 mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-devanagari-body text-maroon-950">
              यदुवंशी दुर्गा पूजा कपूरिपुर के पावन आयोजन हेतु आपका सहयोग अत्यंत वंदनीय है।
            </p>
          </div>

          <form onSubmit={handleDonate} className="space-y-4">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold text-dark-800 uppercase tracking-wider mb-2 font-devanagari-body">
                दान राशि चुनें (₹ INR)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = !customAmount && amount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-maroon-800 text-gold-300 border-gold-500 shadow-sm'
                          : 'bg-cream-50 text-dark-800 border-cream-300 hover:border-gold-500/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
                      ₹{amt}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold">₹</span>
                <input
                  type="number"
                  placeholder="अन्य राशि दर्ज करें..."
                  value={customAmount}
                  onChange={handleCustomChange}
                  min="1"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Donor Name */}
            <div>
              <label className="block text-xs font-semibold text-dark-800 uppercase tracking-wider mb-1.5 font-devanagari-body">
                श्रद्धालु का नाम
              </label>
              <input
                type="text"
                disabled={isAnonymous}
                placeholder={isAnonymous ? 'गुमनाम भक्त' : 'आपका शुभ नाम...'}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-lg border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm ${
                  isAnonymous ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous-check"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-maroon-800 border-cream-400 focus:ring-maroon-700 cursor-pointer"
              />
              <label
                htmlFor="anonymous-check"
                className="text-xs text-muted font-medium cursor-pointer select-none font-devanagari-body"
              >
                नाम गुप्त रखें (गुमनाम भक्त के रूप में दान करें)
              </label>
            </div>

            {/* Optional message / devotion */}
            <div>
              <label className="block text-xs font-semibold text-dark-800 uppercase tracking-wider mb-1.5 font-devanagari-body">
                शुभकामना / संदेश (वैकल्पिक)
              </label>
              <input
                type="text"
                placeholder="जय माता दी! माँ सभी का कल्याण करें..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2 rounded-lg border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm"
              />
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-muted pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Razorpay द्वारा 256-बिट सुरक्षित भुगतान (UPI, Card, NetBanking)</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full py-3 text-base font-bold bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-200 hover:from-maroon-900 hover:to-dark-950 border border-gold-500/30 shadow-lg"
              >
                ₹{customAmount || amount} दान हेतु आगे बढ़ें
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
