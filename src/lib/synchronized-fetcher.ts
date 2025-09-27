/**
 * Synchronized API Fetcher
 * Ensures all APIs fetch simultaneously with consistent timing and error handling
 */

import { apiManager } from './api-manager';
import { rateLimiter } from './rate-limiter';
import { cacheManager } from './cache-manager';

interface FetchConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  enableCaching: boolean;
  enableRateLimiting: boolean;
  fallbackToMock: boolean;
}

interface SynchronizedResult<T> {
  data: T;
  success: boolean;
  fromCache: boolean;
  responseTime: number;
  apiName: string;
  error?: string;
  rateLimitStatus?: any;
}

interface BatchFetchResult {
  productHunt: SynchronizedResult<any[]>;
  hackerNews: SynchronizedResult<any[]>;
  github: SynchronizedResult<any[]>;
  totalTime: number;
  successCount: number;
  errorCount: number;
  fromCacheCount: number;
  timestamp: string;
}

class SynchronizedFetcher {
  private config: FetchConfig;
  private activeFetches = new Map<string, Promise<any>>();

  constructor(config: Partial<FetchConfig> = {}) {
    this.config = {
      timeout: 10000, // 10 seconds timeout
      retries: 3,
      retryDelay: 1000,
      enableCaching: true,
      enableRateLimiting: true,
      fallbackToMock: true,
      ...config
    };
  }

  /**
   * Fetch all APIs simultaneously with synchronization
   */
  async fetchAllAPIs(filters: any = {}): Promise<BatchFetchResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log('🚀 Starting synchronized API fetch...');
    
    // Create fetch promises for all APIs
    const fetchPromises = {
      productHunt: this.fetchWithSynchronization('producthunt', () => 
        apiManager.fetchProductHuntPosts(filters)
      ),
      hackerNews: this.fetchWithSynchronization('hackernews', () => 
        apiManager.fetchHackerNewsPosts(filters)
      ),
      github: this.fetchWithSynchronization('github', () => 
        apiManager.fetchSaaSHubAlternatives(filters)
      )
    };

    // Wait for all APIs to complete (or timeout)
    const results = await Promise.allSettled([
      fetchPromises.productHunt,
      fetchPromises.hackerNews,
      fetchPromises.github
    ]);

    const [phResult, hnResult, ghResult] = results;
    
    // Process results
    const productHunt = this.processResult(phResult, 'producthunt');
    const hackerNews = this.processResult(hnResult, 'hackernews');
    const github = this.processResult(ghResult, 'github');

    const totalTime = Date.now() - startTime;
    const successCount = [productHunt, hackerNews, github].filter(r => r.success).length;
    const errorCount = [productHunt, hackerNews, github].filter(r => !r.success).length;
    const fromCacheCount = [productHunt, hackerNews, github].filter(r => r.fromCache).length;

    console.log(`✅ Synchronized fetch completed in ${totalTime}ms`);
    console.log(`📊 Results: ${successCount} success, ${errorCount} errors, ${fromCacheCount} from cache`);

    return {
      productHunt,
      hackerNews,
      github,
      totalTime,
      successCount,
      errorCount,
      fromCacheCount,
      timestamp
    };
  }

  /**
   * Fetch specific APIs with synchronization
   */
  async fetchSpecificAPIs(apis: string[], filters: any = {}): Promise<Partial<BatchFetchResult>> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`🎯 Fetching specific APIs: ${apis.join(', ')}`);
    
    const fetchPromises: Record<string, Promise<any>> = {};
    
    if (apis.includes('producthunt')) {
      fetchPromises.productHunt = this.fetchWithSynchronization('producthunt', () => 
        apiManager.fetchProductHuntPosts(filters)
      );
    }
    
    if (apis.includes('hackernews')) {
      fetchPromises.hackerNews = this.fetchWithSynchronization('hackernews', () => 
        apiManager.fetchHackerNewsPosts(filters)
      );
    }
    
    if (apis.includes('github')) {
      fetchPromises.github = this.fetchWithSynchronization('github', () => 
        apiManager.fetchSaaSHubAlternatives(filters)
      );
    }

    // Wait for all specified APIs
    const results = await Promise.allSettled(Object.values(fetchPromises));
    
    const processedResults: any = {};
    let resultIndex = 0;
    
    if (apis.includes('producthunt')) {
      processedResults.productHunt = this.processResult(results[resultIndex++], 'producthunt');
    }
    
    if (apis.includes('hackernews')) {
      processedResults.hackerNews = this.processResult(results[resultIndex++], 'hackernews');
    }
    
    if (apis.includes('github')) {
      processedResults.github = this.processResult(results[resultIndex++], 'github');
    }

    const totalTime = Date.now() - startTime;
    const successCount = Object.values(processedResults).filter((r: any) => r.success).length;
    const errorCount = Object.values(processedResults).filter((r: any) => !r.success).length;
    const fromCacheCount = Object.values(processedResults).filter((r: any) => r.fromCache).length;

    return {
      ...processedResults,
      totalTime,
      successCount,
      errorCount,
      fromCacheCount,
      timestamp
    };
  }

  /**
   * Fetch with synchronization and deduplication
   */
  private async fetchWithSynchronization<T>(
    apiName: string, 
    fetcher: () => Promise<T>
  ): Promise<SynchronizedResult<T>> {
    const cacheKey = `sync:${apiName}:${JSON.stringify(arguments)}`;
    
    // Check if there's already an active fetch for this API
    if (this.activeFetches.has(cacheKey)) {
      console.log(`⏳ Waiting for existing ${apiName} fetch...`);
      return this.activeFetches.get(cacheKey)!;
    }

    // Create new fetch promise
    const fetchPromise = this.executeFetch(apiName, fetcher);
    this.activeFetches.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      // Clean up active fetch
      this.activeFetches.delete(cacheKey);
    }
  }

  /**
   * Execute the actual fetch with timeout and retry logic
   */
  private async executeFetch<T>(
    apiName: string,
    fetcher: () => Promise<T>
  ): Promise<SynchronizedResult<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`🔄 ${apiName} fetch attempt ${attempt}/${this.config.retries}`);
        
        // Check rate limits before making the call
        if (this.config.enableRateLimiting) {
          const canCall = rateLimiter.canMakeCall(apiName);
          if (!canCall.allowed) {
            throw new Error(`Rate limit exceeded: ${canCall.reason}`);
          }
        }

        // Execute fetch with timeout
        const result = await Promise.race([
          fetcher(),
          this.createTimeoutPromise(this.config.timeout)
        ]);

        const responseTime = Date.now() - startTime;
        console.log(`✅ ${apiName} fetch successful in ${responseTime}ms`);

        return {
          data: result,
          success: true,
          fromCache: false, // Will be updated by apiManager
          responseTime,
          apiName,
          rateLimitStatus: this.config.enableRateLimiting ? rateLimiter.getStatus(apiName) : undefined
        };

      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ ${apiName} fetch attempt ${attempt} failed:`, error);
        
        // Don't retry on rate limit errors
        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
          break;
        }
        
        // Wait before retry
        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    // All retries failed
    const responseTime = Date.now() - startTime;
    console.error(`💥 ${apiName} fetch failed after ${this.config.retries} attempts:`, lastError);

    return {
      data: [] as T,
      success: false,
      fromCache: false,
      responseTime,
      apiName,
      error: lastError?.message || 'Unknown error',
      rateLimitStatus: this.config.enableRateLimiting ? rateLimiter.getStatus(apiName) : undefined
    };
  }

  /**
   * Process Promise.allSettled result
   */
  private processResult<T>(
    result: PromiseSettledResult<any>,
    apiName: string
  ): SynchronizedResult<T> {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        data: [] as T,
        success: false,
        fromCache: false,
        responseTime: 0,
        apiName,
        error: result.reason?.message || 'Promise rejected'
      };
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get active fetches status
   */
  getActiveFetchesStatus(): { apiName: string; startTime: number }[] {
    return Array.from(this.activeFetches.entries()).map(([key, promise]) => ({
      apiName: key.split(':')[1],
      startTime: Date.now() // Simplified - in real implementation, track actual start time
    }));
  }

  /**
   * Cancel all active fetches
   */
  cancelAllFetches(): void {
    console.log(`🛑 Cancelling ${this.activeFetches.size} active fetches`);
    this.activeFetches.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FetchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Synchronized fetcher config updated:', this.config);
  }
}

// Singleton instance
export const synchronizedFetcher = new SynchronizedFetcher();

/**
 * Utility function for easy usage
 */
export async function fetchAllAPIsSynchronized(filters: any = {}): Promise<BatchFetchResult> {
  return synchronizedFetcher.fetchAllAPIs(filters);
}

/**
 * Utility function for specific APIs
 */
export async function fetchSpecificAPIsSynchronized(
  apis: string[], 
  filters: any = {}
): Promise<Partial<BatchFetchResult>> {
  return synchronizedFetcher.fetchSpecificAPIs(apis, filters);
}

/**
 * Get synchronization status
 */
export function getSynchronizationStatus(): {
  activeFetches: number;
  activeAPIs: string[];
  config: FetchConfig;
} {
  const activeFetches = synchronizedFetcher.getActiveFetchesStatus();
  
  return {
    activeFetches: activeFetches.length,
    activeAPIs: activeFetches.map(f => f.apiName),
    config: synchronizedFetcher['config']
  };
}
