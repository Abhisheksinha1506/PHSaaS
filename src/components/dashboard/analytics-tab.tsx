"use client"

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsSkeleton, CardSkeleton, ListItemSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  Calendar,
  Target,
  Zap,
  Users,
  Star,
  MessageCircle,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";
import { ConnectivityStatus } from "./connectivity-status";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatNumber, formatPercentage, formatCompactNumber } from "@/lib/number-utils";

interface AnalyticsTabProps {
  timeFilter: '24h' | '7d' | '30d';
  setTimeFilter: (filter: '24h' | '7d' | '30d') => void;
}

interface AnalyticsData {
  overview?: {
    totalLaunches: number;
    totalDiscussions: number;
    totalRepositories: number;
    avgVotes: number;
    avgScore: number;
    avgStars: number;
    topCategories: Array<{ name: string; count: number }>;
    trendingTopics: Array<{ name: string; ph: number; hn: number; gh: number; total: number }>;
    engagementTrends: Array<{ date: string; engagement: number; votes: number; comments: number }>;
  };
  trends?: {
    trendingTechnologies: { [key: string]: { momentum: number; growth: number; crossPlatform: boolean } };
    marketGaps: Array<{ category: string; opportunity: number; competition: number }>;
    crossPlatformCorrelations: { correlation: number; sharedTopics: number; crossPlatformTrends: number };
    momentumAnalysis: { phMomentum: number; hnMomentum: number };
  };
  performance?: {
    topPerformers: {
      productHunt: Array<any>;
      hackerNews: Array<any>;
      github: Array<any>;
    };
    engagementMetrics: {
      avgEngagement: number;
      avgScore: number;
      highEngagement: number;
      viralPosts: number;
    };
    growthRates: {
      phGrowth: number;
      hnGrowth: number;
      ghGrowth: number;
    };
    successFactors: {
      timing: string;
      categories: string[];
      engagement: string;
      topics: string;
    };
  };
}

export function AnalyticsTab({ timeFilter, setTimeFilter }: AnalyticsTabProps) {
  const { analyticsData, loading, error } = useAnalytics(timeFilter);
  const [activeMetric, setActiveMetric] = useState<'overview' | 'trends' | 'performance'>('overview');


  // Export analytics data
  const handleExport = useCallback(async (format: string) => {
    try {
      const response = await fetch(`/api/export?format=${format}&platforms=producthunt,hackernews,github&timeFilter=${timeFilter}&includeMetadata=true`);
      
      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [timeFilter]);

  // Show skeleton loading if data is still loading
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium mb-4">
          <Activity className="h-4 w-4" />
          Advanced Analytics
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-white mb-4">
          Analytics Dashboard
        </h2>
        <p className="text-xl text-slate-500 dark:text-slate-300 max-w-3xl mx-auto">
          Advanced market intelligence and performance analytics powered by real-time data
        </p>
      </div>

      {/* API Connectivity Status */}
      <div className="mb-6">
        <ConnectivityStatus />
      </div>

      {/* Enhanced Controls */}
      <div className="bg-card/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant={timeFilter === '24h' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter('24h')}
                className={`transition-all duration-300 ${
                  timeFilter === '24h' 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                    : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                24h
              </Button>
              <Button
                variant={timeFilter === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter('7d')}
                className={`transition-all duration-300 ${
                  timeFilter === '7d' 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                    : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                7d
              </Button>
              <Button
                variant={timeFilter === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter('30d')}
                className={`transition-all duration-300 ${
                  timeFilter === '30d' 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                    : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                30d
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 transition-all duration-300 hover:shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('xml')}
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 transition-all duration-300 hover:shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export XML
              </Button>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-300 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
              Auto-refreshing every 5 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Tabs */}
      <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as any)}>
        <TabsList className="grid w-full grid-cols-3 h-14 bg-card/70 dark:bg-slate-800/70 backdrop-blur-sm p-1 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 h-12 rounded-xl bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 font-medium">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2 h-12 rounded-xl bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 font-medium">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 h-12 rounded-xl bg-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 font-medium">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analyticsData.overview && (
            <>
              {/* Enhanced Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}></div>
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Total Launches</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analyticsData.overview.totalLaunches}</p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}></div>
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Discussions</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analyticsData.overview.totalDiscussions}</p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238b5cf6' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}></div>
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Repositories</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analyticsData.overview.totalRepositories}</p>
                      </div>
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}></div>
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Avg Engagement</p>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{analyticsData.overview.avgVotes}</p>
                      </div>
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Top Categories */}
              <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-slate-700 dark:text-white">
                      Top Categories
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.overview.topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-4 bg-card/50 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 hover:bg-card/70 dark:hover:bg-slate-700/50 transition-colors">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-300">{category.name}</span>
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Trending Topics */}
              <Card className="bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-slate-700 dark:text-white">
                      Trending Topics
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.overview.trendingTopics.map((topic, index) => (
                      <div key={topic.name} className="group flex items-center justify-between p-4 bg-card/50 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 hover:bg-card/70 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-700 dark:text-white mb-2">{topic.name}</h4>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-blue-700 dark:text-blue-300">PH: {topic.ph}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-green-700 dark:text-green-300">HN: {topic.hn}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              <span className="text-purple-700 dark:text-purple-300">GH: {topic.gh}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
                          {topic.total}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {analyticsData.trends && (
            <>
              {/* Trending Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(analyticsData.trends.trendingTechnologies).map(([tech, data]) => (
                      <div key={tech} className="p-4 border rounded-lg">
                        <h4 className="font-medium text-foreground capitalize">{tech}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Momentum:</span>
                            <span className="font-medium">{data.momentum}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Growth:</span>
                            <span className="font-medium">{data.growth}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Cross-Platform:</span>
                            <Badge variant={data.crossPlatform ? 'default' : 'secondary'}>
                              {data.crossPlatform ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Market Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.trends.marketGaps.map((gap, index) => (
                      <div key={gap.category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">{gap.category}</h4>
                          <div className="flex gap-4 text-sm text-foreground">
                            <span>Opportunity: {gap.opportunity}%</span>
                            <span>Competition: {gap.competition}%</span>
                          </div>
                        </div>
                        <Badge variant={gap.opportunity > 80 ? 'default' : gap.opportunity > 60 ? 'secondary' : 'outline'}>
                          {gap.opportunity > 80 ? 'High' : gap.opportunity > 60 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cross-Platform Correlations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Cross-Platform Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPercentage(analyticsData.trends.crossPlatformCorrelations.correlation * 100)}
                      </div>
                      <div className="text-sm text-foreground">Correlation</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.trends.crossPlatformCorrelations.sharedTopics}
                      </div>
                      <div className="text-sm text-foreground">Shared Topics</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analyticsData.trends.crossPlatformCorrelations.crossPlatformTrends}
                      </div>
                      <div className="text-sm text-foreground">Cross-Platform Trends</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {analyticsData.performance && (
            <>
              {/* Engagement Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-foreground">Avg Engagement:</span>
                        <span className="font-medium">{formatNumber(analyticsData.performance.engagementMetrics.avgEngagement)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">Avg Score:</span>
                        <span className="font-medium">{formatNumber(analyticsData.performance.engagementMetrics.avgScore)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">High Engagement:</span>
                        <span className="font-medium">{analyticsData.performance.engagementMetrics.highEngagement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">Viral Posts:</span>
                        <span className="font-medium">{analyticsData.performance.engagementMetrics.viralPosts}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Growth Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-foreground">Product Hunt:</span>
                        <span className="font-medium text-green-600">+{analyticsData.performance.growthRates.phGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">Hacker News:</span>
                        <span className="font-medium text-green-600">+{analyticsData.performance.growthRates.hnGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">GitHub:</span>
                        <span className="font-medium text-green-600">+{analyticsData.performance.growthRates.ghGrowth}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Success Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Optimal Timing</h4>
                      <p className="text-sm text-foreground">{analyticsData.performance.successFactors.timing}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Top Categories</h4>
                      <div className="flex flex-wrap gap-1">
                        {analyticsData.performance.successFactors.categories.map(category => (
                          <Badge key={category} variant="secondary" className="text-xs">{category}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Engagement Strategy</h4>
                      <p className="text-sm text-foreground">{analyticsData.performance.successFactors.engagement}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Trending Topics</h4>
                      <p className="text-sm text-foreground">{analyticsData.performance.successFactors.topics}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            {/* Outer ring */}
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 dark:border-orange-800"></div>
            {/* Inner ring */}
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent absolute top-2 left-2"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">Loading Analytics</h3>
            <p className="text-slate-500 dark:text-slate-300 mb-4">Processing market intelligence data...</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <RefreshCw className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-white mb-2">Failed to Load Analytics</h3>
          <p className="text-red-600 dark:text-red-400 mb-6 max-w-md mx-auto">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
