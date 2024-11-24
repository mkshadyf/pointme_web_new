import { supabase } from '../lib/supabase';

export class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private notificationQueue: Map<string, number> = new Map();
  private maxNotificationsPerMinute = 5;

  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.ready;
      await this.checkPermission();
      this.setupNotificationClickHandler();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async checkPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await this.subscribe();
    }
  }

  private async subscribe() {
    try {
      const subscription = await this.swRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });

      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription,
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  private setupNotificationClickHandler() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'notificationClick') {
        this.handleNotificationClick(event.data);
      }
    });
  }

  private handleNotificationClick(data: any) {
    // Handle different notification types
    switch (data.notificationType) {
      case 'booking':
        window.location.href = `/bookings/${data.bookingId}`;
        break;
      case 'message':
        window.location.href = `/messages/${data.messageId}`;
        break;
      case 'payment':
        window.location.href = `/payments/${data.paymentId}`;
        break;
      default:
        if (data.url) {
          window.location.href = data.url;
        }
    }
  }

  async showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: NotificationAction[];
    requireInteraction?: boolean;
  }) {
    if (!this.swRegistration) return;

    // Rate limiting
    const now = Date.now();
    const recentNotifications = Array.from(this.notificationQueue.values())
      .filter(time => now - time < 60000).length;

    if (recentNotifications >= this.maxNotificationsPerMinute) {
      console.log('Notification rate limit exceeded');
      return;
    }

    const id = crypto.randomUUID();
    this.notificationQueue.set(id, now);

    // Clean up old notifications
    for (const [id, time] of this.notificationQueue.entries()) {
      if (now - time > 60000) {
        this.notificationQueue.delete(id);
      }
    }

    await this.swRegistration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      tag: options.tag,
      data: options.data,
      actions: options.actions,
      requireInteraction: options.requireInteraction,
      silent: false,
      renotify: true,
    });
  }

  private urlBase64ToUint8Array(base64String: string) {
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

export const notificationService = new NotificationService(); 