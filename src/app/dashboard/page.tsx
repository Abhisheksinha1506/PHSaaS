"use client"

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";
import { Zap, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { TabContentSkeleton, DashboardGridSkeleton } from "@/components/ui/skeleton";

// Import the dashboard components
import { TrendTrackerTab } from "@/components/dashboard/trend-tracker-tab";
import { DevPulseTab } from "@/components/dashboard/dev-pulse-tab";
import { LaunchIntelTab } from "@/components/dashboard/launch-intel-tab";
import { TimeFilter } from "@/components/dashboard/time-filter";
import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard";

export default function DashboardPage() {
  const [productHuntData, setProductHuntData] = useState<ProductHuntPost[]>([]);
  const [hackerNewsData, setHackerNewsData] = useState<HackerNewsPost[]>([]);
  const [saaSHubData, setSaaSHubData] = useState<SaaSHubAlternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState('trend-tracker');
  const [allProductHuntData, setAllProductHuntData] = useState<ProductHuntPost[]>([]);
  const [allHackerNewsData, setAllHackerNewsData] = useState<HackerNewsPost[]>([]);
  const [allSaaSHubData, setAllSaaSHubData] = useState<SaaSHubAlternative[]>([]);

  // Function to filter data based on time period
  const filterDataByTime = (data: any[], timeFilter: string, dateField: string) => {
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
      if (!item || !item[dateField]) {
        return false; // Skip items without the required date field
      }

      let itemDate: Date;
      
      if (dateField === 'time') {
        // Hacker News uses Unix timestamp (seconds)
        itemDate = new Date(item[dateField] * 1000);
      } else {
        // Product Hunt uses ISO date string
        itemDate = new Date(item[dateField]);
      }
      
      return itemDate >= cutoffDate;
    });
  };

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`🔄 Auto-refreshing data for ${timeFilter} filter...`);
      
      // Fetch real data from APIs with time-aware parameters
      const [phResponse, hnResponse, shResponse] = await Promise.all([
        fetch(`/api/product-hunt?timeFilter=${timeFilter}`),
        fetch(`/api/hacker-news?timeFilter=${timeFilter}`),
        fetch(`/api/saashub?timeFilter=${timeFilter}`)
      ]);
      
      // Parse responses with error handling
      const phResponseData = phResponse.ok ? await phResponse.json() : { data: [] };
      const hnResponseData = hnResponse.ok ? await hnResponse.json() : { data: [] };
      const shResponseData = shResponse.ok ? await shResponse.json() : { data: [] };
      
      // Extract data from responses (handle both old array format and new object format)
      const phData = Array.isArray(phResponseData) ? phResponseData : (phResponseData.data || []);
      const hnData = Array.isArray(hnResponseData) ? hnResponseData : (hnResponseData.data || []);
      const shData = Array.isArray(shResponseData) ? shResponseData : (shResponseData.data || []);
      
      console.log(`📊 Auto-refresh data received - PH: ${Array.isArray(phData) ? phData.length : 'undefined'}, HN: ${Array.isArray(hnData) ? hnData.length : 'undefined'}, GH: ${Array.isArray(shData) ? shData.length : 'undefined'}`);
      
      // Ensure we have arrays
      const safePhData = Array.isArray(phData) ? phData : [];
      const safeHnData = Array.isArray(hnData) ? hnData : [];
      const safeShData = Array.isArray(shData) ? shData : [];
      
      // Store all data
      setAllProductHuntData(safePhData);
      setAllHackerNewsData(safeHnData);
      setAllSaaSHubData(safeShData);
      
      // Apply additional client-side filtering if needed
      const filteredPH = filterDataByTime(safePhData, timeFilter, 'created_at');
      const filteredHN = filterDataByTime(safeHnData, timeFilter, 'time');
      const filteredSH = timeFilter === '24h' ? safeShData.slice(0, 5) : 
                        timeFilter === '7d' ? safeShData.slice(0, 10) : 
                        safeShData; // 30d shows all data
      
      setProductHuntData(filteredPH);
      setHackerNewsData(filteredHN);
      setSaaSHubData(filteredSH);
    } catch (error) {
      console.error('Error auto-refreshing data:', error);
      // Fallback to empty arrays if API calls fail
      setProductHuntData([]);
      setHackerNewsData([]);
      setSaaSHubData([]);
      setAllProductHuntData([]);
      setAllHackerNewsData([]);
      setAllSaaSHubData([]);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
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

        {/* Common Time Filter */}
        <TimeFilter timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <TabsTrigger value="trend-tracker" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 font-medium text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  TrendTracker Pro
                </TabsTrigger>
                <TabsTrigger value="dev-pulse" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 font-medium text-slate-500 dark:text-slate-400">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  DevPulse
                </TabsTrigger>
                <TabsTrigger value="launch-intel" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 font-medium text-slate-500 dark:text-slate-400">
                  <Zap className="h-4 w-4 mr-2" />
                  LaunchIntel
                </TabsTrigger>
                <TabsTrigger value="enhanced" className="flex-1 h-12 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 font-medium text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trend-tracker" className="mt-6">
                <TrendTrackerTab 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  saaSHubData={saaSHubData}
                  timeFilter={timeFilter}
                  setTimeFilter={setTimeFilter}
                />
              </TabsContent>

              <TabsContent value="dev-pulse" className="mt-6">
                <DevPulseTab 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  saaSHubData={saaSHubData} 
                />
              </TabsContent>

              <TabsContent value="launch-intel" className="mt-6">
                <LaunchIntelTab 
                  productHuntData={productHuntData} 
                  hackerNewsData={hackerNewsData} 
                  saaSHubData={saaSHubData} 
                />
              </TabsContent>

              <TabsContent value="enhanced" className="mt-6">
                <EnhancedDashboard 
                  initialData={{
                    productHunt: productHuntData,
                    hackerNews: hackerNewsData,
                    github: saaSHubData
                  }}
                />
              </TabsContent>
            </Tabs>
      </div>
    </div>
  );
}