import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { memoryService, trackMemoryView } from '../services/memoryService';
import { Memory } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { formatDate, getImageUrl, formatImpressions } from '../utils/helpers';
import { ShareButton } from '../components/memory/ShareButton';
import { ReportModal } from '../components/memory/ReportModal';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Flag,
  Trash2,
  Edit,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const MemoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editCaption, setEditCaption] = useState<string>('');
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await memoryService.getMemoryById(id);
        if (res.success) {
          setMemory(res.data);
          setEditCaption(res.data.caption);
          setEditYear(res.data.year);
          trackMemoryView(id, (newCount) => {
            setMemory((prev) => (prev ? { ...prev, impressions: newCount } : null));
          });
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load memory details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemory();
  }, [id]);

  const isOwner = user && memory && user._id === memory.userId?._id;
  const canModify = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!memory) return;
    setIsDeleting(true);
    try {
      await memoryService.deleteMemory(memory._id);
      toast.success('Memory deleted successfully');
      navigate('/memories');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting memory');
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memory) return;
    setIsUpdating(true);
    try {
      const res = await memoryService.updateMemory(memory._id, {
        caption: editCaption,
        year: editYear,
      });
      if (res.success) {
        setMemory(res.data);
        toast.success('Memory updated successfully');
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating memory');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
        <p className="text-sm font-body text-muted">Loading memory details...</p>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-maroon-700 mb-3" />
        <h3 className="text-xl font-heading font-bold text-dark-900 mb-2">
          Memory Not Found
        </h3>
        <p className="text-sm font-body text-muted mb-6">
          {error || 'This memory is not available or has been removed.'}
        </p>
        <Link to="/memories">
          <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Memories Archive
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[85vh]">
      {/* Top Breadcrumb / Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/memories"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-body font-semibold text-maroon-800 hover:text-maroon-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to all memories</span>
        </Link>

        {canModify && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Memory Showcase Card */}
      {(() => {
        const imagesList =
          memory.images && memory.images.length > 0
            ? memory.images
            : [{ imageUrl: memory.imageUrl, thumbnailUrl: memory.thumbnailUrl }];
        const isCarousel = imagesList.length > 1;
        const currentImageUrl = imagesList[activeImageIndex]?.imageUrl || memory.imageUrl;

        return (
          <article className="bg-cream-50 rounded-3xl overflow-hidden border border-cream-300 shadow-medium">
            {/* Large High-Res Image Showcase */}
            <div className="relative bg-dark-950 max-h-[700px] min-h-[360px] sm:min-h-[480px] flex items-center justify-center overflow-hidden group">
              <img
                src={getImageUrl(currentImageUrl)}
                alt={memory.caption}
                className="w-full max-h-[700px] object-contain mx-auto transition-all duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/hero-durga.jpg';
                }}
              />

              {/* Top-Right Badge: Carousel Counter & Year Tag */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {isCarousel && (
                  <div className="bg-dark-900/85 backdrop-blur-md text-gold-300 text-xs sm:text-sm font-semibold font-mono px-3 py-1 rounded-full border border-gold-500/30 shadow-md flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-gold-400" />
                    <span>{activeImageIndex + 1} / {imagesList.length}</span>
                  </div>
                )}

                <div className="bg-dark-900/85 backdrop-blur-md text-gold-300 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border border-gold-500/30 shadow-md">
                  Year {memory.year}
                </div>
              </div>

              {/* Navigation Arrows (if carousel) */}
              {isCarousel && (
                <>
                  {activeImageIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-dark-900/80 hover:bg-dark-900 text-white backdrop-blur-md transition-all active:scale-95 shadow-xl border border-white/20 z-10"
                      title="Previous photo (Left arrow key)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {activeImageIndex < imagesList.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-dark-900/80 hover:bg-dark-900 text-white backdrop-blur-md transition-all active:scale-95 shadow-xl border border-white/20 z-10"
                      title="Next photo (Right arrow key)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Navigation Filmstrip (if carousel) */}
            {isCarousel && (
              <div className="bg-dark-900/90 px-4 py-3 border-t border-dark-700 flex items-center gap-2 overflow-x-auto scrollbar-none">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeImageIndex
                        ? 'border-gold-400 ring-2 ring-gold-400/50 scale-105 shadow-md'
                        : 'border-dark-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.thumbnailUrl || img.imageUrl)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-white bg-black/70 px-1 rounded">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Details & Metadata Section */}
            <div className="p-6 sm:p-10 space-y-8">
          {/* Header Row: Devotee Info & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-300/80">
            {/* Devotee Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-base overflow-hidden border-2 border-gold-400/40 shrink-0">
                {memory.userId?.avatar ? (
                  <img
                    src={getImageUrl(memory.userId.avatar)}
                    alt={memory.userId.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-gold-300" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-body font-bold text-dark-950">
                    {memory.userId?.name || 'Devotee'}
                  </h2>
                  {memory.userId?.username && (
                    <span className="text-xs sm:text-sm font-mono font-bold text-maroon-800 bg-maroon-900/10 px-2.5 py-0.5 rounded-full border border-maroon-800/20">
                      @{memory.userId.username}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-body text-muted mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span>Shared on: {formatDate(memory.createdAt)}</span>
                  </div>
                  <span className="text-cream-400">•</span>
                  <div className="flex items-center gap-1 text-maroon-900 font-semibold bg-maroon-900/10 px-2.5 py-0.5 rounded-full border border-maroon-900/20">
                    <Eye className="w-3.5 h-3.5 text-maroon-700" />
                    <span>{formatImpressions(memory.impressions)} devotee views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Share & Report */}
            <div className="flex items-center gap-3">
              <ShareButton
                memoryId={memory._id}
                caption={memory.caption}
                year={memory.year}
                variant="button"
                size="md"
              />

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body text-muted hover:text-red-700 hover:bg-red-50 border border-cream-300 transition-colors"
                title="Report content"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* Full Caption */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-gold-800 font-body">
              Memory Description
            </h3>
            <p className="text-base sm:text-lg font-body text-dark-900 leading-relaxed whitespace-pre-line">
              {memory.caption}
            </p>
          </div>

          {/* Archival Quality Badge */}
          <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 flex items-center gap-3 text-xs font-body text-muted">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              This photograph is preserved in original quality in the digital archive of Yaduvanshi Durga Puja Kapooripur.
            </span>
          </div>
        </div>
      </article>
    );
  })()}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        memoryId={memory._id}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-dark-800 leading-relaxed">
            Are you sure you want to permanently delete this memory? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Memory Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Memory"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-body font-semibold text-dark-900 mb-1.5">
              Select Year:
            </label>
            <input
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(parseInt(e.target.value, 10))}
              min={1970}
              max={new Date().getFullYear() + 1}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600 text-sm font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-body font-semibold text-dark-900 mb-1.5">
              Caption / Description:
            </label>
            <textarea
              rows={4}
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              required
              maxLength={600}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600 text-sm font-body"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
