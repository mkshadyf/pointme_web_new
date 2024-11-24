import { supabase } from '../lib/supabase';

export class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.ready;
      const permission = await this.requestPermission();

      if (permission === 'granted') {
        await this.subscribeUser();
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async requestPermission(): Promise<NotificationPermission> {
    return await Notification.requestPermission();
  }

  private async subscribeUser() {
    try {
      const subscription = await this.swRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });

      // Save subscription to database
      await supabase.from('push_subscriptions').upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        subscription: subscription,
      });
    } catch (error) {
      console.error('Failed to subscribe user:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotifications = new PushNotificationService(); 