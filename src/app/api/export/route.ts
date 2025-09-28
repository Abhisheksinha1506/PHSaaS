import { NextResponse } from 'next/server';
import { fetchProductHuntPosts, fetchHackerNewsPosts, fetchSaaSHubAlternatives } from '@/lib/api';
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const platforms = searchParams.get('platforms')?.split(',') || ['producthunt', 'hackernews', 'github'];
    const timeFilter = searchParams.get('timeFilter') || '7d';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    
    console.log(`📤 Export API called: ${format} format for ${platforms.join(', ')}`);
    
    const exportData: {
      metadata?: {
        exportedAt: string;
        timeFilter: string;
        platforms: string[];
        format: string;
        version: string;
      };
      data: {
        productHunt?: ProductHuntPost[];
        hackerNews?: HackerNewsPost[];
        github?: SaaSHubAlternative[];
      };
    } = {
      metadata: includeMetadata ? {
        exportedAt: new Date().toISOString(),
        timeFilter,
        platforms,
        format,
        version: '1.0'
      } : undefined,
      data: {}
    };
    
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
    
    // Use synchronized fetching for consistent timing
    let phData: ProductHuntPost[] = [];
    let hnData: HackerNewsPost[] = [];
    let ghData: SaaSHubAlternative[] = [];
    
    try {
      const { synchronizedFetcher } = await import('@/lib/synchronized-fetcher');
      const result = await synchronizedFetcher.fetchSpecificAPIs(platforms, { timeFilter });
      
      phData = (result.productHunt?.data as ProductHuntPost[]) || [];
      hnData = (result.hackerNews?.data as HackerNewsPost[]) || [];
      ghData = (result.github?.data as SaaSHubAlternative[]) || [];
    } catch (syncError) {
      console.warn('Synchronized fetching failed, falling back to individual calls:', syncError);
      // Fallback to individual API calls
      const [phResult, hnResult, ghResult] = await Promise.allSettled([
        platforms.includes('producthunt') ? fetchProductHuntPosts() : Promise.resolve([]),
        platforms.includes('hackernews') ? fetchHackerNewsPosts() : Promise.resolve([]),
        platforms.includes('github') ? fetchSaaSHubAlternatives() : Promise.resolve([])
      ]);
      
      phData = phResult.status === 'fulfilled' ? phResult.value : [];
      hnData = hnResult.status === 'fulfilled' ? hnResult.value : [];
      ghData = ghResult.status === 'fulfilled' ? ghResult.value : [];
    }
    
    // Filter data based on platforms and time
    if (platforms.includes('producthunt')) {
      const filteredPH = phData.filter(item => new Date(item.created_at) >= cutoffDate);
      exportData.data.productHunt = filteredPH;
    }
    
    if (platforms.includes('hackernews')) {
      const filteredHN = hnData.filter(item => new Date(item.time * 1000) >= cutoffDate);
      exportData.data.hackerNews = filteredHN;
    }
    
    if (platforms.includes('github')) {
      exportData.data.github = ghData;
    }
    
    // Format response based on requested format
    switch (format.toLowerCase()) {
      case 'csv':
        return new NextResponse(convertToCSV({
          productHunt: exportData.data.productHunt || [],
          hackerNews: exportData.data.hackerNews || [],
          github: exportData.data.github || []
        }), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="saas-dashboard-export-${Date.now()}.csv"`
          }
        });
        
      case 'xml':
        return new NextResponse(convertToXML({
          ...exportData,
          data: {
            productHunt: exportData.data.productHunt || [],
            hackerNews: exportData.data.hackerNews || [],
            github: exportData.data.github || []
          }
        }), {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="saas-dashboard-export-${Date.now()}.xml"`
          }
        });
        
      case 'json':
      default:
        return NextResponse.json(exportData, {
          headers: {
            'Content-Disposition': `attachment; filename="saas-dashboard-export-${Date.now()}.json"`
          }
        });
    }
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: {
  productHunt: ProductHuntPost[];
  hackerNews: HackerNewsPost[];
  github: SaaSHubAlternative[];
}): string {
  const csvRows: string[] = [];
  
  // Product Hunt CSV
  if (data.productHunt && data.productHunt.length > 0) {
    csvRows.push('Product Hunt Data');
    csvRows.push('Name,Tagline,Votes,Comments,Created At,Topics');
    data.productHunt.forEach((item: ProductHuntPost) => {
      const topics = item.topics.map((t: { name: string }) => t.name).join(';');
      csvRows.push(`"${item.name}","${item.tagline}",${item.votes_count},${item.comments_count},"${item.created_at}","${topics}"`);
    });
    csvRows.push(''); // Empty line separator
  }
  
  // Hacker News CSV
  if (data.hackerNews && data.hackerNews.length > 0) {
    csvRows.push('Hacker News Data');
    csvRows.push('Title,Score,Comments,Author,Time,URL');
    data.hackerNews.forEach((item: HackerNewsPost) => {
      csvRows.push(`"${item.title}",${item.score},${item.descendants || 0},"${item.by}","${new Date(item.time * 1000).toISOString()}","${item.url || ''}"`);
    });
    csvRows.push(''); // Empty line separator
  }
  
  // GitHub CSV
  if (data.github && data.github.length > 0) {
    csvRows.push('GitHub Data');
    csvRows.push('Name,Description,Stars,Rating,Category,Website');
    data.github.forEach((item: SaaSHubAlternative) => {
      csvRows.push(`"${item.name}","${item.description}",${item.reviews_count},${item.rating},"${item.category}","${item.website_url}"`);
    });
  }
  
  return csvRows.join('\n');
}

// Helper function to convert data to XML
function convertToXML(data: {
  metadata?: {
    exportedAt: string;
    timeFilter: string;
    platforms: string[];
    format: string;
    version: string;
  };
  data: {
    productHunt: ProductHuntPost[];
    hackerNews: HackerNewsPost[];
    github: SaaSHubAlternative[];
  };
}): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<saas-dashboard-export>\n';
  
  if (data.metadata) {
    xml += '  <metadata>\n';
    Object.entries(data.metadata).forEach(([key, value]) => {
      xml += `    <${key}>${value}</${key}>\n`;
    });
    xml += '  </metadata>\n';
  }
  
  xml += '  <data>\n';
  
  // Product Hunt XML
  if (data.data.productHunt) {
    xml += '    <producthunt>\n';
    data.data.productHunt.forEach((item: ProductHuntPost) => {
      xml += '      <item>\n';
      xml += `        <name>${item.name}</name>\n`;
      xml += `        <tagline>${item.tagline}</tagline>\n`;
      xml += `        <votes>${item.votes_count}</votes>\n`;
      xml += `        <comments>${item.comments_count}</comments>\n`;
      xml += `        <createdAt>${item.created_at}</createdAt>\n`;
      xml += '        <topics>\n';
      item.topics.forEach((topic: { name: string }) => {
        xml += `          <topic>${topic.name}</topic>\n`;
      });
      xml += '        </topics>\n';
      xml += '      </item>\n';
    });
    xml += '    </producthunt>\n';
  }
  
  // Hacker News XML
  if (data.data.hackerNews) {
    xml += '    <hackernews>\n';
    data.data.hackerNews.forEach((item: HackerNewsPost) => {
      xml += '      <item>\n';
      xml += `        <title>${item.title}</title>\n`;
      xml += `        <score>${item.score}</score>\n`;
      xml += `        <descendants>${item.descendants || 0}</descendants>\n`;
      xml += `        <author>${item.by}</author>\n`;
      xml += `        <time>${new Date(item.time * 1000).toISOString()}</time>\n`;
      if (item.url) {
        xml += `        <url>${item.url}</url>\n`;
      }
      xml += '      </item>\n';
    });
    xml += '    </hackernews>\n';
  }
  
  // GitHub XML
  if (data.data.github) {
    xml += '    <github>\n';
    data.data.github.forEach((item: SaaSHubAlternative) => {
      xml += '      <item>\n';
      xml += `        <name>${item.name}</name>\n`;
      xml += `        <description>${item.description}</description>\n`;
      xml += `        <stars>${item.reviews_count}</stars>\n`;
      xml += `        <rating>${item.rating}</rating>\n`;
      xml += `        <category>${item.category}</category>\n`;
      xml += `        <website>${item.website_url}</website>\n`;
      xml += '      </item>\n';
    });
    xml += '    </github>\n';
  }
  
  xml += '  </data>\n';
  xml += '</saas-dashboard-export>';
  
  return xml;
}
