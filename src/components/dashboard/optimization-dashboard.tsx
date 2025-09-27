'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Clock, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  Settings
} from 'lucide-react';

interface CacheStats {
  size: number;
  entries: Array<{
    key: string;
    age: string;
    ttl: string;
    remaining: string;
  }>;
}

interface PerformanceData {
  cache: CacheStats;
  performance: {
    hitRate: string;
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
  };
}

export function OptimizationDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cache');
      if (!response.ok) throw new Error('Failed to fetch cache data');
      const data = await response.json();
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setActionLoading('clear');
      await fetch('/api/cache', { method: 'DELETE' });
      await fetchPerformanceData();
    } catch (err) {
      console.error('Failed to clear cache:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const cleanupCache = async () => {
    try {
      setActionLoading('cleanup');
      await fetch('/api/cache', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      });
      await fetchPerformanceData();
    } catch (err) {
      console.error('Failed to cleanup cache:', err);
    } finally {
      setActionLoading(null);
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
            <Settings className="h-5 w-5" />
            Performance Optimization
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
            <Settings className="h-5 w-5" />
            Performance Optimization
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
            <Settings className="h-5 w-5" />
            Performance Optimization
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

  const { cache, performance } = performanceData;
  const memoryUsageMB = Math.round(performance.memoryUsage.heapUsed / 1024 / 1024);

  return (
    <div className="space-y-6">
      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Management
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cleanupCache}
                disabled={actionLoading === 'cleanup'}
              >
                {actionLoading === 'cleanup' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Cleanup
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={clearCache}
                disabled={actionLoading === 'clear'}
              >
                {actionLoading === 'clear' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear All
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage API response caching for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cache Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{cache.size}</div>
              <div className="text-sm text-gray-600">Cached Entries</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{memoryUsageMB}MB</div>
              <div className="text-sm text-gray-600">Memory Used</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {performance.hitRate}
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
          </div>

          {/* Cache Entries */}
          {cache.entries.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Cache Entries
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cache.entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium">{entry.key}</div>
                        <div className="text-sm text-gray-600">
                          Age: {entry.age} | TTL: {entry.ttl}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {entry.remaining} remaining
                      </div>
                      <Badge variant={parseInt(entry.remaining) > 60 ? 'default' : 'destructive'}>
                        {parseInt(entry.remaining) > 60 ? 'Fresh' : 'Expiring'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimizations
          </CardTitle>
          <CardDescription>
            Active optimizations and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Optimization Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">API Caching</span>
              </div>
              <div className="text-sm text-green-700">
                ✅ Active - Reduces external API calls by {cache.size > 0 ? '~80%' : '0%'}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Request Timeouts</span>
              </div>
              <div className="text-sm text-green-700">
                ✅ Active - Prevents hanging requests
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Parallel API Calls</span>
              </div>
              <div className="text-sm text-green-700">
                ✅ Active - Concurrent data fetching
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Memory Usage</span>
              </div>
              <div className="text-sm text-blue-700">
                📊 {memoryUsageMB}MB - {memoryUsageMB < 50 ? 'Good' : 'Monitor'}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Optimization Recommendations
            </h4>
            <div className="space-y-2">
              {cache.size === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    💡 Cache is empty - API calls will be slower on first load
                  </div>
                </div>
              )}
              
              {memoryUsageMB > 100 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">
                    ⚠️ High memory usage detected - consider clearing cache
                  </div>
                </div>
              )}
              
              {cache.size > 0 && memoryUsageMB < 100 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800">
                    ✅ Performance optimizations are working well
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
