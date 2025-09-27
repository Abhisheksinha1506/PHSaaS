"use client"

import { useState, useMemo, useEffect } from "react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, MessageCircle, Star, ExternalLink, Calendar, Info, X, BarChart3, Target, Zap } from "lucide-react";
import { StatsSkeleton, CardSkeleton, ListItemSkeleton } from "@/components/ui/skeleton";
import { thresholdCalculator, CalculatedThresholds } from "@/lib/threshold-calculator";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatNumber, formatCompactNumber } from "@/lib/number-utils";

interface TrendTrackerTabProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  saaSHubData: SaaSHubAlternative[];
  timeFilter: '24h' | '7d' | '30d';
  setTimeFilter: (filter: '24h' | '7d' | '30d') => void;
}

export function TrendTrackerTab({ productHuntData, hackerNewsData, saaSHubData, timeFilter, setTimeFilter }: TrendTrackerTabProps) {
  const [trendFilter, setTrendFilter] = useState<'all' | 'hot' | 'high-engagement' | 'saturated' | 'single-platform' | 'multi-platform'>('all');
  const [selectedTrend, setSelectedTrend] = useState<{topic: string, data: any} | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Analytics integration
  const { analyticsData, loading: analyticsLoading } = useAnalytics(timeFilter);

  // Debug: Track data changes
  useEffect(() => {
    console.log(`📊 Data Change Detected (${timeFilter}):`);
    console.log(`  Product Hunt: ${productHuntData.length} items`);
    console.log(`  Hacker News: ${hackerNewsData.length} items`);
    console.log(`  GitHub: ${saaSHubData.length} items`);
    
    if (productHuntData.length > 0) {
      console.log(`  Sample PH item:`, productHuntData[0].name, productHuntData[0].created_at);
    }
    if (hackerNewsData.length > 0) {
      console.log(`  Sample HN item:`, hackerNewsData[0].title, new Date(hackerNewsData[0].time * 1000));
    }
    if (saaSHubData.length > 0) {
      console.log(`  Sample GH item:`, saaSHubData[0].name, saaSHubData[0].reviews_count);
    }
  }, [productHuntData, hackerNewsData, saaSHubData, timeFilter]);

  // Show skeleton loading if data is still loading
  const isLoading = analyticsLoading || (productHuntData.length === 0 && hackerNewsData.length === 0 && saaSHubData.length === 0);

  // Cross-platform trend analysis - Multiple approaches
  const crossPlatformTrends = useMemo(() => {
    const trends: { [key: string]: { ph: number; hn: number; gh: number; total: number; momentum: number; viral: number; gap: number } } = {};
    
    // Define category mappings - Expanded to capture more trends
    const categoryMappings = {
      'AI & Machine Learning': {
        ph: ['AI', 'Machine Learning', 'Artificial Intelligence', 'ML', 'Deep Learning', 'Neural Networks'],
        hn: ['ai', 'machine learning', 'artificial intelligence', 'ml', 'neural', 'deep learning', 'tensorflow', 'pytorch'],
        gh: ['ai', 'machine-learning', 'artificial-intelligence', 'ml', 'neural-network', 'deep-learning', 'tensorflow', 'pytorch']
      },
      'Web Development': {
        ph: ['Web Development', 'Frontend', 'Backend', 'Full Stack', 'JavaScript', 'React', 'Vue', 'Angular'],
        hn: ['javascript', 'react', 'vue', 'angular', 'node', 'typescript', 'web', 'frontend', 'backend', 'html', 'css'],
        gh: ['javascript', 'react', 'vue', 'angular', 'nodejs', 'typescript', 'web-development', 'frontend', 'backend', 'html', 'css']
      },
      'Education & Learning': {
        ph: ['Education', 'Learning', 'Tutorial', 'Course', 'Training', 'Certification'],
        hn: ['education', 'learning', 'tutorial', 'course', 'learn', 'teaching', 'training', 'certification'],
        gh: ['education', 'learning', 'tutorial', 'course', 'learn', 'teaching', 'curriculum', 'training']
      },
      'Developer Tools': {
        ph: ['Developer Tools', 'IDE', 'Debugging', 'Testing', 'Code Editor', 'Terminal'],
        hn: ['tools', 'ide', 'debugging', 'testing', 'development', 'dev', 'editor', 'terminal'],
        gh: ['tools', 'ide', 'debugging', 'testing', 'development', 'dev-tools', 'editor', 'terminal']
      },
      'Data & Analytics': {
        ph: ['Data', 'Analytics', 'Visualization', 'Database', 'Business Intelligence'],
        hn: ['data', 'analytics', 'visualization', 'database', 'sql', 'big-data', 'business intelligence'],
        gh: ['data', 'analytics', 'visualization', 'database', 'sql', 'big-data', 'business-intelligence']
      },
      'Mobile Development': {
        ph: ['Mobile', 'iOS', 'Android', 'React Native', 'Flutter'],
        hn: ['mobile', 'ios', 'android', 'react native', 'flutter', 'app development'],
        gh: ['mobile', 'ios', 'android', 'react-native', 'flutter', 'app-development']
      },
      'DevOps & Infrastructure': {
        ph: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'Cloud', 'Infrastructure'],
        hn: ['devops', 'docker', 'kubernetes', 'aws', 'cloud', 'infrastructure', 'deployment'],
        gh: ['devops', 'docker', 'kubernetes', 'aws', 'cloud', 'infrastructure', 'deployment']
      },
      'Security': {
        ph: ['Security', 'Cybersecurity', 'Authentication', 'Encryption'],
        hn: ['security', 'cybersecurity', 'authentication', 'encryption', 'privacy'],
        gh: ['security', 'cybersecurity', 'authentication', 'encryption', 'privacy']
      },
      'Gaming': {
        ph: ['Gaming', 'Game Development', 'Unity', 'Unreal Engine'],
        hn: ['gaming', 'game development', 'unity', 'unreal engine', 'games'],
        gh: ['gaming', 'game-development', 'unity', 'unreal-engine', 'games']
      },
      'Blockchain & Crypto': {
        ph: ['Blockchain', 'Cryptocurrency', 'Web3', 'NFT'],
        hn: ['blockchain', 'cryptocurrency', 'web3', 'nft', 'crypto'],
        gh: ['blockchain', 'cryptocurrency', 'web3', 'nft', 'crypto']
      }
    };

    // Analyze Product Hunt by categories
    productHuntData.forEach(item => {
      Object.entries(categoryMappings).forEach(([category, keywords]) => {
        const matches = item.topics.some(topic => 
          keywords.ph.some(keyword => 
            topic.name.toLowerCase().includes(keyword.toLowerCase())
          )
        );
        
        if (matches) {
          if (!trends[category]) trends[category] = { ph: 0, hn: 0, gh: 0, total: 0, momentum: 0, viral: 0, gap: 0 };
          trends[category].ph += item.votes_count;
          trends[category].total += item.votes_count;
          
          // Calculate momentum (engagement velocity)
          const engagement = item.votes_count + item.comments_count;
          const timeDiff = Date.now() - new Date(item.created_at).getTime();
          const momentum = engagement / (timeDiff / (1000 * 60 * 60 * 24)); // engagement per day
          trends[category].momentum += momentum;
          
          // Calculate viral coefficient (comments/votes ratio)
          const viral = item.comments_count / Math.max(item.votes_count, 1);
          trends[category].viral += viral;
        }
      });
    });

    // Analyze Hacker News by categories
    hackerNewsData.forEach(item => {
      const title = item.title.toLowerCase();
      const combinedText = title;
      
      Object.entries(categoryMappings).forEach(([category, keywords]) => {
        const matches = keywords.hn.some(keyword => 
          combinedText.includes(keyword.toLowerCase())
        );
        
        if (matches) {
          if (!trends[category]) trends[category] = { ph: 0, hn: 0, gh: 0, total: 0, momentum: 0, viral: 0, gap: 0 };
          trends[category].hn += item.score;
          trends[category].total += item.score;
          
          // Calculate momentum for HN (score velocity)
          const timeDiff = Date.now() - (item.time * 1000);
          const momentum = item.score / (timeDiff / (1000 * 60 * 60 * 24)); // score per day
          trends[category].momentum += momentum;
          
          // Calculate viral coefficient (comments/score ratio)
          const viral = (item.descendants || 0) / Math.max(item.score, 1);
          trends[category].viral += viral;
        }
      });
    });

    // Analyze GitHub by categories
    saaSHubData.forEach((item, index) => {
      const allText = [
        ...item.features, 
        item.name.toLowerCase(),
        item.description?.toLowerCase() || ''
      ].join(' ');
      
      Object.entries(categoryMappings).forEach(([category, keywords]) => {
        const matches = keywords.gh.some(keyword => 
          allText.includes(keyword.toLowerCase())
        );
        
        if (matches) {
          if (!trends[category]) trends[category] = { ph: 0, hn: 0, gh: 0, total: 0, momentum: 0, viral: 0, gap: 0 };
          trends[category].gh += item.reviews_count;
          trends[category].total += item.reviews_count;
          
          // Calculate momentum for GitHub (stars velocity)
          const momentum = item.reviews_count / 365; // stars per year (approximation)
          trends[category].momentum += momentum;
          
          // Calculate viral coefficient (rating as proxy for engagement)
          const viral = item.rating / 5; // normalized rating
          trends[category].viral += viral;
          
          // Calculate market gap (opportunity score)
          // Higher gap = more opportunity, lower gap = more saturated
          const gap = Math.max(0, 1 - (item.reviews_count / 100000)); // 0-1 scale, 100k+ stars = saturated
          trends[category].gap += gap;
        }
      });
    });

    // Debug: Log the category-based trends
    console.log(`🔍 Cross-Platform Trends Analysis (${timeFilter}):`);
    console.log('Category-based trends found:', Object.keys(trends).length);
    console.log('Data sources - Product Hunt:', productHuntData.length, 'Hacker News:', hackerNewsData.length, 'GitHub:', saaSHubData.length);
    
    // Debug detailed trend data
    const sortedTrends = Object.entries(trends)
      .filter(([_, data]) => data.total > 50)
      .sort(([_, a], [__, b]) => b.total - a.total)
      .slice(0, 5);
    
    console.log('Top 5 trends:', sortedTrends.map(([category, data]) => ({
      category,
      total: data.total,
      ph: data.ph,
      hn: data.hn,
      gh: data.gh,
      momentum: data.momentum.toFixed(2),
      viral: data.viral.toFixed(2)
    })));
    
    // Debug gap values specifically
    Object.entries(trends).forEach(([category, data]) => {
      if (data.gap > 0) {
        console.log(`${category}: gap=${data.gap.toFixed(3)}, stars=${data.gh}`);
      }
    });

    // Debug: Log all trends found
    console.log('🔍 All trends found:', Object.keys(trends).length);
    console.log('🔍 Trend categories:', Object.keys(trends));
    
    const allTrends = Object.entries(trends)
      .filter(([_, data]) => data.total > 0) // Show all trends with any activity
      .sort(([_, a], [__, b]) => b.total - a.total);
    
    console.log('🔍 Filtered trends count:', allTrends.length);
    console.log('🔍 Filtered trend names:', allTrends.map(([name]) => name));
    
    return allTrends;
  }, [productHuntData, hackerNewsData, saaSHubData, timeFilter]);

  // Filter cross-platform trends based on selected filter
  const filteredCrossPlatformTrends = useMemo(() => {
    console.log('🔍 Filtering trends with filter:', trendFilter);
    console.log('🔍 Total crossPlatformTrends:', crossPlatformTrends.length);
    
    if (trendFilter === 'all') {
      console.log('🔍 Returning all trends:', crossPlatformTrends.length);
      console.log('🔍 All trend names:', crossPlatformTrends.map(([name]) => name));
      return crossPlatformTrends;
    }
    
    const filteredResults = crossPlatformTrends.filter(([category, data]) => {
      switch (trendFilter) {
        case 'hot':
          // Growth: 🔥 Hot (momentum > 20)
          return data.momentum > 20;
        case 'high-engagement':
          // Engagement: 💬 High (viral > 0.3)
          return data.viral > 0.3;
        case 'saturated':
          // Market: 📈 Saturated (gap <= 0.3)
          return data.gap <= 0.3;
        case 'single-platform':
          // Single Platform (only one platform has activity)
          const platformCount = [data.ph > 0, data.hn > 0, data.gh > 0].filter(Boolean).length;
          return platformCount === 1;
        case 'multi-platform':
          // Multi-Platform (multiple platforms have activity)
          const multiPlatformCount = [data.ph > 0, data.hn > 0, data.gh > 0].filter(Boolean).length;
          return multiPlatformCount > 1;
        default:
          return true;
      }
    });
    
    console.log('🔍 Filtered results count:', filteredResults.length);
    console.log('🔍 Filtered result names:', filteredResults.map(([name]) => name));
    
    return filteredResults;
  }, [crossPlatformTrends, trendFilter]);

  // Calculate dynamic thresholds
  const dynamicThresholds = useMemo(() => {
    return thresholdCalculator.calculateAllThresholds(
      productHuntData,
      hackerNewsData,
      saaSHubData,
      [],
      timeFilter
    );
  }, [productHuntData, hackerNewsData, saaSHubData, timeFilter]);

  // Enhanced Market signals with dynamic analysis
  const marketSignals = useMemo(() => {
    const signals = [];
    
    // Use calculated dynamic thresholds
    const thresholds = {
      votes: dynamicThresholds.votes.medium,
      comments: dynamicThresholds.comments.medium
    };
    
    // High engagement products with dynamic thresholds
    const highEngagement = productHuntData
      .filter(item => item.votes_count > thresholds.votes && item.comments_count > thresholds.comments)
      .sort((a, b) => (b.votes_count + b.comments_count) - (a.votes_count + a.comments_count))
      .slice(0, 5);
    
    if (highEngagement.length > 0) {
      const avgEngagement = Math.round(
        highEngagement.reduce((sum, item) => sum + item.votes_count + item.comments_count, 0) / highEngagement.length
      );
      
      signals.push({
        type: 'success',
        title: '🔥 High Engagement Products',
        description: `${highEngagement.length} products with >${thresholds.votes} votes and >${thresholds.comments} comments (avg: ${avgEngagement} engagement)`,
        items: highEngagement.map(item => item.name),
        metrics: {
          totalEngagement: highEngagement.reduce((sum, item) => sum + item.votes_count + item.comments_count, 0),
          avgVotes: Math.round(highEngagement.reduce((sum, item) => sum + item.votes_count, 0) / highEngagement.length),
          avgComments: Math.round(highEngagement.reduce((sum, item) => sum + item.comments_count, 0) / highEngagement.length)
        }
      });
    }

    // Trending technologies with momentum analysis
    const trendingTech = crossPlatformTrends
      .filter(([_, data]) => data.total > 0)
      .sort(([_, a], [__, b]) => b.momentum - a.momentum)
      .slice(0, 3);
    
    if (trendingTech.length > 0) {
      const totalMomentum = trendingTech.reduce((sum, [_, data]) => sum + data.momentum, 0);
      const avgMomentum = Math.round(totalMomentum / trendingTech.length);
      
      signals.push({
        type: 'info',
        title: '📈 Trending Technologies',
        description: `Top ${trendingTech.length} trending topics with ${avgMomentum} avg momentum (${timeFilter})`,
        items: trendingTech.map(([topic, data]) => `${topic} (${Math.round(data.momentum)} momentum)`),
        metrics: {
          totalMomentum,
          avgMomentum,
          crossPlatformCount: trendingTech.filter(([_, data]) => data.ph > 0 && data.hn > 0).length
        }
      });
    }

    // Dynamic GitHub activity analysis
    const getDynamicGitHubThresholds = (data: any[], timeFilter: string) => {
      if (data.length === 0) return { stars: 0, label: '0' };
      
      const stars = data.map(item => item.reviews_count).sort((a, b) => b - a);
      const p50 = stars[Math.floor(stars.length * 0.5)] || 0;
      
      const timeMultiplier = timeFilter === '24h' ? 0.3 : timeFilter === '7d' ? 0.7 : 1;
      const threshold = Math.max(100, Math.round(p50 * timeMultiplier));
      
      return {
        stars: threshold,
        label: threshold >= 1000 ? `${Math.round(threshold/1000)}k` : threshold.toString()
      };
    };
    
    const githubThresholds = getDynamicGitHubThresholds(saaSHubData, timeFilter);
    
    // High GitHub activity with dynamic thresholds
    const highActivity = saaSHubData
      .filter(item => item.reviews_count > githubThresholds.stars)
      .sort((a, b) => b.reviews_count - a.reviews_count)
      .slice(0, 5);
    
    if (highActivity.length > 0) {
      const totalStars = highActivity.reduce((sum, item) => sum + item.reviews_count, 0);
      const avgStars = Math.round(totalStars / highActivity.length);
      
      signals.push({
        type: 'warning',
        title: '⭐ High GitHub Activity',
        description: `${highActivity.length} repositories with >${githubThresholds.label} stars (avg: ${Math.round(avgStars/1000)}k stars)`,
        items: highActivity.map(item => item.name),
        metrics: {
          totalStars,
          avgStars,
          highRatedCount: highActivity.filter(item => item.rating > 4).length
        }
      });
    }

    // Market opportunity analysis
    const opportunities = crossPlatformTrends
      .filter(([_, data]) => data.gap > 0.7 && data.total > 1000)
      .sort(([_, a], [__, b]) => b.gap - a.gap)
      .slice(0, 3);
    
    if (opportunities.length > 0) {
      signals.push({
        type: 'success',
        title: '🎯 Market Opportunities',
        description: `${opportunities.length} underserved areas with high potential (${timeFilter})`,
        items: opportunities.map(([topic, data]) => `${topic} (${Math.round(data.gap * 100)}% opportunity)`),
        metrics: {
          avgOpportunity: Math.round(opportunities.reduce((sum, [_, data]) => sum + data.gap, 0) / opportunities.length * 100),
          totalPotential: opportunities.reduce((sum, [_, data]) => sum + data.total, 0)
        }
      });
    }

    return signals;
  }, [productHuntData, crossPlatformTrends, saaSHubData, timeFilter]);

  // Show skeleton loading if data is still loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Filter Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>

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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium mb-4">
          <TrendingUp className="h-4 w-4" />
          Advanced Analytics
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-white mb-4">
          TrendTracker Pro
        </h2>
        <p className="text-xl text-slate-500 dark:text-slate-300 max-w-3xl mx-auto">
          Cross-platform market intelligence and trend analysis powered by AI
        </p>
      </div>

      {/* Market Signals */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {marketSignals.map((signal, index) => (
          <Card key={index} className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
            </div>
            
            {/* Info Icon for Trending Technologies and High GitHub Activity */}
            {(signal.title.includes('Trending Technologies') || signal.title.includes('High GitHub Activity')) && (
              <button
                onClick={() => {
                  setSelectedTrend({topic: signal.title, data: signal.metrics});
                  setShowDetailsModal(true);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-card/50 dark:hover:bg-slate-800/50 rounded-full transition-all duration-300 z-10 group-hover:scale-110"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
            )}
            
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-lg font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-slate-700 dark:text-white">{signal.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-500 dark:text-slate-300 mb-4 leading-relaxed">{signal.description}</p>
              <div className="flex flex-wrap gap-2">
                {signal.items.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Insights */}
      {analyticsData.overview && (
        <Card className="bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <BarChart3 className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="text-slate-700 dark:text-white">
                Analytics Insights ({timeFilter})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  Market Performance
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-600 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-300">Avg Engagement:</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-white text-lg">{analyticsData.overview.avgVotes} votes</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-600 rounded-lg">
                        <MessageCircle className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-300">Avg Discussion Score:</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-white text-lg">{analyticsData.overview.avgScore} points</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-600 rounded-lg">
                        <Star className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-300">Avg Repository Stars:</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-white text-lg">{analyticsData.overview.avgStars} stars</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  Top Categories
                </h4>
                <div className="space-y-3">
                  {analyticsData.overview.topCategories.slice(0, 3).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      <span className="text-slate-500 dark:text-slate-300 font-medium">{category.name}</span>
                      <Badge variant="secondary" className="bg-slate-900 dark:bg-card text-white dark:text-slate-900 border-0">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
        <Card className="bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="text-slate-700 dark:text-white">
                Market Overview ({timeFilter})
              </span>
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group text-center p-6 bg-card dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedTrend({topic: 'Product Launches', data: {ph: productHuntData.length, hn: 0, gh: 0, total: productHuntData.length, momentum: 0, viral: 0, gap: 0}});
                  setShowDetailsModal(true);
                }}
                className="absolute top-3 right-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-300 z-10 group-hover:scale-105"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold text-slate-700 dark:text-white mb-2">{productHuntData.length}</div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-1">Product Launches</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {productHuntData.length > 0 ? formatNumber(productHuntData.reduce((sum, item) => sum + item.votes_count, 0) / productHuntData.length) : 0} avg votes
                </div>
              </div>
            </div>
            
            <div className="group text-center p-6 bg-card dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedTrend({topic: 'HN Discussions', data: {ph: 0, hn: hackerNewsData.length, gh: 0, total: hackerNewsData.length, momentum: 0, viral: 0, gap: 0}});
                  setShowDetailsModal(true);
                }}
                className="absolute top-3 right-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-300 z-10 group-hover:scale-105"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold text-slate-700 dark:text-white mb-2">{hackerNewsData.length}</div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-1">HN Discussions</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {hackerNewsData.length > 0 ? Math.round(hackerNewsData.reduce((sum, item) => sum + item.score, 0) / hackerNewsData.length) : 0} avg score
                </div>
              </div>
            </div>
            
            <div className="group text-center p-6 bg-card dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedTrend({topic: 'Open Source Tools', data: {ph: 0, hn: 0, gh: saaSHubData.length, total: saaSHubData.length, momentum: 0, viral: 0, gap: 0}});
                  setShowDetailsModal(true);
                }}
                className="absolute top-3 right-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-300 z-10 group-hover:scale-105"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold text-slate-700 dark:text-white mb-2">{saaSHubData.length}</div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-1">Open Source Tools</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {saaSHubData.length > 0 ? Math.round(saaSHubData.reduce((sum, item) => sum + item.reviews_count, 0) / saaSHubData.length / 1000) : 0}k avg stars
                </div>
              </div>
            </div>
            
            <div className="group text-center p-6 bg-card dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedTrend({topic: 'Active Trends', data: {ph: 0, hn: 0, gh: 0, total: crossPlatformTrends.length, momentum: 0, viral: 0, gap: 0}});
                  setShowDetailsModal(true);
                }}
                className="absolute top-3 right-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-300 z-10 group-hover:scale-105"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold text-slate-700 dark:text-white mb-2">{crossPlatformTrends.length}</div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-1">Active Trends</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {crossPlatformTrends.filter(([_, data]) => data.ph > 0 && data.hn > 0).length} cross-platform
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Platform Trends */}
      <Card className="bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-slate-700 dark:text-white">
                Cross-Platform Trends
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <select
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value as any)}
                className="px-4 py-3 text-sm border border-purple-200 dark:border-purple-700 rounded-xl bg-card/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-lg"
              >
                <option value="all">All Trends</option>
                <option value="hot">🔥 Hot Growth</option>
                <option value="high-engagement">💬 High Engagement</option>
                <option value="saturated">📈 Saturated Market</option>
                <option value="single-platform">Single Platform</option>
                <option value="multi-platform">Multi-Platform</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCrossPlatformTrends.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
              {filteredCrossPlatformTrends.map(([topic, data], index) => (
                <div key={topic} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-card/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-2xl hover:bg-card/70 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238b5cf6' fill-opacity='0.05'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}></div>
                  </div>
                  
                  
                  <div className="flex-1 mb-4 sm:mb-0 relative z-10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize mb-3">{topic}</h3>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">Launch Activity:</span>
                          <span className="sm:hidden text-slate-700 dark:text-slate-300">Launch:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {data.ph > 0 ? `${data.ph.toLocaleString()} votes` : 'No launches'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">Developer Buzz:</span>
                          <span className="sm:hidden text-slate-700 dark:text-slate-300">Dev:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {data.hn > 0 ? `${data.hn.toLocaleString()} score` : 'No buzz'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">Open Source:</span>
                          <span className="sm:hidden text-slate-700 dark:text-slate-300">OSS:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {data.gh > 0 ? `${Math.round(data.gh / 1000)}k stars` : 'No activity'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Enhanced Advanced Metrics */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                          Growth: {data.momentum > 50 ? '🔥 Hot' : data.momentum > 20 ? '📈 Rising' : data.momentum > 5 ? '📊 Steady' : '📉 Declining'} ({Math.round(data.momentum)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                        <span className="text-xs font-medium text-pink-700 dark:text-pink-300">
                          Engagement: {data.viral > 0.5 ? '💬 High' : data.viral > 0.2 ? '💭 Medium' : '🔇 Low'} ({Math.round(data.viral * 100)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                          Market: {data.gap > 0.8 ? '🎯 High Opportunity' : data.gap > 0.5 ? '⚡ Growing' : data.gap > 0.2 ? '📈 Mature' : '🔴 Saturated'} ({Math.round(data.gap * 100)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Cross-Platform: {data.ph > 0 && data.hn > 0 && data.gh > 0 ? '🚀 All 3' : 
                                         (data.ph > 0 && data.hn > 0) || (data.ph > 0 && data.gh > 0) || (data.hn > 0 && data.gh > 0) ? '🔥 Multi' : '📱 Single'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right relative z-10">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-white mb-2">
                      {data.ph > 0 && data.hn > 0 && data.gh > 0 ? '🚀 Cross-Platform' :
                       data.ph > 0 && data.hn > 0 ? '🔥 Launch + Buzz' :
                       data.ph > 0 && data.gh > 0 ? '📈 Launch + OSS' :
                       data.hn > 0 && data.gh > 0 ? '💬 Buzz + OSS' :
                       data.ph > 0 ? '🚀 Launch Only' :
                       data.hn > 0 ? '💬 Buzz Only' :
                       data.gh > 0 ? '📈 OSS Only' : '💤 No Activity'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {data.ph > 0 && data.hn > 0 && data.gh > 0 ? 'All Platforms Active' :
                       (data.ph > 0 && data.hn > 0) || (data.ph > 0 && data.gh > 0) || (data.hn > 0 && data.gh > 0) ? 'Multi-Platform' :
                       data.ph > 0 || data.hn > 0 || data.gh > 0 ? 'Single Platform' : 'No Activity'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-6">
                <TrendingUp className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Cross-Platform Trends Found</h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Try adjusting the timeframe, changing the filter, or check back later for new trends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Details Modal */}
      {showDetailsModal && selectedTrend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedTrend.topic} - Trend Analysis
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Signal Overview */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {selectedTrend.topic}
                </h3>
                <p className="text-lg text-foreground mb-6">
                  {selectedTrend.topic.includes('Trending Technologies') 
                    ? 'Comprehensive analysis of trending technologies across all platforms with momentum scoring'
                    : selectedTrend.topic.includes('High GitHub Activity')
                    ? 'Analysis of high-activity GitHub repositories with star counts and engagement metrics'
                    : 'Comprehensive cross-platform trend analysis across Product Hunt, Hacker News, and GitHub'
                  }
                </p>
              </div>

              {/* Signal-specific Metrics */}
              {selectedTrend.topic.includes('Trending Technologies') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 bg-blue-900/20 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Momentum Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Total Momentum:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedTrend.data?.totalMomentum ? selectedTrend.data.totalMomentum.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Average Momentum:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {selectedTrend.data?.avgMomentum ? selectedTrend.data.avgMomentum.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Cross-Platform Count:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {selectedTrend.data?.crossPlatformCount || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 bg-green-900/20 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Technology Categories</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-foreground">• Education & Learning</div>
                      <div className="text-sm text-foreground">• Web Development</div>
                      <div className="text-sm text-foreground">• AI & Machine Learning</div>
                      <div className="text-sm text-foreground">• Developer Tools</div>
                      <div className="text-sm text-foreground">• Data & Analytics</div>
                      <div className="text-sm text-foreground">• Mobile Development</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTrend.topic.includes('High GitHub Activity') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 bg-yellow-900/20 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-4">GitHub Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Total Stars:</span>
                        <span className="text-2xl font-bold text-yellow-600">
                          {selectedTrend.data?.totalStars ? Math.round(selectedTrend.data.totalStars / 1000) + 'k' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Average Stars:</span>
                        <span className="text-xl font-bold text-yellow-600">
                          {selectedTrend.data?.avgStars ? Math.round(selectedTrend.data.avgStars / 1000) + 'k' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">High Rated Count:</span>
                        <span className="text-lg font-bold text-yellow-600">
                          {selectedTrend.data?.highRatedCount || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 bg-purple-900/20 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Top Repositories</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-foreground">• freeCodeCamp</div>
                      <div className="text-sm text-foreground">• free-programming-books</div>
                      <div className="text-sm text-foreground">• public-apis</div>
                      <div className="text-sm text-foreground">• developer-roadmap</div>
                      <div className="text-sm text-foreground">• system-design-primer</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Metrics (for other trends) */}
              {!selectedTrend.topic.includes('Trending Technologies') && !selectedTrend.topic.includes('High GitHub Activity') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 bg-blue-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h4 className="text-lg font-semibold text-foreground">Product Hunt</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-blue-600">
                        {selectedTrend.data?.ph ? selectedTrend.data.ph.toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-sm text-foreground">Total Votes</div>
                      <div className="text-sm text-foreground">
                        {selectedTrend.data?.ph > 0 ? 'Active on Product Hunt' : 'No Product Hunt activity'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 bg-green-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="text-lg font-semibold text-foreground">Hacker News</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-600">
                        {selectedTrend.data?.hn ? selectedTrend.data.hn.toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-sm text-foreground">Total Score</div>
                      <div className="text-sm text-foreground">
                        {selectedTrend.data?.hn > 0 ? 'Active on Hacker News' : 'No Hacker News activity'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 bg-purple-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h4 className="text-lg font-semibold text-foreground">GitHub</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-purple-600">
                        {selectedTrend.data?.gh ? Math.round(selectedTrend.data.gh / 1000) + 'k' : 'N/A'}
                      </div>
                      <div className="text-sm text-foreground">Total Stars</div>
                      <div className="text-sm text-foreground">
                        {selectedTrend.data?.gh > 0 ? 'Active on GitHub' : 'No GitHub activity'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Advanced Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 bg-orange-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">Growth Momentum</h5>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedTrend.data?.momentum ? Math.round(selectedTrend.data.momentum) : 'N/A'}
                    </div>
                    <div className="text-sm text-foreground">
                      {selectedTrend.data?.momentum > 50 ? '🔥 Hot Growth' : 
                       selectedTrend.data?.momentum > 20 ? '📈 Rising' : 
                       selectedTrend.data?.momentum > 5 ? '📊 Steady' : '📉 Declining'}
                    </div>
                    <div className="text-xs text-foreground mt-1">
                      Engagement velocity across platforms
                    </div>
                  </div>
                  
                  <div className="bg-pink-50 bg-pink-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">Viral Coefficient</h5>
                    <div className="text-2xl font-bold text-pink-600">
                      {selectedTrend.data?.viral ? Math.round(selectedTrend.data.viral * 100) + '%' : 'N/A'}
                    </div>
                    <div className="text-sm text-foreground">
                      {selectedTrend.data?.viral > 0.5 ? '💬 High Engagement' : 
                       selectedTrend.data?.viral > 0.2 ? '💭 Medium Engagement' : '🔇 Low Engagement'}
                    </div>
                    <div className="text-xs text-foreground mt-1">
                      Comments-to-votes ratio
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 bg-indigo-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">Market Opportunity</h5>
                    <div className="text-2xl font-bold text-indigo-600">
                      {selectedTrend.data?.gap ? Math.round(selectedTrend.data.gap * 100) + '%' : 'N/A'}
                    </div>
                    <div className="text-sm text-foreground">
                      {selectedTrend.data?.gap > 0.8 ? '🎯 High Opportunity' : 
                       selectedTrend.data?.gap > 0.5 ? '⚡ Growing Market' : 
                       selectedTrend.data?.gap > 0.2 ? '📈 Mature Market' : '🔴 Saturated Market'}
                    </div>
                    <div className="text-xs text-foreground mt-1">
                      Market saturation level
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 bg-emerald-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">Cross-Platform Reach</h5>
                    <div className="text-2xl font-bold text-emerald-600">
                      {selectedTrend.data?.ph > 0 && selectedTrend.data?.hn > 0 && selectedTrend.data?.gh > 0 ? '3' :
                       (selectedTrend.data?.ph > 0 && selectedTrend.data?.hn > 0) || 
                       (selectedTrend.data?.ph > 0 && selectedTrend.data?.gh > 0) || 
                       (selectedTrend.data?.hn > 0 && selectedTrend.data?.gh > 0) ? '2' : '1'}
                    </div>
                    <div className="text-sm text-foreground">
                      {selectedTrend.data?.ph > 0 && selectedTrend.data?.hn > 0 && selectedTrend.data?.gh > 0 ? '🚀 All Platforms' :
                       (selectedTrend.data?.ph > 0 && selectedTrend.data?.hn > 0) || 
                       (selectedTrend.data?.ph > 0 && selectedTrend.data?.gh > 0) || 
                       (selectedTrend.data?.hn > 0 && selectedTrend.data?.gh > 0) ? '🔥 Multi-Platform' : '📱 Single Platform'}
                    </div>
                    <div className="text-xs text-foreground mt-1">
                      Platform presence
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Breakdown */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Platform Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-foreground">Product Hunt</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {selectedTrend.data?.ph ? selectedTrend.data.ph.toLocaleString() : 'N/A'} votes
                      </div>
                      <div className="text-sm text-foreground">
                        {selectedTrend.data?.ph > 0 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-foreground">Hacker News</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {selectedTrend.data?.hn ? selectedTrend.data.hn.toLocaleString() : 'N/A'} score
                      </div>
                      <div className="text-sm text-foreground">
                        {selectedTrend.data?.hn > 0 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-foreground">GitHub</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {Math.round(selectedTrend.data.gh / 1000)}k stars
                      </div>
                      <div className="text-sm text-foreground">
                        {selectedTrend.data.gh > 0 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Insights */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Trend Insights</h4>
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium text-foreground">Total Cross-Platform Activity</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedTrend.data?.total ? selectedTrend.data.total.toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-sm text-foreground">
                        Combined engagement across all platforms
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 border-gray-600">
                      <div>
                        <div className="text-sm text-foreground">Time Filter</div>
                        <div className="font-medium text-foreground">{timeFilter}</div>
                      </div>
                      <div>
                        <div className="text-sm text-foreground">Analysis Date</div>
                        <div className="font-medium text-foreground">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
