import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'dark' | 'light';
  isLink?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  variant = 'dark',
  isLink = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      emblem: 'w-8 h-8 rounded-lg',
      title: 'text-sm sm:text-base font-bold',
      subtitle: 'text-[9px] sm:text-[10px]',
    },
    md: {
      emblem: 'w-10 h-10 rounded-xl',
      title: 'text-base sm:text-lg font-bold',
      subtitle: 'text-[10px] sm:text-xs',
    },
    lg: {
      emblem: 'w-14 h-14 rounded-2xl',
      title: 'text-xl sm:text-2xl font-bold',
      subtitle: 'text-xs sm:text-sm',
    },
  };

  const currentSize = sizeClasses[size];
  const isLight = variant === 'light';

  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Sacred Emblem Logo with Favicon */}
      <div
        className={`${currentSize.emblem} bg-maroon-800 p-1 flex items-center justify-center shadow-md border border-amber-400/40 group-hover:border-amber-400 group-hover:scale-105 group-hover:shadow-gold-glow transition-all duration-300 relative overflow-hidden shrink-0`}
      >
        <img
          src="/favicon.svg"
          alt="यदुवंशी दुर्गा पूजा"
          className="w-full h-full object-contain filter drop-shadow"
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-serif tracking-tight leading-tight transition-colors ${currentSize.title} ${
              isLight
                ? 'text-cream-50 group-hover:text-amber-300'
                : 'text-maroon-950 group-hover:text-maroon-800'
            }`}
          >
            Yaduvanshi Durga Puja
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-sans font-semibold tracking-wider transition-colors ${currentSize.subtitle} ${
              isLight ? 'text-amber-400/90' : 'text-amber-800'
            }`}
          >
            Samiti, Kapooripur
          </span>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link to="/" aria-label="Yaduvanshi Durga Puja Kapooripur Home">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
