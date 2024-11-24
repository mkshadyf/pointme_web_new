import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGestures } from '../../hooks/useGestures';
import { useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useGestures(sheetRef, {
    onSwipeDown: onClose,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50"
            style={{ maxHeight: '90vh' }}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                <button onClick={onClose} className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 