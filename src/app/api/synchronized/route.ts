import { NextResponse } from 'next/server';
import { synchronizedFetcher } from '@/lib/synchronized-fetcher';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheManager } from '@/lib/cache-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platforms = searchParams.get('platforms')?.split(',') || ['producthunt', 'hackernews', 'github'];
    const timeFilter = searchParams.get('timeFilter') || '7d';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    
    console.log(`🔄 Synchronized API called for platforms: ${platforms.join(', ')}`);
    
    // Prepare filters
    const filters = {
      timeFilter,
      forceRefresh,
      timestamp: new Date().toISOString()
    };

    // Check if we should use cached data
    const cacheKey = `sync:${platforms.join(',')}:${JSON.stringify(filters)}`;
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        console.log('📦 Returning cached synchronized data');
        return NextResponse.json({
          ...cached,
          fromCache: true,
          cacheAge: Date.now() - cached.timestamp
        });
      }
    }

    // Fetch data synchronously
    const result = await synchronizedFetcher.fetchSpecificAPIs(platforms, filters);
    
    // Add metadata if requested
    const response = {
      ...result,
      metadata: includeMetadata ? {
        fetchedAt: new Date().toISOString(),
        platforms,
        timeFilter,
        forceRefresh,
        rateLimitStatus: {
          producthunt: rateLimiter.getStatus('producthunt'),
          hackernews: rateLimiter.getStatus('hackernews'),
          github: rateLimiter.getStatus('github')
        },
        cacheStatus: cacheManager.getStats(),
        synchronizationStatus: {
          activeFetches: synchronizedFetcher.getActiveFetchesStatus().length,
          totalTime: result.totalTime
        }
      } : undefined
    };

    // Cache the result for 2 minutes
    cacheManager.set(cacheKey, response, 2 * 60 * 1000, ['synchronized']);

    console.log(`✅ Synchronized fetch completed: ${result.successCount}/${platforms.length} successful`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Synchronized API error:', error);
    return NextResponse.json({
      error: 'Synchronized fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platforms = ['producthunt', 'hackernews', 'github'], filters = {} } = body;
    
    console.log(`🔄 Synchronized POST API called for platforms: ${platforms.join(', ')}`);
    
    // Fetch data synchronously
    const result = await synchronizedFetcher.fetchSpecificAPIs(platforms, filters);
    
    return NextResponse.json({
      ...result,
      metadata: {
        fetchedAt: new Date().toISOString(),
        platforms,
        filters,
        totalTime: result.totalTime,
        successRate: `${result.successCount}/${platforms.length}`
      }
    });
    
  } catch (error) {
    console.error('❌ Synchronized POST API error:', error);
    return NextResponse.json({
      error: 'Synchronized fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
