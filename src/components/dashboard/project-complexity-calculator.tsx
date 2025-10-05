"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Target, Users, Code, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface ProjectComplexity {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredSkills: string[];
  complexityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketSize: 'small' | 'medium' | 'large';
  competition: 'low' | 'medium' | 'high';
  successProbability: number;
  timeToMarket: string;
  resourceRequirements: {
    developers: number;
    designers: number;
    months: number;
  };
  technologyStack: string[];
  challenges: string[];
  opportunities: string[];
}

interface ProjectComplexityCalculatorProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
}

export function ProjectComplexityCalculator({ 
  productHuntData, 
  hackerNewsData, 
  githubData 
}: ProjectComplexityCalculatorProps) {
  const [projectComplexities, setProjectComplexities] = useState<ProjectComplexity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const calculateProjectComplexity = () => {
      const projects: ProjectComplexity[] = [];

      // Analyze Product Hunt launches
      productHuntData.slice(0, 8).forEach((ph, index) => {
        const engagement = ph.votes_count + ph.comments_count;
        const complexityScore = calculateComplexityScore(ph.name, ph.description, ph.topics);
        
        projects.push({
          id: `ph-${ph.id}`,
          name: ph.name,
          description: ph.tagline,
          estimatedTime: getEstimatedTime(complexityScore, engagement),
          difficulty: getDifficulty(complexityScore),
          requiredSkills: extractSkills(ph.name, ph.description, ph.topics),
          complexityScore,
          riskLevel: getRiskLevel(engagement, complexityScore),
          marketSize: getMarketSize(ph.topics),
          competition: getCompetition(engagement),
          successProbability: calculateSuccessProbability(engagement, complexityScore),
          timeToMarket: getTimeToMarket(complexityScore),
          resourceRequirements: getResourceRequirements(complexityScore),
          technologyStack: extractTechStack(ph.name, ph.description),
          challenges: generateChallenges(complexityScore, ph.topics),
          opportunities: generateOpportunities(ph.topics, engagement)
        });
      });

      // Analyze GitHub trending projects
      githubData.slice(0, 5).forEach((gh, index) => {
        const complexityScore = calculateComplexityScore(gh.name, gh.description, []);
        
        projects.push({
          id: `gh-${gh.id}`,
          name: gh.name,
          description: gh.description,
          estimatedTime: getEstimatedTime(complexityScore, gh.reviews_count),
          difficulty: getDifficulty(complexityScore),
          requiredSkills: extractSkills(gh.name, gh.description, []),
          complexityScore,
          riskLevel: getRiskLevel(gh.reviews_count, complexityScore),
          marketSize: 'large',
          competition: 'high',
          successProbability: calculateSuccessProbability(gh.reviews_count, complexityScore),
          timeToMarket: getTimeToMarket(complexityScore),
          resourceRequirements: getResourceRequirements(complexityScore),
          technologyStack: extractTechStack(gh.name, gh.description),
          challenges: generateChallenges(complexityScore, []),
          opportunities: generateOpportunities([], gh.reviews_count)
        });
      });

      setProjectComplexities(projects);
      setLoading(false);
    };

    calculateProjectComplexity();
  }, [productHuntData, hackerNewsData, githubData]);

  const calculateComplexityScore = (name: string, description: string, topics: { name: string }[]) => {
    let score = 0;
    
    // Technology complexity indicators
    const complexTech = ['ai', 'machine learning', 'blockchain', 'cryptocurrency', 'iot', 'ar', 'vr'];
    const mediumTech = ['api', 'database', 'analytics', 'automation', 'integration'];
    const simpleTech = ['website', 'app', 'tool', 'dashboard', 'form'];
    
    const text = `${name} ${description}`.toLowerCase();
    
    complexTech.forEach(tech => {
      if (text.includes(tech)) score += 3;
    });
    
    mediumTech.forEach(tech => {
      if (text.includes(tech)) score += 2;
    });
    
    simpleTech.forEach(tech => {
      if (text.includes(tech)) score += 1;
    });

    // Topic complexity
    topics.forEach(topic => {
      if (['AI', 'Machine Learning', 'Blockchain'].includes(topic.name)) score += 2;
      else if (['Developer Tools', 'Analytics'].includes(topic.name)) score += 1;
    });

    return Math.min(10, Math.max(1, score));
  };

  const getEstimatedTime = (complexityScore: number, engagement: number) => {
    if (complexityScore >= 8) return '6-12 months';
    if (complexityScore >= 6) return '3-6 months';
    if (complexityScore >= 4) return '2-4 months';
    return '1-2 months';
  };

  const getDifficulty = (complexityScore: number) => {
    if (complexityScore >= 7) return 'advanced';
    if (complexityScore >= 4) return 'intermediate';
    return 'beginner';
  };

  const getRiskLevel = (engagement: number, complexityScore: number) => {
    if (complexityScore >= 8 && engagement < 100) return 'high';
    if (complexityScore >= 6 && engagement < 200) return 'medium';
    return 'low';
  };

  const getMarketSize = (topics: { name: string }[]) => {
    const largeMarketTopics = ['AI', 'SaaS', 'Developer Tools', 'Analytics'];
    const hasLargeMarket = topics.some(topic => largeMarketTopics.includes(topic.name));
    return hasLargeMarket ? 'large' : 'medium';
  };

  const getCompetition = (engagement: number) => {
    if (engagement > 500) return 'high';
    if (engagement > 200) return 'medium';
    return 'low';
  };

  const calculateSuccessProbability = (engagement: number, complexityScore: number) => {
    const baseProbability = Math.min(90, (engagement / 10) + 20);
    const complexityPenalty = complexityScore * 3;
    return Math.max(10, Math.round(baseProbability - complexityPenalty));
  };

  const getTimeToMarket = (complexityScore: number) => {
    if (complexityScore >= 8) return '8-12 months';
    if (complexityScore >= 6) return '4-8 months';
    if (complexityScore >= 4) return '2-4 months';
    return '1-2 months';
  };

  const getResourceRequirements = (complexityScore: number) => {
    if (complexityScore >= 8) return { developers: 3, designers: 2, months: 8 };
    if (complexityScore >= 6) return { developers: 2, designers: 1, months: 4 };
    if (complexityScore >= 4) return { developers: 1, designers: 1, months: 2 };
    return { developers: 1, designers: 0, months: 1 };
  };

  const extractSkills = (name: string, description: string, _topics: { name: string }[]) => {
    const skills: string[] = [];
    const text = `${name} ${description}`.toLowerCase();
    
    const skillMap: Record<string, string[]> = {
      'React': ['react', 'jsx', 'hooks'],
      'Python': ['python', 'django', 'flask'],
      'JavaScript': ['javascript', 'js', 'node'],
      'TypeScript': ['typescript', 'ts'],
      'AI/ML': ['ai', 'machine learning', 'ml'],
      'Go': ['golang', 'go'],
      'Rust': ['rust'],
      'AWS': ['aws', 'amazon'],
      'Docker': ['docker', 'container'],
      'Kubernetes': ['kubernetes', 'k8s']
    };

    Object.entries(skillMap).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        skills.push(skill);
      }
    });

    return skills.slice(0, 5);
  };

  const extractTechStack = (name: string, description: string) => {
    const techStack: string[] = [];
    const text = `${name} ${description}`.toLowerCase();
    
    const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'go', 'rust', 'aws', 'docker', 'kubernetes'];
    techKeywords.forEach(tech => {
      if (text.includes(tech)) techStack.push(tech);
    });

    return techStack.slice(0, 4);
  };

  const generateChallenges = (complexityScore: number, _topics: { name: string }[]) => {
    const challenges: string[] = [];
    
    if (complexityScore >= 8) {
      challenges.push('High technical complexity', 'Long development time', 'Requires specialized expertise');
    } else if (complexityScore >= 6) {
      challenges.push('Moderate complexity', 'Multiple integrations needed');
    } else {
      challenges.push('Limited scope', 'Quick development possible');
    }

    if (_topics.some(t => ['AI', 'Machine Learning'].includes(t.name))) {
      challenges.push('Data quality requirements', 'Model training complexity');
    }

    return challenges.slice(0, 3);
  };

  const generateOpportunities = (topics: { name: string }[], engagement: number) => {
    const opportunities: string[] = [];
    
    if (engagement > 500) {
      opportunities.push('High market interest', 'Strong user demand');
    }
    
    if (topics.some(t => ['AI', 'SaaS'].includes(t.name))) {
      opportunities.push('Growing market segment', 'Scalable business model');
    }

    opportunities.push('First-mover advantage', 'Low competition');

    return opportunities.slice(0, 3);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredProjects = selectedDifficulty === 'all' 
    ? projectComplexities 
    : projectComplexities.filter(p => p.difficulty === selectedDifficulty);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Complexity Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
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
          Project Complexity Calculator
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('all')}
          >
            All Levels
          </Button>
          <Button
            variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('beginner')}
          >
            Beginner
          </Button>
          <Button
            variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('intermediate')}
          >
            Intermediate
          </Button>
          <Button
            variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('advanced')}
          >
            Advanced
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="p-6 border rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{project.name}</h3>
                  <p className="text-muted-foreground mb-3">{project.description}</p>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {project.complexityScore}/10 complexity
                    </Badge>
                    <Badge variant="outline">
                      {project.successProbability}% success rate
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-card-foreground">{project.estimatedTime}</div>
                  <div className="text-sm text-muted-foreground">estimated time</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Resource Requirements</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {project.resourceRequirements.developers} developers
                    </div>
                    <div className="flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      {project.resourceRequirements.designers} designers
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {project.resourceRequirements.months} months
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Technology Stack</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.technologyStack.map(tech => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Risk Assessment</h4>
                  <div className="space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${getRiskColor(project.riskLevel)}`}>
                      <AlertCircle className="h-3 w-3" />
                      {project.riskLevel} risk
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      {project.marketSize} market
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {project.competition} competition
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Challenges</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Opportunities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {project.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {project.requiredSkills.slice(0, 4).map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Time to market: {project.timeToMarket}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-card-foreground mb-2">💡 Complexity Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {filteredProjects.filter(p => p.difficulty === 'beginner').length} projects are beginner-friendly</li>
            <li>• Average complexity score: {Math.round(filteredProjects.reduce((acc, p) => acc + p.complexityScore, 0) / filteredProjects.length)}/10</li>
            <li>• {filteredProjects.filter(p => p.riskLevel === 'low').length} projects have low risk</li>
            <li>• Most common skills: {Array.from(new Set(filteredProjects.flatMap(p => p.requiredSkills))).slice(0, 3).join(', ')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
