#!/usr/bin/env node

// Real-time Performance Monitor
// Continuously monitors and displays performance metrics

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

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
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

async function displayRealTimeMetrics() {
  try {
    clearScreen();
    
    console.log(colorize('🚀 SAAS DASHBOARD - REAL-TIME PERFORMANCE MONITOR', 'bright'));
    console.log('='.repeat(80));
    console.log(`📅 ${new Date().toLocaleString()} | 🔄 Auto-refresh every 5 seconds`);
    console.log('='.repeat(80));
    
    // Test Analytics API
    const startTime = Date.now();
    const analyticsData = await makeRequest('http://localhost:3000/api/analytics?metric=overview&timeFilter=7d');
    const responseTime = Date.now() - startTime;
    
    console.log('\n' + colorize('📊 CURRENT API PERFORMANCE', 'cyan'));
    console.log('-'.repeat(50));
    console.log(`⏱️  Response Time: ${colorize(responseTime + 'ms', responseTime > 3000 ? 'red' : responseTime > 1000 ? 'yellow' : 'green')}`);
    
    if (analyticsData.performance) {
      const perf = analyticsData.performance.timing;
      console.log(`\n📈 Performance Breakdown:`);
      console.log(`   API Calls: ${colorize(perf.apiCalls.toFixed(2) + 'ms', perf.apiCalls > 2000 ? 'red' : 'green')}`);
      console.log(`   Data Processing: ${colorize(perf.dataProcessing.toFixed(2) + 'ms', 'green')}`);
      console.log(`   Analytics: ${colorize(perf.analyticsCalculation.toFixed(2) + 'ms', 'green')}`);
      console.log(`   Total: ${colorize(perf.total.toFixed(2) + 'ms', perf.total > 3000 ? 'red' : 'green')}`);
      
      // Performance status
      let status = '🟢 EXCELLENT';
      if (perf.total > 5000) status = '🔴 CRITICAL';
      else if (perf.total > 3000) status = '🟡 WARNING';
      else if (perf.total > 1000) status = '🟠 MODERATE';
      
      console.log(`\n📊 Status: ${colorize(status, perf.total > 3000 ? 'red' : 'green')}`);
    }
    
    // Get performance monitor data
    const performanceData = await makeRequest('http://localhost:3000/api/performance');
    
    if (performanceData.analysis) {
      console.log('\n' + colorize('🔍 BOTTLENECK ANALYSIS', 'cyan'));
      console.log('-'.repeat(50));
      
      const analysis = performanceData.analysis;
      console.log(`🎯 Slowest: ${colorize(analysis.slowestOperation, 'red')}`);
      console.log(`⏱️  Average: ${analysis.averageResponseTime.toFixed(2)}ms`);
      
      console.log('\n📊 Bottlenecks:');
      analysis.bottlenecks.forEach((bottleneck, index) => {
        const percentage = bottleneck.percentage.toFixed(1);
        const time = bottleneck.time.toFixed(2);
        const color = bottleneck.percentage > 60 ? 'red' : 'green';
        console.log(`   ${index + 1}. ${colorize(bottleneck.operation, color)}: ${time}ms (${percentage}%)`);
      });
      
      if (analysis.recommendations.length > 0) {
        console.log('\n💡 Top Recommendation:');
        console.log(`   ${analysis.recommendations[0]}`);
      }
    }
    
    if (performanceData.summary) {
      console.log('\n' + colorize('📈 PERFORMANCE SUMMARY', 'cyan'));
      console.log('-'.repeat(50));
      const summary = performanceData.summary;
      console.log(`📊 Measurements: ${summary.totalMeasurements}`);
      console.log(`⏱️  Average Response: ${summary.averageResponseTime.toFixed(2)}ms`);
      console.log(`🐌 Slowest Endpoint: ${summary.slowestEndpoint}`);
    }
    
    // Recent metrics
    if (performanceData.metrics && performanceData.metrics.length > 0) {
      console.log('\n' + colorize('📊 RECENT METRICS (Last 3)', 'cyan'));
      console.log('-'.repeat(50));
      
      performanceData.metrics.slice(-3).forEach((metric, index) => {
        const time = new Date(metric.timestamp).toLocaleTimeString();
        console.log(`${index + 1}. ${time} - Total: ${colorize(metric.total.toFixed(2) + 'ms', metric.total > 3000 ? 'red' : 'green')}`);
        console.log(`   API: ${metric.apiCalls.toFixed(2)}ms | Data: ${metric.dataProcessing.toFixed(2)}ms | Analytics: ${metric.analyticsCalculation.toFixed(2)}ms`);
      });
    }
    
    // System info
    console.log('\n' + colorize('💻 SYSTEM STATUS', 'cyan'));
    console.log('-'.repeat(50));
    const memUsage = process.memoryUsage();
    console.log(`🧠 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    console.log(`⏰ Uptime: ${Math.round(process.uptime())}s`);
    console.log(`🔄 Node: ${process.version}`);
    
    console.log('\n' + '='.repeat(80));
    console.log(colorize('Press Ctrl+C to stop monitoring', 'yellow'));
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error(colorize('❌ Error:', 'red'), error.message);
    console.log(colorize('💡 Make sure your server is running on http://localhost:3000', 'yellow'));
  }
}

// Start real-time monitoring
console.log(colorize('🚀 Starting Real-time Performance Monitor...', 'bright'));
console.log('Press Ctrl+C to stop\n');

// Initial display
displayRealTimeMetrics();

// Refresh every 5 seconds
const interval = setInterval(displayRealTimeMetrics, 5000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\n' + colorize('👋 Performance monitoring stopped.', 'yellow'));
  process.exit(0);
});
