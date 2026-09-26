import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { heroBannerService } from '../../services/heroBannerService';
import { getImageUrl } from '../../utils/helpers';

interface SlideItem {
  _id?: string;
  imageUrl: string;
  badge?: string;
  title: string;
  subtext?: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    imageUrl: '/hero-durga.jpg',
    badge: 'कपूरिपुर पावन धाम',
    title: 'माँ दुर्गा की असीम कृपा और भक्तों की अनमोल आस्था को समर्पित एक पावन डिजिटल धरोहर।',
    subtext: 'माँ भगवती की अखंड ज्योति एवं दिव्य दर्शन',
  },
];

export const HeroSlider: React.FC = () => {
  const [banners, setBanners] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active hero banners from backend
  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const res = await heroBannerService.getActiveBanners();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data);
        }
      } catch (err) {
        // Quiet fallback to DEFAULT_SLIDES
      }
    };
    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = banners.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, nextSlide]);

  const currentBanner = banners[currentIndex] || DEFAULT_SLIDES[0];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.8, ease: 'easeOut' },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl p-2 bg-gradient-to-b from-amber-500/30 via-maroon-900/50 to-maroon-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-dark-950 select-none">
        {/* Animated Slide Imagery */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentBanner._id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={getImageUrl(currentBanner.imageUrl)}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.currentTarget as HTMLImageElement).src = '/hero-durga.jpg';
              }}
            />

            {/* Sacred Gradient Darkening for Devotional Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/40 to-transparent flex items-end p-6 sm:p-8 md:p-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-left max-w-2xl"
              >
                {currentBanner.badge && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-amber-500 text-dark-950 font-body uppercase tracking-wider mb-2.5 shadow-md shadow-amber-500/20 border border-amber-300/40">
                    <span>🪔</span>
                    {currentBanner.badge}
                  </span>
                )}

                <h3 className="text-base sm:text-xl md:text-2xl font-heading font-bold text-cream-50 leading-snug drop-shadow-lg">
                  {currentBanner.title}
                </h3>

                {currentBanner.subtext && (
                  <p className="mt-1 text-xs sm:text-sm font-body text-cream-200/90 drop-shadow line-clamp-2">
                    {currentBanner.subtext}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous / Next Arrow Controls (Visible on hover on desktop, always accessible on touch) */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-dark-950/60 hover:bg-maroon-800/90 text-cream-100 hover:text-amber-300 backdrop-blur-md border border-amber-500/30 flex items-center justify-center transition-all duration-200 opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg z-20"
              aria-label="Previous Poster"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-dark-950/60 hover:bg-maroon-800/90 text-cream-100 hover:text-amber-300 backdrop-blur-md border border-amber-500/30 flex items-center justify-center transition-all duration-200 opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg z-20"
              aria-label="Next Poster"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Bottom Bar: Indicators & Pause/Play */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2 bg-dark-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 shadow-md">
            {/* Play / Pause Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="text-cream-200 hover:text-amber-400 transition-colors p-0.5"
              aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 ml-1">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-gradient-to-r from-amber-400 to-gold-300 shadow-sm shadow-amber-400/50'
                      : 'w-2 bg-cream-100/30 hover:bg-cream-100/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
