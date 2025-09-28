interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class APICache {
  private static instance: APICache;
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= (options.maxSize || this.maxSize)) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey!);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    console.log(`💾 Cached: ${key} (TTL: ${ttl}ms)`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      console.log(`⏰ Cache expired: ${key}`);
      return null;
    }

    console.log(`✅ Cache hit: ${key} (age: ${now - entry.timestamp}ms)`);
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; entries: Array<{ key: string; age: number; ttl: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }));

    return { size: this.cache.size, entries };
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }

    return cleaned;
  }
}

export const apiCache = APICache.getInstance();

// Cache key generators
export const cacheKeys = {
  productHunt: (timeFilter?: string) => `ph:${timeFilter || 'default'}`,
  hackerNews: (timeFilter?: string) => `hn:${timeFilter || 'default'}`,
  saashub: (timeFilter?: string) => `gh:${timeFilter || 'default'}`,
  analytics: (metric: string, timeFilter: string) => `analytics:${metric}:${timeFilter}`
};

// Cache TTL configurations
export const cacheTTL = {
  productHunt: 10 * 60 * 1000, // 10 minutes
  hackerNews: 5 * 60 * 1000,   // 5 minutes
  saashub: 15 * 60 * 1000,     // 15 minutes
  analytics: 2 * 60 * 1000      // 2 minutes
};

// Utility function to wrap API calls with caching
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Try to get from cache first
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  console.log(`🔄 Fetching fresh data for: ${key}`);
  const data = await fetcher();
  
  // Cache the result
  apiCache.set(key, data, { ttl });
  
  return data;
}
