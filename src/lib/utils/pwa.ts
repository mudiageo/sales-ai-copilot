import { writable } from 'svelte/store';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installPrompt: PWAInstallPrompt | null;
  updateAvailable: boolean;
}

export class PWAManager {
  private state = writable<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    installPrompt: null,
    updateAvailable: false
  });

  private deferredPrompt: any = null;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializePWA();
  }

  private async initializePWA() {
    if (typeof window === 'undefined') return;

    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    this.state.update(state => ({
      ...state,
      isStandalone,
      isInstalled: isStandalone
    }));

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      this.state.update(state => ({
        ...state,
        isInstallable: true,
        installPrompt: {
          prompt: async () => {
            if (this.deferredPrompt) {
              this.deferredPrompt.prompt();
              const { outcome } = await this.deferredPrompt.userChoice;
              
              if (outcome === 'accepted') {
                this.state.update(state => ({
                  ...state,
                  isInstalled: true,
                  isInstallable: false,
                  installPrompt: null
                }));
              }
              
              this.deferredPrompt = null;
            }
          },
          userChoice: this.deferredPrompt?.userChoice || Promise.resolve({ outcome: 'dismissed' })
        }
      }));
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.state.update(state => ({
        ...state,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        this.setupUpdateDetection();
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }

    // Setup display mode change detection
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.state.update(state => ({
        ...state,
        isStandalone: e.matches,
        isInstalled: e.matches
      }));
    });
  }

  private setupUpdateDetection() {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.state.update(state => ({
              ...state,
              updateAvailable: true
            }));
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'update-available') {
        this.state.update(state => ({
          ...state,
          updateAvailable: true
        }));
      }
    });
  }

  async installApp(): Promise<boolean> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.state.update(state => ({
          ...state,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }
      
      this.deferredPrompt = null;
    }
    return false;
  }

  async updateApp(): Promise<void> {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  getState() {
    return this.state;
  }

  // Share API integration
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    
    // Fallback to clipboard
    if (navigator.clipboard && data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }
    
    return false;
  }

  // Badge API integration
  async setBadge(count?: number): Promise<void> {
    if ('setAppBadge' in navigator) {
      try {
        await (navigator as any).setAppBadge(count);
      } catch (error) {
        console.error('Set badge failed:', error);
      }
    }
  }

  async clearBadge(): Promise<void> {
    if ('clearAppBadge' in navigator) {
      try {
        await (navigator as any).clearAppBadge();
      } catch (error) {
        console.error('Clear badge failed:', error);
      }
    }
  }

  // Screen Wake Lock API
  private wakeLock: any = null;

  async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        return true;
      } catch (error) {
        console.error('Wake lock request failed:', error);
        return false;
      }
    }
    return false;
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  // Fullscreen API
  async requestFullscreen(element?: Element): Promise<boolean> {
    const target = element || document.documentElement;
    
    if (target.requestFullscreen) {
      try {
        await target.requestFullscreen();
        return true;
      } catch (error) {
        console.error('Fullscreen request failed:', error);
        return false;
      }
    }
    return false;
  }

  async exitFullscreen(): Promise<void> {
    if (document.exitFullscreen && document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }

  // Device orientation
  async lockOrientation(orientation: OrientationLockType): Promise<boolean> {
    if ('orientation' in screen && 'lock' in screen.orientation) {
      try {
        await screen.orientation.lock(orientation);
        return true;
      } catch (error) {
        console.error('Orientation lock failed:', error);
        return false;
      }
    }
    return false;
  }

  async unlockOrientation(): Promise<void> {
    if ('orientation' in screen && 'unlock' in screen.orientation) {
      screen.orientation.unlock();
    }
  }
}

// Global PWA manager instance
export const pwaManager = new PWAManager();

// Utility functions for PWA features
export const pwaUtils = {
  // Check if device supports PWA features
  isSupported: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Check if running as PWA
  isPWA: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  },

  // Get install instructions based on browser
  getInstallInstructions: () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'Tap the menu button (⋮) in the top right',
          'Select "Add to Home screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return {
        browser: 'Safari',
        steps: [
          'Tap the share button (□↗) at the bottom',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Tap the menu button (⋮) in the top right',
          'Select "Install"',
          'Tap "Add" to confirm'
        ]
      };
    } else {
      return {
        browser: 'Browser',
        steps: [
          'Look for an "Install" or "Add to Home Screen" option in your browser menu',
          'Follow the prompts to install the app'
        ]
      };
    }
  },

  // Generate app shortcuts
  generateShortcuts: () => {
    return [
      {
        name: 'New Lead',
        short_name: 'New Lead',
        description: 'Create a new lead',
        url: '/app/leads?action=new',
        icons: [{ src: '/favicon.png', sizes: '96x96' }]
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View dashboard',
        url: '/app',
        icons: [{ src: '/favicon.png', sizes: '96x96' }]
      },
      {
        name: 'Pipeline',
        short_name: 'Pipeline',
        description: 'View sales pipeline',
        url: '/app/pipeline',
        icons: [{ src: '/favicon.png', sizes: '96x96' }]
      }
    ];
  }
};

// PWA event handlers
export const pwaEvents = {
  // Handle app install banner
  onBeforeInstallPrompt: (callback: (event: Event) => void) => {
    window.addEventListener('beforeinstallprompt', callback);
    return () => window.removeEventListener('beforeinstallprompt', callback);
  },

  // Handle app installed
  onAppInstalled: (callback: () => void) => {
    window.addEventListener('appinstalled', callback);
    return () => window.removeEventListener('appinstalled', callback);
  },

  // Handle display mode changes
  onDisplayModeChange: (callback: (isStandalone: boolean) => void) => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  },

  // Handle online/offline status
  onConnectionChange: (callback: (isOnline: boolean) => void) => {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);
    
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }
};