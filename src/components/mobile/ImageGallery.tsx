import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, Share2 } from 'lucide-react';
import { useGestures } from '../../hooks/useGestures';
import { mobileDeviceService } from '../../services/mobileDeviceService';

interface ImageGalleryProps {
  images: string[];
  onShare?: () => void;
}

export function ImageGallery({ images, onShare }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGestures(containerRef, {
    onSwipeLeft: () => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        mobileDeviceService.vibrate('light');
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        mobileDeviceService.vibrate('light');
      }
    },
    onDoubleTap: () => {
      setIsZoomed(!isZoomed);
      mobileDeviceService.vibrate('medium');
    },
  });

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: isZoomed ? 1.5 : 1,
            transition: { duration: 0.3 }
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="p-2 bg-black/50 rounded-full text-white"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 bg-black/50 rounded-full text-white"
          >
            <Share2 className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 