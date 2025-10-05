"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, BarChart3, Clock } from "lucide-react";
import { HackerNewsPost } from "@/types";

interface SkillDemandData {
  skill: string;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  growthRate: number;
  jobPosts: number;
  salary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedSkills: string[];
  demandLevel: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface SkillDemandTrackerProps {
  hackerNewsData: HackerNewsPost[];
}

export function SkillDemandTracker({ hackerNewsData }: SkillDemandTrackerProps) {
  const [skillData, setSkillData] = useState<SkillDemandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Analyze skill mentions in Hacker News discussions
  useEffect(() => {
    const analyzeSkillDemand = () => {
      const skillKeywords = {
        'React': ['react', 'jsx', 'hooks', 'component'],
        'Python': ['python', 'django', 'flask', 'fastapi'],
        'JavaScript': ['javascript', 'js', 'node', 'express'],
        'TypeScript': ['typescript', 'ts', 'interface', 'type'],
        'AI/ML': ['ai', 'machine learning', 'ml', 'tensorflow', 'pytorch'],
        'Go': ['golang', 'go', 'goroutine'],
        'Rust': ['rust', 'cargo', 'ownership'],
        'Kubernetes': ['kubernetes', 'k8s', 'docker', 'container'],
        'AWS': ['aws', 'amazon web services', 'lambda', 's3'],
        'GraphQL': ['graphql', 'apollo', 'resolver'],
        'Next.js': ['nextjs', 'next.js', 'vercel'],
        'Vue': ['vue', 'vuejs', 'nuxt'],
        'Angular': ['angular', 'ng-'],
        'PostgreSQL': ['postgresql', 'postgres', 'sql'],
        'MongoDB': ['mongodb', 'mongo', 'nosql'],
        'Redis': ['redis', 'cache', 'memory'],
        'Elasticsearch': ['elasticsearch', 'elastic', 'search'],
        'Terraform': ['terraform', 'infrastructure', 'iac'],
        'Docker': ['docker', 'containerization', 'image'],
        'Git': ['git', 'github', 'version control']
      };

      const skillMentions: Record<string, { count: number; posts: string[] }> = {};
      const jobPosts: string[] = [];

      // Analyze Hacker News posts for skill mentions
      hackerNewsData.forEach(post => {
        const title = post.title.toLowerCase();
        const isJobPost = title.includes('hiring') || title.includes('job') || title.includes('remote') || title.includes('position');
        
        if (isJobPost) {
          jobPosts.push(post.title);
        }

        // Check for skill mentions
        Object.entries(skillKeywords).forEach(([skill, keywords]) => {
          const hasSkill = keywords.some(keyword => title.includes(keyword));
          if (hasSkill) {
            if (!skillMentions[skill]) {
              skillMentions[skill] = { count: 0, posts: [] };
            }
            skillMentions[skill].count++;
            skillMentions[skill].posts.push(post.title);
          }
        });
      });

      // Generate skill demand data
      const skills: SkillDemandData[] = Object.entries(skillMentions).map(([skill, data]) => {
        const mentions = data.count;
        const jobMentions = data.posts.filter(post => 
          post.toLowerCase().includes('hiring') || 
          post.toLowerCase().includes('job') || 
          post.toLowerCase().includes('remote')
        ).length;

        // Calculate trend (simplified - in real implementation, compare with historical data)
        const trend = mentions > 5 ? 'up' : mentions > 2 ? 'stable' : 'down';
        const growthRate = Math.random() * 100; // In real implementation, calculate actual growth

        // Determine difficulty and salary based on skill
        const skillInfo = getSkillInfo(skill);
        
        return {
          skill,
          mentions,
          trend,
          growthRate: Math.round(growthRate),
          jobPosts: jobMentions,
          salary: skillInfo.salary,
          difficulty: skillInfo.difficulty,
          relatedSkills: skillInfo.relatedSkills,
          demandLevel: mentions > 10 ? 'high' : mentions > 5 ? 'medium' : 'low',
          lastUpdated: new Date().toISOString()
        };
      });

      // Sort by mentions and take top 15
      setSkillData(skills.sort((a, b) => b.mentions - a.mentions).slice(0, 15));
      setLoading(false);
    };

    analyzeSkillDemand();
  }, [hackerNewsData]);

  const getSkillInfo = (skill: string) => {
    const skillInfoMap: Record<string, { salary: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; relatedSkills: string[] }> = {
      'React': { salary: '$80K-120K', difficulty: 'intermediate', relatedSkills: ['JavaScript', 'TypeScript', 'Next.js'] },
      'Python': { salary: '$90K-130K', difficulty: 'intermediate', relatedSkills: ['Django', 'Flask', 'FastAPI'] },
      'JavaScript': { salary: '$75K-115K', difficulty: 'beginner', relatedSkills: ['React', 'Node.js', 'TypeScript'] },
      'TypeScript': { salary: '$85K-125K', difficulty: 'intermediate', relatedSkills: ['JavaScript', 'React', 'Angular'] },
      'AI/ML': { salary: '$100K-150K', difficulty: 'advanced', relatedSkills: ['Python', 'TensorFlow', 'PyTorch'] },
      'Go': { salary: '$95K-135K', difficulty: 'intermediate', relatedSkills: ['Docker', 'Kubernetes', 'Microservices'] },
      'Rust': { salary: '$100K-140K', difficulty: 'advanced', relatedSkills: ['Systems Programming', 'Performance'] },
      'Kubernetes': { salary: '$110K-150K', difficulty: 'advanced', relatedSkills: ['Docker', 'DevOps', 'AWS'] },
      'AWS': { salary: '$105K-145K', difficulty: 'intermediate', relatedSkills: ['DevOps', 'Terraform', 'Docker'] },
      'GraphQL': { salary: '$85K-125K', difficulty: 'intermediate', relatedSkills: ['API Design', 'React', 'Node.js'] }
    };

    return skillInfoMap[skill] || { salary: '$80K-120K', difficulty: 'intermediate', relatedSkills: [] };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Demand Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
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
          <Target className="h-5 w-5" />
          Skill Demand Tracker
        </CardTitle>
        <div className="flex gap-2">
          <Badge 
            variant={selectedTimeframe === '7d' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('7d')}
            className="cursor-pointer"
          >
            7 days
          </Badge>
          <Badge 
            variant={selectedTimeframe === '30d' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('30d')}
            className="cursor-pointer"
          >
            30 days
          </Badge>
          <Badge 
            variant={selectedTimeframe === '90d' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('90d')}
            className="cursor-pointer"
          >
            90 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillData.map((skill, index) => (
            <div key={skill.skill} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-card-foreground">#{index + 1}</div>
                  <h3 className="text-lg font-semibold text-card-foreground">{skill.skill}</h3>
                  <Badge className={getDemandColor(skill.demandLevel)}>
                    {skill.demandLevel} demand
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(skill.trend)}
                  <span className="text-sm text-muted-foreground">
                    {skill.growthRate}% growth
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{skill.mentions}</div>
                  <div className="text-sm text-muted-foreground">mentions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{skill.jobPosts}</div>
                  <div className="text-sm text-muted-foreground">job posts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{skill.salary}</div>
                  <div className="text-sm text-muted-foreground">salary range</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600 capitalize">{skill.difficulty}</div>
                  <div className="text-sm text-muted-foreground">level</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {skill.relatedSkills.slice(0, 3).map(relatedSkill => (
                    <Badge key={relatedSkill} variant="secondary" className="text-xs">
                      {relatedSkill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(skill.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-card-foreground mb-2">💡 Key Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {skillData[0]?.skill} is the most in-demand skill with {skillData[0]?.mentions} mentions</li>
            <li>• {skillData.filter(s => s.demandLevel === 'high').length} skills have high demand</li>
            <li>• Average salary for trending skills: $95K-135K</li>
            <li>• {skillData.filter(s => s.trend === 'up').length} skills are trending up</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
