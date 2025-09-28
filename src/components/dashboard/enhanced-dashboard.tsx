"use client"

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls } from "./pagination-controls";
import { TrendingUp, RefreshCw, BarChart3 } from "lucide-react";
import { StatsSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface EnhancedDashboardProps {
  initialData?: {
    productHunt: ProductHuntPost[];
    hackerNews: HackerNewsPost[];
    github: SaaSHubAlternative[];
  };
}

export function EnhancedDashboard({ initialData }: EnhancedDashboardProps) {
  const [data, setData] = useState({
    productHunt: initialData?.productHunt || [],
    hackerNews: initialData?.hackerNews || [],
    github: initialData?.github || []
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Pagination state
  const [pagination, setPagination] = useState({
    productHunt: { page: 1, limit: 20, totalPages: 1, totalItems: 0 },
    hackerNews: { page: 1, limit: 20, totalPages: 1, totalItems: 0 },
    github: { page: 1, limit: 20, totalPages: 1, totalItems: 0 }
  });

  // Load data with pagination
  const loadData = useCallback(async (platform: string, page: number, limit: number, filters: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await fetch(`/api/${platform}?${params}`);
      const result = await response.json();
      
      if (result.data) {
        setData(prev => ({
          ...prev,
          [platform]: result.data
        }));
        
        setPagination(prev => ({
          ...prev,
          [platform]: {
            page: result.pagination.currentPage,
            limit: result.pagination.itemsPerPage,
            totalPages: result.pagination.totalPages,
            totalItems: result.pagination.totalItems
          }
        }));
      }
    } catch (error) {
      console.error(`Failed to load ${platform} data:`, error);
    } finally {
      setLoading(false);
    }
  }, []);


  // Load initial data
  useEffect(() => {
    loadData('product-hunt', 1, 20);
    loadData('hacker-news', 1, 20);
    loadData('saashub', 1, 20);
  }, [loadData]);

  // Show skeleton loading if data is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="space-y-4">
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-6">
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="w-full">
            <div className="grid w-full grid-cols-4 h-14 bg-card p-1 rounded-2xl shadow-sm border mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-1 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              <StatsSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-card-foreground">Enhanced SaaS Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced analytics with pagination and real-time data
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadData('product-hunt', 1, 20);
              loadData('hacker-news', 1, 20);
              loadData('saashub', 1, 20);
            }}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>


      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Product Hunt Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Product Hunt Launches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {data.productHunt.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.tagline}</p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{item.votes_count} votes</span>
                        <span>{item.comments_count} comments</span>
                        <span>by {item.user?.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-card-foreground">
                        {item.votes_count + item.comments_count}
                      </div>
                      <div className="text-sm text-muted-foreground">engagement</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <PaginationControls
                currentPage={pagination.productHunt.page}
                totalPages={pagination.productHunt.totalPages}
                totalItems={pagination.productHunt.totalItems}
                itemsPerPage={pagination.productHunt.limit}
                onPageChange={(page) => loadData('product-hunt', page, pagination.productHunt.limit)}
                onItemsPerPageChange={(limit) => loadData('product-hunt', 1, limit)}
                hasNextPage={pagination.productHunt.page < pagination.productHunt.totalPages}
                hasPrevPage={pagination.productHunt.page > 1}
              />
            </CardContent>
          </Card>

          {/* Hacker News Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hacker News Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {data.hackerNews.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground line-clamp-2">{item.title}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{item.score} points</span>
                        <span>{item.descendants || 0} comments</span>
                        <span>by {item.by}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-card-foreground">{item.score}</div>
                      <div className="text-sm text-muted-foreground">score</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <PaginationControls
                currentPage={pagination.hackerNews.page}
                totalPages={pagination.hackerNews.totalPages}
                totalItems={pagination.hackerNews.totalItems}
                itemsPerPage={pagination.hackerNews.limit}
                onPageChange={(page) => loadData('hacker-news', page, pagination.hackerNews.limit)}
                onItemsPerPageChange={(limit) => loadData('hacker-news', 1, limit)}
                hasNextPage={pagination.hackerNews.page < pagination.hackerNews.totalPages}
                hasPrevPage={pagination.hackerNews.page > 1}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
