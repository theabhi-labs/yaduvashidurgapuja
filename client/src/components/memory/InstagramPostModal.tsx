import React, { useEffect } from 'react';
import { Memory } from '../../types';
import { InstagramMemoryCard } from './InstagramMemoryCard';
import { X } from 'lucide-react';

interface InstagramPostModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const InstagramPostModal: React.FC<InstagramPostModalProps> = ({
  memory,
  isOpen,
  onClose,
  onDelete,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !memory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="बंद करें"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-dark-900/80 text-cream-100 hover:bg-maroon-800 hover:text-cream-50 transition-colors shadow-lg border border-cream-100/20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto scrollbar-none animate-scale-up">
        <InstagramMemoryCard
          memory={memory}
          onDelete={(id) => {
            if (onDelete) onDelete(id);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
