import { NextResponse } from 'next/server';
import { apiManager } from '@/lib/api-manager';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheManager, getCacheHealth } from '@/lib/cache-manager';

interface ApiHealthData {
  isThrottled?: boolean;
  maxCalls?: number;
  callsInWindow?: number;
  lastSuccessfulCall?: string;
  consecutiveFailures?: number;
  callsRemaining?: number;
}

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
    const healthScore = calculateHealthScore(apiHealth, {
      hitRate: cacheHealth.stats.hitRate,
      size: cacheHealth.stats.size,
      maxSize: 1000
    }, connectivityTests);
    
    const healthStatus: {
      status: string;
      score: number;
      timestamp: string;
      apis: Record<string, unknown>;
      cache: Record<string, unknown>;
      connectivity: Record<string, boolean>;
      recommendations: string[];
      details?: Record<string, unknown>;
    } = {
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
      score: healthScore,
      timestamp: new Date().toISOString(),
      apis: {
        producthunt: {
          status: (apiHealth.producthunt as ApiHealthData)?.isThrottled ? 'throttled' : 'healthy',
          callsRemaining: ((apiHealth.producthunt as ApiHealthData)?.maxCalls || 100) - ((apiHealth.producthunt as ApiHealthData)?.callsInWindow || 0),
          lastSuccessful: (apiHealth.producthunt as ApiHealthData)?.lastSuccessfulCall,
          consecutiveFailures: (apiHealth.producthunt as ApiHealthData)?.consecutiveFailures || 0
        },
        hackernews: {
          status: (apiHealth.hackernews as ApiHealthData)?.isThrottled ? 'throttled' : 'healthy',
          callsRemaining: ((apiHealth.hackernews as ApiHealthData)?.maxCalls || 100) - ((apiHealth.hackernews as ApiHealthData)?.callsInWindow || 0),
          lastSuccessful: (apiHealth.hackernews as ApiHealthData)?.lastSuccessfulCall,
          consecutiveFailures: (apiHealth.hackernews as ApiHealthData)?.consecutiveFailures || 0
        },
        github: {
          status: (apiHealth.github as ApiHealthData)?.isThrottled ? 'throttled' : 'healthy',
          callsRemaining: ((apiHealth.github as ApiHealthData)?.maxCalls || 100) - ((apiHealth.github as ApiHealthData)?.callsInWindow || 0),
          lastSuccessful: (apiHealth.github as ApiHealthData)?.lastSuccessfulCall,
          consecutiveFailures: (apiHealth.github as ApiHealthData)?.consecutiveFailures || 0
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
        ...generateHealthRecommendations(healthScore, apiHealth, {
          hitRate: cacheHealth.stats.hitRate,
          size: cacheHealth.stats.size,
          maxSize: 1000
        })
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
  apiHealth: Record<string, unknown>,
  cacheHealth: { hitRate: number; size: number; maxSize: number },
  connectivity: Record<string, boolean>
): number {
  let score = 100;
  
  // Deduct points for throttled APIs
  if ((apiHealth.producthunt as ApiHealthData)?.isThrottled) score -= 20;
  if ((apiHealth.hackernews as ApiHealthData)?.isThrottled) score -= 15;
  if ((apiHealth.github as ApiHealthData)?.isThrottled) score -= 10;
  
  // Deduct points for low cache hit rate
  if (cacheHealth.hitRate < 50) score -= 15;
  if (cacheHealth.hitRate < 30) score -= 25;
  
  // Deduct points for connectivity issues
  if (!connectivity.producthunt) score -= 20;
  if (!connectivity.hackernews) score -= 15;
  if (!connectivity.github) score -= 10;
  
  // Deduct points for consecutive failures
  const phData = apiHealth.producthunt as ApiHealthData;
  if (phData?.consecutiveFailures && phData.consecutiveFailures > 3) score -= 10;
  
  const hnData = apiHealth.hackernews as ApiHealthData;
  if (hnData?.consecutiveFailures && hnData.consecutiveFailures > 3) score -= 10;
  
  const ghData = apiHealth.github as ApiHealthData;
  if (ghData?.consecutiveFailures && ghData.consecutiveFailures > 3) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate health recommendations
 */
function generateHealthRecommendations(
  healthScore: number,
  apiHealth: Record<string, unknown>,
  cacheHealth: { hitRate: number; size: number; maxSize: number }
): string[] {
  const recommendations: string[] = [];
  
  if (healthScore < 60) {
    recommendations.push('Critical: System health is poor - immediate attention required');
  }
  
  if ((apiHealth.producthunt as ApiHealthData)?.isThrottled) {
    recommendations.push('Product Hunt API is throttled - consider using cached data or reducing request frequency');
  }
  
  if ((apiHealth.hackernews as ApiHealthData)?.isThrottled) {
    recommendations.push('Hacker News API is throttled - consider using cached data or reducing request frequency');
  }
  
  if ((apiHealth.github as ApiHealthData)?.isThrottled) {
    recommendations.push('GitHub API is throttled - consider using cached data or reducing request frequency');
  }
  
  if (cacheHealth.hitRate < 50) {
    recommendations.push('Low cache hit rate - consider optimizing cache keys or increasing TTL');
  }
  
  const phData = apiHealth.producthunt as ApiHealthData;
  if (phData?.consecutiveFailures && phData.consecutiveFailures > 3) {
    recommendations.push('Product Hunt API has multiple consecutive failures - check API key and rate limits');
  }
  
  const hnData = apiHealth.hackernews as ApiHealthData;
  if (hnData?.consecutiveFailures && hnData.consecutiveFailures > 3) {
    recommendations.push('Hacker News API has multiple consecutive failures - check network connectivity');
  }
  
  const ghData = apiHealth.github as ApiHealthData;
  if (ghData?.consecutiveFailures && ghData.consecutiveFailures > 3) {
    recommendations.push('GitHub API has multiple consecutive failures - check API key and rate limits');
  }
  
  return recommendations;
}
