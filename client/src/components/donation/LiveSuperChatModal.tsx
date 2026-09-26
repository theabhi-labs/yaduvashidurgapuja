import React, { useState } from 'react';
import { X } from 'lucide-react';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';

interface LiveSuperChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  streamTitle?: string;
}

const PRESET_AMOUNTS = [
  { amount: 51, label: 'दीपक सेवा 🪔', tier: 'bronze' },
  { amount: 101, label: 'आरती भोग 🌸', tier: 'silver' },
  { amount: 251, label: 'विशेष पूजा 🚩', tier: 'gold' },
  { amount: 501, label: 'पुष्पांजलि ✨', tier: 'gold' },
  { amount: 1100, label: 'महाप्रसाद सेवा 🕉️', tier: 'ruby' },
  { amount: 2100, label: 'यज्ञ संकल्प 👑', tier: 'ruby' },
];

export const LiveSuperChatModal: React.FC<LiveSuperChatModalProps> = ({
  isOpen,
  onClose,
  roomName,
  streamTitle,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [amount, setAmount] = useState<number>(101);
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [message, setMessage] = useState<string>('जय माता दी! माँ के चरणों में पावन समर्पण 🙏');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 1) {
      toast.error('कृपया न्यूनतम ₹1 का दान दर्ज करें');
      return;
    }

    setIsLoading(true);
    try {
      const effectiveName = isAnonymous ? 'गुप्त भक्त' : (donorName.trim() || user?.name || 'श्रद्धालु');

      const orderData = await donationService.createOrder({
        amount,
        donorName: effectiveName,
        isAnonymous,
        message: message.trim() || undefined,
        liveSessionRoomName: roomName,
        type: 'dakshina',
      });


      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'यदुवंशी दुर्गा पूजा कपूरीपुर',
        description: `पावन दक्षिणा — ${streamTitle || 'माँ दुर्गा महाआरती'}`,
        image: '/favicon.svg',
        order_id: orderData.data.orderId,
        handler: async (response: any) => {
          try {
            await donationService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success('माँ के चरणों में आपकी पावन दक्षिणा सफलतापूर्वक समर्पित हुई! 🌸');
            onClose();
          } catch (err: any) {
            toast.error(err.message || 'भुगतान सत्यापन में समस्या आई');
          }
        },
        prefill: {
          name: effectiveName,
          email: user?.email || '',
        },
        theme: {
          color: '#700c0c',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.info('दक्षिणा भुगतान प्रक्रिया रद्द कर दी गई');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error(`भुगतान विफल: ${response.error?.description || 'त्रुटि'}`);
        setIsLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'ऑर्डर बनाने में समस्या आई');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-cream-50 to-cream-100 rounded-3xl border-2 border-gold-500 shadow-2xl overflow-hidden">
        {/* Header with Golden Theme */}
        <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-gold-200 p-5 text-center relative border-b border-gold-500/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/40 text-gold-300 hover:text-white hover:bg-black/60 transition-colors"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-400 flex items-center justify-center mx-auto mb-2 text-gold-300 text-2xl shadow-lg">
            🪔
          </div>

          <h3 className="font-heading font-black text-lg text-cream-50 tracking-wide">
            पावन दक्षिणा • सेवा समर्पण
          </h3>
          <p className="text-xs text-gold-300/90 font-body mt-0.5">
            आपकी दक्षिणा और संदेश लाइव स्ट्रीम में सुनहरे रंग में हाइलाइट होगा 🌟
          </p>
        </div>

        <form onSubmit={handleDonate} className="p-5 space-y-4">
          {/* Preset Amount Chips */}
          <div>
            <label className="block text-xs font-bold text-dark-900 font-body mb-2 uppercase">
              दक्षिणा राशि चुनें (Select Dakshina) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((p) => {
                const isSelected = amount === p.amount;
                return (
                  <button
                    key={p.amount}
                    type="button"
                    onClick={() => setAmount(p.amount)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-200 border-gold-400 shadow-md ring-2 ring-gold-400/60 font-bold scale-[1.02]'
                        : 'bg-cream-50 hover:bg-cream-200/80 text-dark-900 border-cream-300 font-semibold'
                    }`}
                  >
                    <span className="text-sm font-black block">₹{p.amount}</span>
                    <span className="text-[10px] text-muted block truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-bold text-dark-900 font-body mb-1">
              अन्य दक्षिणा राशि (Custom ₹ Amount)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-maroon-900 text-sm">
                ₹
              </span>
              <input
                type="number"
                min={1}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 font-black text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700"
              />
            </div>
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-dark-900 font-body mb-1">
              भक्त का नाम (Devotee Name)
            </label>
            <input
              type="text"
              disabled={isAnonymous}
              value={isAnonymous ? 'गुप्त भक्त (Anonymous)' : donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="आपका नाम..."
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-body font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-700 disabled:opacity-60"
            />
          </div>

          {/* Devotional Message */}
          <div>
            <label className="block text-xs font-bold text-dark-900 font-body mb-1">
              प्रार्थना / शुभ संदेश (Devotional Note)
            </label>
            <input
              type="text"
              maxLength={150}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="माँ दुर्गा के लिए प्रार्थना या जयकारा..."
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-700"
            />
          </div>

          {/* Anonymous checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="scAnonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-maroon-800 rounded"
            />
            <label htmlFor="scAnonymous" className="text-xs text-dark-800 cursor-pointer font-body">
              नाम गुप्त रखें (Make donation anonymous)
            </label>
          </div>

          {/* Action Buttons: Cancel and Submit */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-cream-400 text-dark-800 hover:bg-cream-200"
            >
              वापस जाएँ (Cancel)
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="flex-[2] bg-gradient-to-r from-maroon-800 via-maroon-900 to-maroon-950 text-gold-200 border border-gold-400/60 shadow-xl font-bold flex items-center justify-center gap-1.5"
            >
              <span>🪔 ₹{amount || 0} दक्षिणा अर्पित करें</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
