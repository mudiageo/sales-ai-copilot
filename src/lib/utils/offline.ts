import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface OfflineData {
  leads: any[];
  activities: any[];
  notes: any[];
  lastSync: string | null;
}

export const isOffline = writable(false);
export const offlineQueue = writable<any[]>([]);

const STORAGE_KEY = 'ai-sales-copilot-offline';

export function initializeOfflineStorage() {
  if (!browser) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialData: OfflineData = {
      leads: [],
      activities: [],
      notes: [],
      lastSync: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }

  // Set up online/offline listeners
  const updateOnlineStatus = () => {
    isOffline.set(!navigator.onLine);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial status
  updateOnlineStatus();
}

export function saveOfflineData(type: keyof OfflineData, data: any) {
  if (!browser) return;

  const stored = getOfflineData();
  if (type !== 'lastSync') {
    (stored[type] as any[]).push({
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      synced: false
    });
  } else {
    stored[type] = data;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function getOfflineData(): OfflineData {
  if (!browser) return { leads: [], activities: [], notes: [], lastSync: null };

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { leads: [], activities: [], notes: [], lastSync: null };
}

export function clearOfflineData() {
  if (!browser) return;

  const initialData: OfflineData = {
    leads: [],
    activities: [],
    notes: [],
    lastSync: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
}

export async function syncOfflineData() {
  if (!browser || !navigator.onLine) return;

  const data = getOfflineData();
  const unsyncedItems = [
    ...data.leads.filter(item => !item.synced),
    ...data.activities.filter(item => !item.synced),
    ...data.notes.filter(item => !item.synced)
  ];

  if (unsyncedItems.length === 0) return;

  try {
    // Simulate API sync
    for (const item of unsyncedItems) {
      // await api.sync(item);
      console.log('Syncing item:', item);
    }

    // Clear synced data
    clearOfflineData();
    
    return { success: true, synced: unsyncedItems.length };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error };
  }
}

export function addToOfflineQueue(action: any) {
  offlineQueue.update(queue => [...queue, {
    ...action,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  }]);
}

export async function processOfflineQueue() {
  if (!navigator.onLine) return;

  offlineQueue.update(queue => {
    // Process queue items
    queue.forEach(async (item) => {
      try {
        // await api.processAction(item);
        console.log('Processing queued action:', item);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    });
    
    return []; // Clear queue after processing
  });
}