#!/usr/bin/env node

// Console Performance Report Generator
// This script fetches and displays comprehensive performance data

const https = require('https');
const http = require('http');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    }).on('error', reject);
  });
}

async function printPerformanceReport() {
  console.log('\n' + '='.repeat(80));
  console.log(colorize('🚀 SAAS DASHBOARD PERFORMANCE REPORT', 'bright'));
  console.log('='.repeat(80));
  console.log(`📅 Generated: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Test Analytics API Performance
    console.log(colorize('📊 ANALYTICS API PERFORMANCE TEST', 'cyan'));
    console.log('-'.repeat(50));
    
    const startTime = Date.now();
    const analyticsData = await makeRequest('http://localhost:3000/api/analytics?metric=overview&timeFilter=7d');
    const endTime = Date.now();
    
    console.log(`✅ Analytics API Response Time: ${endTime - startTime}ms`);
    
    if (analyticsData.performance) {
      console.log('\n📈 Performance Breakdown:');
      console.log(`   API Calls: ${analyticsData.performance.timing.apiCalls.toFixed(2)}ms`);
      console.log(`   Data Processing: ${analyticsData.performance.timing.dataProcessing.toFixed(2)}ms`);
      console.log(`   Analytics Calculation: ${analyticsData.performance.timing.analyticsCalculation.toFixed(2)}ms`);
      console.log(`   Total: ${analyticsData.performance.timing.total.toFixed(2)}ms`);
      
      console.log('\n📊 Performance Percentages:');
      Object.entries(analyticsData.performance.breakdown).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    console.log('\n📋 Analytics Data Summary:');
    if (analyticsData.data) {
      console.log(`   Total Launches: ${analyticsData.data.totalLaunches || 0}`);
      console.log(`   Total Discussions: ${analyticsData.data.totalDiscussions || 0}`);
      console.log(`   Total Repositories: ${analyticsData.data.totalRepositories || 0}`);
      console.log(`   Average Votes: ${analyticsData.data.avgVotes || 0}`);
      console.log(`   Average Score: ${analyticsData.data.avgScore || 0}`);
      console.log(`   Average Stars: ${analyticsData.data.avgStars || 0}`);
    }

    // 2. Get Performance Monitor Data
    console.log('\n' + colorize('🔍 PERFORMANCE MONITOR ANALYSIS', 'cyan'));
    console.log('-'.repeat(50));
    
    const performanceData = await makeRequest('http://localhost:3000/api/performance');
    
    if (performanceData.analysis) {
      const analysis = performanceData.analysis;
      
      console.log(`🎯 Slowest Operation: ${colorize(analysis.slowestOperation, 'red')}`);
      console.log(`⏱️  Average Response Time: ${analysis.averageResponseTime.toFixed(2)}ms`);
      
      // Performance status
      let status = '🟢 EXCELLENT';
      let statusColor = 'green';
      if (analysis.averageResponseTime > 5000) {
        status = '🔴 CRITICAL';
        statusColor = 'red';
      } else if (analysis.averageResponseTime > 3000) {
        status = '🟡 WARNING';
        statusColor = 'yellow';
      } else if (analysis.averageResponseTime > 1000) {
        status = '🟠 MODERATE';
        statusColor = 'yellow';
      }
      
      console.log(`📊 Overall Status: ${colorize(status, statusColor)}`);
      
      console.log('\n🔍 Bottleneck Analysis:');
      analysis.bottlenecks.forEach((bottleneck, index) => {
        const percentage = bottleneck.percentage.toFixed(1);
        const time = bottleneck.time.toFixed(2);
        const recommendation = bottleneck.recommendation;
        
        let bottleneckColor = 'green';
        if (bottleneck.percentage > 60) bottleneckColor = 'red';
        else if (bottleneck.percentage > 30) bottleneckColor = 'yellow';
        
        console.log(`   ${index + 1}. ${colorize(bottleneck.operation, bottleneckColor)}`);
        console.log(`      Time: ${time}ms (${percentage}%)`);
        console.log(`      Recommendation: ${recommendation}`);
        console.log('');
      });
      
      console.log('💡 Recommendations:');
      analysis.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    if (performanceData.summary) {
      const summary = performanceData.summary;
      console.log('\n📈 Performance Summary:');
      console.log(`   Total Measurements: ${summary.totalMeasurements}`);
      console.log(`   Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);
      console.log(`   Slowest Endpoint: ${summary.slowestEndpoint}`);
    }
    
    if (performanceData.metrics && performanceData.metrics.length > 0) {
      console.log('\n📊 Recent Performance Metrics:');
      performanceData.metrics.slice(-5).forEach((metric, index) => {
        console.log(`   ${index + 1}. ${metric.timestamp}`);
        console.log(`      API Calls: ${metric.apiCalls.toFixed(2)}ms`);
        console.log(`      Data Processing: ${metric.dataProcessing.toFixed(2)}ms`);
        console.log(`      Analytics: ${metric.analyticsCalculation.toFixed(2)}ms`);
        console.log(`      Total: ${metric.total.toFixed(2)}ms`);
        console.log(`      Endpoint: ${metric.endpoint}`);
        console.log('');
      });
    }

    // 3. Test Individual API Endpoints
    console.log(colorize('🌐 INDIVIDUAL API ENDPOINT TESTS', 'cyan'));
    console.log('-'.repeat(50));
    
    const endpoints = [
      { name: 'Analytics Overview', url: 'http://localhost:3000/api/analytics?metric=overview&timeFilter=7d' },
      { name: 'Analytics Trends', url: 'http://localhost:3000/api/analytics?metric=trends&timeFilter=7d' },
      { name: 'Analytics Performance', url: 'http://localhost:3000/api/analytics?metric=performance&timeFilter=7d' },
      { name: 'Product Hunt API', url: 'http://localhost:3000/api/product-hunt' },
      { name: 'Hacker News API', url: 'http://localhost:3000/api/hacker-news' },
      { name: 'SaaSHub API', url: 'http://localhost:3000/api/saashub' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const start = Date.now();
        const response = await makeRequest(endpoint.url);
        const duration = Date.now() - start;
        
        let status = '✅';
        let color = 'green';
        if (duration > 5000) {
          status = '🔴';
          color = 'red';
        } else if (duration > 3000) {
          status = '🟡';
          color = 'yellow';
        }
        
        console.log(`${status} ${endpoint.name}: ${colorize(duration + 'ms', color)}`);
        
        if (response.error) {
          console.log(`   ❌ Error: ${response.error}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${colorize('FAILED', 'red')} - ${error.message}`);
      }
    }

    // 4. System Information
    console.log('\n' + colorize('💻 SYSTEM INFORMATION', 'cyan'));
    console.log('-'.repeat(50));
    console.log(`Node.js Version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    console.log(`Uptime: ${Math.round(process.uptime())} seconds`);

    // 5. Performance Recommendations
    console.log('\n' + colorize('🚀 PERFORMANCE OPTIMIZATION RECOMMENDATIONS', 'cyan'));
    console.log('-'.repeat(50));
    
    const recommendations = [
      '🔧 Implement API response caching (Redis/Memory)',
      '⚡ Use parallel API calls where possible',
      '📦 Implement request deduplication',
      '⏱️  Add request timeouts to prevent hanging',
      '🗜️  Enable gzip compression for responses',
      '📊 Use CDN for static assets',
      '🔄 Implement database connection pooling',
      '📈 Add performance monitoring alerts',
      '🎯 Optimize database queries with indexes',
      '💾 Implement client-side caching'
    ];
    
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(colorize('📊 PERFORMANCE REPORT COMPLETE', 'bright'));
    console.log('='.repeat(80));
    console.log(`🕐 Report completed at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error(colorize('❌ Error generating performance report:', 'red'));
    console.error(error.message);
    console.log('\n💡 Make sure your development server is running on http://localhost:3000');
  }
}

// Run the performance report
printPerformanceReport().catch(console.error);
