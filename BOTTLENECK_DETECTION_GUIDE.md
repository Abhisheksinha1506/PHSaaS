# 🔍 Bottleneck Detection Guide

This guide helps you identify and resolve performance bottlenecks in your SaaS Dashboard application.

## 🚀 Quick Start

### 1. **Real-time Performance Monitoring**
```bash
# Check current performance metrics
curl http://localhost:3000/api/performance

# Clear metrics and start fresh
curl -X DELETE http://localhost:3000/api/performance
```

### 2. **API Performance Analysis**
```bash
# Test analytics API with timing
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/analytics?metric=overview&timeFilter=7d"
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## 📊 Performance Monitoring Dashboard

### Access the Performance Monitor
1. Navigate to your dashboard
2. Look for the "Performance Monitor" component
3. View real-time metrics and bottleneck analysis

### Key Metrics to Watch
- **API Calls**: Should be < 2000ms
- **Data Processing**: Should be < 500ms  
- **Analytics Calculation**: Should be < 300ms
- **Total Response Time**: Should be < 3000ms

## 🔍 Common Bottlenecks & Solutions

### 1. **API Call Bottlenecks**
**Symptoms:**
- API calls taking > 2000ms
- High percentage of total time spent on API calls
- Network timeouts

**Solutions:**
```typescript
// Implement API caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url: string) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetch(url);
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// Use parallel API calls
const [phData, hnData, ghData] = await Promise.allSettled([
  fetchProductHuntPosts(),
  fetchHackerNewsPosts(),
  fetchSaaSHubAlternatives()
]);
```

### 2. **Data Processing Bottlenecks**
**Symptoms:**
- Data processing taking > 500ms
- High memory usage during filtering
- Slow date parsing

**Solutions:**
```typescript
// Optimize data filtering
const filteredData = data.filter(item => {
  // Use efficient date parsing
  const itemDate = new Date(item.created_at);
  return itemDate >= cutoffDate;
});

// Use Web Workers for heavy processing
const worker = new Worker('/workers/data-processor.js');
worker.postMessage({ data, filters });
```

### 3. **Analytics Calculation Bottlenecks**
**Symptoms:**
- Analytics calculation taking > 300ms
- Complex calculations blocking the main thread
- Memory leaks in calculations

**Solutions:**
```typescript
// Cache analytics results
const analyticsCache = new Map();

function getCachedAnalytics(key: string, calculation: () => any) {
  if (analyticsCache.has(key)) {
    return analyticsCache.get(key);
  }
  
  const result = calculation();
  analyticsCache.set(key, result);
  return result;
}

// Use memoization for expensive calculations
const memoizedCalculation = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### 4. **Frontend Rendering Bottlenecks**
**Symptoms:**
- Component render times > 100ms
- Frequent re-renders
- Large bundle sizes

**Solutions:**
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

// Use code splitting
const LazyComponent = lazy(() => import('./LazyComponent'));
```

## 🛠️ Advanced Bottleneck Detection

### 1. **Database Query Analysis**
```sql
-- Enable slow query logging
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Analyze slow queries
SELECT * FROM mysql.slow_log 
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY query_time DESC;
```

### 2. **Memory Usage Monitoring**
```typescript
// Monitor memory usage
function logMemoryUsage() {
  if (performance.memory) {
    console.log('Memory Usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
}
```

### 3. **Network Performance**
```typescript
// Monitor network performance
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'navigation') {
      console.log('Navigation timing:', {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        tcp: entry.connectEnd - entry.connectStart,
        request: entry.responseStart - entry.requestStart,
        response: entry.responseEnd - entry.responseStart,
        total: entry.loadEventEnd - entry.navigationStart
      });
    }
  });
});
observer.observe({ entryTypes: ['navigation'] });
```

## 📈 Performance Optimization Checklist

### ✅ **Backend Optimizations**
- [ ] Implement API response caching
- [ ] Use database connection pooling
- [ ] Optimize database queries with indexes
- [ ] Implement request rate limiting
- [ ] Use CDN for static assets
- [ ] Enable gzip compression

### ✅ **Frontend Optimizations**
- [ ] Implement code splitting
- [ ] Use React.memo for expensive components
- [ ] Optimize bundle size with tree shaking
- [ ] Implement virtual scrolling for large lists
- [ ] Use Web Workers for heavy calculations
- [ ] Implement service worker caching

### ✅ **API Optimizations**
- [ ] Use parallel API calls where possible
- [ ] Implement request deduplication
- [ ] Add request timeout handling
- [ ] Use connection pooling
- [ ] Implement circuit breaker pattern

### ✅ **Monitoring & Alerting**
- [ ] Set up performance alerts
- [ ] Monitor error rates
- [ ] Track user experience metrics
- [ ] Implement automated performance testing
- [ ] Set up real-time monitoring dashboards

## 🚨 Performance Alerts

### Critical Alerts (Immediate Action Required)
- Total response time > 5000ms
- API failure rate > 10%
- Memory usage > 80%
- Error rate > 5%

### Warning Alerts (Monitor Closely)
- Total response time > 3000ms
- API response time > 2000ms
- Memory usage > 60%
- Error rate > 2%

### Info Alerts (Good to Know)
- Performance improvements detected
- New bottlenecks identified
- Cache hit rate changes

## 🔧 Tools & Resources

### Performance Testing Tools
- **Lighthouse**: Web performance auditing
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Real-time performance profiling
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring

### Browser DevTools
```javascript
// Performance profiling
console.profile('My Performance Profile');
// ... your code ...
console.profileEnd('My Performance Profile');

// Memory profiling
console.profile('Memory Profile');
// ... your code ...
console.profileEnd('Memory Profile');
```

### Custom Performance Monitoring
```typescript
// Custom performance marks
performance.mark('api-call-start');
await fetch('/api/data');
performance.mark('api-call-end');
performance.measure('api-call', 'api-call-start', 'api-call-end');

// Get performance measurements
const measures = performance.getEntriesByType('measure');
console.log('Performance measures:', measures);
```

## 📊 Performance Metrics Dashboard

The built-in performance monitor provides:

1. **Real-time Metrics**: Live performance data
2. **Bottleneck Analysis**: Identifies slow operations
3. **Recommendations**: Automated optimization suggestions
4. **Historical Data**: Performance trends over time
5. **Alert System**: Performance threshold monitoring

Access it at: `/dashboard` → Performance Monitor tab

## 🎯 Performance Goals

### Target Metrics
- **API Response Time**: < 2000ms
- **Page Load Time**: < 3000ms
- **Time to Interactive**: < 4000ms
- **First Contentful Paint**: < 1500ms
- **Largest Contentful Paint**: < 2500ms
- **Cumulative Layout Shift**: < 0.1

### Monitoring Frequency
- **Real-time**: Critical metrics every 30 seconds
- **Hourly**: Performance trends and patterns
- **Daily**: Comprehensive performance reports
- **Weekly**: Performance optimization reviews

Remember: Performance optimization is an ongoing process. Regular monitoring and optimization will ensure your application remains fast and responsive as it scales.
