"use client"

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity
} from "lucide-react";

interface ConnectivityStatus {
  productHunt: boolean;
  hackerNews: boolean;
  github: boolean;
}

export function ConnectivityStatus() {
  const [connectivity, setConnectivity] = useState<ConnectivityStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Test API connectivity
  const testConnectivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-connectivity');
      const data = await response.json();
      
      if (data.success) {
        setConnectivity(data.connectivity);
        setLastChecked(new Date());
      } else {
        throw new Error(data.error || 'Connectivity test failed');
      }
    } catch (error) {
      console.error('Connectivity test error:', error);
      setError('Failed to test API connectivity');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-test on component mount
  useEffect(() => {
    testConnectivity();
  }, [testConnectivity]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(testConnectivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [testConnectivity]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  const getOverallStatus = () => {
    if (!connectivity) return 'unknown';
    const { productHunt, hackerNews, github } = connectivity;
    const connectedCount = [productHunt, hackerNews, github].filter(Boolean).length;
    
    if (connectedCount === 3) return 'all-connected';
    if (connectedCount === 2) return 'mostly-connected';
    if (connectedCount === 1) return 'partially-connected';
    return 'disconnected';
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-slate-700 dark:text-white">
              API Connectivity Status
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnectivity}
            disabled={loading}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 transition-all duration-300 hover:shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Test
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">Connection Test Failed</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={testConnectivity}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : connectivity ? (
          <div className="space-y-6">
            {/* Enhanced Overall Status */}
            <div className="text-center p-6 bg-card/50 dark:bg-slate-800/50 rounded-2xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-center gap-3 mb-3">
                {overallStatus === 'all-connected' && <Wifi className="h-8 w-8 text-green-600 dark:text-green-400" />}
                {overallStatus === 'mostly-connected' && <Wifi className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />}
                {overallStatus === 'partially-connected' && <Wifi className="h-8 w-8 text-orange-600 dark:text-orange-400" />}
                {overallStatus === 'disconnected' && <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />}
                <span className="text-xl font-semibold text-slate-700 dark:text-white">
                  {overallStatus === 'all-connected' && 'All APIs Connected'}
                  {overallStatus === 'mostly-connected' && 'Mostly Connected'}
                  {overallStatus === 'partially-connected' && 'Partially Connected'}
                  {overallStatus === 'disconnected' && 'APIs Disconnected'}
                </span>
              </div>
              {lastChecked && (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Enhanced Individual API Status */}
            <div className="grid gap-4">
              <div className="group flex items-center justify-between p-4 bg-card/50 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 hover:bg-card/70 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {getStatusIcon(connectivity.productHunt)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-white">Product Hunt</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Product launch data</p>
                  </div>
                </div>
                {getStatusBadge(connectivity.productHunt)}
              </div>

              <div className="group flex items-center justify-between p-4 bg-card/50 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 hover:bg-card/70 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    {getStatusIcon(connectivity.hackerNews)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-white">Hacker News</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Developer discussions</p>
                  </div>
                </div>
                {getStatusBadge(connectivity.hackerNews)}
              </div>

              <div className="group flex items-center justify-between p-4 bg-card/50 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 hover:bg-card/70 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    {getStatusIcon(connectivity.github)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-white">GitHub</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Open source repositories</p>
                  </div>
                </div>
                {getStatusBadge(connectivity.github)}
              </div>
            </div>

            {/* Enhanced Status Summary */}
            <div className="text-center p-4 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-700 dark:to-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                {connectivity.productHunt && connectivity.hackerNews && connectivity.github
                  ? 'All data sources are operational'
                  : `${[connectivity.productHunt, connectivity.hackerNews, connectivity.github].filter(Boolean).length} of 3 data sources are operational`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="relative mb-4">
              {/* Outer ring */}
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 mx-auto"></div>
              {/* Inner ring */}
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-2 left-1/2 transform -translate-x-1/2"></div>
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">Testing Connectivity</h3>
            <p className="text-slate-500 dark:text-slate-300">Checking API endpoints...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
