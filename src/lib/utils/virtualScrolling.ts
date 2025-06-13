import { writable, type Writable } from 'svelte/store';

export interface VirtualScrollItem {
  id: string | number;
  height?: number;
  data: any;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  overscan: number;
  containerHeight: number;
  estimatedItemHeight?: number;
}

export class VirtualScrollManager {
  private items: VirtualScrollItem[] = [];
  private config: VirtualScrollConfig;
  private scrollTop = 0;
  private visibleRange = writable({ start: 0, end: 0 });
  private totalHeight = writable(0);
  private itemHeights: Map<string | number, number> = new Map();

  constructor(config: VirtualScrollConfig) {
    this.config = config;
  }

  setItems(items: VirtualScrollItem[]) {
    this.items = items;
    this.calculateTotalHeight();
    this.updateVisibleRange();
  }

  updateScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
    this.updateVisibleRange();
  }

  updateItemHeight(id: string | number, height: number) {
    this.itemHeights.set(id, height);
    this.calculateTotalHeight();
    this.updateVisibleRange();
  }

  private calculateTotalHeight() {
    let total = 0;
    for (const item of this.items) {
      const height = this.itemHeights.get(item.id) || 
                    item.height || 
                    this.config.estimatedItemHeight || 
                    this.config.itemHeight;
      total += height;
    }
    this.totalHeight.set(total);
  }

  private updateVisibleRange() {
    const { containerHeight, overscan } = this.config;
    
    let currentTop = 0;
    let start = 0;
    let end = 0;

    // Find start index
    for (let i = 0; i < this.items.length; i++) {
      const height = this.getItemHeight(i);
      if (currentTop + height > this.scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      currentTop += height;
    }

    // Find end index
    currentTop = this.getOffsetTop(start);
    for (let i = start; i < this.items.length; i++) {
      const height = this.getItemHeight(i);
      if (currentTop > this.scrollTop + containerHeight) {
        end = Math.min(this.items.length - 1, i + overscan);
        break;
      }
      currentTop += height;
    }

    if (end === 0) {
      end = Math.min(this.items.length - 1, start + Math.ceil(containerHeight / this.config.itemHeight) + overscan);
    }

    this.visibleRange.set({ start, end });
  }

  private getItemHeight(index: number): number {
    const item = this.items[index];
    return this.itemHeights.get(item.id) || 
           item.height || 
           this.config.estimatedItemHeight || 
           this.config.itemHeight;
  }

  private getOffsetTop(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getItemHeight(i);
    }
    return offset;
  }

  getVisibleItems() {
    return this.visibleRange;
  }

  getTotalHeight() {
    return this.totalHeight;
  }

  getItemOffset(index: number): number {
    return this.getOffsetTop(index);
  }

  recalculate() {
    this.calculateTotalHeight();
    this.updateVisibleRange();
  }

  // Performance optimization: batch updates
  batchUpdate(updates: Array<{ id: string | number; height: number }>) {
    for (const update of updates) {
      this.itemHeights.set(update.id, update.height);
    }
    this.calculateTotalHeight();
    this.updateVisibleRange();
  }

  // Memory management
  cleanup() {
    this.itemHeights.clear();
    this.items = [];
  }
}

// Svelte store integration
export function createVirtualScrollStore(config: VirtualScrollConfig) {
  const manager = new VirtualScrollManager(config);
  
  return {
    manager,
    visibleItems: manager.getVisibleItems(),
    totalHeight: manager.getTotalHeight(),
    setItems: (items: VirtualScrollItem[]) => manager.setItems(items),
    updateScrollTop: (scrollTop: number) => manager.updateScrollTop(scrollTop),
    updateItemHeight: (id: string | number, height: number) => manager.updateItemHeight(id, height),
    recalculate: () => manager.recalculate(),
    cleanup: () => manager.cleanup()
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  startMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('longTask', entry.duration);
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.log('Long task monitoring not supported');
      }
    }

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('layoutShift', entry.value);
          if (entry.value > 0.1) {
            console.warn(`Layout shift detected: ${entry.value}`);
          }
        }
      });
      
      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (e) {
        console.log('Layout shift monitoring not supported');
      }
    }
  }

  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics() {
    const result: Record<string, { avg: number; max: number; count: number }> = {};
    
    for (const [name, values] of this.metrics) {
      result[name] = {
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        max: Math.max(...values),
        count: values.length
      };
    }
    
    return result;
  }

  // Memory usage monitoring (Chrome DevTools)
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Memory management utilities
export class MemoryManager {
  private cache: Map<string, { data: any; timestamp: number; size: number }> = new Map();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;

  set(key: string, data: any, estimatedSize?: number) {
    const size = estimatedSize || this.estimateSize(data);
    
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.currentCacheSize -= this.cache.get(key)!.size;
    }

    // Evict if necessary
    while (this.currentCacheSize + size > this.maxCacheSize && this.cache.size > 0) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size
    });
    this.currentCacheSize += size;
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      return entry.data;
    }
    return null;
  }

  delete(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentCacheSize -= entry.size;
      this.cache.delete(key);
    }
  }

  clear() {
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  private evictLRU() {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private estimateSize(obj: any): number {
    const str = JSON.stringify(obj);
    return str.length * 2; // Rough estimate: 2 bytes per character
  }

  getStats() {
    return {
      cacheSize: this.currentCacheSize,
      maxCacheSize: this.maxCacheSize,
      entryCount: this.cache.size,
      utilizationPercent: (this.currentCacheSize / this.maxCacheSize) * 100
    };
  }
}

// Global instances
export const performanceMonitor = new PerformanceMonitor();
export const memoryManager = new MemoryManager();