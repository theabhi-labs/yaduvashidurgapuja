import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { generateShareText } from '../../utils/helpers';

interface ShareButtonProps {
  memoryId: string;
  caption?: string;
  year?: number;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  memoryId,
  caption,
  year,
  variant = 'icon',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const shareUrl = `${window.location.origin}/memories/${memoryId}`;
  const shareText = generateShareText(memoryId, caption, year);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Yaduvanshi Durga Puja Kapooripur',
          text: shareText,
          url: shareUrl,
        });
        toast.success('Memory shared successfully');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
      setIsOpen(false);
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const shareViaWhatsApp = () => {
    const encoded = encodeURIComponent(`${shareText}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {variant === 'icon' ? (
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-xl text-muted hover:text-maroon-800 hover:bg-cream-200/80 transition-all focus:outline-none focus:ring-2 focus:ring-maroon-500/30"
          title="Share Memory"
          aria-label="Share memory"
        >
          <Share2 className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        </button>
      ) : (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-cream-200 hover:bg-cream-300 text-dark-900 border border-cream-400/60 transition-all focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <Share2 className="w-4 h-4 text-maroon-700" />
          <span>Share</span>
        </button>
      )}

      {/* Share Dropdown fallback for desktop */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-52 bg-cream-50 rounded-xl shadow-xl border border-cream-300 py-1.5 z-30 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-cream-200 text-xs font-semibold text-muted uppercase tracking-wider">
            Share Memory
          </div>

          <button
            onClick={shareViaWhatsApp}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm text-dark-900 hover:bg-cream-200 transition-colors text-left"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-body">Share on WhatsApp</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm text-dark-900 hover:bg-cream-200 transition-colors text-left"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <LinkIcon className="w-4 h-4 text-gold-600 shrink-0" />
            )}
            <span className="font-body">
              {copied ? 'Link Copied' : 'Copy Link'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
