import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryService } from '../services/memoryService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { AVAILABLE_YEARS } from '../utils/constants';
import {
  UploadCloud,
  Images,
  X,
  Info,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
} from 'lucide-react';

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file

export const ShareMemory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [caption, setCaption] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Clean up object URLs when unmounting or changing files
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validList: File[] = [];

    const totalAllowed = MAX_PHOTOS - selectedFiles.length;
    if (totalAllowed <= 0) {
      toast.info(`You have already selected the maximum limit of ${MAX_PHOTOS} photos.`);
      return;
    }

    const filesToProcess = Array.from(newFiles).slice(0, totalAllowed);

    for (const file of filesToProcess) {
      if (!validTypes.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is not a valid format (only JPG, PNG, WebP allowed).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }
      validList.push(file);
    }

    if (validList.length === 0) return;

    const newUrls = validList.map((f) => URL.createObjectURL(f));
    const combinedFiles = [...selectedFiles, ...validList];
    const combinedUrls = [...previewUrls, ...newUrls];

    setSelectedFiles(combinedFiles);
    setPreviewUrls(combinedUrls);
    if (selectedFiles.length === 0) {
      setActivePreviewIndex(0);
    }

    if (Array.from(newFiles).length > totalAllowed) {
      toast.info(`Only ${MAX_PHOTOS} photos can be attached per post. First ${totalAllowed} were added.`);
    } else {
      toast.success(
        validList.length === 1
          ? 'Photo added to album'
          : `${validList.length} photos added to post`
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (indexToRemove: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Revoke removed object URL
    URL.revokeObjectURL(previewUrls[indexToRemove]);

    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    const updatedUrls = previewUrls.filter((_, idx) => idx !== indexToRemove);

    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedUrls);

    if (activePreviewIndex >= updatedFiles.length) {
      setActivePreviewIndex(Math.max(0, updatedFiles.length - 1));
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreInputRef.current) addMoreInputRef.current.value = '';
  };

  const handlePrevPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : previewUrls.length - 1));
  };

  const handleNextPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePreviewIndex((prev) => (prev < previewUrls.length - 1 ? prev + 1 : 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error('Please select at least one photo to share.');
      return;
    }

    if (!caption.trim()) {
      toast.error('Please provide a caption or description for this memory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Append all carousel photos under 'images' field
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('caption', caption.trim());
      formData.append('year', year.toString());

      const res = await memoryService.createMemory(formData);
      if (res.success && res.data) {
        toast.success(
          selectedFiles.length > 1
            ? `Your album of ${selectedFiles.length} photos has been shared successfully!`
            : 'Your memory has been preserved successfully!'
        );
        navigate(`/memories/${res.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload memory. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-16 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[85vh]">
      <SectionHeading
        badge="Instagram-Style Album Post"
        title="Share Festival Memories & Photos"
        subtitle="Upload single or multiple festival photos (up to 10 photos in one post) to be permanently preserved in the Kapooripur archive."
      />

      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-4 sm:p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* ======================================================== */}
          {/* 1. MULTI-PHOTO UPLOAD & CAROUSEL PREVIEW AREA            */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-body font-bold text-dark-900 flex items-center gap-1.5">
                <Images className="w-4 h-4 text-maroon-700" />
                <span>Festival Photos (Select up to 10 photos) *</span>
              </label>

              {selectedFiles.length > 0 && (
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-maroon-900/10 text-maroon-900 border border-maroon-800/20">
                  {selectedFiles.length} / {MAX_PHOTOS} Photos
                </span>
              )}
            </div>

            {/* Hidden Input for Initial Multi-select */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  validateAndAddFiles(e.target.files);
                }
              }}
              className="hidden"
            />

            {/* Hidden Input for Adding More Photos */}
            <input
              ref={addMoreInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  validateAndAddFiles(e.target.files);
                }
              }}
              className="hidden"
            />

            {selectedFiles.length === 0 ? (
              /* Dropzone for zero files selected */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-gold-500 bg-gold-50/70 scale-[0.99]'
                    : 'border-cream-400 bg-cream-50 hover:bg-cream-200/50 hover:border-maroon-600 shadow-sm'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-cream-200 border border-gold-400/40 flex items-center justify-center text-maroon-700 mb-3.5 shadow-sm">
                  <UploadCloud className="w-8 h-8 text-gold-600" />
                </div>
                <p className="text-base sm:text-lg font-heading font-bold text-dark-900 mb-1">
                  Drag and drop photos here, or click to select
                </p>
                <p className="text-xs font-body text-muted mb-4 max-w-sm">
                  Select multiple photos at once for an Instagram-style carousel album (Up to 10 photos • JPG, PNG, WebP • Max 10MB each)
                </p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-200 shadow-md border border-gold-500/30 active:scale-95 transition-transform">
                  <Layers className="w-4 h-4 text-gold-400" />
                  <span>Choose Photos (Carousel)</span>
                </span>
              </div>
            ) : (
              /* Interactive Carousel Preview & Filmstrip */
              <div className="space-y-3.5 bg-cream-50 p-3.5 sm:p-5 rounded-3xl border border-gold-500/30 shadow-md">
                {/* Main Hero Active Slide */}
                <div className="relative aspect-square sm:aspect-[4/3] md:aspect-[16/10] bg-dark-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                  <img
                    src={previewUrls[activePreviewIndex]}
                    alt={`Preview ${activePreviewIndex + 1}`}
                    className="w-full h-full object-contain mx-auto transition-all duration-300"
                  />

                  {/* Top-Right Badge & Remove Button */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-gold-300 text-xs font-bold font-mono border border-gold-500/30 shadow-md">
                      {activePreviewIndex + 1} / {previewUrls.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemovePhoto(activePreviewIndex, e)}
                      className="p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition-all shadow-md active:scale-90"
                      title="Remove this photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Top-Left Album Pill */}
                  {previewUrls.length > 1 && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-cream-100 text-xs font-bold border border-white/20 shadow-md">
                      <Layers className="w-3.5 h-3.5 text-gold-400" />
                      <span>Carousel Album</span>
                    </div>
                  )}

                  {/* Left & Right Slide Controls (if multiple photos) */}
                  {previewUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPreview}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-950/70 hover:bg-dark-900 text-white backdrop-blur-md transition-all active:scale-90 shadow-md border border-white/10"
                        title="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPreview}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-950/70 hover:bg-dark-900 text-white backdrop-blur-md transition-all active:scale-90 shadow-md border border-white/10"
                        title="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Dot Indicators */}
                  {previewUrls.length > 1 && (
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                      {previewUrls.map((_, idx) => (
                        <span
                          key={idx}
                          className={`transition-all duration-300 rounded-full ${
                            idx === activePreviewIndex
                              ? 'w-6 h-1.5 bg-gold-400 shadow-md'
                              : 'w-1.5 h-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Thumbnail Filmstrip Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-none">
                  {previewUrls.map((url, idx) => {
                    const isActive = idx === activePreviewIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActivePreviewIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                          isActive
                            ? 'border-gold-500 ring-2 ring-gold-400/50 scale-105 shadow-md'
                            : 'border-cream-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto(idx, e)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-dark-950/80 hover:bg-red-600 text-white transition-colors"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-dark-950/80 text-cream-100">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}

                  {/* Add More Photos Button (if under limit) */}
                  {selectedFiles.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => addMoreInputRef.current?.click()}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-maroon-700/50 bg-maroon-900/5 hover:bg-maroon-900/10 flex flex-col items-center justify-center text-maroon-800 shrink-0 transition-all active:scale-95 shadow-sm"
                      title="Add more photos"
                    >
                      <Plus className="w-5 h-5 text-maroon-700" />
                      <span className="text-[10px] font-bold mt-0.5 font-body">+ Add</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. YEAR & DEVOTEE ROW                                    */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Year Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-body font-bold text-dark-900 mb-1.5">
                Festival Year *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-body font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-600 appearance-none shadow-sm"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Devotee Display */}
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-body font-bold text-dark-900 mb-1.5">
                Devotee Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 bg-cream-200/80 text-dark-800 text-sm font-body font-medium cursor-not-allowed shadow-inner"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. CAPTION INPUT                                         */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-body font-bold text-dark-900">
                Memory Caption / Description *
              </label>
              <span className="text-xs text-muted font-mono">{caption.length}/600</span>
            </div>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this moment... (e.g., Grand Maha Aarti with 108 oil lamps on Maha Ashtami evening in 2024...)"
              required
              maxLength={600}
              className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-body placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-600 shadow-sm"
            />
          </div>

          {/* Guidelines Notice */}
          <div className="bg-cream-200/80 p-4 rounded-2xl border border-cream-300 text-xs font-body text-dark-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-maroon-800">
              <Info className="w-4 h-4" />
              <span>Archive Guidelines:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted pl-1">
              <li>You can upload up to 10 photos in a single carousel album post.</li>
              <li>Please upload only genuine photos related to Yaduvanshi Durga Puja Kapooripur.</li>
              <li>GPS location and sensitive EXIF metadata are automatically stripped for privacy.</li>
            </ul>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/memories')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-5 h-5 text-dark-950" />}
              className="font-body font-bold shadow-md"
            >
              {selectedFiles.length > 1
                ? `Publish Album (${selectedFiles.length} Photos)`
                : 'Publish Memory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareMemory;

