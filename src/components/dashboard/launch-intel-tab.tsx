"use client"

import { useState, useMemo } from "react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Calendar, TrendingUp, Target, Users, MessageCircle, Star, Clock, AlertCircle, CheckCircle, Info, X, BarChart3, Activity } from "lucide-react";
import { StatsSkeleton, CardSkeleton, ListItemSkeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatNumber } from "@/lib/number-utils";

interface LaunchIntelTabProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  saaSHubData: SaaSHubAlternative[];
}

export function LaunchIntelTab({ productHuntData, hackerNewsData, saaSHubData }: LaunchIntelTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'timing'>('engagement');
  const [selectedTimingData, setSelectedTimingData] = useState<{type: string, data: any} | null>(null);
  const [showTimingDetailsModal, setShowTimingDetailsModal] = useState(false);

  // Show skeleton loading if data is still loading
  const isLoading = productHuntData.length === 0 && hackerNewsData.length === 0 && saaSHubData.length === 0;
  
  // Analytics integration
  const { analyticsData } = useAnalytics('7d');

  // Debug: Log data for troubleshooting
  console.log('LaunchIntel Debug:', {
    productHuntCount: productHuntData.length,
    hackerNewsCount: hackerNewsData.length,
    saaSHubCount: saaSHubData.length,
    samplePH: productHuntData.slice(0, 2).map(item => ({ name: item.name, votes: item.votes_count, comments: item.comments_count })),
    sampleHN: hackerNewsData.slice(0, 2).map(item => ({ title: item.title, score: item.score, descendants: item.descendants }))
  });

  // Enhanced launch timing analysis
  const launchTiming = useMemo(() => {
    const timingData = {
      bestDays: [] as { day: string; score: number; count: number; avgVotes: number }[],
      bestTimes: [] as { time: string; score: number; count: number; avgVotes: number }[],
      hourlyBreakdown: [] as { hour: number; score: number; count: number; avgEngagement: number }[],
      weeklyPattern: [] as { day: string; launches: number; avgEngagement: number; avgVotes: number }[],
      seasonalTrends: [] as { month: string; score: number; count: number; avgEngagement: number }[]
    };

    // Analyze Product Hunt launch timing with detailed metrics
    const dayScores: { [key: string]: { total: number; count: number; votes: number } } = {};
    const timeScores: { [key: string]: { total: number; count: number; votes: number } } = {};
    const hourlyScores: { [key: number]: { total: number; count: number } } = {};
    const monthlyScores: { [key: string]: { total: number; count: number } } = {};

    // Filter for high engagement launches (500+ engagement score)
    const highEngagementLaunches = productHuntData.filter(item => {
      const engagementScore = item.votes_count + item.comments_count;
      return engagementScore >= 500;
    });

    console.log('High Engagement Filter:', {
      totalLaunches: productHuntData.length,
      highEngagementLaunches: highEngagementLaunches.length,
      filteredLaunches: highEngagementLaunches.map(item => ({
        name: item.name,
        votes: item.votes_count,
        comments: item.comments_count,
        engagement: item.votes_count + item.comments_count
      }))
    });

    highEngagementLaunches.forEach(item => {
      // Handle potential date parsing issues
      let date: Date;
      try {
        date = new Date(item.created_at);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', item.created_at, 'for product:', item.name);
          return; // Skip this item
        }
      } catch (error) {
        console.warn('Date parsing error:', error, 'for product:', item.name);
        return; // Skip this item
      }
      
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      
      // Debug logging for date parsing
      console.log('Launch Date Debug:', {
        originalDate: item.created_at,
        parsedDate: date,
        day: day,
        hour: hour,
        month: month,
        productName: item.name
      });
      
      // Day analysis
      if (!dayScores[day]) dayScores[day] = { total: 0, count: 0, votes: 0 };
      dayScores[day].total += item.votes_count + item.comments_count;
      dayScores[day].count += 1;
      dayScores[day].votes += item.votes_count;
      
      // Time analysis
      let timeSlot = '';
      if (hour >= 6 && hour <= 12) timeSlot = 'Morning (6-12)';
      else if (hour >= 13 && hour <= 18) timeSlot = 'Afternoon (13-18)';
      else if (hour >= 19 && hour <= 23) timeSlot = 'Evening (19-23)';
      else timeSlot = 'Late Night (0-5)';
      
      if (!timeScores[timeSlot]) timeScores[timeSlot] = { total: 0, count: 0, votes: 0 };
      timeScores[timeSlot].total += item.votes_count + item.comments_count;
      timeScores[timeSlot].count += 1;
      timeScores[timeSlot].votes += item.votes_count;
      
      // Hourly breakdown
      if (!hourlyScores[hour]) hourlyScores[hour] = { total: 0, count: 0 };
      hourlyScores[hour].total += item.votes_count + item.comments_count;
      hourlyScores[hour].count += 1;
      
      // Monthly trends
      if (!monthlyScores[month]) monthlyScores[month] = { total: 0, count: 0 };
      monthlyScores[month].total += item.votes_count + item.comments_count;
      monthlyScores[month].count += 1;
    });

    // Process day data
    timingData.bestDays = Object.entries(dayScores)
      .map(([day, data]) => ({
        day,
        score: data.total,
        count: data.count,
        avgVotes: Math.round(data.votes / data.count)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Process time data - show all time slots with data, minimum 3
    const timeEntries = Object.entries(timeScores)
      .map(([time, data]) => ({
        time,
        score: data.total,
        count: data.count,
        avgVotes: Math.round(data.votes / data.count)
      }))
      .sort((a, b) => b.score - a.score);

    // If we have fewer than 3 time slots with data, fill with all time slots
    if (timeEntries.length < 3) {
      const allTimeSlots = ['Morning (6-12)', 'Afternoon (13-18)', 'Evening (19-23)', 'Late Night (0-5)'];
      const missingSlots = allTimeSlots
        .filter(slot => !timeEntries.some(entry => entry.time === slot))
        .map(slot => ({
          time: slot,
          score: 0,
          count: 0,
          avgVotes: 0
        }));
      
      timingData.bestTimes = [...timeEntries, ...missingSlots].slice(0, 4);
    } else {
      timingData.bestTimes = timeEntries.slice(0, 4);
    }

    // Process hourly breakdown - only show hours with actual launches
    timingData.hourlyBreakdown = Object.entries(hourlyScores)
      .filter(([hour, data]) => data.count > 0) // Only include hours with launches
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        score: data.total,
        count: data.count,
        avgEngagement: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Show top 8 active hours

    // Process weekly pattern - ensure all 7 days are shown
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    timingData.weeklyPattern = daysOfWeek.map(day => {
      const data = dayScores[day] || { total: 0, count: 0, votes: 0 };
      return {
        day,
        launches: data.count,
        avgEngagement: data.count > 0 ? Math.round(data.total / data.count) : 0,
        totalEngagement: data.total,
        avgVotes: data.count > 0 ? Math.round(data.votes / data.count) : 0
      };
    });

    // Debug logging for weekly pattern
    console.log('Weekly Pattern Debug:', {
      dayScores: dayScores,
      weeklyPattern: timingData.weeklyPattern,
      totalLaunches: productHuntData.length,
      highEngagementLaunches: highEngagementLaunches.length,
      filteredLaunches: highEngagementLaunches.map(item => ({
        name: item.name,
        day: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'long' }),
        engagement: item.votes_count + item.comments_count
      }))
    });

    // Process seasonal trends - only show months with actual launches
    timingData.seasonalTrends = Object.entries(monthlyScores)
      .filter(([month, data]) => data.count > 0) // Only include months with launches
      .map(([month, data]) => ({
        month,
        score: data.total,
        count: data.count,
        avgEngagement: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Show top 6 active months

    return timingData;
  }, [productHuntData]);


  // Success predictors
  const successPredictors = useMemo(() => {
    // More realistic engagement thresholds
    const avgVotes = productHuntData.length > 0 ? productHuntData.reduce((sum, item) => sum + item.votes_count, 0) / productHuntData.length : 0;
    const avgComments = productHuntData.length > 0 ? productHuntData.reduce((sum, item) => sum + item.comments_count, 0) / productHuntData.length : 0;
    
    // Much more inclusive thresholds to show more products
    const voteThreshold = productHuntData.length > 0 
      ? Math.max(20, Math.min(100, Math.round(avgVotes * 0.8))) // 0.8x average, max 100, min 20
      : 20; // Much lower default threshold
    const commentThreshold = productHuntData.length > 0
      ? Math.max(2, Math.min(10, Math.round(avgComments * 0.8))) // 0.8x average, max 10, min 2
      : 2; // Much lower default threshold
    
    const predictors = {
      highEngagement: productHuntData.filter(item => item.votes_count > voteThreshold && item.comments_count > commentThreshold).length,
      trendingTopics: new Set<string>(),
      marketGaps: [] as string[],
      optimalTiming: launchTiming.bestDays.length > 0,
      thresholds: { votes: voteThreshold, comments: commentThreshold }
    };

    // Identify trending topics with better logic
    const topicCounts: { [key: string]: number } = {};
    const topicEngagement: { [key: string]: number } = {};
    
    productHuntData.forEach(item => {
      item.topics.forEach(topic => {
        if (!topicCounts[topic.name]) {
          topicCounts[topic.name] = 0;
          topicEngagement[topic.name] = 0;
        }
        topicCounts[topic.name] += 1;
        topicEngagement[topic.name] += item.votes_count + item.comments_count;
      });
    });

    // Get trending topics based on both frequency and engagement
    const trendingTopics = Object.entries(topicCounts)
      .filter(([_, count]) => count >= 1) // Lower threshold for trending
      .map(([topic, count]) => ({
        topic,
        count,
        engagement: topicEngagement[topic] || 0,
        score: count * 0.3 + (topicEngagement[topic] || 0) * 0.7 // Weighted score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.topic);

    trendingTopics.forEach(topic => predictors.trendingTopics.add(topic));

    // Identify market gaps with better algorithm
    const allTopics = new Set<string>();
    productHuntData.forEach(item => {
      item.topics.forEach(topic => allTopics.add(topic.name));
    });

    // Find truly underserved areas (not trending topics)
    const topicFrequencies = Object.entries(topicCounts);
    const trendingTopicNames = new Set(trendingTopics);
    
    const marketGaps = topicFrequencies
      .filter(([topic, count]) => {
        // Must be underrepresented (low frequency)
        const isUnderrepresented = count <= 2;
        // Must NOT be in trending topics
        const isNotTrending = !trendingTopicNames.has(topic);
        // Must have some potential (moderate engagement)
        const hasPotential = (topicEngagement[topic] || 0) > 0 && (topicEngagement[topic] || 0) < 1000;
        return isUnderrepresented && isNotTrending && hasPotential;
      })
      .map(([topic, count]) => ({
        topic,
        count,
        engagement: topicEngagement[topic] || 0,
        gapScore: (topicEngagement[topic] || 0) / Math.max(count, 1) // Engagement per occurrence
      }))
      .sort((a, b) => b.gapScore - a.gapScore) // Sort by engagement per occurrence
      .slice(0, 5)
      .map(item => item.topic);

    predictors.marketGaps = marketGaps;

    // Debug logging
    console.log('Market Analysis Debug:', {
      trendingTopics: Array.from(trendingTopicNames),
      marketGaps: marketGaps,
      totalTopics: topicFrequencies.length,
      underrepresentedTopics: topicFrequencies.filter(([_, count]) => count <= 2).length
    });

    return predictors;
  }, [productHuntData, launchTiming]);

  // Launch recommendations
  const launchRecommendations = useMemo(() => {
    const recommendations = [];

    // Timing recommendations
    if (launchTiming.bestDays.length > 0) {
      recommendations.push({
        type: 'success',
        title: 'Optimal Launch Timing',
        description: `Best days: ${launchTiming.bestDays.map(day => day.day).join(', ')}`,
        icon: Calendar
      });
    }

    // Engagement recommendations
    if (successPredictors.highEngagement > 0) {
      recommendations.push({
        type: 'info',
        title: 'High Engagement Products',
        description: `${successPredictors.highEngagement} products with >500 votes and >50 comments`,
        icon: TrendingUp
      });
    }

    // Market gap recommendations
    if (successPredictors.marketGaps.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Market Opportunities',
        description: `Underserved areas: ${successPredictors.marketGaps.slice(0, 3).join(', ')}`,
        icon: Target
      });
    } else {
      recommendations.push({
        type: 'info',
        title: 'Market Analysis',
        description: 'No significant market gaps identified. Current trends show strong coverage across all major categories.',
        icon: Target
      });
    }

    return recommendations;
  }, [launchTiming, successPredictors]);

  const metrics = [
    { id: 'engagement', label: 'Engagement Analysis', icon: TrendingUp },
    { id: 'timing', label: 'Launch Timing', icon: Clock }
  ];

  // Show skeleton loading if data is still loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Filter Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">LaunchIntel</h2>
          <p className="text-foreground">Product launch intelligence and market timing</p>
      </div>

      {/* Analytics Launch Insights */}
      {analyticsData.overview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Launch Analytics Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Launch Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground">Total Launches:</span>
                    <span className="font-medium text-blue-600">{analyticsData.overview.totalLaunches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Avg Engagement:</span>
                    <span className="font-medium text-green-600">{analyticsData.overview.avgVotes} votes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Avg Comments:</span>
                    <span className="font-medium text-purple-600">{Math.round(analyticsData.overview.avgVotes * 0.1)} comments</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Market Trends</h4>
                <div className="space-y-1">
                  {analyticsData.overview.topCategories.slice(0, 3).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">{category.count} launches</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch Recommendations */}
      <div className="grid gap-4 md:grid-cols-3">
        {launchRecommendations.map((rec, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <rec.icon className="h-4 w-4" />
                {rec.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{rec.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Tabs */}
      <div className="flex gap-2 mb-4">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedMetric === metric.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <metric.icon className="h-4 w-4" />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Engagement Analysis */}
      {selectedMetric === 'engagement' && (
        <div className="space-y-6">
          {/* All Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                All Product Hunt Launches
              </CardTitle>
              <p className="text-sm text-foreground">Recent launches sorted by engagement</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productHuntData
                  .sort((a, b) => (b.votes_count + b.comments_count) - (a.votes_count + a.comments_count))
                  .slice(0, 15)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <a 
                          href={`https://www.producthunt.com/posts/${item.name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 hover:bg-gray-800 rounded p-2 -m-2 transition-colors"
                        >
                          <h3 className="font-semibold text-foreground hover:text-blue-600 transition-colors cursor-pointer">
                            {item.name}
                            <span className="ml-2 text-xs text-foreground">↗</span>
                          </h3>
                          <p className="text-sm text-foreground">{item.tagline}</p>
                        </a>
                        <div className="flex gap-3 mt-1 text-xs">
                          <span className="text-blue-600">{item.votes_count} votes</span>
                          <span className="text-green-600">{item.comments_count} comments</span>
                          <span className="text-foreground">by {item.user.name}</span>
                        </div>
                        {item.topics.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.topics.slice(0, 3).map((topic, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 bg-gray-700 px-2 py-1 rounded">
                                {topic.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {item.votes_count + item.comments_count}
                        </div>
                        <div className="text-sm text-foreground">total engagement</div>
                      </div>
                    </div>
                  ))}
                {productHuntData.length === 0 && (
                  <div className="text-center py-8 text-foreground">
                    <p>No Product Hunt data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* High Engagement Products */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                High Engagement Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-gray-600 scrollbar-track-gray-100 scrollbar-track-gray-800">
                {/* Show products that meet the high engagement criteria */}
                {productHuntData
                  .filter(item => item.votes_count > (successPredictors.thresholds?.votes || 20) && item.comments_count > (successPredictors.thresholds?.comments || 2))
                  .sort((a, b) => b.votes_count - a.votes_count)
                  .slice(0, 8)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div>
                        <a 
                          href={`https://www.producthunt.com/posts/${item.name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 hover:bg-gray-800 rounded p-2 -m-2 transition-colors"
                        >
                          <h3 className="font-semibold text-foreground hover:text-blue-600 transition-colors cursor-pointer">
                            {item.name}
                            <span className="ml-2 text-xs text-foreground">↗</span>
                          </h3>
                          <p className="text-sm text-foreground">{item.tagline}</p>
                        </a>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-blue-600">{item.votes_count} votes</span>
                          <span className="text-xs text-green-600">{item.comments_count} comments</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{item.votes_count}</div>
                        <div className="text-sm text-foreground">votes</div>
                      </div>
                    </div>
                  ))}
                
                {/* If no high engagement products, show top products by votes */}
                {productHuntData.filter(item => item.votes_count > (successPredictors.thresholds?.votes || 20) && item.comments_count > (successPredictors.thresholds?.comments || 2)).length === 0 && (
                  <>
                    <div className="text-center py-2 text-foreground text-sm">
                      <p>No products meet both vote and comment thresholds</p>
                      <p className="text-xs">Showing top products by votes instead:</p>
                    </div>
                    {productHuntData
                      .sort((a, b) => b.votes_count - a.votes_count)
                      .slice(0, 8)
                      .map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow bg-gray-50 bg-gray-800">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-foreground">{item.tagline}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-blue-600">{item.votes_count} votes</span>
                              <span className="text-xs text-green-600">{item.comments_count} comments</span>
                            </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{item.votes_count}</div>
                        <div className="text-sm text-foreground">votes</div>
                      </div>
                    </div>
                  ))}
                  </>
                )}
                
                {/* Final fallback if no data at all */}
                {productHuntData.length === 0 && (
                  <div className="text-center py-4 text-foreground">
                    <p>No Product Hunt data available</p>
                    <p className="text-sm">Check back later for new launches</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discussion Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hackerNewsData
                  .filter(item => (item.descendants || 0) > 5) // Much lower threshold for more results
                  .sort((a, b) => (b.descendants || 0) - (a.descendants || 0))
                  .slice(0, 10) // Show more items
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="hover:bg-gray-50 hover:bg-gray-800 rounded p-2 -m-2">
                          <a 
                            href={`https://news.ycombinator.com/item?id=${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <h3 className="font-semibold text-foreground line-clamp-2 hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                          </a>
                          <div className="flex items-center gap-3 mt-1 text-sm text-foreground">
                            <span>Score: {item.score}</span>
                            <span>•</span>
                            <span>by {item.by}</span>
                            {item.url && !item.title.toLowerCase().includes('http') && !item.title.toLowerCase().includes('www.') && (
                              <>
                                <span>•</span>
                                <a 
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-blue-400 hover:text-blue-300"
                                >
                                  View Article
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{item.descendants || 0}</div>
                        <div className="text-sm text-foreground">comments</div>
                      </div>
                    </div>
                  ))}
                {hackerNewsData.filter(item => (item.descendants || 0) > 5).length === 0 && (
                  <div className="text-center py-4 text-foreground">
                    <p>No high discussion posts found</p>
                    <p className="text-sm">Threshold: 5+ comments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      )}

      {/* Launch Timing */}
      {selectedMetric === 'timing' && (
        <div className="space-y-6">
          {/* Best Launch Days & Times */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Best Launch Days
              </CardTitle>
                <p className="text-sm text-foreground">Based on {productHuntData.length} total launches, {productHuntData.filter(item => (item.votes_count + item.comments_count) >= 500).length} high engagement (500+)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                  {launchTiming.bestDays.map((dayData, index) => (
                    <div key={dayData.day} className="flex items-center justify-between p-3 border rounded-lg relative">
                      {/* Info Icon */}
                      <button
                        onClick={() => {
                          setSelectedTimingData({type: 'day', data: dayData});
                          setShowTimingDetailsModal(true);
                        }}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors z-10"
                        title="View detailed timing information"
                      >
                        <Info className="h-3 w-3 text-foreground hover:text-foreground" />
                      </button>
                      
                    <div className="flex items-center gap-3 pr-6">
                      <div className="w-8 h-8 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600 text-blue-300">{index + 1}</span>
                      </div>
                        <div>
                          <span className="font-semibold text-foreground">{dayData.day}</span>
                          <div className="text-xs text-foreground">
                            {dayData.count} launches • {dayData.avgVotes} avg votes
                    </div>
                        </div>
                      </div>
                      <div className="text-right">
                    <Badge variant="default">Optimal</Badge>
                        <div className="text-xs text-foreground mt-1">{dayData.score} total engagement</div>
                      </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Best Launch Times
              </CardTitle>
                <p className="text-sm text-foreground">Peak engagement time slots</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                  {launchTiming.bestTimes.map((timeData, index) => (
                    <div key={timeData.time} className="flex items-center justify-between p-3 border rounded-lg relative">
                      {/* Info Icon */}
                      <button
                        onClick={() => {
                          setSelectedTimingData({type: 'time', data: timeData});
                          setShowTimingDetailsModal(true);
                        }}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors z-10"
                        title="View detailed timing information"
                      >
                        <Info className="h-3 w-3 text-foreground hover:text-foreground" />
                      </button>
                      
                    <div className="flex items-center gap-3 pr-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          timeData.count > 0 
                            ? 'bg-green-100 bg-green-900' 
                            : 'bg-gray-100 bg-gray-700'
                        }`}>
                          <span className={`text-sm font-bold ${
                            timeData.count > 0 
                              ? 'text-green-600 text-green-300' 
                              : 'text-foreground'
                          }`}>{index + 1}</span>
                      </div>
                        <div>
                          <span className="font-semibold text-foreground">{timeData.time}</span>
                          <div className="text-xs text-foreground">
                            {timeData.count > 0 
                              ? `${timeData.count} launches • ${timeData.avgVotes} avg votes`
                              : 'No launches in this time slot'
                            }
                    </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={timeData.count > 0 ? "secondary" : "outline"}>
                          {timeData.count > 0 ? 'Recommended' : 'No Data'}
                        </Badge>
                        <div className="text-xs text-foreground mt-1">
                          {timeData.count > 0 ? `${timeData.score} total engagement` : 'No activity'}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Weekly Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Launch Pattern
              </CardTitle>
              <p className="text-sm text-foreground">
                Launch activity across the week • 
                <span className="ml-1 font-medium">
                  {launchTiming.weeklyPattern.filter(day => day.launches > 0).length} active days
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {launchTiming.weeklyPattern.map((dayData, index) => (
                  <div key={dayData.day} className={`text-center p-3 border rounded-lg transition-colors ${
                    dayData.launches > 0 
                      ? 'bg-blue-50 bg-blue-900/20 border-blue-200 border-blue-800' 
                      : 'bg-gray-50 bg-gray-800 border-gray-200 border-gray-700'
                  }`}>
                    <div className="text-sm font-medium text-foreground">{dayData.day.slice(0, 3)}</div>
                    <div className={`text-lg font-bold ${
                      dayData.launches > 0 ? 'text-blue-600' : 'text-foreground'
                    }`}>
                      {dayData.launches}
                    </div>
                    <div className="text-xs text-foreground">launches</div>
                    {dayData.launches > 0 ? (
                      <>
                        <div className="text-xs text-foreground">{dayData.avgEngagement} avg engagement</div>
                        <div className="text-xs text-foreground">{dayData.avgVotes} avg votes</div>
                      </>
                    ) : (
                      <div className="text-xs text-foreground">No activity</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hourly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hourly Launch Activity
              </CardTitle>
              <p className="text-sm text-foreground">
                Best hours for launching (24h format) • 
                <span className="ml-1 font-medium">
                  {launchTiming.hourlyBreakdown.length} active hours
                </span>
              </p>
            </CardHeader>
            <CardContent>
              {launchTiming.hourlyBreakdown.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {launchTiming.hourlyBreakdown.map((hourData, index) => (
                    <div key={hourData.hour} className="text-center p-3 border rounded-lg bg-green-50 bg-green-900/20 border-green-200 border-green-800">
                      <div className="text-sm font-medium text-foreground">
                        {hourData.hour.toString().padStart(2, '0')}:00
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {hourData.count}
                      </div>
                      <div className="text-xs text-foreground">launches</div>
                      <div className="text-xs text-foreground">{hourData.score} total engagement</div>
                      <div className="text-xs text-foreground">{hourData.avgEngagement} avg engagement</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hourly launch data available</p>
                  <p className="text-sm">No launches found in the selected time period</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seasonal Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seasonal Launch Trends
              </CardTitle>
              <p className="text-sm text-foreground">
                Monthly launch activity • 
                <span className="ml-1 font-medium">
                  {launchTiming.seasonalTrends.length} active months
                </span>
              </p>
            </CardHeader>
            <CardContent>
              {launchTiming.seasonalTrends.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {launchTiming.seasonalTrends.map((monthData, index) => (
                    <div key={monthData.month} className="text-center p-3 border rounded-lg bg-purple-50 bg-purple-900/20 border-purple-200 border-purple-800">
                      <div className="text-sm font-medium text-foreground">{monthData.month}</div>
                      <div className="text-lg font-bold text-purple-600">{monthData.count}</div>
                      <div className="text-xs text-foreground">launches</div>
                      <div className="text-xs text-foreground">{monthData.score} total engagement</div>
                      <div className="text-xs text-foreground">{monthData.avgEngagement} avg engagement</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No seasonal launch data available</p>
                  <p className="text-sm">No launches found in the selected time period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Launch Timing Details Modal */}
      {showTimingDetailsModal && selectedTimingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <h2 className="text-2xl font-bold text-foreground">
                Launch Timing Analysis - {selectedTimingData.type === 'day' ? 'Day' : 'Time'} Details
              </h2>
              <button
                onClick={() => setShowTimingDetailsModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Timing Overview */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {selectedTimingData.type === 'day' ? selectedTimingData.data.day : selectedTimingData.data.time}
                </h3>
                <p className="text-lg text-foreground mb-6">
                  {selectedTimingData.type === 'day' 
                    ? 'Optimal launch day analysis based on historical data and engagement patterns'
                    : 'Optimal launch time analysis based on peak engagement periods'
                  }
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{selectedTimingData.data.count}</div>
                  <div className="text-sm text-foreground">Total Launches</div>
                </div>
                <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{selectedTimingData.data.score}</div>
                  <div className="text-sm text-foreground">Total Engagement</div>
                </div>
                <div className="bg-purple-50 bg-purple-900/20 p-4 rounded-lg text-center">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{selectedTimingData.data.avgVotes || Math.round(selectedTimingData.data.score / selectedTimingData.data.count)}</div>
                  <div className="text-sm text-foreground">Avg Votes</div>
                </div>
                <div className="bg-orange-50 bg-orange-900/20 p-4 rounded-lg text-center">
                  <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedTimingData.data.count > 0 ? formatNumber(selectedTimingData.data.score / selectedTimingData.data.count) : 0}
                  </div>
                  <div className="text-sm text-foreground">Engagement/Launch</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-foreground">Launch Count:</span>
                      <span className="font-medium">{selectedTimingData.data.count} launches</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Total Engagement:</span>
                      <span className="font-medium">{selectedTimingData.data.score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Average Votes:</span>
                      <span className="font-medium">{selectedTimingData.data.avgVotes || formatNumber(selectedTimingData.data.score / selectedTimingData.data.count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Success Rate:</span>
                      <span className="font-medium">
                        {selectedTimingData.data.count > 0 
                          ? `${Math.round((selectedTimingData.data.count / productHuntData.length) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Timing Insights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-foreground">Optimal Status:</span>
                      <span className="font-medium text-green-600">
                        {selectedTimingData.data.count > 0 ? '✅ Optimal' : '⚠️ Limited Data'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Engagement Quality:</span>
                      <span className="font-medium">
                        {selectedTimingData.data.count > 0 && (selectedTimingData.data.avgVotes || Math.round(selectedTimingData.data.score / selectedTimingData.data.count)) > 100 
                          ? '🔥 High Quality' 
                          : selectedTimingData.data.count > 0 
                            ? '📈 Good Quality' 
                            : '📊 Unknown'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Recommendation:</span>
                      <span className="font-medium">
                        {selectedTimingData.data.count > 0 
                          ? '✅ Recommended for launches'
                          : '⚠️ Consider other timing'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Data Reliability:</span>
                      <span className="font-medium">
                        {selectedTimingData.data.count >= 5 
                          ? '🟢 High Reliability' 
                          : selectedTimingData.data.count >= 2 
                            ? '🟡 Medium Reliability' 
                            : '🔴 Low Reliability'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison with Other Timing */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Comparison with Other {selectedTimingData.type === 'day' ? 'Days' : 'Times'}</h4>
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-3">
                    {selectedTimingData.type === 'day' ? (
                      launchTiming.bestDays.slice(0, 5).map((day, index) => (
                        <div key={day.day} className={`flex items-center justify-between p-3 rounded-lg ${
                          day.day === selectedTimingData.data.day 
                            ? 'bg-blue-100 bg-blue-900/30 border-2 border-blue-300 border-blue-700' 
                            : 'bg-card bg-gray-600'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{day.day}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{day.score}</div>
                            <div className="text-xs text-foreground">{day.count} launches</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      launchTiming.bestTimes.slice(0, 5).map((time, index) => (
                        <div key={time.time} className={`flex items-center justify-between p-3 rounded-lg ${
                          time.time === selectedTimingData.data.time 
                            ? 'bg-green-100 bg-green-900/30 border-2 border-green-300 border-green-700' 
                            : 'bg-card bg-gray-600'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 bg-green-900 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{time.time}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{time.score}</div>
                            <div className="text-xs text-foreground">{time.count} launches</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Launch Strategy */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Launch Strategy</h4>
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <span className="text-foreground">
                        {selectedTimingData.type === 'day' 
                          ? `Schedule your launch for ${selectedTimingData.data.day} to maximize engagement`
                          : `Launch during ${selectedTimingData.data.time} for optimal visibility`
                        }
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <span className="text-foreground">
                        Prepare your launch materials and community outreach in advance
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <span className="text-foreground">
                        Monitor engagement and respond to comments quickly during peak hours
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <span className="text-foreground">
                        Track performance and adjust strategy based on results
                      </span>
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
