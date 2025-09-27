import { NextResponse } from 'next/server';
import { apiManager } from '@/lib/api-manager';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheManager, getCacheHealth } from '@/lib/cache-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';
    
    console.log('🏥 Health check requested');
    
    // Get comprehensive health status
    const apiHealth = apiManager.getApiHealth();
    const cacheHealth = getCacheHealth();
    
    // Test API connectivity
    const connectivityTests = await testApiConnectivity();
    
    // Calculate overall health score
    const healthScore = calculateHealthScore(apiHealth, cacheHealth, connectivityTests);
    
    const healthStatus = {
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
      score: healthScore,
      timestamp: new Date().toISOString(),
      apis: {
        producthunt: {
          status: apiHealth.producthunt.isThrottled ? 'throttled' : 'healthy',
          callsRemaining: apiHealth.producthunt.maxCalls - apiHealth.producthunt.callsInWindow,
          lastSuccessful: apiHealth.producthunt.lastSuccessfulCall,
          consecutiveFailures: apiHealth.producthunt.consecutiveFailures
        },
        hackernews: {
          status: apiHealth.hackernews.isThrottled ? 'throttled' : 'healthy',
          callsRemaining: apiHealth.hackernews.maxCalls - apiHealth.hackernews.callsInWindow,
          lastSuccessful: apiHealth.hackernews.lastSuccessfulCall,
          consecutiveFailures: apiHealth.hackernews.consecutiveFailures
        },
        github: {
          status: apiHealth.github.isThrottled ? 'throttled' : 'healthy',
          callsRemaining: apiHealth.github.maxCalls - apiHealth.github.callsInWindow,
          lastSuccessful: apiHealth.github.lastSuccessfulCall,
          consecutiveFailures: apiHealth.github.consecutiveFailures
        }
      },
      cache: {
        status: cacheHealth.status,
        hitRate: cacheHealth.stats.hitRate,
        size: cacheHealth.stats.size,
        recommendations: cacheHealth.recommendations
      },
      connectivity: connectivityTests,
      recommendations: [
        ...apiHealth.recommendations,
        ...cacheHealth.recommendations,
        ...generateHealthRecommendations(healthScore, apiHealth, cacheHealth)
      ]
    };

    // Add detailed information if requested
    if (includeDetails) {
      healthStatus.details = {
        rateLimits: rateLimiter.getAllStatuses(),
        cacheStats: cacheManager.getStats(),
        apiConfig: {
          enableCaching: true,
          enableRateLimiting: true,
          fallbackToMock: true
        }
      };
    }

    return NextResponse.json(healthStatus);
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Test API connectivity
 */
async function testApiConnectivity(): Promise<{
  producthunt: boolean;
  hackernews: boolean;
  github: boolean;
  overall: boolean;
}> {
  const results = {
    producthunt: false,
    hackernews: false,
    github: false,
    overall: false
  };

  // Test Product Hunt API
  try {
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer 0VaMMCJ2ILdKkpY52GI7utplq83BtbvzKLDVz_YUHE4',
      },
      body: JSON.stringify({
        query: 'query { posts(first: 1) { edges { node { id name } } } }'
      })
    });
    results.producthunt = response.ok;
  } catch (error) {
    console.log('Product Hunt connectivity test failed:', error);
  }

  // Test Hacker News API
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    results.hackernews = response.ok;
  } catch (error) {
    console.log('Hacker News connectivity test failed:', error);
  }

  // Test GitHub API
  try {
    const response = await fetch('https://api.github.com/search/repositories?q=stars:>1000&per_page=1');
    results.github = response.ok;
  } catch (error) {
    console.log('GitHub connectivity test failed:', error);
  }

  results.overall = results.producthunt && results.hackernews && results.github;
  
  return results;
}

/**
 * Calculate overall health score
 */
function calculateHealthScore(
  apiHealth: any,
  cacheHealth: any,
  connectivity: any
): number {
  let score = 100;
  
  // Deduct points for throttled APIs
  if (apiHealth.producthunt.isThrottled) score -= 20;
  if (apiHealth.hackernews.isThrottled) score -= 15;
  if (apiHealth.github.isThrottled) score -= 10;
  
  // Deduct points for low cache hit rate
  if (cacheHealth.stats.hitRate < 50) score -= 15;
  if (cacheHealth.stats.hitRate < 30) score -= 25;
  
  // Deduct points for connectivity issues
  if (!connectivity.producthunt) score -= 20;
  if (!connectivity.hackernews) score -= 15;
  if (!connectivity.github) score -= 10;
  
  // Deduct points for consecutive failures
  if (apiHealth.producthunt.consecutiveFailures > 3) score -= 10;
  if (apiHealth.hackernews.consecutiveFailures > 3) score -= 10;
  if (apiHealth.github.consecutiveFailures > 3) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate health recommendations
 */
function generateHealthRecommendations(
  healthScore: number,
  apiHealth: any,
  cacheHealth: any
): string[] {
  const recommendations: string[] = [];
  
  if (healthScore < 60) {
    recommendations.push('Critical: System health is poor - immediate attention required');
  }
  
  if (apiHealth.producthunt.isThrottled) {
    recommendations.push('Product Hunt API is throttled - consider using cached data or reducing request frequency');
  }
  
  if (apiHealth.hackernews.isThrottled) {
    recommendations.push('Hacker News API is throttled - consider using cached data or reducing request frequency');
  }
  
  if (apiHealth.github.isThrottled) {
    recommendations.push('GitHub API is throttled - consider using cached data or reducing request frequency');
  }
  
  if (cacheHealth.stats.hitRate < 50) {
    recommendations.push('Low cache hit rate - consider optimizing cache keys or increasing TTL');
  }
  
  if (apiHealth.producthunt.consecutiveFailures > 3) {
    recommendations.push('Product Hunt API has multiple consecutive failures - check API key and rate limits');
  }
  
  if (apiHealth.hackernews.consecutiveFailures > 3) {
    recommendations.push('Hacker News API has multiple consecutive failures - check network connectivity');
  }
  
  if (apiHealth.github.consecutiveFailures > 3) {
    recommendations.push('GitHub API has multiple consecutive failures - check API key and rate limits');
  }
  
  return recommendations;
}
