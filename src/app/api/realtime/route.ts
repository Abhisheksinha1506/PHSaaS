import { NextResponse } from 'next/server';
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from '@/types';

// Define types for realtime updates
interface RealtimeProductHuntUpdate {
  id: number;
  name: string;
  votes: number;
  comments: number;
  createdAt: string;
  type: string;
}

interface RealtimeHackerNewsUpdate {
  id: number;
  title: string;
  score: number;
  descendants: number;
  createdAt: string;
  type: string;
}

interface RealtimeGitHubUpdate {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  createdAt: string;
  type: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastUpdate = searchParams.get('lastUpdate');
    const platforms = searchParams.get('platforms')?.split(',') || ['producthunt', 'hackernews', 'github'];
    
    console.log(`🔄 Real-time API called since: ${lastUpdate}`);
    
    const updates = {
      productHunt: { new: [] as RealtimeProductHuntUpdate[], updated: [] as RealtimeProductHuntUpdate[], deleted: [] as RealtimeProductHuntUpdate[] },
      hackerNews: { new: [] as RealtimeHackerNewsUpdate[], updated: [] as RealtimeHackerNewsUpdate[], deleted: [] as RealtimeHackerNewsUpdate[] },
      github: { new: [] as RealtimeGitHubUpdate[], updated: [] as RealtimeGitHubUpdate[], deleted: [] as RealtimeGitHubUpdate[] },
      timestamp: new Date().toISOString()
    };
    
    // Get fresh data using synchronized fetching
    const { synchronizedFetcher } = await import('@/lib/synchronized-fetcher');
    const result = await synchronizedFetcher.fetchSpecificAPIs(platforms, {});
    
    const phData = result.productHunt?.data || [];
    const hnData = result.hackerNews?.data || [];
    const ghData = result.github?.data || [];
    
    // Filter for recent updates (last 1 hour if no lastUpdate provided)
    const cutoffTime = lastUpdate ? new Date(lastUpdate) : new Date(Date.now() - 60 * 60 * 1000);
    
    // Product Hunt updates
    if (platforms.includes('producthunt')) {
      const recentPH = (phData as ProductHuntPost[]).filter((item: ProductHuntPost) => new Date(item.created_at) > cutoffTime);
      updates.productHunt.new = recentPH.map((item: ProductHuntPost) => ({
        id: item.id,
        name: item.name,
        votes: item.votes_count,
        comments: item.comments_count,
        createdAt: item.created_at,
        type: 'new'
      }));
    }
    
    // Hacker News updates
    if (platforms.includes('hackernews')) {
      const recentHN = (hnData as HackerNewsPost[]).filter((item: HackerNewsPost) => new Date(item.time * 1000) > cutoffTime);
      updates.hackerNews.new = recentHN.map((item: HackerNewsPost) => ({
        id: item.id,
        title: item.title,
        score: item.score,
        descendants: item.descendants,
        createdAt: new Date(item.time * 1000).toISOString(),
        type: 'new'
      }));
    }
    
    // GitHub updates
    if (platforms.includes('github')) {
      const recentGH = (ghData as SaaSHubAlternative[]).filter(() => {
        // GitHub doesn't have creation dates in our current data structure
        // This is a simplified approach - in reality, you'd need to track repository creation dates
        return true; // For demo purposes, return all items
      }).slice(0, 10); // Limit to 10 most recent
      
      updates.github.new = recentGH.map((item: SaaSHubAlternative) => ({
        id: item.id,
        name: item.name,
        rating: item.rating,
        reviews: item.reviews_count,
        createdAt: new Date().toISOString(), // Use current time as fallback
        type: 'new'
      }));
    }
    
    // Calculate total updates
    const totalUpdates = 
      updates.productHunt.new.length + 
      updates.hackerNews.new.length + 
      updates.github.new.length;
    
    console.log(`🔄 Real-time updates: ${totalUpdates} new items`);
    
    return NextResponse.json({
      updates,
      totalUpdates,
      platforms,
      lastUpdate: updates.timestamp,
      nextUpdate: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Suggest next update in 5 minutes
    });
  } catch (error) {
    console.error('Real-time API error:', error);
    return NextResponse.json({ error: 'Real-time updates failed' }, { status: 500 });
  }
}

// WebSocket-like endpoint for Server-Sent Events
export async function POST(request: Request) {
  try {
    const { platforms, interval = 30000 } = await request.json();
    
    // This would typically be implemented with Server-Sent Events or WebSockets
    // For now, return a subscription endpoint
    return NextResponse.json({
      subscriptionId: `sub_${Date.now()}`,
      platforms,
      interval,
      endpoint: `/api/realtime/stream?subscriptionId=sub_${Date.now()}`,
      message: 'Use the endpoint for real-time updates'
    });
  } catch (error) {
    console.error('Real-time subscription error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
