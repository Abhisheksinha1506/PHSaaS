import { NextResponse } from 'next/server';
import { fetchSaaSHubAlternatives } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get('timeFilter') || '7d';
    
    console.log(`📡 SaaSHub API called with timeFilter: ${timeFilter}`);
    
    const data = await fetchSaaSHubAlternatives();
    
    // Log if we're using fallback data
    if (data.length > 0 && data[0].name === "Slack") {
      console.log('⚠️ Using fallback data for SaaSHub');
    } else {
      console.log('✅ Using real API data for SaaSHub');
    }
    
    // Apply time-based filtering for GitHub data
    let filteredData;
    switch (timeFilter) {
      case '24h':
        filteredData = data.slice(0, 20); // Top 20 most popular repos
        break;
      case '7d':
        filteredData = data.slice(0, 40); // Top 40 most popular repos
        break;
      case '30d':
        filteredData = data; // All repos (up to 60)
        break;
      default:
        filteredData = data.slice(0, 40);
    }
    
    console.log(`📊 SaaSHub: ${data.length} -> ${filteredData.length} (${timeFilter})`);
    
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
    console.error('Error fetching SaaSHub data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
