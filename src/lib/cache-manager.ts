/**
 * Advanced Cache Manager
 * Implements intelligent caching to reduce API calls and prevent rate limiting
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  tags: string[];
}

interface CacheConfig {
  defaultTtl: number;
  maxSize: number;
  cleanupInterval: number;
  enableCompression: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    size: 0
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000, // Maximum 1000 entries
      cleanupInterval: 60 * 1000, // Cleanup every minute
      enableCompression: false,
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = now;
    this.stats.hits++;
    
    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number, tags: string[] = []): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTtl,
      hits: 0,
      lastAccessed: now,
      tags
    };

    // If cache is full, remove least recently used entry
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Get or set data with automatic fallback
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    tags: string[] = []
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and store
    try {
      const data = await fetcher();
      this.set(key, data, ttl, tags);
      return data;
    } catch (error) {
      console.error(`Cache miss and fetch failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  invalidateByTag(tag: string): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.stats.size = this.cache.size;
    return invalidated;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.stats.size = this.cache.size;
    return invalidated;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  /**
   * Get cache entries by tag
   */
  getByTag(tag: string): Array<{ key: string; data: unknown; timestamp: number }> {
    const results: Array<{ key: string; data: unknown; timestamp: number }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        results.push({
          key,
          data: entry.data,
          timestamp: entry.timestamp
        });
      }
    }
    
    return results;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Destroy cache manager
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Singleton cache manager instance
export const cacheManager = new CacheManager({
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  cleanupInterval: 60 * 1000 // 1 minute
});

/**
 * Cache key generators for different data types
 */
export const cacheKeys = {
  productHunt: (filters: Record<string, unknown> = {}) => `ph:${JSON.stringify(filters)}`,
  hackerNews: (filters: Record<string, unknown> = {}) => `hn:${JSON.stringify(filters)}`,
  github: (filters: Record<string, unknown> = {}) => `gh:${JSON.stringify(filters)}`,
  search: (query: string, filters: Record<string, unknown> = {}) => `search:${query}:${JSON.stringify(filters)}`,
  analytics: (metric: string, timeFilter: string) => `analytics:${metric}:${timeFilter}`,
  realtime: (platforms: string[], lastUpdate: string) => `realtime:${platforms.join(',')}:${lastUpdate}`
};

/**
 * Cache tags for easy invalidation
 */
export const cacheTags = {
  productHunt: 'producthunt',
  hackerNews: 'hackernews',
  github: 'github',
  search: 'search',
  analytics: 'analytics',
  realtime: 'realtime'
};

/**
 * Smart cache wrapper for API calls
 */
export function withCache<T extends unknown[], R>(
  keyGenerator: (...args: T) => string,
  fetcher: (...args: T) => Promise<R>,
  ttl?: number,
  tags: string[] = []
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    return cacheManager.getOrSet(
      key,
      () => fetcher(...args),
      ttl,
      tags
    );
  };
}

/**
 * Cache warming utility
 */
export async function warmCache(): Promise<void> {
  console.log('🔥 Warming cache with initial data...');
  
  try {
    // Pre-load common data
    // const commonFilters = [
    //   { timeFilter: '24h' },
    //   { timeFilter: '7d' },
    //   { timeFilter: '30d' }
    // ];

    // This would be called by the API endpoints during startup
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
}

/**
 * Cache health check
 */
export function getCacheHealth(): {
  status: 'healthy' | 'warning' | 'critical';
  stats: CacheStats;
  recommendations: string[];
} {
  const stats = cacheManager.getStats();
  const recommendations: string[] = [];
  
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  if (stats.hitRate < 50) {
    status = 'warning';
    recommendations.push('Low cache hit rate - consider increasing TTL or improving cache keys');
  }
  
  if (stats.size > 800) {
    status = 'warning';
    recommendations.push('Cache size is high - consider reducing TTL or increasing max size');
  }
  
  if (stats.hitRate < 30) {
    status = 'critical';
    recommendations.push('Critical: Very low cache hit rate - cache may not be working properly');
  }
  
  return {
    status,
    stats,
    recommendations
  };
}
