'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceData {
  analysis: {
    slowestOperation: string;
    averageResponseTime: number;
    bottlenecks: Array<{
      operation: string;
      time: number;
      percentage: number;
      recommendation: string;
    }>;
    recommendations: string[];
  };
  metrics: Array<{
    apiCalls: number;
    dataProcessing: number;
    analyticsCalculation: number;
    total: number;
    timestamp: string;
    endpoint: string;
  }>;
  summary: {
    totalMeasurements: number;
    averageResponseTime: number;
    slowestEndpoint: string;
  };
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance');
      if (!response.ok) throw new Error('Failed to fetch performance data');
      const data = await response.json();
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearMetrics = async () => {
    try {
      await fetch('/api/performance', { method: 'DELETE' });
      await fetchPerformanceData();
    } catch (err) {
      console.error('Failed to clear metrics:', err);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-4">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-center py-4">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const { analysis, summary } = performanceData;

  const getPerformanceStatus = (avgTime: number) => {
    if (avgTime < 1000) return { status: 'excellent', color: 'green', icon: CheckCircle };
    if (avgTime < 3000) return { status: 'good', color: 'blue', icon: CheckCircle };
    if (avgTime < 5000) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'critical', color: 'red', icon: AlertTriangle };
  };

  const performanceStatus = getPerformanceStatus(analysis.averageResponseTime);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Monitor
            </div>
            <Button variant="outline" size="sm" onClick={clearMetrics}>
              Clear Metrics
            </Button>
          </CardTitle>
          <CardDescription>
            Real-time performance analysis and bottleneck detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Performance Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <performanceStatus.icon className={`h-6 w-6 text-${performanceStatus.color}-600`} />
              <div>
                <div className="font-semibold">Overall Performance</div>
                <div className="text-sm text-gray-600">
                  {analysis.averageResponseTime.toFixed(2)}ms average
                </div>
              </div>
            </div>
            <Badge variant={performanceStatus.status === 'excellent' ? 'default' : 'destructive'}>
              {performanceStatus.status.toUpperCase()}
            </Badge>
          </div>

          {/* Bottleneck Analysis */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Bottleneck Analysis
            </h4>
            <div className="space-y-2">
              {analysis.bottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-medium">{bottleneck.operation}</div>
                      <div className="text-sm text-gray-600">{bottleneck.recommendation}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{bottleneck.time.toFixed(2)}ms</div>
                    <div className="text-sm text-gray-600">{bottleneck.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalMeasurements}</div>
              <div className="text-sm text-gray-600">Measurements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {summary.slowestEndpoint.split('/').pop() || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Slowest Endpoint</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
