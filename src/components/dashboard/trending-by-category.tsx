"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, ArrowUpRight } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface TrendingByCategoryProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
  timeFilter: string;
}

interface CategoryTrend {
  category: string;
  productHuntCount: number;
  hackerNewsCount: number;
  githubCount: number;
  totalEngagement: number;
  growth: number;
  trendingItems: Array<{
    name: string;
    platform: string;
    engagement: number;
    link?: string;
  }>;
}

export function TrendingByCategory({ productHuntData, hackerNewsData, githubData, timeFilter }: TrendingByCategoryProps) {
  const categoryTrends = useMemo(() => {
    const trends: Record<string, CategoryTrend> = {};
    
    // Extract categories from Product Hunt
    productHuntData.forEach(item => {
      item.topics.forEach(topic => {
        const category = topic.name;
        if (!trends[category]) {
          trends[category] = {
            category,
            productHuntCount: 0,
            hackerNewsCount: 0,
            githubCount: 0,
            totalEngagement: 0,
            growth: 0,
            trendingItems: []
          };
        }
        trends[category].productHuntCount++;
        const engagement = item.votes_count + item.comments_count;
        trends[category].totalEngagement += engagement;
        trends[category].trendingItems.push({
          name: item.name,
          platform: 'Product Hunt',
          engagement,
          link: `https://www.producthunt.com/posts/${item.name.toLowerCase().replace(/\s+/g, '-')}`
        });
      });
    });
    
    // Extract categories from GitHub (using features/category)
    githubData.forEach(item => {
      const category = item.category || 'Open Source Tools';
      if (!trends[category]) {
        trends[category] = {
          category,
          productHuntCount: 0,
          hackerNewsCount: 0,
          githubCount: 0,
          totalEngagement: 0,
          growth: 0,
          trendingItems: []
        };
      }
      trends[category].githubCount++;
      trends[category].totalEngagement += item.reviews_count || 0;
      trends[category].trendingItems.push({
        name: item.name,
        platform: 'GitHub',
        engagement: item.reviews_count || 0,
        link: item.website_url
      });
    });
    
    // Calculate growth (simplified - based on engagement)
    Object.values(trends).forEach(trend => {
      const avgEngagement = trend.totalEngagement / (trend.productHuntCount + trend.githubCount + trend.hackerNewsCount || 1);
      trend.growth = avgEngagement > 500 ? 50 : avgEngagement > 200 ? 30 : avgEngagement > 100 ? 15 : 5;
    });
    
    // Sort by total engagement
    return Object.values(trends)
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 12); // Top 12 categories
  }, [productHuntData, hackerNewsData, githubData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Trending by Category</h2>
          <p className="text-muted-foreground">Spot rising projects in specific categories</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Activity className="h-3 w-3 mr-1" />
          Live Trends
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTrends.map((trend, index) => (
          <Card key={trend.category} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{trend.category}</CardTitle>
                <Badge 
                  variant="outline"
                  className={
                    trend.growth > 40 ? 'border-green-500 text-green-600' :
                    trend.growth > 20 ? 'border-blue-500 text-blue-600' :
                    'border-gray-500 text-gray-600'
                  }
                >
                  {trend.growth > 0 ? '+' : ''}{trend.growth}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Platform Counts */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="font-semibold text-card-foreground">{trend.productHuntCount}</p>
                    <p className="text-xs text-muted-foreground">PH</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="font-semibold text-card-foreground">{trend.hackerNewsCount}</p>
                    <p className="text-xs text-muted-foreground">HN</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="font-semibold text-card-foreground">{trend.githubCount}</p>
                    <p className="text-xs text-muted-foreground">GH</p>
                  </div>
                </div>

                {/* Total Engagement */}
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm text-muted-foreground">Total Engagement</span>
                  <span className="font-bold text-blue-600">{trend.totalEngagement.toLocaleString()}</span>
                </div>

                {/* Trending Items */}
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-2">Top Items:</p>
                  <div className="space-y-1">
                    {trend.trendingItems
                      .sort((a, b) => b.engagement - a.engagement)
                      .slice(0, 3)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {item.platform === 'Product Hunt' ? 'PH' : item.platform === 'Hacker News' ? 'HN' : 'GH'}
                            </Badge>
                            <span className="truncate text-card-foreground">{item.name}</span>
                          </div>
                          <span className="text-muted-foreground flex-shrink-0 ml-2">{item.engagement}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Growth Indicator */}
                <div className="flex items-center gap-2 text-sm">
                  {trend.growth > 40 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Rapidly Growing</span>
                    </>
                  ) : trend.growth > 20 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Growing</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600 font-medium">Stable</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categoryTrends.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No category trends available for the selected time period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

