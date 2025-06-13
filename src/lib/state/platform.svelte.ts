import { writable } from 'svelte/store';

export interface PlatformInfo {
  type: 'desktop' | 'mobile';
  os: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';
  isTauri: boolean;
  isOnline: boolean;
  capabilities: {
    notifications: boolean;
    camera: boolean;
    geolocation: boolean;
    fileSystem: boolean;
    clipboard: boolean;
    multiWindow: boolean;

  };
}

const defaultPlatform: PlatformInfo = {
  type: 'desktop',
  os: 'unknown',
  isTauri: false,
  isOnline: true,
  capabilities: {
    notifications: false,
    camera: false,
    geolocation: false,
    fileSystem: false,
    clipboard: false,
    multiWindow: false

  }
};

export const platform = writable<PlatformInfo>(defaultPlatform);

export async function detectPlatformCapabilities(): Promise<PlatformInfo['capabilities']> {
  const capabilities: PlatformInfo['capabilities'] = {
    notifications: 'Notification' in window,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    geolocation: 'geolocation' in navigator,
    fileSystem: 'showOpenFilePicker' in window || window.__TAURI__ !== undefined,
    clipboard: 'clipboard' in navigator
  };

  return capabilities;
}

export async function detectPlatform(): Promise<PlatformInfo> {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTauri = window.__TAURI__ !== undefined;
    
    let type: 'desktop' | 'mobile' = 'desktop';
    
    // Enhanced mobile detection
    if (window.innerWidth < 768 || /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      type = 'mobile';
    }
    
    let os: PlatformInfo['os'] = 'unknown';

    // Detect mobile
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      type = 'mobile';
      if (/android/i.test(userAgent)) os = 'android';
      else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'ios';
    } else {
      // Detect desktop OS
      if (/win/i.test(userAgent)) os = 'windows';
      else if (/mac/i.test(userAgent)) os = 'macos';
      else if (/linux/i.test(userAgent)) os = 'linux';
    }

    // Use Tauri API for more accurate detection if available
    if (isTauri && window.__TAURI__?.os) {
      try {
        const tauriOs = await window.__TAURI__.os.platform();
        switch (tauriOs) {
          case 'win32': os = 'windows'; break;
          case 'darwin': os = 'macos'; break;
          case 'linux': os = 'linux'; break;
          case 'android': os = 'android'; type = 'mobile'; break;
          case 'ios': os = 'ios'; type = 'mobile'; break;
        }
      } catch (error) {
        console.log('Tauri OS detection failed:', error);
      }
    }

    // Detect capabilities
    const capabilities = {
      notifications: 'Notification' in window,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocation: 'geolocation' in navigator,
      fileSystem: 'showOpenFilePicker' in window || isTauri,
      clipboard: 'clipboard' in navigator,
      multiWindow: isTauri || type === 'desktop'
    };

    return {
      type,
      os,
      isTauri,
      isOnline: navigator.onLine,
      capabilities
    };
  }


export async function requestPermissions() {
  const permissions = [];

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    permissions.push(Notification.requestPermission());
  }

  // Request camera permission (will be requested when needed)
  // Request geolocation permission (will be requested when needed)

  await Promise.all(permissions);
}