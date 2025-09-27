import { NextResponse } from 'next/server';
import { apiCache } from '@/lib/api-cache';

export async function GET() {
  try {
    const stats = apiCache.getStats();
    
    return NextResponse.json({
      cache: {
        size: stats.size,
        entries: stats.entries.map(entry => ({
          key: entry.key,
          age: `${Math.round(entry.age / 1000)}s`,
          ttl: `${Math.round(entry.ttl / 1000)}s`,
          remaining: `${Math.round((entry.ttl - entry.age) / 1000)}s`
        }))
      },
      performance: {
        hitRate: 'N/A', // Would need to track hits/misses
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json({ error: 'Failed to get cache stats' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    apiCache.clear();
    
    return NextResponse.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'cleanup') {
      const cleaned = apiCache.cleanup();
      return NextResponse.json({
        message: `Cleaned up ${cleaned} expired entries`,
        cleaned
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Cache action error:', error);
    return NextResponse.json({ error: 'Failed to perform cache action' }, { status: 500 });
  }
}
