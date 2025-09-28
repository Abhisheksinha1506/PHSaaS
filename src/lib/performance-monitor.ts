interface PerformanceMetrics {
  apiCalls: number;
  dataProcessing: number;
  analyticsCalculation: number;
  total: number;
  timestamp: string;
  endpoint: string;
  method: string;
}

interface BottleneckAnalysis {
  slowestOperation: string;
  averageResponseTime: number;
  bottlenecks: Array<{
    operation: string;
    time: number;
    percentage: number;
    recommendation: string;
  }>;
  recommendations: string[];
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 measurements

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(): { end: (operation: string) => number } {
    const startTime = performance.now();
    
    return {
      end: (operation: string): number => {
        const duration = performance.now() - startTime;
        console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }

  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.push(fullMetrics);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    console.log(`📊 Performance recorded:`, {
      endpoint: metrics.endpoint,
      method: metrics.method,
      total: `${metrics.total.toFixed(2)}ms`,
      breakdown: {
        apiCalls: `${metrics.apiCalls.toFixed(2)}ms`,
        dataProcessing: `${metrics.dataProcessing.toFixed(2)}ms`,
        analyticsCalculation: `${metrics.analyticsCalculation.toFixed(2)}ms`
      }
    });
  }

  analyzeBottlenecks(): BottleneckAnalysis {
    if (this.metrics.length === 0) {
      return {
        slowestOperation: 'No data',
        averageResponseTime: 0,
        bottlenecks: [],
        recommendations: ['No performance data available']
      };
    }

    const recentMetrics = this.metrics.slice(-20); // Last 20 measurements
    const avgTotal = recentMetrics.reduce((sum, m) => sum + m.total, 0) / recentMetrics.length;
    const avgApiCalls = recentMetrics.reduce((sum, m) => sum + m.apiCalls, 0) / recentMetrics.length;
    const avgDataProcessing = recentMetrics.reduce((sum, m) => sum + m.dataProcessing, 0) / recentMetrics.length;
    const avgAnalytics = recentMetrics.reduce((sum, m) => sum + m.analyticsCalculation, 0) / recentMetrics.length;

    const bottlenecks = [
      {
        operation: 'API Calls',
        time: avgApiCalls,
        percentage: (avgApiCalls / avgTotal) * 100,
        recommendation: avgApiCalls > 2000 ? 'Consider API caching or parallel requests' : 'Good'
      },
      {
        operation: 'Data Processing',
        time: avgDataProcessing,
        percentage: (avgDataProcessing / avgTotal) * 100,
        recommendation: avgDataProcessing > 500 ? 'Optimize data filtering and transformation' : 'Good'
      },
      {
        operation: 'Analytics Calculation',
        time: avgAnalytics,
        percentage: (avgAnalytics / avgTotal) * 100,
        recommendation: avgAnalytics > 300 ? 'Consider caching analytics results' : 'Good'
      }
    ].sort((a, b) => b.time - a.time);

    const slowestOperation = bottlenecks[0].operation;
    const recommendations = this.generateRecommendations(
      bottlenecks.map(b => ({ name: b.operation, avgTime: b.time, percentage: b.percentage })),
      avgTotal
    );

    return {
      slowestOperation,
      averageResponseTime: avgTotal,
      bottlenecks,
      recommendations
    };
  }

  private generateRecommendations(bottlenecks: Array<{name: string; avgTime: number; percentage: number}>, avgTotal: number): string[] {
    const recommendations: string[] = [];
    
    if (avgTotal > 5000) {
      recommendations.push('🚨 Critical: Total response time exceeds 5 seconds');
    } else if (avgTotal > 3000) {
      recommendations.push('⚠️ Warning: Total response time exceeds 3 seconds');
    }

    bottlenecks.forEach(bottleneck => {
      if (bottleneck.percentage > 60) {
        let recommendation = '';
        if (bottleneck.name === 'API Calls') {
          recommendation = bottleneck.avgTime > 2000 ? 'Consider API caching or parallel requests' : 'Good';
        } else if (bottleneck.name === 'Data Processing') {
          recommendation = bottleneck.avgTime > 500 ? 'Optimize data filtering and transformation' : 'Good';
        } else if (bottleneck.name === 'Analytics Calculation') {
          recommendation = bottleneck.avgTime > 300 ? 'Consider caching analytics results' : 'Good';
        }
        recommendations.push(`🔍 Focus on ${bottleneck.name}: ${recommendation}`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance looks good!');
    }

    return recommendations;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Real-time performance monitoring
  monitorApiCall<T>(apiCall: () => Promise<T>, operation: string): Promise<T> {
    const timer = this.startTiming();
    
    return apiCall()
      .then(result => {
        const duration = timer.end(operation);
        console.log(`✅ ${operation} completed in ${duration.toFixed(2)}ms`);
        return result;
      })
      .catch(error => {
        timer.end(`${operation} (failed)`);
        console.error(`❌ ${operation} failed:`, error);
        throw error;
      });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions for easy use
export const startTiming = () => performanceMonitor.startTiming();
export const recordMetrics = (metrics: Omit<PerformanceMetrics, 'timestamp'>) => 
  performanceMonitor.recordMetrics(metrics);
export const analyzeBottlenecks = () => performanceMonitor.analyzeBottlenecks();
export const monitorApiCall = <T>(apiCall: () => Promise<T>, operation: string) => 
  performanceMonitor.monitorApiCall(apiCall, operation);
