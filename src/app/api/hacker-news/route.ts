import { NextResponse } from 'next/server';
import { fetchHackerNewsPosts } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get('timeFilter') || '7d';
    
    console.log(`📡 Hacker News API called with timeFilter: ${timeFilter}`);
    
    const data = await fetchHackerNewsPosts();
    
    // Log if we're using fallback data
    if (data.length > 0 && data[0].title === "Show HN: I built a JavaScript framework for modern web apps") {
      console.log('⚠️ Using fallback data for Hacker News');
    } else {
      console.log('✅ Using real API data for Hacker News');
    }
    
    // Apply time filtering on the server side
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeFilter) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.time * 1000); // Convert Unix timestamp to Date
      return itemDate >= cutoffDate;
    });
    
    console.log(`📊 Hacker News: ${data.length} -> ${filteredData.length} (${timeFilter})`);
    
    return NextResponse.json({
      data: filteredData,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: filteredData.length,
        itemsPerPage: filteredData.length,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
      },
      filters: {
        timeFilter
      }
    });
  } catch (error) {
    console.error('Error fetching Hacker News data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
