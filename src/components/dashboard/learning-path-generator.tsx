"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BookOpen, CheckCircle, Star, Users, TrendingUp } from "lucide-react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  skills: string[];
  prerequisites: string[];
  learningOrder: LearningStep[];
  marketDemand: 'high' | 'medium' | 'low';
  salaryRange: string;
  jobOpportunities: number;
  trendingScore: number;
  resources: LearningResource[];
  milestones: Milestone[];
}

interface LearningStep {
  step: number;
  skill: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources: string[];
}

interface LearningResource {
  name: string;
  type: 'course' | 'tutorial' | 'documentation' | 'project';
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  rating: number;
}

interface Milestone {
  title: string;
  description: string;
  skills: string[];
  project: string;
  duration: string;
}

interface LearningPathGeneratorProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  githubData: SaaSHubAlternative[];
}

export function LearningPathGenerator({ 
  productHuntData, 
  hackerNewsData, 
  githubData 
}: LearningPathGeneratorProps) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    const generateLearningPaths = () => {
      const paths: LearningPath[] = [];

      // Analyze trending technologies from all platforms
      const trendingTech = analyzeTrendingTechnologies();
      
      // Generate learning paths for trending technologies
      trendingTech.forEach((tech, index) => {
        const path = createLearningPath(tech, index);
        if (path) paths.push(path);
      });

      setLearningPaths(paths);
      setLoading(false);
    };

    generateLearningPaths();
  }, [productHuntData, hackerNewsData, githubData]);

  const analyzeTrendingTechnologies = () => {
    const techMentions: Record<string, number> = {};
    
    // Analyze Product Hunt data
    productHuntData.forEach(ph => {
      const text = `${ph.name} ${ph.tagline} ${ph.description}`.toLowerCase();
      ph.topics.forEach(topic => {
        techMentions[topic.name] = (techMentions[topic.name] || 0) + 1;
      });
    });

    // Analyze Hacker News data
    hackerNewsData.forEach(hn => {
      const text = hn.title.toLowerCase();
      const techKeywords = ['react', 'python', 'javascript', 'ai', 'machine learning', 'go', 'rust', 'typescript', 'vue', 'angular'];
      techKeywords.forEach(tech => {
        if (text.includes(tech)) {
          techMentions[tech] = (techMentions[tech] || 0) + 1;
        }
      });
    });

    // Analyze GitHub data
    githubData.forEach(gh => {
      const text = `${gh.name} ${gh.description}`.toLowerCase();
      const techKeywords = ['react', 'python', 'javascript', 'ai', 'machine learning', 'go', 'rust', 'typescript', 'vue', 'angular'];
      techKeywords.forEach(tech => {
        if (text.includes(tech)) {
          techMentions[tech] = (techMentions[tech] || 0) + 1;
        }
      });
    });

    return Object.entries(techMentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([tech, mentions]) => ({ tech, mentions }));
  };

  const createLearningPath = (tech: { tech: string; mentions: number }, index: number): LearningPath | null => {
    const techName = tech.tech;
    const mentions = tech.mentions;

    // Define learning paths for different technologies
    const pathDefinitions: Record<string, Partial<LearningPath>> = {
      'React': {
        title: 'Modern React Development',
        description: 'Master React ecosystem for building modern web applications',
        difficulty: 'intermediate',
        duration: '3-4 months',
        skills: ['JavaScript', 'HTML/CSS', 'React', 'TypeScript', 'Next.js', 'State Management'],
        prerequisites: ['Basic JavaScript', 'HTML/CSS'],
        marketDemand: 'high',
        salaryRange: '$80K-120K',
        jobOpportunities: 15000
      },
      'Python': {
        title: 'Python Full-Stack Development',
        description: 'Build web applications and data science projects with Python',
        difficulty: 'intermediate',
        duration: '4-6 months',
        skills: ['Python', 'Django/Flask', 'SQL', 'APIs', 'Data Analysis', 'Machine Learning'],
        prerequisites: ['Basic Programming'],
        marketDemand: 'high',
        salaryRange: '$90K-130K',
        jobOpportunities: 12000
      },
      'AI': {
        title: 'AI/ML Engineering Path',
        description: 'Learn artificial intelligence and machine learning engineering',
        difficulty: 'advanced',
        duration: '6-8 months',
        skills: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science'],
        prerequisites: ['Python', 'Mathematics', 'Statistics'],
        marketDemand: 'high',
        salaryRange: '$100K-150K',
        jobOpportunities: 8000
      },
      'JavaScript': {
        title: 'JavaScript Mastery',
        description: 'Become a JavaScript expert for frontend and backend development',
        difficulty: 'intermediate',
        duration: '3-5 months',
        skills: ['JavaScript', 'Node.js', 'APIs', 'Databases', 'Testing', 'Deployment'],
        prerequisites: ['Basic Programming'],
        marketDemand: 'high',
        salaryRange: '$75K-115K',
        jobOpportunities: 18000
      },
      'Go': {
        title: 'Go Systems Programming',
        description: 'Learn Go for building scalable backend systems and microservices',
        difficulty: 'intermediate',
        duration: '2-4 months',
        skills: ['Go', 'Concurrency', 'APIs', 'Microservices', 'Docker', 'Kubernetes'],
        prerequisites: ['Basic Programming'],
        marketDemand: 'medium',
        salaryRange: '$95K-135K',
        jobOpportunities: 5000
      },
      'Rust': {
        title: 'Rust Systems Programming',
        description: 'Master Rust for high-performance systems programming',
        difficulty: 'advanced',
        duration: '4-6 months',
        skills: ['Rust', 'Systems Programming', 'Memory Management', 'Concurrency', 'Performance'],
        prerequisites: ['Systems Programming', 'C/C++'],
        marketDemand: 'medium',
        salaryRange: '$100K-140K',
        jobOpportunities: 3000
      }
    };

    const pathDef = pathDefinitions[techName];
    if (!pathDef) return null;

    return {
      id: `path-${index}`,
      title: pathDef.title || `${techName} Development`,
      description: pathDef.description || `Learn ${techName} for modern development`,
      difficulty: pathDef.difficulty || 'intermediate',
      duration: pathDef.duration || '3-4 months',
      skills: pathDef.skills || [techName],
      prerequisites: pathDef.prerequisites || [],
      marketDemand: pathDef.marketDemand || 'medium',
      salaryRange: pathDef.salaryRange || '$80K-120K',
      jobOpportunities: pathDef.jobOpportunities || 5000,
      trendingScore: mentions,
      learningOrder: generateLearningOrder(techName, pathDef.skills || []),
      resources: generateResources(techName),
      milestones: generateMilestones(techName, pathDef.skills || [])
    };
  };

  const generateLearningOrder = (tech: string, skills: string[]): LearningStep[] => {
    const baseSteps = [
      { step: 1, skill: 'Fundamentals', description: 'Learn the basics and core concepts', duration: '2-3 weeks', difficulty: 'beginner' as const },
      { step: 2, skill: 'Intermediate', description: 'Build projects and practice', duration: '3-4 weeks', difficulty: 'intermediate' as const },
      { step: 3, skill: 'Advanced', description: 'Master advanced concepts and patterns', duration: '4-6 weeks', difficulty: 'advanced' as const },
      { step: 4, skill: 'Projects', description: 'Build real-world applications', duration: '4-8 weeks', difficulty: 'intermediate' as const }
    ];

    return baseSteps.map(step => ({
      ...step,
      resources: generateStepResources(tech, step.skill)
    }));
  };

  const generateStepResources = (tech: string, step: string): string[] => {
    const resources: Record<string, string[]> = {
      'Fundamentals': ['Official Documentation', 'Interactive Tutorials', 'Video Courses'],
      'Intermediate': ['Advanced Tutorials', 'Code Challenges', 'Community Projects'],
      'Advanced': ['Best Practices Guide', 'Design Patterns', 'Performance Optimization'],
      'Projects': ['Real-world Examples', 'Open Source Projects', 'Portfolio Building']
    };

    return resources[step] || ['Documentation', 'Tutorials', 'Projects'];
  };

  const generateResources = (tech: string): LearningResource[] => {
    return [
      {
        name: `${tech} Official Documentation`,
        type: 'documentation',
        url: '#',
        difficulty: 'beginner',
        duration: 'Ongoing',
        rating: 4.8
      },
      {
        name: `Learn ${tech} - Interactive Course`,
        type: 'course',
        url: '#',
        difficulty: 'beginner',
        duration: '20 hours',
        rating: 4.6
      },
      {
        name: `${tech} Best Practices Guide`,
        type: 'tutorial',
        url: '#',
        difficulty: 'intermediate',
        duration: '5 hours',
        rating: 4.7
      },
      {
        name: `Build a ${tech} Project`,
        type: 'project',
        url: '#',
        difficulty: 'intermediate',
        duration: '2 weeks',
        rating: 4.5
      }
    ];
  };

  const generateMilestones = (tech: string, skills: string[]): Milestone[] => {
    return [
      {
        title: 'First Project',
        description: `Build your first ${tech} application`,
        skills: skills.slice(0, 2),
        project: `Simple ${tech} App`,
        duration: '1-2 weeks'
      },
      {
        title: 'Intermediate Project',
        description: `Create a more complex ${tech} application`,
        skills: skills.slice(0, 4),
        project: `Full-stack ${tech} Application`,
        duration: '2-4 weeks'
      },
      {
        title: 'Portfolio Project',
        description: `Build a production-ready ${tech} application`,
        skills: skills,
        project: `Professional ${tech} Application`,
        duration: '4-6 weeks'
      }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Path Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
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
          <BookOpen className="h-5 w-5" />
          Learning Path Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized learning paths based on trending technologies and market demand
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {learningPaths.map((path) => (
            <div key={path.id} className="p-6 border rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{path.title}</h3>
                  <p className="text-muted-foreground mb-3">{path.description}</p>
                  <div className="flex gap-2 mb-3">
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {path.duration}
                    </Badge>
                    <Badge variant="outline" className={getDemandColor(path.marketDemand)}>
                      {path.marketDemand} demand
                    </Badge>
                    <Badge variant="outline">
                      {path.trendingScore} mentions
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{path.salaryRange}</div>
                  <div className="text-sm text-muted-foreground">salary range</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Skills You&apos;ll Learn</h4>
                  <div className="flex flex-wrap gap-1">
                    {path.skills.slice(0, 6).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-1">
                    {path.prerequisites.map(prereq => (
                      <Badge key={prereq} variant="outline" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Market Info</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {path.jobOpportunities.toLocaleString()} jobs available
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      {path.marketDemand} market demand
                    </div>
                  </div>
                </div>
              </div>

              {selectedPath === path.id && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-card-foreground mb-3">Learning Path</h4>
                    <div className="space-y-3">
                      {path.learningOrder.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-card-foreground">{step.skill}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.duration}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {step.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-card-foreground mb-3">Milestones</h4>
                    <div className="space-y-3">
                      {path.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-card-foreground">{milestone.title}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Project: {milestone.project}</span>
                              <span>Duration: {milestone.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-card-foreground mb-3">Recommended Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {path.resources.map((resource, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-card-foreground">{resource.name}</h5>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">{resource.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{resource.type}</span>
                            <span>{resource.duration}</span>
                            <Badge variant="outline" className="text-xs">
                              {resource.difficulty}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {path.skills.slice(0, 4).map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
                >
                  {selectedPath === path.id ? 'Hide Details' : 'View Path'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-card-foreground mb-2">💡 Learning Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {learningPaths.filter(p => p.difficulty === 'beginner').length} paths are beginner&apos;friendly</li>
            <li>• Average salary range: $85K-125K</li>
            <li>• {learningPaths.filter(p => p.marketDemand === 'high').length} paths have high market demand</li>
            <li>• Most trending: {learningPaths[0]?.title} with {learningPaths[0]?.trendingScore} mentions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
