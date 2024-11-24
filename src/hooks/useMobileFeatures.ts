import { useEffect } from 'react';
import { useMobile } from '../contexts/MobileContext';
import { mobileDeviceService } from '../services/mobileDeviceService';

export function useMobileFeatures() {
  const { isNative, isMobile } = useMobile();

  useEffect(() => {
    if (!isMobile) return;

    // Set up mobile-specific features
    const setupMobileFeatures = async () => {
      if (isNative) {
        // Check network status
        const networkStatus = await mobileDeviceService.getNetworkStatus();

        // Set up app info
        const appInfo = await mobileDeviceService.getAppInfo();

        // Schedule local notification for app launch
        await mobileDeviceService.scheduleLocalNotification(
          'Welcome back!',
          'Check your upcoming appointments',
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        );
      }
    };

    setupMobileFeatures().catch(console.error);
  }, [isMobile, isNative]);

  return {
    shareContent: mobileDeviceService.shareContent,
    vibrate: mobileDeviceService.vibrate,
    takePicture: mobileDeviceService.takePicture,
  };
} 