import { writable } from 'svelte/store';
import { browser } from '$app/environment'

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: 'uri' | 'base64';
  source?: 'camera' | 'photos' | 'prompt';
}

export interface BusinessCard {
  name?: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export class CameraManager {
  private isCapacitor = false;
  private isSupported = false;

  constructor() {
    this.isCapacitor = browser ? window.Capacitor !== undefined : false;
    this.isSupported = browser ? this.isCapacitor || ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) : false;
  }

  async requestPermissions(): Promise<boolean> {
    if (this.isCapacitor) {
      try {
        const { Camera } = await import('@capacitor/camera');
        const permissions = await Camera.requestPermissions();
        return permissions.camera === 'granted';
      } catch (error) {
        console.error('Failed to request camera permissions:', error);
        return false;
      }
    } else if ('mediaDevices' in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (error) {
        console.error('Camera permission denied:', error);
        return false;
      }
    }
    return false;
  }

  async takePicture(options: CameraOptions = {}): Promise<string | null> {
    if (!this.isSupported) {
      throw new Error('Camera not supported on this device');
    }

    if (this.isCapacitor) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: options.allowEditing || false,
          resultType: options.resultType === 'base64' ? CameraResultType.Base64 : CameraResultType.Uri,
          source: options.source === 'photos' ? CameraSource.Photos : 
                  options.source === 'camera' ? CameraSource.Camera : CameraSource.Prompt,
        });

        return options.resultType === 'base64' ? image.base64String || null : image.webPath || null;
      } catch (error) {
        console.error('Failed to take picture:', error);
        return null;
      }
    } else {
      // Web fallback using file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          } else {
            resolve(null);
          }
        };
        
        input.click();
      });
    }
  }

  async scanBusinessCard(): Promise<BusinessCard | null> {
    try {
      const imageUri = await this.takePicture({
        quality: 100,
        resultType: 'base64',
        source: 'camera'
      });

      if (!imageUri) {
        return null;
      }

      // Process the image with OCR
      const businessCard = await this.processBusinessCardImage(imageUri);
      return businessCard;
    } catch (error) {
      console.error('Business card scanning failed:', error);
      return null;
    }
  }

  private async processBusinessCardImage(imageData: string): Promise<BusinessCard> {
    // Simulate OCR processing
    // In a real implementation, you would use a service like Google Vision API, AWS Textract, or Azure Computer Vision
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    // Mock extracted data
    const mockData: BusinessCard = {
      name: 'John Smith',
      company: 'Tech Solutions Inc.',
      title: 'Senior Sales Manager',
      email: 'john.smith@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business Ave, Suite 100, City, ST 12345',
      website: 'www.techsolutions.com'
    };

    return mockData;
  }

  async processImageWithOCR(imageData: string): Promise<string> {
    // This would integrate with an OCR service
    // For now, return mock text
    return "Sample extracted text from image";
  }

  // isSupported(): boolean {
  //   return this.isSupported;
  // }

  async checkPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
    if (this.isCapacitor) {
      try {
        const { Camera } = await import('@capacitor/camera');
        const permissions = await Camera.checkPermissions();
        return permissions.camera;
      } catch (error) {
        return 'denied';
      }
    } else if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return result.state as 'granted' | 'denied' | 'prompt';
      } catch (error) {
        return 'prompt';
      }
    }
    return 'prompt';
  }
}

// Global camera manager instance
export const cameraManager = new CameraManager();

// Svelte store for camera state
export const cameraState = writable({
  isSupported: cameraManager.isSupported,
  hasPermission: false,
  isScanning: false,
  lastScanResult: null as BusinessCard | null
});

// Initialize camera permissions on load
if (typeof window !== 'undefined') {
  cameraManager.checkPermissions().then(status => {
    cameraState.update(state => ({
      ...state,
      hasPermission: status === 'granted'
    }));
  });
}