import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { Network } from '@capacitor/network';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    });

    Network.getStatus().then(status => {
      setIsOnline(status.connected);
    });

    return () => {
      Network.removeAllListeners();
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 bg-yellow-500 text-white z-50"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 