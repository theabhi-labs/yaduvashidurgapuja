import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface PWAInstallButtonProps {
  variant?: 'icon' | 'badge' | 'button';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'icon',
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in PWA standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isStandalone || isInstalled) {
      alert('KapooripurPuja ऐप आपके डिवाइस में पहले से इंस्टॉल है! 🌸');
      return;
    }

    // Android / Chrome / Edge native install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // Check if iOS Safari
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // Generic guide
    setShowIosGuide(true);
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {variant === 'icon' && (
        <button
          onClick={handleInstallClick}
          className={`relative p-2 sm:p-2.5 rounded-xl text-maroon-900 bg-gradient-to-r from-amber-400/20 via-gold-400/25 to-amber-500/20 hover:from-amber-400/35 hover:to-gold-400/35 border border-amber-400/70 transition-all active:scale-95 shadow-xs flex items-center justify-center group ${className}`}
          title="KapooripurPuja ऐप डाउनलोड / इंस्टॉल करें"
          aria-label="KapooripurPuja ऐप इंस्टॉल करें"
        >
          <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-maroon-900 group-hover:scale-110 transition-transform stroke-[2.5]" />
          <span className="sr-only">Install KapooripurPuja App</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
        </button>
      )}

      {variant === 'badge' && (
        <button
          onClick={handleInstallClick}
          className={`relative p-2 sm:p-2.5 rounded-xl text-maroon-900 bg-gradient-to-r from-amber-400/20 via-gold-400/25 to-amber-500/20 hover:from-amber-400/35 hover:to-gold-400/35 border border-amber-400/70 transition-all active:scale-95 shadow-xs flex items-center justify-center group ${className}`}
          title="KapooripurPuja ऐप डाउनलोड / इंस्टॉल करें"
          aria-label="KapooripurPuja ऐप इंस्टॉल करें"
        >
          <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-maroon-900 group-hover:scale-110 transition-transform stroke-[2.5]" />
          <span className="sr-only">Install KapooripurPuja App</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
        </button>
      )}

      {variant === 'button' && (
        <Button
          onClick={handleInstallClick}
          size="sm"
          variant="gold"
          leftIcon={<Download className="w-4 h-4" />}
          className={className}
        >
          Install KapooripurPuja
        </Button>
      )}


      {/* iOS & Manual Installation Instruction Modal */}
      <Modal
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
        title="KapooripurPuja ऐप इंस्टॉल करें"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-maroon-800 p-2 mx-auto border-2 border-gold-400 shadow-md flex items-center justify-center">
            <img
              src="/favicon.svg"
              alt="KapooripurPuja"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h4 className="font-heading font-bold text-base text-dark-950">
              KapooripurPuja
            </h4>
            <p className="text-xs text-muted font-body mt-0.5">
              यदुवंशी दुर्गा पूजा समिति कपूरिपुर
            </p>
          </div>

          <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 text-left space-y-3 font-body text-xs text-dark-800">
            <p className="font-bold text-maroon-900 flex items-center gap-1.5 text-sm">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>अपने मोबाइल में शॉर्टकट / ऐप जोड़ें:</span>
            </p>

            <ol className="list-decimal pl-4 space-y-2 text-xs leading-relaxed text-dark-900">
              <li>
                ब्राउज़र के नीचे या ऊपर <strong className="text-maroon-900">Share (शेयर)</strong> या <strong className="text-maroon-900">थ्री डॉट्स (⋮)</strong> आइकन पर टैप करें।
              </li>
              <li>
                मेन्यू में <strong className="text-maroon-900">'Add to Home Screen' (होम स्क्रीन में जोड़ें)</strong> या <strong className="text-maroon-900">'Install App'</strong> चुनें।
              </li>
              <li>
                नाम <strong className="text-maroon-900">KapooripurPuja</strong> पुष्टि करके <strong>Add / Install</strong> पर क्लिक करें।
              </li>
            </ol>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIosGuide(false)}
              className="w-full"
            >
              समझ गया (Got it)
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
