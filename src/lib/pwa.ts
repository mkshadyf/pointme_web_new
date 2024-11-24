export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}

export function showUpdateNotification() {
  // Implement your preferred UI notification here
  const shouldUpdate = window.confirm(
    'A new version is available! Would you like to update?'
  );

  if (shouldUpdate) {
    updateServiceWorker();
  }
}

export async function updateServiceWorker() {
  const registration = await navigator.serviceWorker.ready;
  await registration.update();

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Reload the page to activate the new service worker
  window.location.reload();
}

export async function checkForUpdate() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  }
}

export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://');
}

export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window && !isPWAInstalled();
}

let deferredPrompt: any;

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === 'accepted';
}

export async function checkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('/api/health-check');
    return response.ok;
  } catch {
    return false;
  }
}

export async function syncOfflineData() {
  if (!navigator.onLine) return;

  try {
    await syncService.syncOfflineData();
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

export function setupPeriodicSync() {
  if ('periodicSync' in navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(async (registration) => {
      try {
        await registration.periodicSync.register('sync-data', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
      } catch (error) {
        console.error('Periodic sync registration failed:', error);
      }
    });
  }
} 