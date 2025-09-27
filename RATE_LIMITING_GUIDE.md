# Rate Limiting & API Management Guide

## 🚨 Problem: API Rate Limits

External APIs have strict rate limits that can cause your application to fail:

- **Product Hunt**: ~100 requests/hour
- **Hacker News**: ~1000 requests/hour  
- **GitHub**: ~5000 requests/hour

## ✅ Solution: Comprehensive Rate Limiting System

This implementation provides a multi-layered approach to prevent hitting API limits:

### 1. **Intelligent Rate Limiting** (`src/lib/rate-limiter.ts`)

```typescript
// Automatic rate limit checking
const canCall = rateLimiter.canMakeCall('producthunt');
if (!canCall.allowed) {
  // Handle rate limit exceeded
  throw new Error(`Rate limit exceeded: ${canCall.reason}`);
}
```

**Features:**
- ✅ Per-API rate limit tracking
- ✅ Exponential backoff on failures
- ✅ Automatic retry logic
- ✅ Real-time status monitoring

### 2. **Advanced Caching System** (`src/lib/cache-manager.ts`)

```typescript
// Smart caching with TTL
const data = await cacheManager.getOrSet(
  'producthunt:7d',
  () => fetchProductHuntPosts(),
  5 * 60 * 1000, // 5 minutes TTL
  ['producthunt']
);
```

**Features:**
- ✅ LRU cache eviction
- ✅ Tag-based invalidation
- ✅ Automatic cleanup
- ✅ Hit rate monitoring

### 3. **Enhanced API Manager** (`src/lib/api-manager.ts`)

```typescript
// Centralized API management
const response = await apiManager.fetchProductHuntPosts(filters);
// Returns: { data, fromCache, rateLimitStatus, metadata }
```

**Features:**
- ✅ Rate limiting integration
- ✅ Automatic caching
- ✅ Fallback to mock data
- ✅ Retry logic with backoff

### 4. **Middleware Protection** (`src/middleware.ts`)

```typescript
// Automatic rate limit checking at route level
export function middleware(request: NextRequest) {
  const canCall = rateLimiter.canMakeCall(apiName);
  if (!canCall.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
}
```

## 📊 Monitoring & Health Checks

### Health Endpoint: `/api/health`

```bash
# Basic health check
curl /api/health

# Detailed health check
curl /api/health?details=true
```

**Response:**
```json
{
  "status": "healthy",
  "score": 85,
  "apis": {
    "producthunt": {
      "status": "healthy",
      "callsRemaining": 87,
      "lastSuccessful": 1703123456789
    }
  },
  "cache": {
    "hitRate": 78.5,
    "size": 245
  },
  "recommendations": [
    "Cache hit rate is good",
    "All APIs are healthy"
  ]
}
```

## 🔧 Configuration

### Rate Limits (configurable in `rate-limiter.ts`)

```typescript
const configs = {
  producthunt: {
    maxRequests: 100,        // 100 requests per hour
    windowMs: 60 * 60 * 1000, // 1 hour window
    retryAfterMs: 5 * 60 * 1000, // 5 minutes retry
    backoffMultiplier: 2,
    maxBackoffMs: 30 * 60 * 1000 // 30 minutes max
  },
  hackernews: {
    maxRequests: 1000,       // 1000 requests per hour
    windowMs: 60 * 60 * 1000,
    retryAfterMs: 1 * 60 * 1000,
    backoffMultiplier: 1.5,
    maxBackoffMs: 10 * 60 * 1000
  },
  github: {
    maxRequests: 5000,       // 5000 requests per hour
    windowMs: 60 * 60 * 1000,
    retryAfterMs: 1 * 60 * 1000,
    backoffMultiplier: 1.2,
    maxBackoffMs: 5 * 60 * 1000
  }
};
```

### Cache Settings (configurable in `cache-manager.ts`)

```typescript
const cacheConfig = {
  defaultTtl: 5 * 60 * 1000,    // 5 minutes default TTL
  maxSize: 1000,                 // Maximum 1000 entries
  cleanupInterval: 60 * 1000,    // Cleanup every minute
  enableCompression: false
};
```

## 🚀 Usage Examples

### 1. **Basic API Call with Rate Limiting**

```typescript
import { apiManager } from '@/lib/api-manager';

// This automatically handles rate limiting and caching
const response = await apiManager.fetchProductHuntPosts({
  timeFilter: '7d',
  page: 1,
  limit: 20
});

console.log('Data:', response.data);
console.log('From cache:', response.fromCache);
console.log('Rate limit status:', response.rateLimitStatus);
```

### 2. **Manual Rate Limit Checking**

```typescript
import { rateLimiter } from '@/lib/rate-limiter';

const canCall = rateLimiter.canMakeCall('producthunt');
if (!canCall.allowed) {
  console.log(`Cannot make call: ${canCall.reason}`);
  console.log(`Retry after: ${canCall.retryAfter}ms`);
}
```

### 3. **Cache Management**

```typescript
import { cacheManager } from '@/lib/cache-manager';

// Get cache statistics
const stats = cacheManager.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Cache size: ${stats.size} entries`);

// Invalidate cache by tag
const invalidated = cacheManager.invalidateByTag('producthunt');
console.log(`Invalidated ${invalidated} entries`);

// Clear all cache
cacheManager.clear();
```

### 4. **Health Monitoring**

```typescript
// Check API health
const health = await fetch('/api/health?details=true');
const healthData = await health.json();

if (healthData.status === 'critical') {
  console.error('System health is critical!');
  console.log('Recommendations:', healthData.recommendations);
}
```

## 🛡️ Best Practices

### 1. **Always Use the API Manager**

```typescript
// ✅ Good - Uses rate limiting and caching
const data = await apiManager.fetchProductHuntPosts(filters);

// ❌ Bad - Direct API calls bypass protection
const data = await fetch('https://api.producthunt.com/...');
```

### 2. **Handle Rate Limit Responses**

```typescript
try {
  const response = await apiManager.fetchProductHuntPosts(filters);
  // Handle successful response
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Handle rate limit - maybe use cached data or show user message
    console.log('Rate limit exceeded, using fallback data');
  }
}
```

### 3. **Monitor Cache Performance**

```typescript
// Check cache health regularly
const cacheHealth = getCacheHealth();
if (cacheHealth.status === 'warning') {
  console.log('Cache performance issues:', cacheHealth.recommendations);
}
```

### 4. **Use Appropriate Cache TTLs**

```typescript
// Different TTLs for different data types
const productHuntData = await apiManager.fetchProductHuntPosts(filters); // 5 min TTL
const analyticsData = await apiManager.fetchAnalytics('overview'); // 10 min TTL
const searchResults = await apiManager.search('query'); // 2 min TTL
```

## 📈 Performance Optimization

### 1. **Cache Warming**

```typescript
// Pre-load common data during startup
await warmCache();
```

### 2. **Batch Requests**

```typescript
// Load multiple data sources in parallel
const [phData, hnData, ghData] = await Promise.all([
  apiManager.fetchProductHuntPosts(filters),
  apiManager.fetchHackerNewsPosts(filters),
  apiManager.fetchSaaSHubAlternatives(filters)
]);
```

### 3. **Smart Cache Keys**

```typescript
// Use descriptive cache keys
const cacheKey = `producthunt:${timeFilter}:${page}:${limit}:${category}`;
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Rate limit exceeded" errors**
   - Check if you're making too many requests
   - Use cached data when possible
   - Implement request queuing

2. **Low cache hit rate**
   - Review cache key strategy
   - Increase TTL for stable data
   - Check cache invalidation logic

3. **API timeouts**
   - Check network connectivity
   - Verify API keys are valid
   - Use fallback data

### Debug Commands:

```bash
# Check rate limit status
curl /api/health

# Check cache statistics
curl /api/health?details=true

# Test API connectivity
curl /api/test-connectivity
```

## 📊 Metrics to Monitor

1. **Rate Limit Metrics:**
   - Calls remaining per API
   - Throttle status
   - Consecutive failures

2. **Cache Metrics:**
   - Hit rate percentage
   - Cache size
   - TTL effectiveness

3. **API Health:**
   - Response times
   - Success rates
   - Error rates

## 🔄 Migration Guide

### From Direct API Calls:

```typescript
// Before
const data = await fetchProductHuntPosts();

// After
const response = await apiManager.fetchProductHuntPosts();
const data = response.data;
```

### From Manual Caching:

```typescript
// Before
let cached = localStorage.getItem('ph-data');
if (!cached) {
  cached = await fetchProductHuntPosts();
  localStorage.setItem('ph-data', JSON.stringify(cached));
}

// After
const response = await apiManager.fetchProductHuntPosts();
// Caching is automatic!
```

This comprehensive rate limiting system ensures your application never hits API limits while providing excellent performance through intelligent caching and monitoring.
