import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface LiveSuperChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
  streamTitle?: string;
}

export const LiveSuperChatModal: React.FC<LiveSuperChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-body">
      <div className="relative w-full max-w-md bg-gradient-to-b from-cream-50 to-cream-100 rounded-3xl border-2 border-gold-500 shadow-2xl overflow-hidden text-center">
        {/* Header with Golden Theme */}
        <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-gold-200 p-5 text-center relative border-b border-gold-500/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/40 text-gold-300 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
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
            ॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-500/15 border-2 border-amber-500/50 p-4 rounded-2xl text-amber-950 space-y-2 text-center shadow-xs">
            <div className="font-bold text-sm text-maroon-950 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>प्रशासकीय सूचना (Official Notice)</span>
            </div>
            <p className="text-xs text-maroon-900 font-medium leading-relaxed">
              वर्तमान में ऑनलाइन दान / सहयोग / दक्षिणा सेवा प्रशासक (Administrator) द्वारा अस्थायी रूप से स्थगित (Temporarily off by Administrator) है।
            </p>
            <p className="text-[11px] text-maroon-800/80">
              माँ दुर्गा के पावन लाइव दर्शन का आनंद लें और जयकारा लगाएं!
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-maroon-800 via-maroon-900 to-maroon-950 text-gold-200 border border-gold-400/60 shadow-lg font-bold"
            >
              <span>समझ गए / बंद करें (Close)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LiveSuperChatModal;
