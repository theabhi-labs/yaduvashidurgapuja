import React, { useState, useEffect } from 'react';
import { Memory } from '../../types';
import { formatDate, getImageUrl, generateShareText, formatImpressions } from '../../utils/helpers';
import { ShareButton } from './ShareButton';
import { ReportModal } from './ReportModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Bookmark, 
  BookmarkCheck, 
  MoreHorizontal, 
  MapPin, 
  Flag, 
  Share2, 
  Copy, 
  Sparkles,
  Calendar,
  Eye,
} from 'lucide-react';

interface InstagramMemoryCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
  onOpenDetail?: (memory: Memory) => void;
}

export const InstagramMemoryCard: React.FC<InstagramMemoryCardProps> = ({
  memory,
  onDelete,
  onOpenDetail,
}) => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);
  const [showBloom, setShowBloom] = useState<boolean>(false);

  const uploaderName = memory.userId?.name || 'Devotee';
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();
  const isOwner = user && memory.userId && user._id === memory.userId._id;

  // Check if bookmarked in localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_memories') || '[]');
      setIsBookmarked(saved.includes(memory._id));
    } catch {
      setIsBookmarked(false);
    }
  }, [memory._id]);

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('saved_memories') || '[]');
      let updated: string[];
      if (saved.includes(memory._id)) {
        updated = saved.filter((id) => id !== memory._id);
        setIsBookmarked(false);
        toast.info('Memory removed from bookmarks');
      } else {
        updated = [...saved, memory._id];
        setIsBookmarked(true);
        toast.success('Memory saved to bookmarks');
      }
      localStorage.setItem('saved_memories', JSON.stringify(updated));
    } catch {
      toast.error('Could not update bookmark');
    }
  };

  // Double tap animation for sacred visual delight
  let lastTap = 0;
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      setShowBloom(true);
      setTimeout(() => setShowBloom(false), 900);
      if (!isBookmarked) {
        toggleBookmark();
      }
    }
    lastTap = now;
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/memories/${memory._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Memory link copied to clipboard!');
    setShowMenu(false);
  };

  const shareText = generateShareText(memory._id, memory.caption, memory.year);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <article className="bg-cream-100 rounded-3xl border border-cream-300/80 shadow-soft overflow-hidden mb-6 max-w-lg mx-auto transition-all hover:border-cream-400">
      {/* 1. Header: User Avatar, Name, Location, Options */}
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400">
            <div className="w-10 h-10 rounded-full bg-maroon-800 text-cream-50 flex items-center justify-center font-bold text-sm border-2 border-cream-100">
              {uploaderInitial}
            </div>
          </div>
          <div>
            <h3 className="font-heading font-bold text-dark-900 text-sm leading-tight">
              {uploaderName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted font-body mt-0.5">
              <MapPin className="w-3 h-3 text-maroon-700 shrink-0" />
              <span>Kapooripur, Durga Puja</span>
              <span>•</span>
              <span className="font-semibold text-maroon-800">Year {memory.year}</span>
            </div>
          </div>
        </div>

        {/* Triple Dot Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-muted hover:text-dark-900 rounded-full hover:bg-cream-200 transition-colors"
            aria-label="Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-cream-50 rounded-2xl shadow-xl border border-cream-300 py-1.5 z-30 font-body text-xs">
              <button
                onClick={handleCopyLink}
                className="w-full px-3.5 py-2 text-left text-dark-800 hover:bg-cream-200 flex items-center gap-2"
              >
                <Copy className="w-4 h-4 text-maroon-700" />
                <span>Copy Link</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                className="w-full px-3.5 py-2 text-left text-rose-700 hover:bg-rose-50 flex items-center gap-2"
              >
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Report Memory</span>
              </button>

              {(isOwner || isAdmin) && onDelete && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm('Are you sure you want to delete this memory?')) {
                      onDelete(memory._id);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-cream-200"
                >
                  <span>Delete Memory</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Media Image (Edge-to-Edge with double tap animation) */}
      <div 
        className="relative aspect-square sm:aspect-[4/5] bg-cream-200 cursor-pointer select-none overflow-hidden"
        onClick={() => {
          handleDoubleTap();
          if (onOpenDetail) onOpenDetail(memory);
        }}
      >
        <img
          src={getImageUrl(memory.imageUrl)}
          alt={memory.caption || 'Kapooripur Durga Puja Memory'}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
          loading="lazy"
        />

        {/* Sacred Diya / Heart Double Tap Bloom Animation */}
        {showBloom && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px] animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-cream-50/90 text-amber-500 flex flex-col items-center justify-center shadow-2xl scale-125 animate-bounce">
              <Sparkles className="w-12 h-12 text-amber-500 animate-spin" />
              <span className="text-[10px] font-heading font-bold text-maroon-900 mt-1">
                Jai Maa Durga
              </span>
            </div>
          </div>
        )}

        {/* Year Pill Tag */}
        <div className="absolute top-3 right-3 bg-dark-950/70 backdrop-blur-md text-cream-100 text-xs font-body font-semibold px-2.5 py-1 rounded-full border border-cream-100/20 flex items-center gap-1 shadow-sm">
          <Calendar className="w-3 h-3 text-amber-400" />
          <span>{memory.year}</span>
        </div>
      </div>

      {/* 3. Action Bar */}
      <div className="p-3.5 sm:p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Share */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-cream-50 text-xs font-body font-semibold shadow-sm transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>

            {/* Modal Detail Share */}
            <ShareButton
              memoryId={memory._id}
              caption={memory.caption}
              year={memory.year}
            />
          </div>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            aria-label="Bookmark Memory"
            className={`p-2 rounded-full transition-all active:scale-90 ${
              isBookmarked
                ? 'text-amber-600 bg-amber-100/70'
                : 'text-dark-700/70 hover:text-dark-900 hover:bg-cream-200'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 fill-amber-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Impression (Views/Darshan) Counter — No likes, No comments */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-body font-semibold text-maroon-900">
          <Eye className="w-3.5 h-3.5 text-maroon-700" />
          <span>{formatImpressions(memory.impressions)} devotee views</span>
        </div>

        {/* 4. Caption & Details */}
        <div className="mt-2 font-body text-sm text-dark-900 leading-relaxed">
          <span className="font-bold text-maroon-900 mr-2">{uploaderName}</span>
          <span className={!isCaptionExpanded && memory.caption?.length > 120 ? 'line-clamp-2 inline' : 'inline'}>
            {memory.caption || 'Sacred memory of Durga Puja'}
          </span>

          {memory.caption && memory.caption.length > 120 && (
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="ml-1.5 text-xs text-maroon-700 font-bold hover:underline"
            >
              {isCaptionExpanded ? 'Show less' : '...Read more'}
            </button>
          )}
        </div>

        {/* 5. Timestamp */}
        <div className="mt-2 text-[11px] font-body text-muted">
          {formatDate(memory.createdAt)} • Kapooripur Archive
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        memoryId={memory._id}
      />
    </article>
  );
};
