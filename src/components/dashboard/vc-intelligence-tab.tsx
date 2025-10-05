"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Target, DollarSign, Users, Zap, Eye, ArrowUpRight, TrendingDown, Activity } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface VCIntelligenceTabProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
  timeFilter: string;
}

interface InvestmentSignal {
  id: string;
  title: string;
  description: string;
  signal: 'strong' | 'medium' | 'weak';
  platforms: string[];
  correlation: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  marketSize: 'large' | 'medium' | 'small';
  competition: 'low' | 'medium' | 'high';
}

interface CrossPlatformAlert {
  id: string;
  type: 'launch' | 'discussion' | 'trending' | 'correlation';
  title: string;
  description: string;
  platforms: string[];
  urgency: 'high' | 'medium' | 'low';
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
}

export function VCIntelligenceTab({ productHuntData, hackerNewsData, githubData, timeFilter }: VCIntelligenceTabProps) {
  const [investmentSignals, setInvestmentSignals] = useState<InvestmentSignal[]>([]);
  const [crossPlatformAlerts, setCrossPlatformAlerts] = useState<CrossPlatformAlert[]>([]);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate investment signals based on cross-platform data
  useEffect(() => {
    const generateInvestmentSignals = () => {
      const signals: InvestmentSignal[] = [];
      
      // Analyze Product Hunt launches with high engagement
      productHuntData.slice(0, 5).forEach((ph, index) => {
        const engagementScore = ph.votes_count + ph.comments_count;
        if (engagementScore > 500) {
          signals.push({
            id: `ph-${ph.id}`,
            title: ph.name,
            description: ph.tagline,
            signal: engagementScore > 1000 ? 'strong' : engagementScore > 750 ? 'medium' : 'weak',
            platforms: ['Product Hunt'],
            correlation: 'High engagement on launch day',
            score: Math.min(100, (engagementScore / 20)),
            trend: 'up',
            marketSize: ph.topics.some(t => ['AI', 'Developer Tools', 'SaaS'].includes(t.name)) ? 'large' : 'medium',
            competition: 'medium'
          });
        }
      });

      // Analyze Hacker News discussions with high scores
      hackerNewsData.slice(0, 3).forEach((hn, index) => {
        if (hn.score > 100) {
          signals.push({
            id: `hn-${hn.id}`,
            title: hn.title,
            description: `High developer interest: ${hn.score} points, ${hn.descendants} comments`,
            signal: hn.score > 200 ? 'strong' : 'medium',
            platforms: ['Hacker News'],
            correlation: 'Strong developer community interest',
            score: Math.min(100, hn.score / 2),
            trend: 'up',
            marketSize: 'large',
            competition: 'high'
          });
        }
      });

      // Analyze GitHub trending with high stars
      githubData.slice(0, 3).forEach((gh, index) => {
        if (gh.reviews_count > 1000) {
          signals.push({
            id: `gh-${gh.id}`,
            title: gh.name,
            description: gh.description,
            signal: gh.reviews_count > 5000 ? 'strong' : 'medium',
            platforms: ['GitHub'],
            correlation: 'High developer adoption',
            score: Math.min(100, gh.reviews_count / 50),
            trend: 'up',
            marketSize: 'large',
            competition: 'low'
          });
        }
      });

      setInvestmentSignals(signals);
    };

    const generateCrossPlatformAlerts = () => {
      const alerts: CrossPlatformAlert[] = [];
      
      // Find correlations between platforms
      productHuntData.slice(0, 3).forEach(ph => {
        const phKeywords = ph.name.toLowerCase().split(' ');
        hackerNewsData.forEach(hn => {
          const hnKeywords = hn.title.toLowerCase().split(' ');
          const commonKeywords = phKeywords.filter(keyword => 
            hnKeywords.some(hnKeyword => hnKeyword.includes(keyword) || keyword.includes(hnKeyword))
          );
          
          if (commonKeywords.length > 0) {
            alerts.push({
              id: `correlation-${ph.id}-${hn.id}`,
              type: 'correlation',
              title: `Cross-platform buzz: ${ph.name}`,
              description: `Product Hunt launch getting discussed on Hacker News`,
              platforms: ['Product Hunt', 'Hacker News'],
              urgency: 'medium',
              timestamp: new Date().toISOString(),
              impact: 'medium'
            });
          }
        });
      });

      // High engagement alerts
      productHuntData.forEach(ph => {
        if (ph.votes_count > 800) {
          alerts.push({
            id: `launch-${ph.id}`,
            type: 'launch',
            title: `Hot Launch: ${ph.name}`,
            description: `${ph.votes_count} votes in first day`,
            platforms: ['Product Hunt'],
            urgency: 'high',
            timestamp: ph.created_at,
            impact: 'high'
          });
        }
      });

      setCrossPlatformAlerts(alerts.slice(0, 8));
    };

    const generateMarketInsights = () => {
      const insights = [
        {
          category: 'AI/ML',
          trend: 'up',
          growth: '+45%',
          opportunities: 12,
          competition: 'medium'
        },
        {
          category: 'Developer Tools',
          trend: 'up',
          growth: '+32%',
          opportunities: 8,
          competition: 'high'
        },
        {
          category: 'SaaS',
          trend: 'stable',
          growth: '+18%',
          opportunities: 15,
          competition: 'high'
        }
      ];
      setMarketInsights(insights);
    };

    generateInvestmentSignals();
    generateCrossPlatformAlerts();
    generateMarketInsights();
    setLoading(false);
  }, [productHuntData, hackerNewsData, githubData]);

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
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">VC Intelligence Dashboard</h2>
            <p className="text-muted-foreground">Investment signals and market opportunities</p>
          </div>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Activity className="h-3 w-3 mr-1" />
          Live Intelligence
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investment Signals</p>
                <p className="text-2xl font-bold text-green-600">{investmentSignals.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cross-Platform Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{crossPlatformAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Categories</p>
                <p className="text-2xl font-bold text-purple-600">{marketInsights.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Signal Score</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(investmentSignals.reduce((acc, s) => acc + s.score, 0) / investmentSignals.length || 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investmentSignals.map((signal) => (
              <div key={signal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-card-foreground">{signal.title}</h3>
                    <Badge 
                      variant={signal.signal === 'strong' ? 'default' : signal.signal === 'medium' ? 'secondary' : 'outline'}
                      className={signal.signal === 'strong' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {signal.signal.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{signal.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {signal.marketSize} market
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {signal.competition} competition
                    </span>
                    <span className="flex items-center gap-1">
                      {signal.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-600" /> : 
                       signal.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-600" /> : 
                       <Activity className="h-3 w-3 text-gray-600" />}
                      {signal.trend} trend
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-card-foreground">{signal.score}</div>
                  <div className="text-sm text-muted-foreground">signal score</div>
                  <div className="flex gap-1 mt-2">
                    {signal.platforms.map(platform => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Platform Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Cross-Platform Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {crossPlatformAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border-l-4 rounded-r-lg ${
                alert.urgency === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                alert.urgency === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {alert.platforms.map(platform => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          alert.impact === 'high' ? 'border-red-500 text-red-600' :
                          alert.impact === 'medium' ? 'border-yellow-500 text-yellow-600' :
                          'border-blue-500 text-blue-600'
                        }`}
                      >
                        {alert.impact} impact
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Category Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-card-foreground">{insight.category}</h4>
                  <Badge 
                    variant="outline"
                    className={insight.trend === 'up' ? 'border-green-500 text-green-600' : 
                              insight.trend === 'down' ? 'border-red-500 text-red-600' : 
                              'border-gray-500 text-gray-600'}
                  >
                    {insight.trend}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Growth:</span>
                    <span className="font-medium text-green-600">{insight.growth}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Opportunities:</span>
                    <span className="font-medium">{insight.opportunities}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Competition:</span>
                    <span className="font-medium">{insight.competition}</span>
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
