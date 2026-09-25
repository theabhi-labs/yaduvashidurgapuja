import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { memoryService } from '../services/memoryService';
import { Memory } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { MemoryCardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { ShareButton } from '../components/memory/ShareButton';
import { formatDate, getImageUrl } from '../utils/helpers';
import {
  PlusCircle,
  Trash2,
  Eye,
  Calendar,
  ImageOff,
} from 'lucide-react';

export const MyMemories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchMyMemories = async () => {
    setIsLoading(true);
    try {
      const res = await memoryService.getMyMemories();
      if (res.success) {
        setMemories(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'आपकी स्मृतियाँ लोड करने में त्रुटि हुई');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMemories();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await memoryService.deleteMemory(deletingId);
      toast.success('स्मृति हटा दी गई');
      setMemories((prev) => prev.filter((m) => m._id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'हटाने में त्रुटि हुई');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-devanagari-heading font-bold text-maroon-900">
            मेरी साझा की गई स्मृतियाँ
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            आपके द्वारा यदुवंशी दुर्गा पूजा कपूरिपुर अभिलेखागार में जोड़ी गई सभी तस्वीरें।
          </p>
        </div>

        <Link to="/share-memory">
          <Button
            variant="gold"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="font-devanagari-body font-bold"
          >
            नई याद साझा करें
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MemoryCardSkeleton />
          <MemoryCardSkeleton />
          <MemoryCardSkeleton />
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          icon={<ImageOff className="w-8 h-8 text-gold-600" />}
          title="आपने अभी तक कोई स्मृति साझा नहीं की है"
          description="कपूरिपुर दुर्गा पूजा के पावन उत्सव की अपनी पहली तस्वीर और संस्मरण अभी साझा करें।"
          actionText="अपनी पहली याद साझा करें"
          onAction={() => {
            window.location.href = '/share-memory';
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {memories.map((mem) => (
            <div
              key={mem._id}
              className="bg-cream-50 rounded-2xl overflow-hidden border border-cream-300 shadow-soft flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-cream-200 overflow-hidden">
                <Link to={`/memories/${mem._id}`}>
                  <img
                    src={getImageUrl(mem.thumbnailUrl || mem.imageUrl)}
                    alt={mem.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur-md text-gold-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                  वर्ष {mem.year}
                </div>
                <div
                  className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                    mem.status === 'published'
                      ? 'bg-emerald-700 text-emerald-50'
                      : 'bg-amber-700 text-amber-50'
                  }`}
                >
                  {mem.status === 'published' ? 'प्रकाशित' : 'समीक्षाधीन'}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted font-devanagari-body mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gold-600" />
                    <span>{formatDate(mem.createdAt)}</span>
                  </div>
                  <p className="text-sm font-devanagari-body text-dark-900 line-clamp-3 leading-relaxed mb-4">
                    {mem.caption}
                  </p>
                </div>

                <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/memories/${mem._id}`}
                      className="p-1.5 rounded-lg text-muted hover:text-dark-900 hover:bg-cream-200 transition-colors"
                      title="देखें"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeletingId(mem._id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <ShareButton
                    memoryId={mem._id}
                    caption={mem.caption}
                    year={mem.year}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="स्मृति हटाने की पुष्टि"
      >
        <div className="space-y-4">
          <p className="text-sm font-devanagari-body text-dark-800 leading-relaxed">
            क्या आप वाकई इस स्मृति को हटाना चाहते हैं?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeletingId(null)}
            >
              रद्द करें
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              हाँ, हटा दें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
