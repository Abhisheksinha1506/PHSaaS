/**
 * Rate Limiter for API Calls
 * Prevents hitting external API rate limits by implementing intelligent throttling
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

interface ApiCall {
  timestamp: number;
  success: boolean;
  responseTime: number;
}

interface RateLimitState {
  calls: ApiCall[];
  isThrottled: boolean;
  throttleUntil: number;
  consecutiveFailures: number;
  lastSuccessfulCall: number;
}

class RateLimiter {
  private state: Map<string, RateLimitState> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Configure rate limits for different APIs
    this.configs.set('producthunt', {
      maxRequests: 100, // 100 requests per hour
      windowMs: 60 * 60 * 1000, // 1 hour
      retryAfterMs: 5 * 60 * 1000, // 5 minutes
      backoffMultiplier: 2,
      maxBackoffMs: 30 * 60 * 1000 // 30 minutes max
    });

    this.configs.set('hackernews', {
      maxRequests: 1000, // 1000 requests per hour
      windowMs: 60 * 60 * 1000, // 1 hour
      retryAfterMs: 1 * 60 * 1000, // 1 minute
      backoffMultiplier: 1.5,
      maxBackoffMs: 10 * 60 * 1000 // 10 minutes max
    });

    this.configs.set('github', {
      maxRequests: 5000, // 5000 requests per hour
      windowMs: 60 * 60 * 1000, // 1 hour
      retryAfterMs: 1 * 60 * 1000, // 1 minute
      backoffMultiplier: 1.2,
      maxBackoffMs: 5 * 60 * 1000 // 5 minutes max
    });
  }

  /**
   * Check if an API call is allowed
   */
  canMakeCall(apiName: string): { allowed: boolean; retryAfter?: number; reason?: string } {
    const config = this.configs.get(apiName);
    if (!config) {
      return { allowed: true }; // No limits for unknown APIs
    }

    const state = this.getOrCreateState(apiName);
    const now = Date.now();

    // Check if currently throttled
    if (state.isThrottled && now < state.throttleUntil) {
      return {
        allowed: false,
        retryAfter: state.throttleUntil - now,
        reason: 'Currently throttled due to rate limiting'
      };
    }

    // Clean old calls outside the window
    const windowStart = now - config.windowMs;
    state.calls = state.calls.filter(call => call.timestamp > windowStart);

    // Check if we've exceeded the rate limit
    if (state.calls.length >= config.maxRequests) {
      const oldestCall = Math.min(...state.calls.map(call => call.timestamp));
      const retryAfter = oldestCall + config.windowMs - now;
      
      return {
        allowed: false,
        retryAfter: Math.max(retryAfter, config.retryAfterMs),
        reason: `Rate limit exceeded: ${state.calls.length}/${config.maxRequests} calls in window`
      };
    }

    return { allowed: true };
  }

  /**
   * Record an API call result
   */
  recordCall(apiName: string, success: boolean, responseTime: number): void {
    const state = this.getOrCreateState(apiName);
    const config = this.configs.get(apiName);
    
    if (!config) return;

    const now = Date.now();
    
    // Record the call
    state.calls.push({
      timestamp: now,
      success,
      responseTime
    });

    // Update state based on success/failure
    if (success) {
      state.consecutiveFailures = 0;
      state.lastSuccessfulCall = now;
      state.isThrottled = false;
    } else {
      state.consecutiveFailures++;
      
      // Implement exponential backoff for failures
      if (state.consecutiveFailures >= 3) {
        const backoffTime = Math.min(
          config.retryAfterMs * Math.pow(config.backoffMultiplier, state.consecutiveFailures - 3),
          config.maxBackoffMs
        );
        
        state.isThrottled = true;
        state.throttleUntil = now + backoffTime;
        
        console.warn(`🚨 API ${apiName} is being throttled for ${backoffTime}ms due to ${state.consecutiveFailures} consecutive failures`);
      }
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(apiName: string): {
    callsInWindow: number;
    maxCalls: number;
    isThrottled: boolean;
    throttleUntil?: number;
    consecutiveFailures: number;
    lastSuccessfulCall?: number;
  } {
    const state = this.getOrCreateState(apiName);
    const config = this.configs.get(apiName);
    const now = Date.now();

    // Clean old calls
    if (config) {
      const windowStart = now - config.windowMs;
      state.calls = state.calls.filter(call => call.timestamp > windowStart);
    }

    return {
      callsInWindow: state.calls.length,
      maxCalls: config?.maxRequests || 0,
      isThrottled: state.isThrottled && now < state.throttleUntil,
      throttleUntil: state.isThrottled ? state.throttleUntil : undefined,
      consecutiveFailures: state.consecutiveFailures,
      lastSuccessfulCall: state.lastSuccessfulCall || undefined
    };
  }

  /**
   * Reset rate limiter for an API
   */
  reset(apiName: string): void {
    this.state.delete(apiName);
  }

  /**
   * Get or create state for an API
   */
  private getOrCreateState(apiName: string): RateLimitState {
    if (!this.state.has(apiName)) {
      this.state.set(apiName, {
        calls: [],
        isThrottled: false,
        throttleUntil: 0,
        consecutiveFailures: 0,
        lastSuccessfulCall: 0
      });
    }
    return this.state.get(apiName)!;
  }

  /**
   * Get all API statuses
   */
  getAllStatuses(): Record<string, ReturnType<RateLimiter['getStatus']>> {
    const statuses: Record<string, ReturnType<RateLimiter['getStatus']>> = {};
    
    for (const apiName of this.configs.keys()) {
      statuses[apiName] = this.getStatus(apiName);
    }
    
    return statuses;
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Decorator function to wrap API calls with rate limiting
 */
export function withRateLimit<T extends unknown[], R>(
  apiName: string,
  apiFunction: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const canCall = rateLimiter.canMakeCall(apiName);
    
    if (!canCall.allowed) {
      throw new Error(`Rate limit exceeded for ${apiName}. ${canCall.reason}. Retry after ${canCall.retryAfter}ms`);
    }

    const startTime = Date.now();
    let success = false;
    let result: R;

    try {
      result = await apiFunction(...args);
      success = true;
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const responseTime = Date.now() - startTime;
      rateLimiter.recordCall(apiName, success, responseTime);
    }
  };
}

/**
 * Utility function to check if we should use cached data instead of making API calls
 */
export function shouldUseCache(apiName: string, cacheAge: number, maxCacheAge: number = 5 * 60 * 1000): boolean {
  const status = rateLimiter.getStatus(apiName);
  
  // Use cache if:
  // 1. We're currently throttled
  // 2. Cache is still fresh (less than maxCacheAge)
  // 3. We're approaching rate limits (80% of max calls)
  const isApproachingLimit = status.callsInWindow >= (status.maxCalls * 0.8);
  
  return status.isThrottled || cacheAge < maxCacheAge || isApproachingLimit;
}

/**
 * Get rate limit recommendations
 */
export function getRateLimitRecommendations(): {
  producthunt: string;
  hackernews: string;
  github: string;
} {
  const statuses = rateLimiter.getAllStatuses();
  
  return {
    producthunt: statuses.producthunt.isThrottled 
      ? `Throttled until ${new Date(statuses.producthunt.throttleUntil!).toLocaleTimeString()}`
      : `${statuses.producthunt.callsInWindow}/${statuses.producthunt.maxCalls} calls used`,
    
    hackernews: statuses.hackernews.isThrottled 
      ? `Throttled until ${new Date(statuses.hackernews.throttleUntil!).toLocaleTimeString()}`
      : `${statuses.hackernews.callsInWindow}/${statuses.hackernews.maxCalls} calls used`,
    
    github: statuses.github.isThrottled 
      ? `Throttled until ${new Date(statuses.github.throttleUntil!).toLocaleTimeString()}`
      : `${statuses.github.callsInWindow}/${statuses.github.maxCalls} calls used`
  };
}
