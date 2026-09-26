import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface DonateButtonProps {
  liveSessionRoomName?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const DonateButton: React.FC<DonateButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  label = 'सहयोग करें / Donate',
}) => {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    toast.info('वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।');
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant={variant as any}
        size={size}
        onClick={handleClick}
        leftIcon={<Heart className="w-4 h-4" />}
        className={className}
      >
        {label}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-maroon-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>प्रशासकीय सूचना (Official Notice)</span>
              </div>
              <p className="font-semibold text-xs text-maroon-900">
                वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।
              </p>
              <p className="text-dark-700 text-[11px]">
                माँ दुर्गा की पावन सेवा एवं आयोजन में आपके सहयोग की सद्भावना के लिए हार्दिक धन्यवाद। जय माता दी 🙏
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-maroon-800 via-maroon-900 to-maroon-950 text-gold-200 border border-gold-400/60 shadow-lg font-bold"
            >
              <span>समझ गए / बंद करें (Close)</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default DonateButton;
