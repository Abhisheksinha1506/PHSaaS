/**
 * React Hook for Synchronized API Fetching
 * Ensures all APIs fetch simultaneously with consistent loading states
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SynchronizedFetchState {
  data: {
    productHunt: unknown[];
    hackerNews: unknown[];
    github: unknown[];
  };
  loading: boolean;
  error: string | null;
  successCount: number;
  errorCount: number;
  fromCacheCount: number;
  totalTime: number;
  lastFetch: string | null;
  fromCache: boolean;
}

interface SynchronizedFetchOptions {
  platforms?: string[];
  timeFilter?: '24h' | '7d' | '30d';
  autoRefresh?: boolean;
  refreshInterval?: number;
  forceRefresh?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useSynchronizedFetch(options: SynchronizedFetchOptions = {}) {
  const {
    platforms = ['producthunt', 'hackernews', 'github'],
    timeFilter = '7d',
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    forceRefresh = false,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<SynchronizedFetchState>({
    data: {
      productHunt: [],
      hackerNews: [],
      github: []
    },
    loading: false,
    error: null,
    successCount: 0,
    errorCount: 0,
    fromCacheCount: 0,
    totalTime: 0,
    lastFetch: null,
    fromCache: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch data function
  const fetchData = useCallback(async (_isRefresh = false) => {
    if (!isMountedRef.current) return;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const params = new URLSearchParams({
        platforms: platforms.join(','),
        timeFilter,
        includeMetadata: 'true',
        ...(forceRefresh && { forceRefresh: 'true' })
      });

      console.log(`🔄 Synchronized fetch: ${platforms.join(', ')}`);
      const startTime = Date.now();

      const response = await fetch(`/api/synchronized?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const fetchTime = Date.now() - startTime;

      if (!isMountedRef.current) return;

      setState(prev => ({
        ...prev,
        data: {
          productHunt: result.productHunt?.data || [],
          hackerNews: result.hackerNews?.data || [],
          github: result.github?.data || []
        },
        loading: false,
        error: null,
        successCount: result.successCount || 0,
        errorCount: result.errorCount || 0,
        fromCacheCount: result.fromCacheCount || 0,
        totalTime: result.totalTime || fetchTime,
        lastFetch: new Date().toISOString(),
        fromCache: result.fromCache || false
      }));

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      console.log(`✅ Synchronized fetch completed in ${fetchTime}ms`);
      console.log(`📊 Results: ${result.successCount} success, ${result.errorCount} errors`);

    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        lastFetch: new Date().toISOString()
      }));

      console.error('❌ Synchronized fetch failed:', error);
      
      // Call error callback
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [platforms, timeFilter, forceRefresh, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Force refresh function
  const forceRefreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Get loading status for specific platforms
  const getLoadingStatus = useCallback((_platform: string) => {
    return state.loading;
  }, [state.loading]);

  // Get error status for specific platforms
  const getErrorStatus = useCallback((_platform: string) => {
    return state.error;
  }, [state.error]);

  // Get data for specific platform
  const getPlatformData = useCallback((platform: string) => {
    switch (platform) {
      case 'producthunt':
        return state.data.productHunt;
      case 'hackernews':
        return state.data.hackerNews;
      case 'github':
        return state.data.github;
      default:
        return [];
    }
  }, [state.data]);

  return {
    // Data
    data: state.data,
    productHunt: state.data.productHunt,
    hackerNews: state.data.hackerNews,
    github: state.data.github,
    
    // Loading states
    loading: state.loading,
    isLoading: state.loading,
    
    // Error states
    error: state.error,
    hasError: !!state.error,
    
    // Metadata
    successCount: state.successCount,
    errorCount: state.errorCount,
    fromCacheCount: state.fromCacheCount,
    totalTime: state.totalTime,
    lastFetch: state.lastFetch,
    fromCache: state.fromCache,
    
    // Actions
    refresh,
    forceRefresh: forceRefreshData,
    
    // Utilities
    getLoadingStatus,
    getErrorStatus,
    getPlatformData,
    
    // Status helpers
    isFullyLoaded: state.successCount === platforms.length,
    isPartiallyLoaded: state.successCount > 0 && state.successCount < platforms.length,
    isFullyFailed: state.errorCount === platforms.length,
    hasAnyData: state.data.productHunt.length > 0 || state.data.hackerNews.length > 0 || state.data.github.length > 0
  };
}

/**
 * Hook for fetching specific platforms only
 */
export function usePlatformFetch(platforms: string[], options: Omit<SynchronizedFetchOptions, 'platforms'> = {}) {
  return useSynchronizedFetch({
    ...options,
    platforms
  });
}

/**
 * Hook for real-time updates with synchronized fetching
 */
export function useRealtimeSynchronizedFetch(options: SynchronizedFetchOptions = {}) {
  return useSynchronizedFetch({
    ...options,
    autoRefresh: true,
    refreshInterval: 2 * 60 * 1000, // 2 minutes for real-time
    forceRefresh: true
  });
}
