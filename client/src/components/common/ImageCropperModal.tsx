import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  X, 
  Move 
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image object URL when file changes
  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      imageRef.current = img;
      setImageSrc(url);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Redraw preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Save state
    ctx.save();

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Fill background
    ctx.fillStyle = '#4a0404';
    ctx.fillRect(0, 0, size, size);

    // Transform: move to center, rotate, scale, translate
    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate base fit dimensions
    const scale = Math.max(size / img.width, size / img.height) * zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    ctx.restore();

    // Draw luxury golden border ring over the circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }, [zoom, rotation, offset]);

  useEffect(() => {
    if (imageSrc) {
      drawPreview();
    }
  }, [imageSrc, drawPreview]);

  // Touch and Mouse Drag Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Perform final high-resolution 600x600 crop
  const handleCropAndSave = async () => {
    const img = imageRef.current;
    if (!img || !imageFile) return;

    setIsProcessing(true);
    try {
      const outputCanvas = document.createElement('canvas');
      const targetSize = 600;
      outputCanvas.width = targetSize;
      outputCanvas.height = targetSize;
      const ctx = outputCanvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context unavailable');

      // Square high-res crop
      ctx.fillStyle = '#4a0404';
      ctx.fillRect(0, 0, targetSize, targetSize);

      // Coordinate mapping from preview canvas (300px) to targetCanvas (600px)
      const ratio = targetSize / 300;
      ctx.translate(targetSize / 2 + offset.x * ratio, targetSize / 2 + offset.y * ratio);
      ctx.rotate((rotation * Math.PI) / 180);

      const scale = Math.max(targetSize / img.width, targetSize / img.height) * zoom;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      outputCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const croppedFile = new File(
            [blob],
            `avatar-${Date.now()}.webp`,
            { type: 'image/webp' }
          );
          onCropComplete(croppedFile);
          setIsProcessing(false);
          onClose();
        },
        'image/webp',
        0.9
      );
    } catch {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="फ़ोटो क्रॉप एवं व्यवस्थित करें (Crop Photo)"
      maxWidth="md"
    >
      <div className="space-y-5 select-none">
        <p className="text-xs text-muted text-center font-body">
          अपनी प्रोफ़ाइल फ़ोटो को गोल घेरे में व्यवस्थित करने के लिए ज़ूम करें व उंगली से खिसकाएँ।
        </p>

        {/* Circular Viewport Preview Canvas */}
        <div className="flex justify-center items-center py-2">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative cursor-move p-2 rounded-full bg-cream-200/80 border-2 border-dashed border-gold-400 shadow-md flex items-center justify-center touch-none"
            title="फ़ोटो को खिसकाने के लिए ड्रैग करें"
          >
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded-full shadow-inner block"
            />

            {/* Subtle drag prompt badge */}
            <div className="absolute bottom-4 bg-black/70 text-cream-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 pointer-events-none shadow-sm">
              <Move className="w-3 h-3 text-gold-300" />
              <span>Drag to Pan</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls (Zoom & Rotate) */}
        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 text-dark-800 transition-colors"
              title="ज़ूम कम करें"
            >
              <ZoomOut className="w-4 h-4 text-maroon-800" />
            </button>

            <input
              type="range"
              min="0.6"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-maroon-800 cursor-pointer h-2 bg-cream-300 rounded-lg"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
              className="p-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 text-dark-800 transition-colors"
              title="ज़ूम बढ़ाएं"
            >
              <ZoomIn className="w-4 h-4 text-maroon-800" />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="px-2.5 py-1.5 rounded-lg bg-gold-100 hover:bg-gold-200 text-maroon-900 text-xs font-bold flex items-center gap-1 border border-gold-300 transition-colors"
              title="घुमाएँ (Rotate 90°)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-cream-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            leftIcon={<X className="w-4 h-4" />}
          >
            रद्द करें (Cancel)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCropAndSave}
            isLoading={isProcessing}
            leftIcon={<Check className="w-4 h-4" />}
            className="bg-maroon-900 hover:bg-maroon-950 text-gold-200 font-bold px-4"
          >
            क्रॉप व अपलोड करें
          </Button>
        </div>
      </div>
    </Modal>
  );
};
