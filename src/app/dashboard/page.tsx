"use client"

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";
import { Zap, TrendingUp, BarChart3 } from "lucide-react";
import { TabContentSkeleton } from "@/components/ui/skeleton";
import { OnboardingGuide } from "@/components/onboarding-guide";

// Import the targeted dashboard components
import { VCIntelligenceTab } from "@/components/dashboard/vc-intelligence-tab";
import { IndieHackerTab } from "@/components/dashboard/indie-hacker-tab";
import { DeveloperInspirationTab } from "@/components/dashboard/developer-inspiration-tab";
import { TimeFilter } from "@/components/dashboard/time-filter";
import { TrendingByCategory } from "@/components/dashboard/trending-by-category";
import { EnhancedFilter } from "@/components/dashboard/enhanced-filter";

export default function DashboardPage() {
  const [productHuntData, setProductHuntData] = useState<ProductHuntPost[]>([]);
  const [hackerNewsData, setHackerNewsData] = useState<HackerNewsPost[]>([]);
  const [saaSHubData, setSaaSHubData] = useState<SaaSHubAlternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState('vc-intelligence');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [projectType, setProjectType] = useState<string>('All Types');
  const [useEnhancedFilter, setUseEnhancedFilter] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Function to filter data based on time period
  const filterDataByTime = (data: (ProductHuntPost | HackerNewsPost | SaaSHubAlternative)[], timeFilter: string, dateField: string) => {
    // Add safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
      console.warn('filterDataByTime: Invalid data provided', data);
      return [];
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (timeFilter) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return data.filter(item => {
      if (!item) {
        return false;
      }

      let itemDate: Date;
      
      if (dateField === 'time') {
        // Hacker News uses Unix timestamp (seconds)
        const hnItem = item as HackerNewsPost;
        if (!hnItem.time) return false;
        itemDate = new Date(hnItem.time * 1000);
      } else {
        // Product Hunt uses ISO date string
        const phItem = item as ProductHuntPost;
        if (!phItem.created_at) return false;
        itemDate = new Date(phItem.created_at);
      }
      
      return itemDate >= cutoffDate;
    });
  };

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`🔄 Auto-refreshing data for ${timeFilter} filter...`);
      
      // Build query parameters
      const phParams = new URLSearchParams({
        timeFilter,
        ...(selectedCategories.length > 0 && { category: selectedCategories[0] }),
        ...(selectedTopics.length > 0 && { topics: selectedTopics.join(',') })
      });
      
      // Fetch real data from APIs with time-aware parameters using Promise.allSettled for better error handling
      const [phResult, hnResult, shResult] = await Promise.allSettled([
        fetch(`/api/product-hunt?${phParams.toString()}`),
        fetch(`/api/hacker-news?timeFilter=${timeFilter}`),
        fetch(`/api/saashub?timeFilter=${timeFilter}`)
      ]);
      
      // Parse responses with error handling - each API call is independent
      let phResponseData = { data: [] };
      let hnResponseData = { data: [] };
      let shResponseData = { data: [] };
      
      if (phResult.status === 'fulfilled' && phResult.value.ok) {
        try {
          phResponseData = await phResult.value.json();
        } catch (error) {
          console.error('Failed to parse Product Hunt response:', error);
        }
      }
      
      if (hnResult.status === 'fulfilled' && hnResult.value.ok) {
        try {
          hnResponseData = await hnResult.value.json();
        } catch (error) {
          console.error('Failed to parse Hacker News response:', error);
        }
      }
      
      if (shResult.status === 'fulfilled' && shResult.value.ok) {
        try {
          shResponseData = await shResult.value.json();
        } catch (error) {
          console.error('Failed to parse SaaSHub response:', error);
        }
      }
      
      // Log any failures
      if (phResult.status === 'rejected') {
        console.error('Product Hunt API call failed:', phResult.reason);
      }
      if (hnResult.status === 'rejected') {
        console.error('Hacker News API call failed:', hnResult.reason);
      }
      if (shResult.status === 'rejected') {
        console.error('SaaSHub API call failed:', shResult.reason);
      }
      
      // Extract data from responses (handle both old array format and new object format)
      const phData = Array.isArray(phResponseData) ? phResponseData : (phResponseData.data || []);
      const hnData = Array.isArray(hnResponseData) ? hnResponseData : (hnResponseData.data || []);
      const shData = Array.isArray(shResponseData) ? shResponseData : (shResponseData.data || []);
      
      console.log(`📊 Auto-refresh data received - PH: ${Array.isArray(phData) ? phData.length : 'undefined'}, HN: ${Array.isArray(hnData) ? hnData.length : 'undefined'}, GH: ${Array.isArray(shData) ? shData.length : 'undefined'}`);
      
      // Ensure we have arrays
      const safePhData = Array.isArray(phData) ? phData : [];
      const safeHnData = Array.isArray(hnData) ? hnData : [];
      const safeShData = Array.isArray(shData) ? shData : [];
      
      // Apply all filters in a single optimized pass (combining filters to reduce iterations)
      // Start with time filtering
      let filteredPH = filterDataByTime(safePhData as ProductHuntPost[], timeFilter, 'created_at') as ProductHuntPost[];
      const filteredHN = filterDataByTime(safeHnData as HackerNewsPost[], timeFilter, 'time') as HackerNewsPost[];
      let filteredSH = timeFilter === '24h' ? safeShData.slice(0, 5) : 
                        timeFilter === '7d' ? safeShData.slice(0, 10) : 
                        safeShData; // 30d shows all data
      
      // Combine category, topic, and project type filters into single pass for better performance
      const hasCategoryFilter = selectedCategories.length > 0;
      const hasTopicFilter = selectedTopics.length > 0;
      const hasProjectTypeFilter = projectType !== 'All Types';
      const isOpenSource = projectType === 'Open Source';
      const isCommercial = projectType === 'Commercial';
      
      // Apply all filters in single pass for Product Hunt data
      if (hasCategoryFilter || hasTopicFilter || (hasProjectTypeFilter && isCommercial)) {
        filteredPH = filteredPH.filter(item => {
          // Category filter
          if (hasCategoryFilter && !item.topics.some(topic => 
            selectedCategories.some(cat => 
              topic.name.toLowerCase().includes(cat.toLowerCase()) || 
              cat.toLowerCase().includes(topic.name.toLowerCase())
            )
          )) {
            return false;
          }
          
          // Topic filter
          if (hasTopicFilter && !item.topics.some(topic => 
            selectedTopics.some(t => 
              topic.name.toLowerCase().includes(t.toLowerCase()) || 
              t.toLowerCase().includes(topic.name.toLowerCase())
            )
          )) {
            return false;
          }
          
          // Project type filter (Commercial)
          if (hasProjectTypeFilter && isCommercial && item.topics.some(t => t.name.toLowerCase().includes('open source'))) {
            return false;
          }
          
          return true;
        });
      }
      
      // Apply filters for SaaSHub data
      if (hasTopicFilter || (hasProjectTypeFilter && isOpenSource)) {
        filteredSH = filteredSH.filter(item => {
          // Topic filter
          if (hasTopicFilter && !item.features.some(feature => 
            selectedTopics.some(t => 
              feature.toLowerCase().includes(t.toLowerCase()) || 
              t.toLowerCase().includes(feature.toLowerCase())
            )
          )) {
            return false;
          }
          
          // Project type filter (Open Source)
          if (hasProjectTypeFilter && isOpenSource && item.pricing !== 'Open Source' && !item.pricing?.includes('Free')) {
            return false;
          }
          
          return true;
        });
      }
      
      setProductHuntData(filteredPH);
      setHackerNewsData(filteredHN);
      setSaaSHubData(filteredSH);
    } catch (error) {
      console.error('Error auto-refreshing data:', error);
      // Fallback to empty arrays if API calls fail
      setProductHuntData([]);
      setHackerNewsData([]);
      setSaaSHubData([]);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, selectedCategories, selectedTopics, projectType]);

  // Check if user needs onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        // Show onboarding after a short delay
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes, but pause when tab is inactive
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !interval) {
        // Tab became visible, restart interval
        interval = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes
      } else if (!isVisible && interval) {
        // Tab became hidden, clear interval
        clearInterval(interval);
        interval = null;
      }
    };

    // Set up initial interval if tab is visible
    if (typeof window !== 'undefined' && !document.hidden) {
      interval = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes
    }

    // Listen for visibility changes
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [fetchData]);

  // Show skeleton loading if data is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-white">
                      SaaS Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-300 text-lg">
                      Track trends across Product Hunt, Hacker News, and GitHub
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Filter Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="w-full">
            <div className="grid w-full grid-cols-4 h-14 bg-card p-1 rounded-2xl shadow-sm border mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-1 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
              ))}
            </div>

            {/* Tab Content Skeleton */}
            <TabContentSkeleton />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-white">
                    SaaS Dashboard
                  </h1>
                  <p className="text-slate-500 dark:text-slate-300 text-lg">
                    Track trends across Product Hunt, Hacker News, and GitHub
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Enhanced Filter with Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Filter Options</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseEnhancedFilter(!useEnhancedFilter)}
              className="text-xs"
            >
              {useEnhancedFilter ? 'Use Simple Filter' : 'Use Advanced Filters'}
            </Button>
          </div>
          {useEnhancedFilter ? (
            <EnhancedFilter
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTopics={selectedTopics}
              setSelectedTopics={setSelectedTopics}
              projectType={projectType}
              setProjectType={setProjectType}
            />
          ) : (
            <TimeFilter timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
          )}
        </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <TabsTrigger value="vc-intelligence" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white font-medium text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  VC Intelligence
                </TabsTrigger>
                <TabsTrigger value="indie-hacker" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white font-medium text-slate-500 dark:text-slate-400">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Indie Hacker
                </TabsTrigger>
                <TabsTrigger value="developer-inspiration" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-600 dark:data-[state=active]:text-white font-medium text-slate-500 dark:text-slate-400">
                  <Zap className="h-4 w-4 mr-2" />
                  Developer
                </TabsTrigger>
                <TabsTrigger value="trending-category" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white font-medium text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  By Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vc-intelligence" className="mt-6">
                <VCIntelligenceTab 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  githubData={saaSHubData}
                  timeFilter={timeFilter}
                />
              </TabsContent>

              <TabsContent value="indie-hacker" className="mt-6">
                <IndieHackerTab 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  githubData={saaSHubData}
                  timeFilter={timeFilter}
                />
              </TabsContent>

              <TabsContent value="developer-inspiration" className="mt-6">
                <DeveloperInspirationTab 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  githubData={saaSHubData}
                  timeFilter={timeFilter}
                />
              </TabsContent>

              <TabsContent value="trending-category" className="mt-6">
                <TrendingByCategory 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  githubData={saaSHubData}
                  timeFilter={timeFilter}
                />
              </TabsContent>

            </Tabs>
      </div>

      {showOnboarding && (
        <OnboardingGuide 
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}