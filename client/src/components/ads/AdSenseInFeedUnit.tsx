import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Globe } from 'lucide-react';

interface AdSenseInFeedUnitProps {
  clientId?: string;
  slotId?: string;
  layoutKey?: string;
  className?: string;
}

export const AdSenseInFeedUnit: React.FC<AdSenseInFeedUnitProps> = ({
  clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-3665660136451799',
  slotId = import.meta.env.VITE_ADSENSE_INFEED_SLOT_ID || '2751192891',
  layoutKey = import.meta.env.VITE_ADSENSE_LAYOUT_KEY || '-6t+ed+2i-1n-4w',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const hasPushedRef = useRef<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFilled, setIsFilled] = useState<boolean>(false);
  const [isUnfilledOrError, setIsUnfilledOrError] = useState<boolean>(false);

  // Check if real AdSense credentials are configured
  const isPlaceholder =
    !clientId ||
    clientId.includes('XXXX') ||
    !slotId ||
    slotId.includes('XXXX');

  // IntersectionObserver for lazy loading (Performance: only push when close to viewport)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px' }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Watch Google AdSense status changes (filled vs unfilled/error)
  useEffect(() => {
    const insEl = insRef.current;
    if (!insEl) return;

    const checkStatus = () => {
      const status = insEl.getAttribute('data-ad-status');
      if (status === 'filled') {
        setIsFilled(true);
        setIsUnfilledOrError(false);
      } else if (status === 'unfilled') {
        setIsFilled(false);
        setIsUnfilledOrError(true);
      }
    };

    checkStatus();

    const observer = new MutationObserver(() => {
      checkStatus();
    });

    observer.observe(insEl, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'style'],
    });

    // Fallback timer: if within 4 seconds Google doesn't fill the ad (e.g. adblock or domain under review), collapse cleanly
    const timer = setTimeout(() => {
      const status = insEl.getAttribute('data-ad-status');
      if (status !== 'filled') {
        setIsUnfilledOrError(true);
      }
    }, 4000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [isVisible]);

  // Trigger Google AdSense push when visible and not yet pushed
  useEffect(() => {
    if (!isVisible || hasPushedRef.current) return;

    if (!isPlaceholder) {
      try {
        hasPushedRef.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.warn('[AdSense] Failed to push ad unit:', err);
        setIsUnfilledOrError(true);
      }
    }
  }, [isVisible, isPlaceholder]);

  // If ad failed, is unfilled (e.g. site not approved or adblocker), collapse completely
  if (isUnfilledOrError && !isPlaceholder) {
    return null;
  }

  // In production, if placeholders are used, hide
  if (import.meta.env.PROD && isPlaceholder) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ${
        !isFilled && !isPlaceholder ? 'h-0 overflow-hidden opacity-0 pointer-events-none my-0 py-0 border-0' : 'mb-6'
      }`}
    >
      <div
        className={`bg-cream-100 rounded-3xl border border-cream-300/80 shadow-soft overflow-hidden max-w-lg mx-auto transition-all hover:border-cream-400 ${className}`}
      >
        {/* 1. Header: Ad Badge & Sponsor Label */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 pb-2 border-b border-cream-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gold-500/15 border border-gold-400/40 text-gold-900 flex items-center justify-center text-xs font-bold shadow-xs">
              <Globe className="w-3.5 h-3.5 text-gold-700" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-dark-900 text-xs sm:text-sm leading-tight">
                  Community Sponsor
                </span>
                <Sparkles className="w-3 h-3 text-amber-600" />
              </div>
              <span className="text-[10px] text-muted font-body">Google AdSense Partner</span>
            </div>
          </div>

          {/* Sponsored Transparency Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-900 border border-gold-400/40 text-[10px] sm:text-[11px] font-semibold font-body shadow-xs">
            <span>Sponsored</span>
          </div>
        </div>

        {/* 2. In-Feed Ad Unit Slot or Dev Preview */}
        <div className="p-3 sm:p-4 min-h-[100px] flex items-center justify-center">
          {isPlaceholder ? (
            /* Dev placeholder card when waiting for AdSense Publisher approval */
            <div className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-amber-300/80 bg-amber-50/40 text-center flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2 shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <p className="font-heading font-bold text-dark-900 text-xs sm:text-sm mb-1">
                Google AdSense In-Feed Ad Unit
              </p>
              <p className="font-body text-[11px] text-muted max-w-xs leading-relaxed">
                Native ad will render here once <span className="font-mono text-amber-900 font-semibold">VITE_ADSENSE_CLIENT_ID</span> is configured.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-mono text-dark-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                <span>Slot: {slotId}</span>
              </div>
            </div>
          ) : (
            /* Live Google AdSense in-feed unit */
            <ins
              ref={insRef}
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minWidth: '250px' }}
              data-ad-format="fluid"
              data-ad-layout-key={layoutKey}
              data-ad-client={clientId}
              data-ad-slot={slotId}
            />
          )}
        </div>

        {/* 3. Footer Disclosure */}
        <div className="px-4 py-2 bg-cream-50/80 border-t border-cream-200/50 flex items-center justify-between text-[10px] font-body text-muted">
          <span>Yaduvanshi Durga Puja Community Archive</span>
          <span className="text-[9px] uppercase tracking-wider text-muted/80">Ads by Google</span>
        </div>
      </div>
    </div>
  );
};
