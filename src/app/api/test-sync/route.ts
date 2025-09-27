import { NextResponse } from 'next/server';
import { synchronizedFetcher } from '@/lib/synchronized-fetcher';

export async function GET() {
  try {
    console.log('🧪 Testing synchronized fetching...');
    
    const startTime = Date.now();
    const result = await synchronizedFetcher.fetchAllAPIs({ timeFilter: '7d' });
    const endTime = Date.now();
    
    return NextResponse.json({
      success: true,
      totalTime: endTime - startTime,
      result: {
        productHunt: {
          success: result.productHunt.success,
          dataLength: result.productHunt.data?.length || 0,
          responseTime: result.productHunt.responseTime,
          fromCache: result.productHunt.fromCache
        },
        hackerNews: {
          success: result.hackerNews.success,
          dataLength: result.hackerNews.data?.length || 0,
          responseTime: result.hackerNews.responseTime,
          fromCache: result.hackerNews.fromCache
        },
        github: {
          success: result.github.success,
          dataLength: result.github.data?.length || 0,
          responseTime: result.github.responseTime,
          fromCache: result.github.fromCache
        }
      },
      summary: {
        totalTime: result.totalTime,
        successCount: result.successCount,
        errorCount: result.errorCount,
        fromCacheCount: result.fromCacheCount
      }
    });
    
  } catch (error) {
    console.error('❌ Synchronized fetch test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
