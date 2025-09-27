/**
 * Enhanced API Manager
 * Centralized API management with rate limiting, caching, and intelligent fallbacks
 */

import { rateLimiter, withRateLimit, shouldUseCache } from './rate-limiter';
import { cacheManager, cacheKeys, cacheTags, withCache } from './cache-manager';
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from '@/types';

interface ApiResponse<T> {
  data: T;
  fromCache: boolean;
  cacheAge?: number;
  rateLimitStatus: {
    callsRemaining: number;
    resetTime: number;
    isThrottled: boolean;
  };
  metadata: {
    timestamp: number;
    responseTime: number;
    apiName: string;
  };
}

interface ApiConfig {
  enableCaching: boolean;
  enableRateLimiting: boolean;
  fallbackToMock: boolean;
  maxRetries: number;
  retryDelay: number;
}

class ApiManager {
  private config: ApiConfig;
  private retryCounts = new Map<string, number>();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableRateLimiting: true,
      fallbackToMock: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Enhanced Product Hunt API with rate limiting and caching
   */
  async fetchProductHuntPosts(filters: any = {}): Promise<ApiResponse<ProductHuntPost[]>> {
    const apiName = 'producthunt';
    const cacheKey = cacheKeys.productHunt(filters);
    const startTime = Date.now();

    // Check cache first
    if (this.config.enableCaching) {
      const cached = cacheManager.get<ProductHuntPost[]>(cacheKey);
      if (cached) {
        const cacheAge = Date.now() - (cacheManager.getByTag(cacheTags.productHunt)[0]?.timestamp || 0);
        
        if (shouldUseCache(apiName, cacheAge)) {
          return {
            data: cached,
            fromCache: true,
            cacheAge,
            rateLimitStatus: this.getRateLimitStatus(apiName),
            metadata: {
              timestamp: Date.now(),
              responseTime: Date.now() - startTime,
              apiName
            }
          };
        }
      }
    }

    // Check rate limits
    if (this.config.enableRateLimiting) {
      const canCall = rateLimiter.canMakeCall(apiName);
      if (!canCall.allowed) {
        console.warn(`🚨 Rate limit exceeded for ${apiName}: ${canCall.reason}`);
        
        if (this.config.fallbackToMock) {
          return this.getFallbackResponse(apiName, this.getMockProductHuntData(), startTime);
        }
        
        throw new Error(`Rate limit exceeded: ${canCall.reason}`);
      }
    }

    try {
      // Make the actual API call
      const data = await this.makeProductHuntCall();
      
      // Cache the result
      if (this.config.enableCaching) {
        cacheManager.set(cacheKey, data, 5 * 60 * 1000, [cacheTags.productHunt]);
      }

      // Record successful call
      if (this.config.enableRateLimiting) {
        rateLimiter.recordCall(apiName, true, Date.now() - startTime);
      }

      return {
        data,
        fromCache: false,
        rateLimitStatus: this.getRateLimitStatus(apiName),
        metadata: {
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
          apiName
        }
      };

    } catch (error) {
      console.error(`❌ Product Hunt API call failed:`, error);
      
      // Record failed call
      if (this.config.enableRateLimiting) {
        rateLimiter.recordCall(apiName, false, Date.now() - startTime);
      }

      // Retry logic
      if (this.shouldRetry(apiName)) {
        console.log(`🔄 Retrying ${apiName} API call...`);
        await this.delay(this.config.retryDelay);
        return this.fetchProductHuntPosts(filters);
      }

      // Fallback to mock data
      if (this.config.fallbackToMock) {
        console.log(`🔄 Falling back to mock data for ${apiName}`);
        return this.getFallbackResponse(apiName, this.getMockProductHuntData(), startTime);
      }

      throw error;
    }
  }

  /**
   * Enhanced Hacker News API
   */
  async fetchHackerNewsPosts(filters: any = {}): Promise<ApiResponse<HackerNewsPost[]>> {
    const apiName = 'hackernews';
    const cacheKey = cacheKeys.hackerNews(filters);
    const startTime = Date.now();

    // Check cache first
    if (this.config.enableCaching) {
      const cached = cacheManager.get<HackerNewsPost[]>(cacheKey);
      if (cached) {
        const cacheAge = Date.now() - (cacheManager.getByTag(cacheTags.hackerNews)[0]?.timestamp || 0);
        
        if (shouldUseCache(apiName, cacheAge)) {
          return {
            data: cached,
            fromCache: true,
            cacheAge,
            rateLimitStatus: this.getRateLimitStatus(apiName),
            metadata: {
              timestamp: Date.now(),
              responseTime: Date.now() - startTime,
              apiName
            }
          };
        }
      }
    }

    // Check rate limits
    if (this.config.enableRateLimiting) {
      const canCall = rateLimiter.canMakeCall(apiName);
      if (!canCall.allowed) {
        console.warn(`🚨 Rate limit exceeded for ${apiName}: ${canCall.reason}`);
        
        if (this.config.fallbackToMock) {
          return this.getFallbackResponse(apiName, this.getMockHackerNewsData(), startTime);
        }
        
        throw new Error(`Rate limit exceeded: ${canCall.reason}`);
      }
    }

    try {
      const data = await this.makeHackerNewsCall();
      
      if (this.config.enableCaching) {
        cacheManager.set(cacheKey, data, 2 * 60 * 1000, [cacheTags.hackerNews]);
      }

      if (this.config.enableRateLimiting) {
        rateLimiter.recordCall(apiName, true, Date.now() - startTime);
      }

      return {
        data,
        fromCache: false,
        rateLimitStatus: this.getRateLimitStatus(apiName),
        metadata: {
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
          apiName
        }
      };

    } catch (error) {
      console.error(`❌ Hacker News API call failed:`, error);
      
      if (this.config.enableRateLimiting) {
        rateLimiter.recordCall(apiName, false, Date.now() - startTime);
      }

      if (this.shouldRetry(apiName)) {
        await this.delay(this.config.retryDelay);
        return this.fetchHackerNewsPosts(filters);
      }

      if (this.config.fallbackToMock) {
        return this.getFallbackResponse(apiName, this.getMockHackerNewsData(), startTime);
      }

      throw error;
    }
  }

  /**
   * Enhanced GitHub/SaaSHub API
   */
  async fetchSaaSHubAlternatives(filters: any = {}): Promise<ApiResponse<SaaSHubAlternative[]>> {
    const apiName = 'github';
    const cacheKey = cacheKeys.github(filters);
    const startTime = Date.now();

    if (this.config.enableCaching) {
      const cached = cacheManager.get<SaaSHubAlternative[]>(cacheKey);
      if (cached) {
        const cacheAge = Date.now() - (cacheManager.getByTag(cacheTags.github)[0]?.timestamp || 0);
        
        if (shouldUseCache(apiName, cacheAge)) {
          return {
            data: cached,
            fromCache: true,
            cacheAge,
            rateLimitStatus: this.getRateLimitStatus(apiName),
            metadata: {
              timestamp: Date.now(),
              responseTime: Date.now() - startTime,
              apiName
            }
          };
        }
      }
    }

    if (this.config.enableRateLimiting) {
      const canCall = rateLimiter.canMakeCall(apiName);
      if (!canCall.allowed) {
        console.warn(`🚨 Rate limit exceeded for ${apiName}: ${canCall.reason}`);
        
        if (this.config.fallbackToMock) {
          return this.getFallbackResponse(apiName, this.getMockSaaSHubData(), startTime);
        }
        
        throw new Error(`Rate limit exceeded: ${canCall.reason}`);
      }
    }

    try {
      const data = await this.makeGitHubCall();
      
      if (this.config.enableCaching) {
        cacheManager.set(cacheKey, data, 10 * 60 * 1000, [cacheTags.github]);
      }

      if (this.config.enableRateLimiting) {
        rateLimiter.recordCall(apiName, true, Date.now() - startTime);
      }

      return {
        data,
        fromCache: false,
        rateLimitStatus: this.getRateLimitStatus(apiName),
        metadata: {
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
          apiName
        }
      };

    } catch (error) {
      console.error(`❌ GitHub API call failed:`, error);
      
      if (this.config.enableRateLimiting) {
        rateLimiter.recordCall(apiName, false, Date.now() - startTime);
      }

      if (this.shouldRetry(apiName)) {
        await this.delay(this.config.retryDelay);
        return this.fetchSaaSHubAlternatives(filters);
      }

      if (this.config.fallbackToMock) {
        return this.getFallbackResponse(apiName, this.getMockSaaSHubData(), startTime);
      }

      throw error;
    }
  }

  /**
   * Get API health status
   */
  getApiHealth(): {
    producthunt: any;
    hackernews: any;
    github: any;
    cache: any;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Check rate limit status
    const phStatus = rateLimiter.getStatus('producthunt');
    const hnStatus = rateLimiter.getStatus('hackernews');
    const ghStatus = rateLimiter.getStatus('github');
    
    // Check cache health
    const cacheHealth = cacheManager.getStats();
    
    // Generate recommendations
    if (phStatus.isThrottled) {
      recommendations.push('Product Hunt API is throttled - consider using cached data');
    }
    
    if (hnStatus.isThrottled) {
      recommendations.push('Hacker News API is throttled - consider using cached data');
    }
    
    if (ghStatus.isThrottled) {
      recommendations.push('GitHub API is throttled - consider using cached data');
    }
    
    if (cacheHealth.hitRate < 50) {
      recommendations.push('Low cache hit rate - consider optimizing cache keys or TTL');
    }

    return {
      producthunt: phStatus,
      hackernews: hnStatus,
      github: ghStatus,
      cache: cacheHealth,
      recommendations
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    cacheManager.clear();
    console.log('🧹 All caches cleared');
  }

  /**
   * Invalidate cache by tag
   */
  invalidateCacheByTag(tag: string): number {
    return cacheManager.invalidateByTag(tag);
  }

  // Private helper methods
  private async makeProductHuntCall(): Promise<ProductHuntPost[]> {
    // Implementation from original api.ts
    const accessToken = '0VaMMCJ2ILdKkpY52GI7utplq83BtbvzKLDVz_YUHE4';
    
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `
          query {
            posts(first: 50, order: VOTES) {
              edges {
                node {
                  id
                  name
                  tagline
                  description
                  votesCount
                  commentsCount
                  createdAt
                  thumbnail { url }
                  user { name username }
                  topics {
                    edges {
                      node { name }
                    }
                  }
                }
              }
            }
          }
        `
      })
    });

    if (!response.ok) {
      throw new Error(`Product Hunt API failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Product Hunt API errors: ${JSON.stringify(data.errors)}`);
    }

    const posts = data.data?.posts?.edges || [];
    return posts.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      tagline: edge.node.tagline,
      description: edge.node.description,
      votes_count: edge.node.votesCount,
      comments_count: edge.node.commentsCount,
      created_at: edge.node.createdAt,
      thumbnail: { image_url: edge.node.thumbnail?.url || '' },
      user: {
        name: edge.node.user.name === "[REDACTED]" ? "Anonymous User" : edge.node.user.name,
        username: edge.node.user.username === "[REDACTED]" ? "anonymous" : edge.node.user.username
      },
      topics: edge.node.topics?.edges?.map((topicEdge: any) => ({ name: topicEdge.node.name })) || []
    }));
  }

  private async makeHackerNewsCall(): Promise<HackerNewsPost[]> {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    
    if (!response.ok) {
      throw new Error(`Hacker News API failed: ${response.status}`);
    }
    
    const storyIds = await response.json();
    if (!Array.isArray(storyIds) || storyIds.length === 0) {
      throw new Error('No story IDs returned from Hacker News API');
    }
    
    const stories = await Promise.all(
      storyIds.slice(0, 50).map(async (id: number) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!storyResponse.ok) return null;
        return storyResponse.json();
      })
    );

    return stories.filter(story => story && story.type === 'story');
  }

  private async makeGitHubCall(): Promise<SaaSHubAlternative[]> {
    const response = await fetch('https://api.github.com/search/repositories?q=stars:>1000+language:javascript+language:typescript+language:python&sort=stars&order=desc&per_page=60');
    
    if (!response.ok) {
      throw new Error(`GitHub API failed: ${response.status}`);
    }

    const data = await response.json();
    const repositories = data.items || [];
    
    if (repositories.length === 0) {
      throw new Error('No repositories returned from GitHub API');
    }

    return repositories.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      description: repo.description || 'No description available',
      website_url: repo.html_url,
      logo_url: repo.owner.avatar_url,
      pricing: "Open Source",
      category: "Open Source Tools",
      features: repo.topics || [],
      pros: ["Open Source", "Active Development", "Community Driven"],
      cons: ["Requires Technical Knowledge", "Self-hosted"],
      rating: Math.min(5, (repo.stargazers_count / 1000) * 0.5 + 3),
      reviews_count: repo.stargazers_count
    }));
  }

  private getRateLimitStatus(apiName: string) {
    const status = rateLimiter.getStatus(apiName);
    return {
      callsRemaining: status.maxCalls - status.callsInWindow,
      resetTime: Date.now() + (60 * 60 * 1000), // Assume 1 hour window
      isThrottled: status.isThrottled
    };
  }

  private shouldRetry(apiName: string): boolean {
    const retryCount = this.retryCounts.get(apiName) || 0;
    return retryCount < this.config.maxRetries;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFallbackResponse<T>(apiName: string, data: T, startTime: number): ApiResponse<T> {
    return {
      data,
      fromCache: false,
      rateLimitStatus: this.getRateLimitStatus(apiName),
      metadata: {
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        apiName
      }
    };
  }

  // Mock data methods (simplified versions)
  private getMockProductHuntData(): ProductHuntPost[] {
    return [
      {
        id: 1,
        name: "AI Code Assistant",
        tagline: "Write better code with AI",
        description: "An intelligent code assistant that helps developers write cleaner, more efficient code.",
        votes_count: 1247,
        comments_count: 89,
        created_at: new Date().toISOString(),
        thumbnail: { image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&crop=center" },
        user: { name: "John Doe", username: "johndoe" },
        topics: [{ name: "Developer Tools" }, { name: "AI" }]
      }
    ];
  }

  private getMockHackerNewsData(): HackerNewsPost[] {
    return [
      {
        id: 1,
        title: "Show HN: I built a JavaScript framework for modern web apps",
        url: "https://example.com/javascript-framework",
        score: 256,
        by: "jsdev",
        time: Math.floor(Date.now() / 1000),
        descendants: 45,
        type: "story"
      }
    ];
  }

  private getMockSaaSHubData(): SaaSHubAlternative[] {
    return [
      {
        id: "1",
        name: "Slack",
        description: "Team communication and collaboration platform",
        website_url: "https://slack.com",
        logo_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center",
        pricing: "Free - $12.50/user/month",
        category: "Communication",
        features: ["Messaging", "File sharing", "Video calls"],
        pros: ["Easy to use", "Great integrations"],
        cons: ["Can be expensive"],
        rating: 4.5,
        reviews_count: 1250
      }
    ];
  }
}

// Singleton instance
export const apiManager = new ApiManager();

// Export individual methods for backward compatibility
export const fetchProductHuntPosts = (filters?: any) => apiManager.fetchProductHuntPosts(filters);
export const fetchHackerNewsPosts = (filters?: any) => apiManager.fetchHackerNewsPosts(filters);
export const fetchSaaSHubAlternatives = (filters?: any) => apiManager.fetchSaaSHubAlternatives(filters);
