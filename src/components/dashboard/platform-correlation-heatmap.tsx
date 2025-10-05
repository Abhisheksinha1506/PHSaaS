"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Eye, ArrowRight, Zap } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface CorrelationData {
  topic: string;
  productHunt: number;
  hackerNews: number;
  github: number;
  totalMentions: number;
  correlation: number;
  trend: 'up' | 'down' | 'stable';
  marketSize: 'large' | 'medium' | 'small';
  crossPlatformBuzz: number;
  opportunities: string[];
  insights: string[];
}

interface CorrelationHeatmapProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
}

export function PlatformCorrelationHeatmap({ 
  productHuntData, 
  hackerNewsData, 
  githubData 
}: CorrelationHeatmapProps) {
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'total' | 'correlation' | 'buzz'>('total');

  useEffect(() => {
    const analyzeCorrelations = () => {
      const topicMentions: Record<string, { ph: number; hn: number; gh: number; topics: string[] }> = {};

      // Analyze Product Hunt data
      productHuntData.forEach(ph => {
        ph.topics.forEach(topic => {
          if (!topicMentions[topic.name]) {
            topicMentions[topic.name] = { ph: 0, hn: 0, gh: 0, topics: [] };
          }
          topicMentions[topic.name].ph += ph.votes_count + ph.comments_count;
          topicMentions[topic.name].topics.push('Product Hunt');
        });
      });

      // Analyze Hacker News data
      hackerNewsData.forEach(hn => {
        const title = hn.title.toLowerCase();
        const techKeywords = [
          'ai', 'machine learning', 'javascript', 'python', 'react', 'vue', 'angular',
          'node', 'go', 'rust', 'typescript', 'docker', 'kubernetes', 'aws', 'blockchain',
          'cryptocurrency', 'api', 'database', 'analytics', 'automation', 'saas', 'mobile',
          'web', 'frontend', 'backend', 'devops', 'security', 'testing', 'deployment'
        ];

        techKeywords.forEach(keyword => {
          if (title.includes(keyword)) {
            const topic = keyword.charAt(0).toUpperCase() + keyword.slice(1);
            if (!topicMentions[topic]) {
              topicMentions[topic] = { ph: 0, hn: 0, gh: 0, topics: [] };
            }
            topicMentions[topic].hn += hn.score + hn.descendants;
            if (!topicMentions[topic].topics.includes('Hacker News')) {
              topicMentions[topic].topics.push('Hacker News');
            }
          }
        });
      });

      // Analyze GitHub data
      githubData.forEach(gh => {
        const text = `${gh.name} ${gh.description}`.toLowerCase();
        const techKeywords = [
          'ai', 'machine learning', 'javascript', 'python', 'react', 'vue', 'angular',
          'node', 'go', 'rust', 'typescript', 'docker', 'kubernetes', 'aws', 'blockchain',
          'cryptocurrency', 'api', 'database', 'analytics', 'automation', 'saas', 'mobile',
          'web', 'frontend', 'backend', 'devops', 'security', 'testing', 'deployment'
        ];

        techKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            const topic = keyword.charAt(0).toUpperCase() + keyword.slice(1);
            if (!topicMentions[topic]) {
              topicMentions[topic] = { ph: 0, hn: 0, gh: 0, topics: [] };
            }
            topicMentions[topic].gh += gh.reviews_count;
            if (!topicMentions[topic].topics.includes('GitHub')) {
              topicMentions[topic].topics.push('GitHub');
            }
          }
        });
      });

      // Calculate correlations and generate insights
      const correlations: CorrelationData[] = Object.entries(topicMentions)
        .filter(([_, data]) => data.ph > 0 || data.hn > 0 || data.gh > 0)
        .map(([topic, data]) => {
          const totalMentions = data.ph + data.hn + data.gh;
          const platformCount = data.topics.length;
          const correlation = platformCount > 1 ? (platformCount / 3) * 100 : 0;
          const crossPlatformBuzz = platformCount > 1 ? totalMentions * (platformCount / 3) : totalMentions;

          return {
            topic,
            productHunt: data.ph,
            hackerNews: data.hn,
            github: data.gh,
            totalMentions,
            correlation: Math.round(correlation),
            trend: (totalMentions > 1000 ? 'up' : totalMentions > 500 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
            marketSize: (totalMentions > 2000 ? 'large' : totalMentions > 1000 ? 'medium' : 'small') as 'large' | 'medium' | 'small',
            crossPlatformBuzz: Math.round(crossPlatformBuzz),
            opportunities: generateOpportunities(topic, data),
            insights: generateInsights(topic, data, correlation)
          };
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'total': return b.totalMentions - a.totalMentions;
            case 'correlation': return b.correlation - a.correlation;
            case 'buzz': return b.crossPlatformBuzz - a.crossPlatformBuzz;
            default: return b.totalMentions - a.totalMentions;
          }
        })
        .slice(0, 15);

      setCorrelationData(correlations);
      setLoading(false);
    };

    analyzeCorrelations();
  }, [productHuntData, hackerNewsData, githubData, sortBy]);

  const generateOpportunities = (topic: string, data: { ph: number; hn: number; gh: number; topics: string[] }) => {
    const opportunities: string[] = [];
    
    if (data.ph > 0 && data.hn > 0) {
      opportunities.push(`High engagement on both Product Hunt and Hacker News`);
    }
    
    if (data.gh > 1000) {
      opportunities.push(`Strong developer adoption on GitHub`);
    }
    
    if (data.ph > 500 && data.hn === 0) {
      opportunities.push(`Product Hunt success but no Hacker News discussion - opportunity to engage developers`);
    }
    
    if (data.hn > 200 && data.ph === 0) {
      opportunities.push(`Developer interest but no Product Hunt presence - opportunity to launch`);
    }

    return opportunities.slice(0, 3);
  };

  const generateInsights = (topic: string, data: { ph: number; hn: number; gh: number; topics: string[] }, correlation: number) => {
    const insights: string[] = [];
    
    if (correlation > 60) {
      insights.push(`Strong cross-platform presence - ${topic} is trending everywhere`);
    } else if (correlation > 30) {
      insights.push(`Moderate cross-platform presence - ${topic} has some traction`);
    } else {
      insights.push(`Limited cross-platform presence - ${topic} is platform-specific`);
    }

    if (data.ph > data.hn && data.ph > data.gh) {
      insights.push(`Product Hunt is the primary platform for ${topic}`);
    } else if (data.hn > data.ph && data.hn > data.gh) {
      insights.push(`Hacker News is the primary platform for ${topic}`);
    } else if (data.gh > data.ph && data.gh > data.hn) {
      insights.push(`GitHub is the primary platform for ${topic}`);
    }

    return insights;
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (correlation >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (correlation >= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMarketSizeColor = (size: string) => {
    switch (size) {
      case 'large': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'small': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Correlation Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Platform Correlation Heatmap
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'total' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('total')}
          >
            Total Mentions
          </Button>
          <Button
            variant={sortBy === 'correlation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('correlation')}
          >
            Correlation
          </Button>
          <Button
            variant={sortBy === 'buzz' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('buzz')}
          >
            Cross-Platform Buzz
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {correlationData.map((item, index) => (
            <div key={item.topic} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-card-foreground">#{index + 1}</div>
                  <h3 className="text-lg font-semibold text-card-foreground">{item.topic}</h3>
                  <Badge className={getCorrelationColor(item.correlation)}>
                    {item.correlation}% correlation
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.trend)}
                  <span className="text-sm text-muted-foreground">
                    {item.crossPlatformBuzz} buzz score
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{item.productHunt}</div>
                  <div className="text-sm text-muted-foreground">Product Hunt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{item.hackerNews}</div>
                  <div className="text-sm text-muted-foreground">Hacker News</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{item.github}</div>
                  <div className="text-sm text-muted-foreground">GitHub</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{item.totalMentions}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Opportunities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {item.opportunities.map((opportunity, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {item.insights.map((insight, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-blue-500" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedTopic === item.topic && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded">
                  <h4 className="font-medium text-card-foreground mb-3">Detailed Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-card-foreground mb-2">Platform Breakdown</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Product Hunt:</span>
                          <span className="font-medium">{item.productHunt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hacker News:</span>
                          <span className="font-medium">{item.hackerNews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GitHub:</span>
                          <span className="font-medium">{item.github}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-card-foreground mb-2">Market Analysis</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Market Size:</span>
                          <span className={`font-medium ${getMarketSizeColor(item.marketSize)}`}>
                            {item.marketSize}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend:</span>
                          <span className="font-medium capitalize">{item.trend}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Correlation:</span>
                          <span className="font-medium">{item.correlation}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-card-foreground mb-2">Recommendations</h5>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {item.correlation > 60 && (
                          <div>• High cross-platform interest - consider multi-platform strategy</div>
                        )}
                        {item.productHunt > item.hackerNews && (
                          <div>• Focus on Product Hunt for launches</div>
                        )}
                        {item.hackerNews > item.productHunt && (
                          <div>• Engage developer community on Hacker News</div>
                        )}
                        {item.github > 1000 && (
                          <div>• Strong developer adoption - build developer tools</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline" className={getMarketSizeColor(item.marketSize)}>
                    {item.marketSize} market
                  </Badge>
                  <Badge variant="outline">
                    {item.trend} trend
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTopic(selectedTopic === item.topic ? null : item.topic)}
                >
                  {selectedTopic === item.topic ? 'Hide Details' : 'View Analysis'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="font-semibold text-card-foreground mb-2">💡 Correlation Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {correlationData.filter(c => c.correlation > 60).length} topics have high cross-platform correlation</li>
            <li>• {correlationData.filter(c => c.trend === 'up').length} topics are trending up</li>
            <li>• {correlationData.filter(c => c.marketSize === 'large').length} topics have large market potential</li>
            <li>• Most correlated: {correlationData[0]?.topic} with {correlationData[0]?.correlation}% correlation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
