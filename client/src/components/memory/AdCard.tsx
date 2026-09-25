import React, { useEffect, useRef } from 'react';
import { Ad } from '../../types';
import { getImageUrl } from '../../utils/helpers';
import { adService } from '../../services/adService';
import { ExternalLink, Sparkles, Building2 } from 'lucide-react';

interface AdCardProps {
  ad: Ad;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionTrackedRef = useRef<boolean>(false);

  // Track impression once when card enters viewport
  useEffect(() => {
    if (!cardRef.current || impressionTrackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTrackedRef.current) {
            impressionTrackedRef.current = true;
            adService.trackImpression(ad._id);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [ad._id]);

  const handleClick = () => {
    adService.trackClick(ad._id);
  };

  const sponsorInitial = (ad.sponsorName || 'S').charAt(0).toUpperCase();

  return (
    <article
      ref={cardRef}
      className="bg-cream-100 rounded-3xl border border-cream-300/80 shadow-soft overflow-hidden mb-6 max-w-lg mx-auto transition-all hover:border-cream-400"
    >
      {/* 1. Header: Sponsor Avatar, Name, Location & Sponsored Badge */}
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-rose-500">
            <div className="w-10 h-10 rounded-full bg-gold-700 text-cream-50 flex items-center justify-center font-bold text-sm border-2 border-cream-100 shadow-inner">
              {sponsorInitial}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-bold text-dark-900 text-sm leading-tight">
                {ad.sponsorName}
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted font-body mt-0.5">
              <Building2 className="w-3 h-3 text-gold-700 shrink-0" />
              <span>Community Partner</span>
            </div>
          </div>
        </div>

        {/* Subtle Transparent "Sponsored" Tag */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-900 border border-gold-400/40 text-[11px] font-semibold font-body shadow-xs">
          <span>Sponsored</span>
        </div>
      </div>

      {/* 2. Media Image (Edge-to-Edge matching Memory Cards) */}
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block relative aspect-square sm:aspect-[4/5] bg-cream-200 select-none overflow-hidden group cursor-pointer"
      >
        <img
          src={getImageUrl(ad.imageUrl)}
          alt={ad.title || 'Sponsored promotion'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />

        {/* Subtle hover overlay hint */}
        <div className="absolute inset-0 bg-dark-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-50/95 text-maroon-900 text-xs font-semibold font-body shadow-md">
            <span>Learn More</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </a>

      {/* 3. Action Bar & Details */}
      <div className="p-3.5 sm:p-4 pb-3">
        <div className="flex items-center justify-between">
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-body font-semibold shadow-sm transition-all active:scale-95"
          >
            <span>Visit Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <span className="text-[11px] font-body text-muted">
            Direct Link
          </span>
        </div>

        {/* 4. Title & Description */}
        <div className="mt-2.5 font-body text-sm text-dark-900 leading-relaxed">
          <span className="font-bold text-maroon-900 mr-1.5">{ad.sponsorName}:</span>
          <span>{ad.title}</span>
        </div>

        {/* 5. Footer Note */}
        <div className="mt-2 text-[11px] font-body text-muted/80">
          Official community sponsor • Yaduvanshi Durga Puja Kapooripur
        </div>
      </div>
    </article>
  );
};
