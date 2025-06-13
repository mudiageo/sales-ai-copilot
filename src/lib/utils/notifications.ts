import { browser } from '$app/environment'

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  silent?: boolean;
  vibrate?: number[];
}

export class NotificationManager {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.checkPermission();
    this.initializeServiceWorker();
  }

  private checkPermission() {
    if (browser && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.error('Service worker not available:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  async show(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    if (this.permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const notificationOptions: NotificationOptions = {
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      ...options
    };

    if (this.registration) {
      // Use service worker for persistent notifications
      await this.registration.showNotification(options.title, notificationOptions);
    } else {
      // Fallback to regular notifications
      new Notification(options.title, notificationOptions);
    }
  }

  async showLeadNotification(leadName: string, score: number) {
    await this.show({
      title: 'New High-Value Lead',
      body: `${leadName} has a lead score of ${score}`,
      tag: 'lead-notification',
      data: { type: 'lead', leadName, score },
      actions: [
        { action: 'view', title: 'View Lead' },
        { action: 'call', title: 'Call Now' }
      ]
    });
  }

  async showDealNotification(dealName: string, stage: string) {
    await this.show({
      title: 'Deal Update',
      body: `${dealName} moved to ${stage}`,
      tag: 'deal-notification',
      data: { type: 'deal', dealName, stage },
      actions: [
        { action: 'view', title: 'View Deal' },
        { action: 'update', title: 'Update' }
      ]
    });
  }

  async showCoachingNotification(tip: string) {
    await this.show({
      title: 'AI Coaching Tip',
      body: tip,
      tag: 'coaching-notification',
      data: { type: 'coaching', tip },
      silent: true
    });
  }

  async showSyncNotification(itemCount: number) {
    await this.show({
      title: 'Data Synced',
      body: `${itemCount} items synced successfully`,
      tag: 'sync-notification',
      data: { type: 'sync', itemCount },
      silent: true
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationManager = new NotificationManager();

// Handle notification clicks
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'notification-click') {
      const { action, data } = event.data;
      
      switch (data.type) {
        case 'lead':
          // Navigate to lead details
          window.location.href = `/app?view=leads&id=${data.leadName}`;
          break;
        case 'deal':
          // Navigate to deal details
          window.location.href = `/app?view=pipeline&id=${data.dealName}`;
          break;
        case 'coaching':
          // Navigate to coaching
          window.location.href = '/app?view=coaching';
          break;
      }
    }
  });
}