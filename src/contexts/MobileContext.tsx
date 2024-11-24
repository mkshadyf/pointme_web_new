import { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

interface MobileContextType {
  isNative: boolean;
  isMobile: boolean;
  hasLocationPermission: boolean;
  hasCameraPermission: boolean;
  hasNotificationPermission: boolean;
  requestPermissions: () => Promise<void>;
  takePicture: () => Promise<string>;
  getCurrentPosition: () => Promise<{ latitude: number; longitude: number }>;
  scheduleNotification: (title: string, body: string, at: Date) => Promise<void>;
}

const MobileContext = createContext<MobileContextType | null>(null);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [isNative] = useState(Capacitor.isNativePlatform());
  const [isMobile] = useState(/Mobi|Android/i.test(navigator.userAgent));
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  const requestPermissions = async () => {
    if (isNative) {
      const locationPerm = await Geolocation.checkPermissions();
      const cameraPerm = await Camera.checkPermissions();
      const notificationPerm = await PushNotifications.checkPermissions();

      if (locationPerm.location === 'prompt') {
        await Geolocation.requestPermissions();
      }
      if (cameraPerm.camera === 'prompt') {
        await Camera.requestPermissions();
      }
      if (notificationPerm.receive === 'prompt') {
        await PushNotifications.requestPermissions();
      }

      // Update permission states
      setHasLocationPermission(locationPerm.location === 'granted');
      setHasCameraPermission(cameraPerm.camera === 'granted');
      setHasNotificationPermission(notificationPerm.receive === 'granted');
    }
  };

  const takePicture = async () => {
    if (!isNative) throw new Error('Camera not available');
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'base64',
    });
    return `data:image/jpeg;base64,${image.base64String}`;
  };

  const getCurrentPosition = async () => {
    const position = await Geolocation.getCurrentPosition();
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  };

  const scheduleNotification = async (title: string, body: string, at: Date) => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at },
        },
      ],
    });
  };

  useEffect(() => {
    if (isNative) {
      requestPermissions();
    }
  }, [isNative]);

  return (
    <MobileContext.Provider
      value={{
        isNative,
        isMobile,
        hasLocationPermission,
        hasCameraPermission,
        hasNotificationPermission,
        requestPermissions,
        takePicture,
        getCurrentPosition,
        scheduleNotification,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export const useMobile = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
}; 