import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNavigation } from '../components/mobile/MobileNavigation';
import { MobileErrorBoundary } from '../components/mobile/MobileErrorBoundary';
import { OfflineIndicator } from '../components/mobile/OfflineIndicator';
import { useMobile } from '../contexts/MobileContext';
import { mobileDeviceService } from '../services/mobileDeviceService';

export function MobileAppLayout() {
  const { requestPermissions } = useMobile();

  useEffect(() => {
    // Request necessary permissions on mount
    requestPermissions();

    // Set up status bar for mobile devices
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.documentElement.classList.add('mobile-safe-area');
    }
  }, [requestPermissions]);

  return (
    <MobileErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        <main className="pb-16">
          <Outlet />
        </main>
        <MobileNavigation />
      </div>
    </MobileErrorBoundary>
  );
} 