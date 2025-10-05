"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Target, Users, Clock, DollarSign, AlertCircle, Lightbulb, BarChart3, Zap } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface IndieHackerTabProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
  timeFilter: string;
}

interface MarketGap {
  id: string;
  title: string;
  description: string;
  problem: string;
  opportunity: string;
  marketSize: 'large' | 'medium' | 'small';
  competition: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  timeToMarket: string;
  revenue: string;
  platforms: string[];
  keywords: string[];
}

interface CompetitorAnalysis {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketPosition: 'leader' | 'challenger' | 'follower';
  launchDate: string;
  traction: number;
  gaps: string[];
}

interface LaunchTiming {
  category: string;
  bestTime: string;
  reason: string;
  examples: string[];
  successRate: number;
}

export function IndieHackerTab({ productHuntData, hackerNewsData, githubData, timeFilter }: IndieHackerTabProps) {
  const [marketGaps, setMarketGaps] = useState<MarketGap[]>([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [launchTiming, setLaunchTiming] = useState<LaunchTiming[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Generate market gaps based on cross-platform analysis
  useEffect(() => {
    const generateMarketGaps = () => {
      const gaps: MarketGap[] = [];
      
      // Analyze Hacker News pain points
      hackerNewsData.forEach(hn => {
        const title = hn.title.toLowerCase();
        if (title.includes('problem') || title.includes('issue') || title.includes('frustrated')) {
          gaps.push({
            id: `gap-${hn.id}`,
            title: `Problem: ${hn.title.substring(0, 50)}...`,
            description: `High developer discussion: ${hn.score} points, ${hn.descendants} comments`,
            problem: hn.title,
            opportunity: `Build a solution for this developer pain point`,
            marketSize: hn.score > 200 ? 'large' : hn.score > 100 ? 'medium' : 'small',
            competition: 'low',
            difficulty: 'medium',
            timeToMarket: '3-6 months',
            revenue: '$5K-50K MRR potential',
            platforms: ['Hacker News'],
            keywords: hn.title.split(' ').slice(0, 5)
          });
        }
      });

      // Analyze Product Hunt categories with low competition
      const categoryAnalysis = productHuntData.reduce((acc, ph) => {
        ph.topics.forEach(topic => {
          if (!acc[topic.name]) {
            acc[topic.name] = { count: 0, totalVotes: 0 };
          }
          acc[topic.name].count++;
          acc[topic.name].totalVotes += ph.votes_count;
        });
      }, {} as Record<string, { count: number; totalVotes: number }>);

      Object.entries(categoryAnalysis).forEach(([category, data]) => {
        if (data.count < 3 && data.totalVotes > 500) {
          gaps.push({
            id: `category-${category}`,
            title: `Underserved Market: ${category}`,
            description: `Only ${data.count} products in this category with ${data.totalVotes} total votes`,
            problem: `Limited options in ${category} space`,
            opportunity: `First-mover advantage in ${category}`,
            marketSize: 'medium',
            competition: 'low',
            difficulty: 'easy',
            timeToMarket: '2-4 months',
            revenue: '$10K-100K MRR potential',
            platforms: ['Product Hunt'],
            keywords: [category.toLowerCase()]
          });
        }
      });

      setMarketGaps(gaps.slice(0, 6));
    };

    const generateCompetitorAnalysis = () => {
      const competitors: CompetitorAnalysis[] = [];
      
      // Analyze top Product Hunt launches
      productHuntData.slice(0, 5).forEach(ph => {
        const engagement = ph.votes_count + ph.comments_count;
        competitors.push({
          id: `competitor-${ph.id}`,
          name: ph.name,
          description: ph.tagline,
          strengths: [
            `High engagement: ${engagement} total interactions`,
            `Strong community support`,
            `Clear value proposition`
          ],
          weaknesses: [
            engagement < 500 ? 'Low initial traction' : '',
            ph.comments_count < 20 ? 'Limited community discussion' : '',
            'New to market'
          ].filter(Boolean),
          marketPosition: engagement > 1000 ? 'leader' : engagement > 500 ? 'challenger' : 'follower',
          launchDate: ph.created_at,
          traction: engagement,
          gaps: [
            'Mobile app missing',
            'API integration needed',
            'Team collaboration features',
            'Advanced analytics'
          ]
        });
      });

      setCompetitorAnalysis(competitors);
    };

    const generateLaunchTiming = () => {
      const timing: LaunchTiming[] = [
        {
          category: 'Developer Tools',
          bestTime: 'Tuesday 10 AM PST',
          reason: 'Developers are most active during work hours',
          examples: ['VS Code extensions', 'CLI tools', 'API services'],
          successRate: 78
        },
        {
          category: 'SaaS Products',
          bestTime: 'Wednesday 9 AM PST',
          reason: 'Mid-week when decision makers are planning',
          examples: ['Project management', 'Analytics', 'Communication'],
          successRate: 65
        },
        {
          category: 'AI/ML Tools',
          bestTime: 'Monday 8 AM PST',
          reason: 'Fresh start to the week, high tech interest',
          examples: ['Chatbots', 'Data analysis', 'Automation'],
          successRate: 82
        }
      ];
      setLaunchTiming(timing);
    };

    generateMarketGaps();
    generateCompetitorAnalysis();
    generateLaunchTiming();
    setLoading(false);
  }, [productHuntData, hackerNewsData, githubData]);

  const filteredGaps = marketGaps.filter(gap => 
    gap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gap.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gap.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Lightbulb className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">Indie Hacker Research</h2>
            <p className="text-muted-foreground">Market gaps, competitor analysis, and launch timing</p>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Target className="h-3 w-3 mr-1" />
          Research Mode
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for problems, markets, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Gaps</p>
                <p className="text-2xl font-bold text-blue-600">{marketGaps.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competitors</p>
                <p className="text-2xl font-bold text-orange-600">{competitorAnalysis.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Revenue</p>
                <p className="text-2xl font-bold text-green-600">$25K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">75%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Gaps & Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGaps.map((gap) => (
              <div key={gap.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground mb-1">{gap.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {gap.marketSize} market
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {gap.competition} competition
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {gap.difficulty} difficulty
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{gap.revenue}</div>
                    <div className="text-sm text-muted-foreground">potential</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground mb-1">Problem:</h4>
                    <p className="text-sm text-muted-foreground">{gap.problem}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground mb-1">Opportunity:</h4>
                    <p className="text-sm text-muted-foreground">{gap.opportunity}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {gap.keywords.slice(0, 3).map(keyword => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Research
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitorAnalysis.map((competitor) => (
              <div key={competitor.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-card-foreground">{competitor.name}</h3>
                      <Badge 
                        variant="outline"
                        className={
                          competitor.marketPosition === 'leader' ? 'border-green-500 text-green-600' :
                          competitor.marketPosition === 'challenger' ? 'border-yellow-500 text-yellow-600' :
                          'border-gray-500 text-gray-600'
                        }
                      >
                        {competitor.marketPosition}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{competitor.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-card-foreground">{competitor.traction}</div>
                    <div className="text-sm text-muted-foreground">traction score</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground mb-2">Strengths:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {competitor.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground mb-2">Weaknesses:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {competitor.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-card-foreground mb-2">Market Gaps:</h4>
                  <div className="flex flex-wrap gap-1">
                    {competitor.gaps.map((gap, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Launch Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Launch Timing Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {launchTiming.map((timing, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-card-foreground">{timing.category}</h4>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {timing.successRate}% success
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Best Time:</p>
                    <p className="text-sm text-muted-foreground">{timing.bestTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Why:</p>
                    <p className="text-sm text-muted-foreground">{timing.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Examples:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {timing.examples.map((example, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
