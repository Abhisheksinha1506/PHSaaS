# SaaS Dashboard API Usage Examples

## 1. Pagination API

### Basic Pagination
```javascript
// Get first page of Product Hunt data
const response = await fetch('/api/product-hunt?page=1&limit=10');
const data = await response.json();

console.log(data.pagination);
// {
//   currentPage: 1,
//   totalPages: 5,
//   totalItems: 50,
//   itemsPerPage: 10,
//   hasNextPage: true,
//   hasPrevPage: false,
//   nextPage: 2,
//   prevPage: null
// }
```

### Advanced Filtering & Sorting
```javascript
// Get AI-related products sorted by votes
const response = await fetch('/api/product-hunt?category=AI&sortBy=votes&sortOrder=desc&minVotes=100&page=1&limit=20');
const data = await response.json();
```

## 2. Search API

### Cross-Platform Search
```javascript
// Search across all platforms
const response = await fetch('/api/search?q=javascript&platforms=producthunt,hackernews,github&limit=50');
const data = await response.json();

console.log(data.results);
// {
//   productHunt: [...],
//   hackerNews: [...],
//   github: [...],
//   totalResults: 45,
//   searchTime: 234
// }
```

### Category-Specific Search
```javascript
// Search for AI-related content
const response = await fetch('/api/search?q=artificial intelligence&categories=ai,machine-learning&minScore=50');
```

## 3. Analytics API

### Overview Analytics
```javascript
// Get comprehensive analytics
const response = await fetch('/api/analytics?metric=overview&timeFilter=7d');
const data = await response.json();

console.log(data.data);
// {
//   totalLaunches: 25,
//   totalDiscussions: 150,
//   avgVotes: 234,
//   topCategories: [...],
//   trendingTopics: [...],
//   engagementTrends: [...]
// }
```

### Trend Analysis
```javascript
// Get trending technologies
const response = await fetch('/api/analytics?metric=trends&timeFilter=30d');
const data = await response.json();

console.log(data.data.trendingTechnologies);
// {
//   ai: { momentum: 95, growth: 15.2, crossPlatform: true },
//   web3: { momentum: 87, growth: 12.8, crossPlatform: true }
// }
```

### Performance Metrics
```javascript
// Get performance insights
const response = await fetch('/api/analytics?metric=performance&timeFilter=7d');
const data = await response.json();
```

## 4. Real-time Updates API

### Get Recent Updates
```javascript
// Get updates since last check
const lastUpdate = '2024-01-15T10:30:00Z';
const response = await fetch(`/api/realtime?lastUpdate=${lastUpdate}&platforms=producthunt,hackernews`);
const data = await response.json();

console.log(data.updates);
// {
//   productHunt: { new: [...], updated: [...], deleted: [] },
//   hackerNews: { new: [...], updated: [...], deleted: [] },
//   totalUpdates: 12
// }
```

### Subscribe to Updates
```javascript
// Subscribe to real-time updates
const response = await fetch('/api/realtime', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platforms: ['producthunt', 'hackernews'],
    interval: 30000 // 30 seconds
  })
});

const subscription = await response.json();
console.log(subscription.endpoint); // Use this endpoint for streaming
```

## 5. Export API

### JSON Export
```javascript
// Export all data as JSON
const response = await fetch('/api/export?format=json&platforms=producthunt,hackernews,github&includeMetadata=true');
const data = await response.json();
```

### CSV Export
```javascript
// Export as CSV file
const response = await fetch('/api/export?format=csv&platforms=producthunt&timeFilter=7d');
const csvData = await response.text();
// Save as file or process CSV data
```

### XML Export
```javascript
// Export as XML
const response = await fetch('/api/export?format=xml&platforms=all&includeMetadata=true');
const xmlData = await response.text();
```

## 6. Advanced Usage Patterns

### Dashboard Data Loading
```javascript
// Load dashboard with pagination
async function loadDashboard(page = 1, filters = {}) {
  const [phData, hnData, ghData, analytics] = await Promise.all([
    fetch(`/api/product-hunt?page=${page}&limit=20&${new URLSearchParams(filters)}`),
    fetch(`/api/hacker-news?page=${page}&limit=20&${new URLSearchParams(filters)}`),
    fetch(`/api/saashub?page=${page}&limit=20&${new URLSearchParams(filters)}`),
    fetch(`/api/analytics?metric=overview&timeFilter=${filters.timeFilter || '7d'}`)
  ]);
  
  return {
    productHunt: await phData.json(),
    hackerNews: await hnData.json(),
    github: await ghData.json(),
    analytics: await analytics.json()
  };
}
```

### Real-time Dashboard Updates
```javascript
// Set up real-time updates
class RealtimeDashboard {
  constructor() {
    this.lastUpdate = new Date().toISOString();
    this.updateInterval = 30000; // 30 seconds
  }
  
  async startUpdates() {
    setInterval(async () => {
      try {
        const response = await fetch(`/api/realtime?lastUpdate=${this.lastUpdate}`);
        const updates = await response.json();
        
        if (updates.totalUpdates > 0) {
          this.handleUpdates(updates);
          this.lastUpdate = updates.timestamp;
        }
      } catch (error) {
        console.error('Update failed:', error);
      }
    }, this.updateInterval);
  }
  
  handleUpdates(updates) {
    // Update UI with new data
    console.log('New updates:', updates);
  }
}

const dashboard = new RealtimeDashboard();
dashboard.startUpdates();
```

### Advanced Search Implementation
```javascript
// Advanced search with debouncing
class AdvancedSearch {
  constructor() {
    this.searchTimeout = null;
    this.searchCache = new Map();
  }
  
  async search(query, filters = {}) {
    // Debounce search requests
    clearTimeout(this.searchTimeout);
    
    return new Promise((resolve) => {
      this.searchTimeout = setTimeout(async () => {
        const cacheKey = `${query}-${JSON.stringify(filters)}`;
        
        if (this.searchCache.has(cacheKey)) {
          resolve(this.searchCache.get(cacheKey));
          return;
        }
        
        try {
          const response = await fetch(`/api/search?${new URLSearchParams({
            q: query,
            ...filters
          })}`);
          const results = await response.json();
          
          this.searchCache.set(cacheKey, results);
          resolve(results);
        } catch (error) {
          console.error('Search failed:', error);
          resolve({ results: { productHunt: [], hackerNews: [], github: [] } });
        }
      }, 300); // 300ms debounce
    });
  }
}
```

## 7. Error Handling

```javascript
// Robust API calls with error handling
async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return { error: error.message, data: null };
  }
}

// Usage
const result = await safeApiCall('/api/product-hunt?page=1&limit=10');
if (result.error) {
  // Handle error
  console.error('Failed to load data:', result.error);
} else {
  // Use data
  console.log('Data loaded:', result.data);
}
```

## 8. Performance Optimization

```javascript
// Implement caching for better performance
class ApiCache {
  constructor(ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  async get(key, fetcher) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  clear() {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

// Usage with caching
const data = await apiCache.get('product-hunt-page-1', () => 
  fetch('/api/product-hunt?page=1&limit=10').then(r => r.json())
);
```

These APIs provide comprehensive functionality for:
- **Pagination** with sorting and filtering
- **Cross-platform search** with advanced queries
- **Real-time analytics** and insights
- **Data export** in multiple formats
- **Real-time updates** for live dashboards
- **Performance optimization** with caching
- **Error handling** and resilience

The APIs are designed to be RESTful, scalable, and easy to integrate into any frontend application.
