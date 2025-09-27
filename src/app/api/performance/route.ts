import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';

export async function GET() {
  try {
    const analysis = performanceMonitor.analyzeBottlenecks();
    const metrics = performanceMonitor.getMetrics();
    
    return NextResponse.json({
      analysis,
      metrics: metrics.slice(-10), // Last 10 measurements
      summary: {
        totalMeasurements: metrics.length,
        averageResponseTime: metrics.length > 0 
          ? metrics.reduce((sum, m) => sum + m.total, 0) / metrics.length 
          : 0,
        slowestEndpoint: metrics.length > 0 
          ? metrics.reduce((slowest, current) => 
              current.total > slowest.total ? current : slowest
            ).endpoint 
          : 'No data'
      }
    });
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json({ error: 'Performance analysis failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    performanceMonitor.clearMetrics();
    return NextResponse.json({ message: 'Performance metrics cleared' });
  } catch (error) {
    console.error('Clear metrics error:', error);
    return NextResponse.json({ error: 'Failed to clear metrics' }, { status: 500 });
  }
}
