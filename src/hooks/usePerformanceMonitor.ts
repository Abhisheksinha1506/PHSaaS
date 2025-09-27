'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type: 'component' | 'api' | 'render' | 'user-interaction';
}

class FrontendPerformanceMonitor {
  private static instance: FrontendPerformanceMonitor;
  private entries: PerformanceEntry[] = [];
  private observers: ((entries: PerformanceEntry[]) => void)[] = [];

  static getInstance(): FrontendPerformanceMonitor {
    if (!FrontendPerformanceMonitor.instance) {
      FrontendPerformanceMonitor.instance = new FrontendPerformanceMonitor();
    }
    return FrontendPerformanceMonitor.instance;
  }

  startTiming(name: string, type: PerformanceEntry['type'] = 'component'): () => void {
    const startTime = performance.now();
    const entry: PerformanceEntry = {
      name,
      startTime,
      type
    };

    return () => {
      const endTime = performance.now();
      entry.endTime = endTime;
      entry.duration = endTime - startTime;
      
      this.entries.push(entry);
      this.notifyObservers();
      
      console.log(`⏱️ Frontend ${type}: ${name} - ${entry.duration.toFixed(2)}ms`);
    };
  }

  measureComponent(name: string, fn: () => void): void {
    const endTiming = this.startTiming(name, 'component');
    fn();
    endTiming();
  }

  measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const endTiming = this.startTiming(name, 'api');
    
    return apiCall()
      .then(result => {
        endTiming();
        return result;
      })
      .catch(error => {
        endTiming();
        throw error;
      });
  }

  measureRender(name: string, fn: () => void): void {
    const endTiming = this.startTiming(name, 'render');
    fn();
    endTiming();
  }

  subscribe(callback: (entries: PerformanceEntry[]) => void): () => void {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback([...this.entries]));
  }

  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  getBottlenecks(): PerformanceEntry[] {
    return this.entries
      .filter(entry => entry.duration && entry.duration > 100) // More than 100ms
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }

  clear(): void {
    this.entries = [];
    this.notifyObservers();
  }
}

export const frontendPerformanceMonitor = FrontendPerformanceMonitor.getInstance();

export function usePerformanceMonitor() {
  const entries = useRef<PerformanceEntry[]>([]);
  const [bottlenecks, setBottlenecks] = useState<PerformanceEntry[]>([]);

  useEffect(() => {
    const unsubscribe = frontendPerformanceMonitor.subscribe((newEntries) => {
      entries.current = newEntries;
      setBottlenecks(frontendPerformanceMonitor.getBottlenecks());
    });

    return unsubscribe;
  }, []);

  const measureComponent = useCallback((name: string, fn: () => void) => {
    frontendPerformanceMonitor.measureComponent(name, fn);
  }, []);

  const measureApiCall = useCallback(<T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
    return frontendPerformanceMonitor.measureApiCall(name, apiCall);
  }, []);

  const measureRender = useCallback((name: string, fn: () => void) => {
    frontendPerformanceMonitor.measureRender(name, fn);
  }, []);

  const clearMetrics = useCallback(() => {
    frontendPerformanceMonitor.clear();
  }, []);

  return {
    entries: entries.current,
    bottlenecks,
    measureComponent,
    measureApiCall,
    measureRender,
    clearMetrics
  };
}

// Hook for measuring component render times
export function useRenderTiming(componentName: string) {
  const renderStart = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    if (renderStart.current > 0) {
      const renderTime = performance.now() - renderStart.current;
      console.log(`🎨 Render: ${componentName} - ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 100) {
        console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    }
  });
}

// Hook for measuring API call performance
export function useApiTiming() {
  const measureApiCall = useCallback(<T>(
    name: string, 
    apiCall: () => Promise<T>
  ): Promise<T> => {
    return frontendPerformanceMonitor.measureApiCall(name, apiCall);
  }, []);

  return { measureApiCall };
}
