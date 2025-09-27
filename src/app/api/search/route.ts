import { NextResponse } from 'next/server';
import { fetchProductHuntPosts, fetchHackerNewsPosts, fetchSaaSHubAlternatives } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const platforms = searchParams.get('platforms')?.split(',') || ['producthunt', 'hackernews', 'github'];
    const categories = searchParams.get('categories')?.split(',') || [];
    const dateRange = searchParams.get('dateRange') || '7d';
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`🔍 Search API called with query: "${query}"`);
    
    const results = {
      productHunt: [] as any[],
      hackerNews: [] as any[],
      github: [] as any[],
      totalResults: 0,
      searchTime: 0
    };
    
    const startTime = Date.now();
    
    // Search Product Hunt
    if (platforms.includes('producthunt')) {
      try {
        const phData = await fetchProductHuntPosts();
        const filteredPH = phData.filter(item => {
          const matchesQuery = !query || 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.tagline.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.topics.some(topic => topic.name.toLowerCase().includes(query.toLowerCase()));
          
          const matchesCategory = categories.length === 0 || 
            item.topics.some(topic => categories.includes(topic.name.toLowerCase()));
          
          const matchesScore = item.votes_count >= minScore;
          
          return matchesQuery && matchesCategory && matchesScore;
        });
        
        results.productHunt = filteredPH.slice(0, limit);
      } catch (error) {
        console.error('Product Hunt search error:', error);
      }
    }
    
    // Search Hacker News
    if (platforms.includes('hackernews')) {
      try {
        const hnData = await fetchHackerNewsPosts();
        const filteredHN = hnData.filter(item => {
          const matchesQuery = !query || 
            item.title.toLowerCase().includes(query.toLowerCase());
          
          const matchesScore = item.score >= minScore;
          
          return matchesQuery && matchesScore;
        });
        
        results.hackerNews = filteredHN.slice(0, limit);
      } catch (error) {
        console.error('Hacker News search error:', error);
      }
    }
    
    // Search GitHub
    if (platforms.includes('github')) {
      try {
        const ghData = await fetchSaaSHubAlternatives();
        const filteredGH = ghData.filter(item => {
          const matchesQuery = !query || 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()));
          
          const matchesCategory = categories.length === 0 || 
            item.category.toLowerCase().includes(categories[0]?.toLowerCase() || '');
          
          const matchesScore = item.reviews_count >= minScore;
          
          return matchesQuery && matchesCategory && matchesScore;
        });
        
        results.github = filteredGH.slice(0, limit);
      } catch (error) {
        console.error('GitHub search error:', error);
      }
    }
    
    // Calculate total results
    results.totalResults = results.productHunt.length + results.hackerNews.length + results.github.length;
    results.searchTime = Date.now() - startTime;
    
    console.log(`🔍 Search completed: ${results.totalResults} results in ${results.searchTime}ms`);
    
    return NextResponse.json({
      query,
      results,
      filters: {
        platforms,
        categories,
        dateRange,
        minScore,
        sortBy
      },
      searchTime: results.searchTime
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
