import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryService } from '../services/memoryService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { AVAILABLE_YEARS } from '../utils/constants';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Info,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const ShareMemory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a JPG, JPEG, PNG or WebP image.');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select an image to upload.');
      return;
    }

    if (!caption.trim()) {
      toast.error('Please provide a caption or description for this memory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption.trim());
      formData.append('year', year.toString());

      const res = await memoryService.createMemory(formData);
      if (res.success && res.data) {
        toast.success('Your memory has been preserved successfully!');
        navigate(`/memories/${res.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload memory. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[85vh]">
      <SectionHeading
        badge="Contribute Memory"
        title="Share Your Sacred Memory"
        subtitle="Photographs and memories captured by you during Yaduvanshi Durga Puja Kapooripur will become a permanent part of our digital heritage."
      />

      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-body font-bold text-dark-900 mb-2">
              Select Festival Photo *
            </label>

            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-gold-500 bg-gold-50/60 scale-[0.99]'
                    : 'border-cream-400 bg-cream-50 hover:bg-cream-200/50 hover:border-maroon-600'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-cream-200 border border-gold-400/40 flex items-center justify-center text-maroon-700 mb-4 shadow-sm">
                  <UploadCloud className="w-8 h-8 text-gold-600" />
                </div>
                <p className="text-base font-body font-bold text-dark-900 mb-1">
                  Drag and drop photo here, or click to browse
                </p>
                <p className="text-xs font-body text-muted mb-4">
                  JPG, JPEG, PNG, WebP (Maximum 10MB)
                </p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-maroon-700 text-cream-50">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Browse Photos
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-cream-300 bg-dark-950/80 max-h-[450px] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[450px] object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 rounded-full bg-dark-900/80 hover:bg-red-700 text-white transition-colors shadow-lg"
                  title="Remove Image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Year and Caption Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Year Selection */}
            <div>
              <label className="block text-sm font-body font-bold text-dark-900 mb-2">
                Festival Year *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-body font-medium focus:outline-none focus:ring-2 focus:ring-maroon-600 appearance-none"
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
              <label className="block text-sm font-body font-bold text-dark-900 mb-2">
                Devotee Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-200 text-dark-800 text-sm font-body cursor-not-allowed"
              />
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-body font-bold text-dark-900">
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
              className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-body placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          {/* Guidelines Notice */}
          <div className="bg-cream-200/80 p-4 rounded-2xl border border-cream-300 text-xs font-body text-dark-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-maroon-800">
              <Info className="w-4 h-4" />
              <span>Archive Guidelines:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted pl-1">
              <li>Please upload only genuine photos related to Yaduvanshi Durga Puja Kapooripur.</li>
              <li>GPS location and sensitive EXIF metadata are automatically stripped for privacy.</li>
              <li>This is a community heritage archive preserving sacred memories for future generations.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/memories')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-5 h-5 text-dark-950" />}
              className="font-body font-bold"
            >
              Save Memory
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
