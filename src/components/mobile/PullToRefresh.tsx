import { useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useGestures } from '../../hooks/useGestures';
import type { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();

  useGestures(containerRef, {
    onSwipeDown: async () => {
      if (isRefreshing) return;
      
      setIsRefreshing(true);
      controls.start({ y: 50, rotate: 360, transition: { duration: 0.5 } });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        controls.start({ y: 0, transition: { duration: 0.3 } });
      }
    },
  });

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <motion.div
        animate={controls}
        className="absolute top-0 left-0 right-0 flex justify-center py-4"
      >
        <RefreshCw
          className={`w-6 h-6 text-primary-500 ${isRefreshing ? 'animate-spin' : ''}`}
        />
      </motion.div>
      {children}
    </div>
  );
} 