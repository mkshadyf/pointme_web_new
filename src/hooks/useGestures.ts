import { useEffect, useRef } from 'react';
import { useMobile } from '../contexts/MobileContext';
import { mobileDeviceService } from '../services/mobileDeviceService';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
}

export function useGestures(elementRef: React.RefObject<HTMLElement>, options: GestureOptions) {
  const { isMobile } = useMobile();
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const threshold = options.threshold || 50;

  useEffect(() => {
    if (!isMobile || !elementRef.current) return;

    const element = elementRef.current;
    let lastTap = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      // Handle double tap
      if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const currentTime = Date.now();
        if (currentTime - lastTap < 300) {
          options.onDoubleTap?.();
          mobileDeviceService.vibrate('light');
        }
        lastTap = currentTime;
      }

      // Handle swipes
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            options.onSwipeRight?.();
          } else {
            options.onSwipeLeft?.();
          }
        } else {
          if (deltaY > 0) {
            options.onSwipeDown?.();
          } else {
            options.onSwipeUp?.();
          }
        }
        mobileDeviceService.vibrate('medium');
      }

      touchStart.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, options, threshold]);
} 