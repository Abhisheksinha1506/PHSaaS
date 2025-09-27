import { useState, useEffect, useCallback } from 'react';

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

export function useAnalytics(timeFilter: '24h' | '7d' | '30d') {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data for a specific metric
  const fetchAnalytics = useCallback(async (metric: 'overview' | 'trends' | 'performance') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics?metric=${metric}&timeFilter=${timeFilter}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAnalyticsData(prev => ({
        ...prev,
        [metric]: data.data
      }));
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  // Load all analytics data
  const loadAllAnalytics = useCallback(async () => {
    await Promise.all([
      fetchAnalytics('overview'),
      fetchAnalytics('trends'),
      fetchAnalytics('performance')
    ]);
  }, [fetchAnalytics]);

  // Auto-load analytics on mount, timeFilter change, and every 5 minutes
  useEffect(() => {
    // Initial load
    loadAllAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAllAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAllAnalytics]);

  return {
    analyticsData,
    loading,
    error,
    fetchAnalytics,
    loadAllAnalytics
  };
}
