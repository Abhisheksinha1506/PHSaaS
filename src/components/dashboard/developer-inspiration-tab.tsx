"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, TrendingUp, Lightbulb, Target, Users, Clock, Star, GitBranch, Zap, Search, Filter } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface DeveloperInspirationTabProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
  timeFilter: string;
}

interface TrendingProblem {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToBuild: string;
  skills: string[];
  market: 'large' | 'medium' | 'small';
  inspiration: string;
  platforms: string[];
  engagement: number;
}

interface ProjectIdea {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  skills: string[];
  inspiration: string;
  marketSize: 'large' | 'medium' | 'small';
  competition: 'low' | 'medium' | 'high';
  revenue: string;
  githubStars: number;
  hnScore: number;
  phVotes: number;
}

interface SkillMatch {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  projects: number;
  trending: boolean;
  demand: 'high' | 'medium' | 'low';
  salary: string;
}

export function DeveloperInspirationTab({ productHuntData, hackerNewsData, githubData, timeFilter }: DeveloperInspirationTabProps) {
  const [trendingProblems, setTrendingProblems] = useState<TrendingProblem[]>([]);
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([]);
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Generate trending problems from cross-platform analysis
  useEffect(() => {
    const generateTrendingProblems = () => {
      const problems: TrendingProblem[] = [];
      
      // Analyze Hacker News discussions for problems
      hackerNewsData.forEach(hn => {
        const title = hn.title.toLowerCase();
        const keywords = ['problem', 'issue', 'frustrated', 'difficult', 'hard', 'challenge', 'pain'];
        const hasProblemKeywords = keywords.some(keyword => title.includes(keyword));
        
        if (hasProblemKeywords && hn.score > 50) {
          problems.push({
            id: `problem-${hn.id}`,
            title: hn.title,
            description: `High developer discussion: ${hn.score} points, ${hn.descendants} comments`,
            problem: hn.title,
            solution: `Build a tool to solve this developer pain point`,
            difficulty: hn.score > 200 ? 'advanced' : hn.score > 100 ? 'intermediate' : 'beginner',
            timeToBuild: hn.score > 200 ? '3-6 months' : hn.score > 100 ? '1-3 months' : '2-4 weeks',
            skills: ['JavaScript', 'React', 'Node.js', 'API Development'],
            market: hn.score > 200 ? 'large' : hn.score > 100 ? 'medium' : 'small',
            inspiration: `Solve a real problem that ${hn.score} developers are discussing`,
            platforms: ['Hacker News'],
            engagement: hn.score + hn.descendants
          });
        }
      });

      // Analyze Product Hunt for solution gaps
      productHuntData.forEach(ph => {
        const lowEngagement = ph.votes_count < 100;
        const highEngagement = ph.votes_count > 500;
        
        if (lowEngagement) {
          problems.push({
            id: `gap-${ph.id}`,
            title: `Market Gap: ${ph.name}`,
            description: `Low engagement suggests market opportunity`,
            problem: `Limited solutions in ${ph.topics.map(t => t.name).join(', ')} space`,
            solution: `Build a better version of ${ph.name}`,
            difficulty: 'intermediate',
            timeToBuild: '2-4 months',
            skills: ['Full-stack Development', 'UI/UX', 'Marketing'],
            market: 'medium',
            inspiration: `Improve upon existing solution with ${ph.votes_count} votes`,
            platforms: ['Product Hunt'],
            engagement: ph.votes_count + ph.comments_count
          });
        }
      });

      setTrendingProblems(problems.slice(0, 8));
    };

    const generateProjectIdeas = () => {
      const ideas: ProjectIdea[] = [];
      
      // Generate ideas from GitHub trending
      githubData.forEach(gh => {
        if (gh.reviews_count > 500) {
          ideas.push({
            id: `idea-${gh.id}`,
            name: `Build with ${gh.name}`,
            description: `Create a project using ${gh.name} - ${gh.description}`,
            category: gh.category,
            difficulty: gh.reviews_count > 2000 ? 'hard' : gh.reviews_count > 1000 ? 'medium' : 'easy',
            timeEstimate: gh.reviews_count > 2000 ? '3-6 months' : gh.reviews_count > 1000 ? '1-3 months' : '2-4 weeks',
            skills: gh.features.slice(0, 4),
            inspiration: `Popular tool with ${gh.reviews_count} stars`,
            marketSize: gh.reviews_count > 5000 ? 'large' : gh.reviews_count > 2000 ? 'medium' : 'small',
            competition: 'medium',
            revenue: gh.reviews_count > 5000 ? '$10K-100K MRR' : gh.reviews_count > 2000 ? '$5K-50K MRR' : '$1K-10K MRR',
            githubStars: gh.reviews_count,
            hnScore: 0,
            phVotes: 0
          });
        }
      });

      // Generate ideas from Product Hunt
      productHuntData.slice(0, 5).forEach(ph => {
        ideas.push({
          id: `ph-idea-${ph.id}`,
          name: `Improve ${ph.name}`,
          description: `Build a better version of ${ph.name} - ${ph.tagline}`,
          category: ph.topics[0]?.name || 'General',
          difficulty: ph.votes_count > 500 ? 'hard' : ph.votes_count > 200 ? 'medium' : 'easy',
          timeEstimate: ph.votes_count > 500 ? '3-6 months' : ph.votes_count > 200 ? '1-3 months' : '2-4 weeks',
          skills: ['Full-stack Development', 'UI/UX', 'Marketing'],
          inspiration: `Popular product with ${ph.votes_count} votes`,
          marketSize: ph.votes_count > 1000 ? 'large' : ph.votes_count > 500 ? 'medium' : 'small',
          competition: 'high',
          revenue: ph.votes_count > 1000 ? '$50K-500K MRR' : ph.votes_count > 500 ? '$10K-100K MRR' : '$1K-10K MRR',
          githubStars: 0,
          hnScore: 0,
          phVotes: ph.votes_count
        });
      });

      setProjectIdeas(ideas.slice(0, 10));
    };

    const generateSkillMatches = () => {
      const skills: SkillMatch[] = [
        {
          skill: 'React',
          level: 'intermediate',
          projects: 15,
          trending: true,
          demand: 'high',
          salary: '$80K-120K'
        },
        {
          skill: 'Python',
          level: 'intermediate',
          projects: 12,
          trending: true,
          demand: 'high',
          salary: '$90K-130K'
        },
        {
          skill: 'AI/ML',
          level: 'advanced',
          projects: 8,
          trending: true,
          demand: 'high',
          salary: '$100K-150K'
        },
        {
          skill: 'TypeScript',
          level: 'intermediate',
          projects: 10,
          trending: true,
          demand: 'high',
          salary: '$85K-125K'
        },
        {
          skill: 'Go',
          level: 'intermediate',
          projects: 6,
          trending: true,
          demand: 'medium',
          salary: '$95K-135K'
        }
      ];
      setSkillMatches(skills);
    };

    generateTrendingProblems();
    generateProjectIdeas();
    generateSkillMatches();
    setLoading(false);
  }, [productHuntData, hackerNewsData, githubData]);

  const filteredProblems = trendingProblems.filter(problem => {
    if (difficultyFilter !== 'all' && problem.difficulty !== difficultyFilter) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some(skill => problem.skills.includes(skill))) return false;
    return true;
  });

  const filteredIdeas = projectIdeas.filter(idea => {
    if (difficultyFilter !== 'all' && idea.difficulty !== difficultyFilter) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some(skill => idea.skills.includes(skill))) return false;
    return true;
  });

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
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Code className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">Developer Inspiration Engine</h2>
            <p className="text-muted-foreground">Find your next project, solve trending problems, build skills</p>
          </div>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          <Lightbulb className="h-3 w-3 mr-1" />
          Inspiration Mode
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('all')}
              >
                All Levels
              </Button>
              <Button
                variant={difficultyFilter === 'beginner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('beginner')}
              >
                Beginner
              </Button>
              <Button
                variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('intermediate')}
              >
                Intermediate
              </Button>
              <Button
                variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('advanced')}
              >
                Advanced
              </Button>
            </div>

            <div className="flex gap-2">
              {skillMatches.map(skill => (
                <Button
                  key={skill.skill}
                  variant={selectedSkills.includes(skill.skill) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (selectedSkills.includes(skill.skill)) {
                      setSelectedSkills(selectedSkills.filter(s => s !== skill.skill));
                    } else {
                      setSelectedSkills([...selectedSkills, skill.skill]);
                    }
                  }}
                >
                  {skill.skill}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending Problems</p>
                <p className="text-2xl font-bold text-purple-600">{trendingProblems.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Project Ideas</p>
                <p className="text-2xl font-bold text-blue-600">{projectIdeas.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills to Learn</p>
                <p className="text-2xl font-bold text-green-600">{skillMatches.length}</p>
              </div>
              <Code className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Build Time</p>
                <p className="text-2xl font-bold text-orange-600">3 months</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Problems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Trending Problems to Solve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProblems.map((problem) => (
              <div key={problem.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground mb-1">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{problem.description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {problem.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {problem.timeToBuild}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {problem.market} market
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-card-foreground">{problem.engagement}</div>
                    <div className="text-sm text-muted-foreground">engagement</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground mb-1">Problem:</h4>
                    <p className="text-sm text-muted-foreground">{problem.problem}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground mb-1">Solution:</h4>
                    <p className="text-sm text-muted-foreground">{problem.solution}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {problem.skills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Get Started
                    </Button>
                    <Button variant="outline" size="sm">
                      <Code className="h-3 w-3 mr-1" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Project Ideas for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground mb-1">{idea.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {idea.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {idea.timeEstimate}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {idea.marketSize} market
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{idea.revenue}</div>
                    <div className="text-sm text-muted-foreground">potential</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground">Skills:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {idea.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground">Inspiration:</h4>
                    <p className="text-sm text-muted-foreground">{idea.inspiration}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {idea.githubStars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {idea.githubStars}
                      </span>
                    )}
                    {idea.phVotes > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {idea.phVotes}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <GitBranch className="h-3 w-3 mr-1" />
                    Start Project
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills to Learn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Trending Skills to Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillMatches.map((skill) => (
              <div key={skill.skill} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-card-foreground">{skill.skill}</h4>
                  <div className="flex gap-1">
                    {skill.trending && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        Trending
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        skill.demand === 'high' ? 'border-green-500 text-green-600' :
                        skill.demand === 'medium' ? 'border-yellow-500 text-yellow-600' :
                        'border-gray-500 text-gray-600'
                      }`}
                    >
                      {skill.demand} demand
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{skill.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projects:</span>
                    <span className="font-medium">{skill.projects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="font-medium text-green-600">{skill.salary}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Code className="h-3 w-3 mr-1" />
                  Learn {skill.skill}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
