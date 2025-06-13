import { writable } from 'svelte/store';
import { browser } from '$app/environment'

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface CheckInLocation {
  coordinates: LocationCoordinates;
  address?: string;
  timestamp: Date;
  notes?: string;
}

export class GeolocationManager {
  private isCapacitor = false;
  private watchId: number | null = null;

  constructor() {
    this.isCapacitor = browser ? window.Capacitor !== undefined : false;
  }

  async requestPermissions(): Promise<boolean> {
    if (this.isCapacitor) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permissions = await Geolocation.requestPermissions();
        return permissions.location === 'granted';
      } catch (error) {
        console.error('Failed to request location permissions:', error);
        return false;
      }
    } else if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 5000 }
        );
      });
    }
    return false;
  }

  async getCurrentPosition(): Promise<LocationCoordinates | null> {
    if (this.isCapacitor) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });

        return {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude,
          accuracy: coordinates.coords.accuracy,
          altitude: coordinates.coords.altitude || undefined,
          altitudeAccuracy: coordinates.coords.altitudeAccuracy || undefined,
          heading: coordinates.coords.heading || undefined,
          speed: coordinates.coords.speed || undefined
        };
      } catch (error) {
        console.error('Failed to get current position:', error);
        return null;
      }
    } else if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });
    }
    return null;
  }

  async startWatching(callback: (position: LocationCoordinates) => void): Promise<boolean> {
    if (this.watchId !== null) {
      this.stopWatching();
    }

    if (this.isCapacitor) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        this.watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000
          },
          (position) => {
            if (position) {
              callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined
              });
            }
          }
        );
        return true;
      } catch (error) {
        console.error('Failed to start watching position:', error);
        return false;
      }
    } else if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          });
        },
        (error) => {
          console.error('Geolocation watch error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
      return true;
    }
    return false;
  }

  stopWatching() {
    if (this.watchId !== null) {
      if (this.isCapacitor) {
        // Capacitor watch ID cleanup
        this.watchId = null;
      } else {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    }
  }

  async reverseGeocode(coordinates: LocationCoordinates): Promise<string | null> {
    try {
      // Using a free geocoding service (you might want to use a paid service for production)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name || data.locality || 'Unknown location';
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    return null;
  }

  async checkIn(notes?: string): Promise<CheckInLocation | null> {
    try {
      const coordinates = await this.getCurrentPosition();
      if (!coordinates) {
        throw new Error('Unable to get current location');
      }

      const address = await this.reverseGeocode(coordinates);
      
      const checkIn: CheckInLocation = {
        coordinates,
        address: address || undefined,
        timestamp: new Date(),
        notes
      };

      // Save check-in to local storage
      this.saveCheckIn(checkIn);
      
      return checkIn;
    } catch (error) {
      console.error('Check-in failed:', error);
      return null;
    }
  }

  private saveCheckIn(checkIn: CheckInLocation) {
    const checkIns = this.getCheckInHistory();
    checkIns.unshift(checkIn);
    
    // Keep only last 100 check-ins
    if (checkIns.length > 100) {
      checkIns.splice(100);
    }
    
    localStorage.setItem('sales-checkins', JSON.stringify(checkIns));
  }

  getCheckInHistory(): CheckInLocation[] {
    try {
      const stored = localStorage.getItem('sales-checkins');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load check-in history:', error);
      return [];
    }
  }

  calculateDistance(coord1: LocationCoordinates, coord2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  isSupported(): boolean {
    return this.isCapacitor || 'geolocation' in navigator;
  }

  async checkPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
    if (this.isCapacitor) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permissions = await Geolocation.checkPermissions();
        return permissions.location;
      } catch (error) {
        return 'denied';
      }
    } else if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state as 'granted' | 'denied' | 'prompt';
      } catch (error) {
        return 'prompt';
      }
    }
    return 'prompt';
  }
}

// Global geolocation manager instance
export const geolocationManager = new GeolocationManager();

// Svelte store for geolocation state
export const geolocationState = writable({
  isSupported: geolocationManager.isSupported(),
  hasPermission: false,
  currentPosition: null as LocationCoordinates | null,
  isWatching: false,
  checkInHistory: [] as CheckInLocation[]
});

// Initialize geolocation permissions on load
if (typeof window !== 'undefined') {
  geolocationManager.checkPermissions().then(status => {
    geolocationState.update(state => ({
      ...state,
      hasPermission: status === 'granted',
      checkInHistory: geolocationManager.getCheckInHistory()
    }));
  });
}