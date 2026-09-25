import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Memory } from '../../types';
import { formatDate, getImageUrl, formatImpressions } from '../../utils/helpers';
import { trackMemoryView } from '../../services/memoryService';
import { ShareButton } from './ShareButton';
import { Calendar, User as UserIcon, Eye } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const [impressionsCount, setImpressionsCount] = useState<number>(memory.impressions || 0);

  useEffect(() => {
    setImpressionsCount(memory.impressions || 0);
  }, [memory.impressions]);

  useEffect(() => {
    const currentCard = cardRef.current;
    if (!currentCard) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackMemoryView(memory._id, (newCount) => {
              setImpressionsCount(newCount);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(currentCard);

    return () => {
      observer.disconnect();
    };
  }, [memory._id]);

  return (
    <article
      ref={cardRef as any}
      className="group bg-cream-50 rounded-2xl overflow-hidden border border-cream-300/80 shadow-soft hover:shadow-medium hover:border-gold-400/50 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <Link to={`/memories/${memory._id}`} className="block w-full h-full">
          <img
            src={getImageUrl(memory.thumbnailUrl || memory.imageUrl)}
            alt={memory.caption}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
        {/* Year Tag Badge */}
        <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-md text-gold-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-gold-500/30 shadow-sm">
          Year {memory.year}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Devotee Info */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-cream-300 border border-cream-400 flex items-center justify-center text-maroon-800 text-xs font-bold overflow-hidden shrink-0">
              {memory.userId?.avatar ? (
                <img
                  src={getImageUrl(memory.userId.avatar)}
                  alt={memory.userId.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-maroon-700" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs sm:text-sm font-body font-semibold text-dark-900 truncate">
                  {memory.userId?.name || 'Devotee'}
                </p>
                {/* Impressions Counter (No Likes, No Comments) */}
                <span className="inline-flex items-center gap-1 text-[11px] font-body text-maroon-800 bg-maroon-900/5 px-2 py-0.5 rounded-full border border-maroon-800/15 font-medium shrink-0">
                  <Eye className="w-3 h-3 text-maroon-700" />
                  <span>{formatImpressions(impressionsCount)} views</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-muted font-body mt-0.5">
                <Calendar className="w-3 h-3 text-gold-600 shrink-0" />
                <span>{formatDate(memory.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Caption */}
          <Link to={`/memories/${memory._id}`}>
            <p className="text-sm sm:text-base font-body text-dark-800 line-clamp-3 leading-relaxed hover:text-maroon-800 transition-colors">
              {memory.caption}
            </p>
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-3 border-t border-cream-200 flex items-center justify-between">
          <Link
            to={`/memories/${memory._id}`}
            className="text-xs font-body font-semibold text-maroon-700 hover:text-maroon-900 hover:underline"
          >
            View Memory →
          </Link>

          <ShareButton
            memoryId={memory._id}
            caption={memory.caption}
            year={memory.year}
            variant="icon"
          />
        </div>
      </div>
    </article>
  );
};
