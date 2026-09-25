import React from 'react';
import { Link } from 'react-router-dom';
import { Memory } from '../../types';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { ShareButton } from './ShareButton';
import { Calendar, User as UserIcon } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  return (
    <article className="group bg-cream-50 rounded-2xl overflow-hidden border border-cream-300/80 shadow-soft hover:shadow-medium hover:border-gold-400/50 transition-all duration-300 flex flex-col justify-between">
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
          वर्ष {memory.year}
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
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-devanagari-body font-semibold text-dark-900 truncate">
                {memory.userId?.name || 'श्रद्धालु भक्त'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-muted font-devanagari-body">
                <Calendar className="w-3 h-3 text-gold-600 shrink-0" />
                <span>{formatDate(memory.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Caption */}
          <Link to={`/memories/${memory._id}`}>
            <p className="text-sm sm:text-base font-devanagari-body text-dark-800 line-clamp-3 leading-relaxed hover:text-maroon-800 transition-colors">
              {memory.caption}
            </p>
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-3 border-t border-cream-200 flex items-center justify-between">
          <Link
            to={`/memories/${memory._id}`}
            className="text-xs font-devanagari-body font-semibold text-maroon-700 hover:text-maroon-900 hover:underline"
          >
            स्मृति देखें →
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
