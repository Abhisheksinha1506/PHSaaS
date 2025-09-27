import { NextResponse } from 'next/server';
import { fetchProductHuntPosts, fetchHackerNewsPosts, fetchSaaSHubAlternatives } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastUpdate = searchParams.get('lastUpdate');
    const platforms = searchParams.get('platforms')?.split(',') || ['producthunt', 'hackernews', 'github'];
    
    console.log(`🔄 Real-time API called since: ${lastUpdate}`);
    
    const updates = {
      productHunt: { new: [] as any[], updated: [] as any[], deleted: [] as any[] },
      hackerNews: { new: [] as any[], updated: [] as any[], deleted: [] as any[] },
      github: { new: [] as any[], updated: [] as any[], deleted: [] as any[] },
      timestamp: new Date().toISOString()
    };
    
    // Get fresh data
    const [phData, hnData, ghData] = await Promise.all([
      platforms.includes('producthunt') ? fetchProductHuntPosts() : Promise.resolve([]),
      platforms.includes('hackernews') ? fetchHackerNewsPosts() : Promise.resolve([]),
      platforms.includes('github') ? fetchSaaSHubAlternatives() : Promise.resolve([])
    ]);
    
    // Filter for recent updates (last 1 hour if no lastUpdate provided)
    const cutoffTime = lastUpdate ? new Date(lastUpdate) : new Date(Date.now() - 60 * 60 * 1000);
    
    // Product Hunt updates
    if (platforms.includes('producthunt')) {
      const recentPH = phData.filter(item => new Date(item.created_at) > cutoffTime);
      updates.productHunt.new = recentPH.map(item => ({
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
      const recentHN = hnData.filter(item => new Date(item.time * 1000) > cutoffTime);
      updates.hackerNews.new = recentHN.map(item => ({
        id: item.id,
        title: item.title,
        score: item.score,
        descendants: item.descendants,
        time: item.time,
        type: 'new'
      }));
    }
    
    // GitHub updates
    if (platforms.includes('github')) {
      const recentGH = ghData.filter(item => {
        // GitHub doesn't have creation dates in our current data structure
        // This is a simplified approach - in reality, you'd need to track repository creation dates
        return true; // For demo purposes, return all items
      }).slice(0, 10); // Limit to 10 most recent
      
      updates.github.new = recentGH.map(item => ({
        id: item.id,
        name: item.name,
        stars: item.reviews_count,
        description: item.description,
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
