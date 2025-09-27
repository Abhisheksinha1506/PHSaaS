/**
 * Synchronized Dashboard Component
 * Example of how to use synchronized fetching for consistent API timing
 */

"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Database,
  Zap,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useSynchronizedFetch } from "@/hooks/useSynchronizedFetch";
import { ProductHuntTab } from "./product-hunt-tab";
import { HackerNewsTab } from "./hacker-news-tab";
import { SaaSHubTab } from "./saashub-tab";

interface SynchronizedDashboardProps {
  timeFilter?: '24h' | '7d' | '30d';
  autoRefresh?: boolean;
}

export function SynchronizedDashboard({ 
  timeFilter = '7d', 
  autoRefresh = true 
}: SynchronizedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use synchronized fetching hook
  const {
    data,
    loading,
    error,
    successCount,
    errorCount,
    fromCacheCount,
    totalTime,
    lastFetch,
    fromCache,
    refresh,
    forceRefresh,
    isFullyLoaded,
    isPartiallyLoaded,
    hasAnyData,
    getLoadingStatus,
    getErrorStatus
  } = useSynchronizedFetch({
    platforms: ['producthunt', 'hackernews', 'github'],
    timeFilter,
    autoRefresh,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    onSuccess: (result) => {
      console.log('✅ All APIs loaded successfully!', result);
    },
    onError: (error) => {
      console.error('❌ API fetch failed:', error);
    }
  });

  // Get loading status for each platform
  const phLoading = getLoadingStatus('producthunt');
  const hnLoading = getLoadingStatus('hackernews');
  const ghLoading = getLoadingStatus('github');

  // Get error status for each platform
  const phError = getErrorStatus('producthunt');
  const hnError = getErrorStatus('hackernews');
  const ghError = getErrorStatus('github');

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Synchronized Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={refresh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={forceRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Force Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Product Hunt</span>
              {phLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : phError ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Hacker News</span>
              {hnLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : hnError ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">GitHub</span>
              {ghLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : ghError ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {totalTime > 0 ? `${totalTime}ms` : 'Loading...'}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={isFullyLoaded ? "default" : "secondary"}>
              {successCount}/3 APIs Loaded
            </Badge>
            {fromCacheCount > 0 && (
              <Badge variant="outline">
                {fromCacheCount} from Cache
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Errors
              </Badge>
            )}
            {fromCache && (
              <Badge variant="outline">
                Cached Data
              </Badge>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Synchronized Fetch Error</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          )}

          {/* Loading States */}
          {loading && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="font-medium">
                  {isPartiallyLoaded ? 'Loading remaining APIs...' : 'Loading all APIs simultaneously...'}
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Fetching data from Product Hunt, Hacker News, and GitHub...
              </p>
            </div>
          )}

          {/* Success Message */}
          {isFullyLoaded && !loading && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">All APIs Loaded Successfully!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Loaded in {totalTime}ms • Last updated: {lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'Unknown'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      {hasAnyData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="producthunt">Product Hunt</TabsTrigger>
            <TabsTrigger value="hackernews">Hacker News</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Product Hunt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.productHunt.length}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                  {phLoading && <p className="text-xs text-blue-500">Loading...</p>}
                  {phError && <p className="text-xs text-red-500">Error: {phError}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Hacker News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.hackerNews.length}</p>
                  <p className="text-sm text-muted-foreground">Stories</p>
                  {hnLoading && <p className="text-xs text-blue-500">Loading...</p>}
                  {hnError && <p className="text-xs text-red-500">Error: {hnError}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    GitHub
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.github.length}</p>
                  <p className="text-sm text-muted-foreground">Repositories</p>
                  {ghLoading && <p className="text-xs text-blue-500">Loading...</p>}
                  {ghError && <p className="text-xs text-red-500">Error: {ghError}</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="producthunt">
            <ProductHuntTab 
              data={data.productHunt} 
              loading={phLoading}
              error={phError}
            />
          </TabsContent>

          <TabsContent value="hackernews">
            <HackerNewsTab 
              data={data.hackerNews} 
              loading={hnLoading}
              error={hnError}
            />
          </TabsContent>

          <TabsContent value="github">
            <SaaSHubTab 
              data={data.github} 
              loading={ghLoading}
              error={ghError}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* No Data State */}
      {!hasAnyData && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Unable to load data from the APIs. This could be due to rate limiting or network issues.
            </p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
