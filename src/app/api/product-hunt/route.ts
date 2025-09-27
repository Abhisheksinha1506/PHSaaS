import { NextResponse } from 'next/server';
import { fetchProductHuntPosts } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get('timeFilter') || '7d';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'votes';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const category = searchParams.get('category') || '';
    const minVotes = parseInt(searchParams.get('minVotes') || '0');
    
    console.log(`📡 Product Hunt API called with params:`, {
      timeFilter, page, limit, sortBy, sortOrder, category, minVotes
    });
    
    const data = await fetchProductHuntPosts();
    
    // Ensure we have an array
    const safeData = Array.isArray(data) ? data : [];
    
    console.log(`📊 Product Hunt API: Received ${safeData.length} items`);
    
    // Apply time filtering
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
    
    let filteredData = safeData.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= cutoffDate;
    });
    
    // Apply category filtering
    if (category) {
      filteredData = filteredData.filter(item => 
        item.topics.some(topic => 
          topic.name.toLowerCase().includes(category.toLowerCase())
        )
      );
    }
    
    // Apply minimum votes filter
    if (minVotes > 0) {
      filteredData = filteredData.filter(item => item.votes_count >= minVotes);
    }
    
    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'votes':
          aValue = a.votes_count;
          bValue = b.votes_count;
          break;
        case 'comments':
          aValue = a.comments_count;
          bValue = b.comments_count;
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'engagement':
          aValue = a.votes_count + a.comments_count;
          bValue = b.votes_count + b.comments_count;
          break;
        default:
          aValue = a.votes_count;
          bValue = b.votes_count;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Calculate pagination metadata
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    console.log(`📊 Product Hunt: ${safeData.length} -> ${filteredData.length} -> ${paginatedData.length} (page ${page}/${totalPages})`);
    
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        timeFilter,
        sortBy,
        sortOrder,
        category,
        minVotes
      }
    });
  } catch (error) {
    console.error('Error fetching Product Hunt data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}