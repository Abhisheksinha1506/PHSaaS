"use client"

import { useState, useMemo } from "react";
import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, GitBranch, TrendingUp, Users, MessageCircle, Star, Zap, Target, Info, X, BarChart3, Activity } from "lucide-react";
import { StatsSkeleton, CardSkeleton, ListItemSkeleton } from "@/components/ui/skeleton";
import { thresholdCalculator, CalculatedThresholds } from "@/lib/threshold-calculator";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatNumber, formatCurrency, formatCompactNumber } from "@/lib/number-utils";

interface DevPulseTabProps {
  productHuntData: ProductHuntPost[];
  hackerNewsData: HackerNewsPost[];
  saaSHubData: SaaSHubAlternative[];
}

export function DevPulseTab({ productHuntData, hackerNewsData, saaSHubData }: DevPulseTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'tools' | 'frameworks'>('all');
  const [selectedCardModal, setSelectedCardModal] = useState<'skills' | 'hot' | 'salary' | 'difficulty' | null>(null);

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [showSkillDetailsModal, setShowSkillDetailsModal] = useState(false);
  
  // Analytics integration
  const { analyticsData } = useAnalytics('7d');

  // Calculate dynamic thresholds based on actual data
  const dynamicThresholds = useMemo(() => {
    return thresholdCalculator.calculateAllThresholds(
      productHuntData,
      hackerNewsData,
      saaSHubData,
      [], // We'll calculate skill demand separately
      '7d' // Default time filter
    );
  }, [productHuntData, hackerNewsData, saaSHubData]);

  // Developer Skill Demand Analysis
  const skillDemand = useMemo(() => {
    const skills: { [key: string]: { 
      demand: number; 
      salary: number; 
      difficulty: number; 
      jobPosts: number; 
      learningResources: number;
      community: number;
    } } = {};

    // Analyze Product Hunt for skill demand
    productHuntData.forEach(item => {
      item.topics.forEach(topic => {
        if (!skills[topic.name]) {
          skills[topic.name] = { demand: 0, salary: 0, difficulty: 0, jobPosts: 0, learningResources: 0, community: 0 };
        }
        skills[topic.name].demand += item.votes_count;
        skills[topic.name].jobPosts += item.comments_count;
        // Graduated community scoring based on engagement levels
        if (item.votes_count > 1000) {
          skills[topic.name].community += 3; // High engagement
        } else if (item.votes_count > 500) {
          skills[topic.name].community += 2; // Medium engagement
        } else if (item.votes_count > 100) {
          skills[topic.name].community += 1; // Low engagement
        }
      });
    });

    // Analyze Hacker News for developer sentiment and difficulty
    hackerNewsData.forEach(item => {
      const techKeywords = ['javascript', 'python', 'react', 'node', 'typescript', 'vue', 'angular', 'ai', 'machine-learning', 'rust', 'go', 'java', 'c++', 'swift', 'kotlin'];
      techKeywords.forEach(keyword => {
        if (item.title.toLowerCase().includes(keyword)) {
          if (!skills[keyword]) {
            skills[keyword] = { demand: 0, salary: 0, difficulty: 0, jobPosts: 0, learningResources: 0, community: 0 };
          }
          skills[keyword].demand += item.score;
          skills[keyword].learningResources += item.descendants || 0;
          skills[keyword].difficulty += item.score > 200 ? 1 : 0; // High score = complex topic
          
          // Add community scoring from Hacker News based on discussion activity
          if (item.score > 500) {
            skills[keyword].community += 3; // High score = strong community interest
          } else if (item.score > 200) {
            skills[keyword].community += 2; // Medium score = moderate community interest
          } else if (item.score > 50) {
            skills[keyword].community += 1; // Low score = some community interest
          }
        }
      });
    });

    // Analyze GitHub for adoption and community
    saaSHubData.forEach(item => {
      const techKeywords = ['javascript', 'python', 'react', 'nodejs', 'typescript', 'vue', 'angular', 'ai', 'machine-learning', 'rust', 'go', 'java'];
      techKeywords.forEach(keyword => {
        if (item.features.includes(keyword) || item.name.toLowerCase().includes(keyword)) {
          if (!skills[keyword]) {
            skills[keyword] = { demand: 0, salary: 0, difficulty: 0, jobPosts: 0, learningResources: 0, community: 0 };
          }
          skills[keyword].demand += item.reviews_count;
          // Graduated community scoring based on rating levels
          if (item.rating > 4.5) {
            skills[keyword].community += 3; // Excellent rating
          } else if (item.rating > 4.0) {
            skills[keyword].community += 2; // Good rating
          } else if (item.rating > 3.5) {
            skills[keyword].community += 1; // Average rating
          }
        }
      });
    });

    // Calculate derived metrics with realistic difficulty ratings
    const skillDifficultyMap: { [key: string]: number } = {
      'javascript': 3, 'html': 2, 'css': 2, 'vue': 4, 'react': 5, 'angular': 6,
      'python': 4, 'java': 6, 'c++': 8, 'rust': 8, 'go': 5, 'swift': 6, 'kotlin': 6,
      'ai': 9, 'machine-learning': 9, 'artificial-intelligence': 9, 'tensorflow': 8, 'pytorch': 8,
      'node': 5, 'nodejs': 5, 'typescript': 6, 'docker': 4, 'kubernetes': 7, 'aws': 6,
      'sql': 3, 'database': 4, 'mongodb': 4, 'postgresql': 5, 'redis': 4,
      'git': 2, 'github': 2, 'gitlab': 3, 'jenkins': 5, 'ci-cd': 6
    };

    return Object.entries(skills).map(([skill, data]) => {
      const baseDifficulty = skillDifficultyMap[skill.toLowerCase()] || 5;
      const demandDifficulty = data.demand > 100000 ? 1 : data.demand > 50000 ? 0 : 1; // High demand = easier to learn
      const communityDifficulty = data.community > 3 ? -1 : 0; // Strong community = easier to learn
      const finalDifficulty = Math.max(1, Math.min(10, baseDifficulty + demandDifficulty + communityDifficulty));
      
      // Improved salary calculation with more realistic ranges
      const baseSalary = 70000; // Base salary
      const demandMultiplier = Math.min(2, Math.log10(data.demand + 1) / 3); // More conservative logarithmic scaling
      const difficultyBonus = (10 - finalDifficulty) * 3000; // Reduced difficulty bonus
      const communityBonus = Math.min(10000, data.community * 1000); // Capped community bonus
      const demandBonus = Math.min(50000, (data.demand / 100000) * 5000); // Much more conservative demand scaling
      const calculatedSalary = Math.min(180000, baseSalary + demandBonus + difficultyBonus + communityBonus);
      
      // Dynamic trend calculation based on calculated thresholds
      const getTrend = (demand: number) => {
        return thresholdCalculator.getTrendStatus(demand, dynamicThresholds.demand);
      };
      
      return {
        name: skill,
        demand: data.demand,
        salary: Math.round(calculatedSalary * 100) / 100,
        difficulty: finalDifficulty,
        jobPosts: data.jobPosts,
        learningResources: data.learningResources,
        community: data.community,
        score: (data.demand + data.community * 1000 + data.learningResources) / 3,
        trend: getTrend(data.demand),
        recommendation: data.demand > 15000 && data.community > 5 ? '🎯 Learn Now' : 
                       data.demand > 8000 ? '📚 Consider Learning' : '⏳ Watch'
      };
    }).sort((a, b) => b.score - a.score).slice(0, 20);
  }, [productHuntData, hackerNewsData, saaSHubData]);

  // Debug: Log trend distribution
  console.log('Skill trends:', skillDemand.map(s => ({ name: s.name, demand: s.demand, trend: s.trend })));

  // Enhanced Developer Career Insights with dynamic analysis
  const careerInsights = useMemo(() => {
    // Dynamic salary threshold based on data distribution
    const salaries = skillDemand.map(skill => skill.salary).sort((a, b) => b - a);
    const salaryP75 = salaries[Math.floor(salaries.length * 0.25)] || 100000; // Top 25% as high salary
    
    // Dynamic difficulty threshold based on data distribution
    const difficulties = skillDemand.map(skill => skill.difficulty).sort((a, b) => a - b);
    const easyThreshold = difficulties[Math.floor(difficulties.length * 0.3)] || 4; // Bottom 30% as easy
    
    // Dynamic community threshold based on data distribution
    const communities = skillDemand.map(skill => skill.community).sort((a, b) => b - a);
    const communityP75 = communities[Math.floor(communities.length * 0.25)] || 2; // Top 25% as high community
    const communityP50 = communities[Math.floor(communities.length * 0.5)] || 1; // Median community
    const communityP25 = communities[Math.floor(communities.length * 0.75)] || 0; // Bottom 25%
    
    // Debug community distribution
    console.log('Community distribution:', {
      total: communities.length,
      p75: communityP75,
      p50: communityP50,
      p25: communityP25,
      max: Math.max(...communities),
      min: Math.min(...communities),
      avg: Math.round(communities.reduce((sum, c) => sum + c, 0) / communities.length * 10000) / 10000
    });
    
    // Debug: Log threshold values
    console.log('Dynamic thresholds:', {
      demand: dynamicThresholds.demand,
      hotSkills: skillDemand.filter(skill => skill.trend === '🔥 Hot').length,
      risingSkills: skillDemand.filter(skill => skill.trend === '📈 Rising').length,
      stableSkills: skillDemand.filter(skill => skill.trend === '📊 Stable').length,
      watchSkills: skillDemand.filter(skill => skill.trend === '⏳ Watch').length
    });

    const insights = {
      hotSkills: skillDemand
        .filter(skill => skill.trend === '🔥 Hot')
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 5),
      risingSkills: (() => {
        const rising = skillDemand
          .filter(skill => skill.trend === '📈 Rising')
          .sort((a, b) => b.demand - a.demand);
        
        // Enhanced fallback: if no rising skills, create a balanced distribution
        if (rising.length === 0) {
          // Take skills that are stable or watch but have good demand
          const fallbackSkills = skillDemand
            .filter(skill => 
              skill.trend !== '🔥 Hot' && 
              skill.demand > 5000 && 
              skill.community > 1
            )
            .sort((a, b) => b.demand - a.demand)
            .slice(0, 5);
          
          // If still no skills, take any non-hot skills with demand
          if (fallbackSkills.length === 0) {
            return skillDemand
              .filter(skill => skill.trend !== '🔥 Hot')
              .sort((a, b) => b.demand - a.demand)
              .slice(0, 5);
          }
          
          return fallbackSkills;
        }
        
        return rising.slice(0, 5);
      })(),
      highSalary: skillDemand
        .filter(skill => skill.salary > salaryP75)
        .sort((a, b) => b.salary - a.salary)
        .slice(0, 5),
      easyToLearn: skillDemand
        .filter(skill => skill.difficulty < easyThreshold)
        .sort((a, b) => b.demand - a.demand) // Sort by demand for easy skills
        .slice(0, 5),
      communityDriven: (() => {
        // First try to get skills with high community scores
        let communitySkills = skillDemand
          .filter(skill => skill.community > communityP75)
          .sort((a, b) => b.community - a.community);
        
        // If not enough skills, include medium community scores
        if (communitySkills.length < 3) {
          const mediumCommunitySkills = skillDemand
            .filter(skill => skill.community > communityP50 && skill.community <= communityP75)
            .sort((a, b) => b.community - a.community);
          communitySkills = [...communitySkills, ...mediumCommunitySkills];
        }
        
        // If still not enough, include any skills with community > 0
        if (communitySkills.length < 3) {
          const anyCommunitySkills = skillDemand
            .filter(skill => skill.community > 0)
            .sort((a, b) => b.community - a.community);
          communitySkills = [...communitySkills, ...anyCommunitySkills];
        }
        
        // If still not enough, fall back to skills with high demand (as proxy for community)
        if (communitySkills.length < 3) {
          const highDemandSkills = skillDemand
            .filter(skill => skill.demand > 10000)
            .sort((a, b) => b.demand - a.demand);
          communitySkills = [...communitySkills, ...highDemandSkills];
        }
        
        return communitySkills.slice(0, 5);
      })()
    };
    
    // Enhanced fallback logic for rising skills
    if (insights.risingSkills.length === 0) {
      insights.risingSkills = skillDemand
        .filter(skill => skill.trend !== '🔥 Hot' && skill.demand > 10000)
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 5);
    }
    
    // Add market insights
    const marketInsights = {
      totalSkills: skillDemand.length,
      hotSkillsCount: insights.hotSkills.length,
      highSalaryCount: insights.highSalary.length,
      avgSalary: Math.round(skillDemand.reduce((sum, skill) => sum + skill.salary, 0) / skillDemand.length * 100) / 100,
      avgDifficulty: Math.round(skillDemand.reduce((sum, skill) => sum + skill.difficulty, 0) / skillDemand.length * 100) / 100,
      totalDemand: skillDemand.reduce((sum, skill) => sum + skill.demand, 0),
      crossPlatformSkills: skillDemand.filter(skill => skill.community > 2 && skill.demand > 50000).length
    };
    
    return { ...insights, marketInsights };
  }, [skillDemand]);

  // Enhanced Technology Lifecycle Analysis
  const techLifecycle = useMemo(() => {
    // Calculate percentiles for better categorization
    const demands = skillDemand.map(skill => skill.demand).sort((a, b) => a - b);
    const communities = skillDemand.map(skill => skill.community).sort((a, b) => a - b);
    
    const p25 = demands[Math.floor(demands.length * 0.25)] || 0;
    const p50 = demands[Math.floor(demands.length * 0.5)] || 0;
    const p75 = demands[Math.floor(demands.length * 0.75)] || 0;
    
    const communityP25 = communities[Math.floor(communities.length * 0.25)] || 0;
    const communityP50 = communities[Math.floor(communities.length * 0.5)] || 0;
    
    const lifecycle = {
      // Emerging: Low demand with any community OR medium demand with low community (early stage)
      emerging: skillDemand.filter(skill => 
        (skill.demand < p25 && skill.community > 0) || // Low demand but has some community
        (skill.demand >= p25 && skill.demand < p50 && skill.community <= communityP25) // Medium demand but low community
      ),
      
      // Growing: Medium demand with active community (growth stage)
      growing: skillDemand.filter(skill => 
        skill.demand >= p25 && 
        skill.demand < p75 && 
        skill.community > communityP25
      ),
      
      // Mature: High demand with strong community (established)
      mature: skillDemand.filter(skill => 
        skill.demand >= p75 && 
        skill.community > communityP50
      ),
      
      // Declining: High demand but low community OR low demand with low community
      declining: skillDemand.filter(skill => 
        (skill.demand >= p50 && skill.community <= communityP25) || // High demand but low community
        (skill.demand < p25 && skill.community <= communityP25) // Low demand and low community
      )
    };
    
    // Enhanced fallback mechanism to ensure balanced distribution
    const ensureMinimumCategories = () => {
      const result = { ...lifecycle };
      
      // Calculate total skills to distribute
      const totalSkills = skillDemand.length;
      const targetPerCategory = Math.max(2, Math.floor(totalSkills / 4)); // At least 2 per category
      
      // If emerging is empty, add some low-demand skills
      if (result.emerging.length === 0) {
        const lowDemandSkills = skillDemand
          .filter(skill => skill.demand < p50)
          .sort((a, b) => a.demand - b.demand)
          .slice(0, targetPerCategory);
        result.emerging = lowDemandSkills;
      }
      
      // If growing is empty, add some medium-demand skills
      if (result.growing.length === 0) {
        const mediumDemandSkills = skillDemand
          .filter(skill => skill.demand >= p25 && skill.demand < p75)
          .sort((a, b) => b.demand - a.demand)
          .slice(0, targetPerCategory);
        result.growing = mediumDemandSkills;
      }
      
      // If mature is empty, add some high-demand skills
      if (result.mature.length === 0) {
        const highDemandSkills = skillDemand
          .filter(skill => skill.demand >= p75)
          .sort((a, b) => b.demand - a.demand)
          .slice(0, targetPerCategory);
        result.mature = highDemandSkills;
      }
      
      // If declining is empty, add some skills with low community or low demand
      if (result.declining.length === 0) {
        const decliningSkills = skillDemand
          .filter(skill => 
            skill.community <= communityP25 || // Low community
            skill.demand < p25 // Low demand
          )
          .sort((a, b) => a.community - b.community) // Sort by community (lowest first)
          .slice(0, targetPerCategory);
        result.declining = decliningSkills;
      }
      
      return result;
    };
    
    const finalLifecycle = ensureMinimumCategories();
    
    // Debug logging with enhanced details
    console.log('Enhanced Lifecycle Analysis:', {
      percentiles: { 
        demand: { p25, p50, p75 },
        community: { p25: communityP25, p50: communityP50 }
      },
      counts: {
        emerging: finalLifecycle.emerging.length,
        growing: finalLifecycle.growing.length,
        mature: finalLifecycle.mature.length,
        declining: finalLifecycle.declining.length
      },
      total: skillDemand.length,
      emerging_skills: finalLifecycle.emerging.map(s => s.name),
      growing_skills: finalLifecycle.growing.map(s => s.name),
      mature_skills: finalLifecycle.mature.map(s => s.name),
      declining_skills: finalLifecycle.declining.map(s => s.name)
    });
    
    return finalLifecycle;
  }, [skillDemand]);

  // Enhanced Developer Learning Path Recommendations with dynamic analysis
  const learningPaths = useMemo(() => {
    const calculatePathMetrics = (skillNames: string[]) => {
      const pathSkills = skillDemand.filter(s => skillNames.includes(s.name));
      if (pathSkills.length === 0) return { demand: 0, avgSalary: 0, avgDifficulty: 0, skillCount: 0 };
      
      const totalDemand = pathSkills.reduce((sum, s) => sum + s.demand, 0);
      const avgSalary = Math.round(pathSkills.reduce((sum, s) => sum + s.salary, 0) / pathSkills.length * 100) / 100;
      const avgDifficulty = Math.round(pathSkills.reduce((sum, s) => sum + s.difficulty, 0) / pathSkills.length * 100) / 100;
      const skillCount = pathSkills.length;
      
      return { demand: totalDemand, avgSalary, avgDifficulty, skillCount };
    };
    
    const getDifficultyLevel = (avgDifficulty: number) => {
      if (avgDifficulty < 3) return 'Easy';
      if (avgDifficulty < 5) return 'Medium';
      if (avgDifficulty < 7) return 'Medium-High';
      return 'High';
    };
    
    const getTimeToLearn = (avgDifficulty: number, skillCount: number) => {
      const baseMonths = Math.round(avgDifficulty * 2 * 100) / 100;
      const skillBonus = skillCount * 0.5;
      const totalMonths = Math.round((baseMonths + skillBonus) * 100) / 100;
      
      if (totalMonths < 6) return '3-6 months';
      if (totalMonths < 12) return '6-12 months';
      if (totalMonths < 18) return '12-18 months';
      return '18-24 months';
    };
    
    const getSalaryRange = (avgSalary: number) => {
      const minSalary = Math.round(avgSalary * 0.7 * 100) / 100;
      const maxSalary = Math.round(avgSalary * 1.3 * 100) / 100;
      return `$${Math.round(minSalary/1000)}k-$${Math.round(maxSalary/1000)}k`;
    };
    
    const paths = [
      {
        name: 'Frontend Developer',
        skills: ['javascript', 'react', 'typescript', 'vue', 'css', 'html'],
        ...calculatePathMetrics(['javascript', 'react', 'typescript', 'vue', 'css', 'html']),
        get difficulty(): string { return getDifficultyLevel(this.avgDifficulty); },
        get timeToLearn(): string { return getTimeToLearn(this.avgDifficulty, this.skillCount); },
        get salary(): string { return getSalaryRange(this.avgSalary); },
        get demandScore(): number { return Math.round(this.demand / 1000 * 100) / 100; }
      },
      {
        name: 'Backend Developer',
        skills: ['python', 'node', 'java', 'go', 'rust', 'sql'],
        ...calculatePathMetrics(['python', 'node', 'java', 'go', 'rust', 'sql']),
        get difficulty(): string { return getDifficultyLevel(this.avgDifficulty); },
        get timeToLearn(): string { return getTimeToLearn(this.avgDifficulty, this.skillCount); },
        get salary(): string { return getSalaryRange(this.avgSalary); },
        get demandScore(): number { return Math.round(this.demand / 1000 * 100) / 100; }
      },
      {
        name: 'AI/ML Engineer',
        skills: ['python', 'ai', 'machine-learning', 'tensorflow', 'pytorch', 'data-science'],
        ...calculatePathMetrics(['python', 'ai', 'machine-learning', 'tensorflow', 'pytorch']),
        get difficulty(): string { return getDifficultyLevel(this.avgDifficulty); },
        get timeToLearn(): string { return getTimeToLearn(this.avgDifficulty, this.skillCount); },
        get salary(): string { return getSalaryRange(this.avgSalary); },
        get demandScore(): number { return Math.round(this.demand / 1000 * 100) / 100; }
      },
      {
        name: 'DevOps Engineer',
        skills: ['docker', 'kubernetes', 'aws', 'python', 'go', 'linux'],
        ...calculatePathMetrics(['docker', 'kubernetes', 'aws', 'python', 'go']),
        get difficulty(): string { return getDifficultyLevel(this.avgDifficulty); },
        get timeToLearn(): string { return getTimeToLearn(this.avgDifficulty, this.skillCount); },
        get salary(): string { return getSalaryRange(this.avgSalary); },
        get demandScore(): number { return Math.round(this.demand / 1000 * 100) / 100; }
      },
      {
        name: 'Mobile Developer',
        skills: ['javascript', 'react-native', 'swift', 'kotlin', 'flutter', 'ios'],
        ...calculatePathMetrics(['javascript', 'react-native', 'swift', 'kotlin', 'flutter']),
        get difficulty(): string { return getDifficultyLevel(this.avgDifficulty); },
        get timeToLearn(): string { return getTimeToLearn(this.avgDifficulty, this.skillCount); },
        get salary(): string { return getSalaryRange(this.avgSalary); },
        get demandScore(): number { return Math.round(this.demand / 1000 * 100) / 100; }
      },
      {
        name: 'Data Engineer',
        skills: ['python', 'sql', 'spark', 'hadoop', 'kafka', 'data-pipeline'],
        ...calculatePathMetrics(['python', 'sql', 'spark', 'hadoop', 'kafka']),
        get difficulty(): string { return getDifficultyLevel(this.avgDifficulty); },
        get timeToLearn(): string { return getTimeToLearn(this.avgDifficulty, this.skillCount); },
        get salary(): string { return getSalaryRange(this.avgSalary); },
        get demandScore(): number { return Math.round(this.demand / 1000 * 100) / 100; }
      }
    ];
    
    return paths
      .filter(path => path.skillCount > 0) // Only show paths with actual skills
      .sort((a, b) => b.demand - a.demand);
  }, [skillDemand]);

  // Show skeleton loading if data is still loading
  const isLoading = productHuntData.length === 0 && hackerNewsData.length === 0 && saaSHubData.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Filter Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">DevPulse</h2>
        <p className="text-foreground">Developer career intelligence and skill market analysis</p>
      </div>

      {/* Market Overview Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Developer Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 bg-blue-900/20 rounded-lg relative">
              <div className="text-2xl font-bold text-blue-600">{careerInsights.marketInsights.totalSkills}</div>
              <div className="text-sm text-foreground">Skills Tracked</div>
              <div className="text-xs text-foreground">
                {careerInsights.marketInsights.crossPlatformSkills} cross-platform
              </div>
              <button
                onClick={() => setSelectedCardModal('skills')}
                className="absolute top-2 right-2 p-1 hover:bg-blue-100 hover:bg-blue-800 rounded-full transition-colors"
                title="View all tracked skills"
              >
                <Info className="h-3 w-3 text-blue-500" />
              </button>
            </div>
            <div className="text-center p-3 bg-green-50 bg-green-900/20 rounded-lg relative">
              <div className="text-2xl font-bold text-green-600">{careerInsights.marketInsights.hotSkillsCount}</div>
              <div className="text-sm text-foreground">Hot Skills</div>
              <div className="text-xs text-foreground">
                {formatNumber(careerInsights.marketInsights.hotSkillsCount / careerInsights.marketInsights.totalSkills * 100)}% of total
              </div>
              <button
                onClick={() => setSelectedCardModal('hot')}
                className="absolute top-2 right-2 p-1 hover:bg-green-100 hover:bg-green-800 rounded-full transition-colors"
                title="View hot skills details"
              >
                <Info className="h-3 w-3 text-green-500" />
              </button>
            </div>
            <div className="text-center p-3 bg-yellow-50 bg-yellow-900/20 rounded-lg relative">
              <div className="text-2xl font-bold text-yellow-600">${formatNumber(careerInsights.marketInsights.avgSalary/1000)}k</div>
              <div className="text-sm text-foreground">Avg Salary</div>
              <div className="text-xs text-foreground">
                {careerInsights.marketInsights.highSalaryCount} high-salary skills
              </div>
              <button
                onClick={() => setSelectedCardModal('salary')}
                className="absolute top-2 right-2 p-1 hover:bg-yellow-100 hover:bg-yellow-800 rounded-full transition-colors"
                title="View salary details"
              >
                <Info className="h-3 w-3 text-yellow-500" />
              </button>
            </div>
            <div className="text-center p-3 bg-purple-50 bg-purple-900/20 rounded-lg relative">
              <div className="text-2xl font-bold text-purple-600">{careerInsights.marketInsights.avgDifficulty}/10</div>
              <div className="text-sm text-foreground">Avg Difficulty</div>
              <div className="text-xs text-foreground">
                {formatNumber(careerInsights.marketInsights.totalDemand/1000000)}M total demand
              </div>
              <button
                onClick={() => setSelectedCardModal('difficulty')}
                className="absolute top-2 right-2 p-1 hover:bg-purple-100 hover:bg-purple-800 rounded-full transition-colors"
                title="View difficulty details"
              >
                <Info className="h-3 w-3 text-purple-500" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Performance Insights */}
      {analyticsData.performance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Market Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analyticsData.performance.engagementMetrics.avgEngagement)}
                </div>
                <div className="text-sm text-foreground">Avg Engagement</div>
                <div className="text-xs text-foreground mt-1">
                  {analyticsData.performance.engagementMetrics.highEngagement} high engagement items
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.performance.engagementMetrics.viralPosts}
                </div>
                <div className="text-sm text-foreground">Viral Posts</div>
                <div className="text-xs text-foreground mt-1">
                  {formatNumber(analyticsData.performance.engagementMetrics.avgScore)} avg score
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  +{analyticsData.performance.growthRates.phGrowth}%
                </div>
                <div className="text-sm text-foreground">Growth Rate</div>
                <div className="text-xs text-foreground mt-1">
                  Product Hunt momentum
                </div>
              </div>
            </div>
            
            {/* Success Factors */}
            <div className="mt-4 p-4 bg-card rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Success Factors</h4>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div>
                  <span className="text-foreground">Optimal Timing: </span>
                  <span className="font-medium text-foreground">{analyticsData.performance.successFactors.timing}</span>
                </div>
                <div>
                  <span className="text-foreground">Top Categories: </span>
                  <span className="font-medium text-foreground">{analyticsData.performance.successFactors.categories.join(', ')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Insights Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-500" />
              Hot Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {careerInsights.hotSkills.slice(0, 3).map((skill, index) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <Badge variant="default" className="text-xs">🔥 Hot</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Rising Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {careerInsights.risingSkills.slice(0, 3).map((skill, index) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <Badge variant="secondary" className="text-xs">📈 Rising</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              High Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {careerInsights.highSalary.slice(0, 3).map((skill, index) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-green-600">${Math.round(skill.salary/1000)}k</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-500" />
              Community
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {careerInsights.communityDriven.slice(0, 3).map((skill, index) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <button
                      onClick={() => {
                        setSelectedSkill(skill.name);
                        setShowCommunityModal(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {skill.community} communities
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Career Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {learningPaths.map((path, index) => (
              <div key={path.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{path.name}</h3>
                  <Badge variant="outline" className="text-xs">{path.difficulty}</Badge>
                </div>
                <div className="space-y-2 text-sm text-foreground">
                  <div className="flex justify-between">
                    <span>Demand Score:</span>
                    <span className="font-medium">{path.demandScore}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Salary:</span>
                    <span className="font-medium text-green-600">${Math.round(path.avgSalary/1000)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="font-medium">{path.difficulty} ({path.avgDifficulty}/10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time to Learn:</span>
                    <span className="font-medium">{path.timeToLearn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Range:</span>
                    <span className="font-medium text-green-600">{path.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skills Available:</span>
                    <span className="font-medium">{path.skillCount}/{path.skills.length}</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-foreground mb-1">Key Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                      {path.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{path.skills.length - 4} more</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Technology Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg bg-green-50 bg-green-900/20">
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  🌱 Emerging ({techLifecycle.emerging.length})
                </h3>
                <div className="space-y-2">
                  {techLifecycle.emerging.slice(0, 4).map(tech => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">⚠️ {tech.name}</span>
                      <div className="text-xs text-foreground">
                        {tech.demand.toLocaleString()} demand
                      </div>
                    </div>
                  ))}
                  {techLifecycle.emerging.length === 0 && (
                    <div className="text-sm text-foreground">No emerging technologies</div>
                  )}
                  {techLifecycle.emerging.length > 4 && (
                    <div className="text-xs text-foreground">+{techLifecycle.emerging.length - 4} more</div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50 bg-blue-900/20">
                <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  📈 Growing ({techLifecycle.growing.length})
                </h3>
                <div className="space-y-2">
                  {techLifecycle.growing.slice(0, 4).map(tech => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">⚠️ {tech.name}</span>
                      <div className="text-xs text-foreground">
                        {tech.demand.toLocaleString()} demand
                      </div>
                    </div>
                  ))}
                  {techLifecycle.growing.length === 0 && (
                    <div className="text-sm text-foreground">No growing technologies</div>
                  )}
                  {techLifecycle.growing.length > 4 && (
                    <div className="text-xs text-foreground">+{techLifecycle.growing.length - 4} more</div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-purple-50 bg-purple-900/20">
                <h3 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                  🏢 Mature ({techLifecycle.mature.length})
                </h3>
                <div className="space-y-2">
                  {techLifecycle.mature.slice(0, 4).map(tech => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">⚠️ {tech.name}</span>
                      <div className="text-xs text-foreground">
                        {tech.demand.toLocaleString()} demand
                      </div>
                    </div>
                  ))}
                  {techLifecycle.mature.length === 0 && (
                    <div className="text-sm text-foreground">No mature technologies</div>
                  )}
                  {techLifecycle.mature.length > 4 && (
                    <div className="text-xs text-foreground">+{techLifecycle.mature.length - 4} more</div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-red-50 bg-red-900/20">
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  📉 Declining ({techLifecycle.declining.length})
                </h3>
                <div className="space-y-2">
                  {techLifecycle.declining.slice(0, 4).map(tech => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">⚠️ {tech.name}</span>
                      <div className="text-xs text-foreground">
                        {tech.demand.toLocaleString()} demand
                      </div>
                    </div>
                  ))}
                  {techLifecycle.declining.length === 0 && (
                    <div className="text-sm text-foreground">No declining technologies</div>
                  )}
                  {techLifecycle.declining.length > 4 && (
                    <div className="text-xs text-foreground">+{techLifecycle.declining.length - 4} more</div>
                  )}
                </div>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Skill Demand Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill Demand Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-gray-600 scrollbar-track-gray-100 scrollbar-track-gray-800">
            {skillDemand.slice(0, 15).map((skill, index) => (
              <div key={skill.name} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow relative">
                {/* Info Icon */}
                <button
                  onClick={() => {
                    setSelectedSkill(skill.name);
                    setShowSkillDetailsModal(true);
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors z-10"
                  title="View detailed skill information"
                >
                  <Info className="h-3 w-3 text-foreground hover:text-foreground" />
                </button>
                
                <div className="flex items-center gap-3 pr-6">
                  <div className="w-8 h-8 rounded-full bg-gray-100 bg-gray-700 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{skill.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <span>Demand: {skill.demand.toLocaleString()}</span>
                      <span>•</span>
                      <span>Salary: ${Math.round(skill.salary/1000)}k</span>
                      <span>•</span>
                      <span>Difficulty: {skill.difficulty}/10</span>
                      <span>•</span>
                      <span>Community: {skill.community}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-blue-600">Learning Resources: {skill.learningResources}</span>
                      <span className="text-green-600">Job Posts: {skill.jobPosts}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={skill.trend === '🔥 Hot' ? 'default' : skill.trend === '📈 Rising' ? 'secondary' : 'outline'}>
                      {skill.trend}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {skill.recommendation}
                    </Badge>
                  </div>
                  <div className="text-xs text-foreground">
                    Score: {Math.round(skill.score)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Card Modals */}
      {selectedCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <h2 className="text-xl font-bold text-foreground">
                {selectedCardModal === 'skills' && 'Skills Tracked Details'}
                {selectedCardModal === 'hot' && 'Hot Skills Details'}
                {selectedCardModal === 'salary' && 'Salary Analysis'}
                {selectedCardModal === 'difficulty' && 'Difficulty Analysis'}
              </h2>
              <button
                onClick={() => setSelectedCardModal(null)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedCardModal === 'skills' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-600 mb-2">All Tracked Skills</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {skillDemand.slice(0, 20).map((skill, index) => (
                        <div key={skill.name} className="flex items-center justify-between p-2 bg-card bg-gray-700 rounded">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-xs text-foreground">{skill.demand.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    {skillDemand.length > 20 && (
                      <p className="text-xs text-foreground mt-2">+{skillDemand.length - 20} more skills</p>
                    )}
                  </div>
                  
                  <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-600 mb-2">Cross-Platform Skills</h3>
                    <div className="space-y-1 text-sm">
                      {skillDemand.filter(skill => skill.community > 2 && skill.demand > 50000).slice(0, 10).map(skill => (
                        <div key={skill.name} className="flex items-center justify-between p-2 bg-card bg-gray-700 rounded">
                          <span>{skill.name}</span>
                          <span className="text-xs text-foreground">{skill.community} communities</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCardModal === 'hot' && (
                <div className="space-y-4">
                  <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-600 mb-2">Hot Skills List</h3>
                    <div className="space-y-2">
                      {careerInsights.hotSkills.map((skill, index) => (
                        <div key={skill.name} className="flex items-center justify-between p-3 bg-card bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 bg-green-900 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">{skill.demand.toLocaleString()}</div>
                            <div className="text-xs text-foreground">demand</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 bg-orange-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-600 mb-2">Hot Skills Criteria</h3>
                    <ul className="text-sm space-y-1 text-foreground">
                      <li>• Demand &gt; 1M points</li>
                      <li>• Trending status (🔥 Hot)</li>
                      <li>• Strong community engagement</li>
                      <li>• High momentum score</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedCardModal === 'salary' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 bg-yellow-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-600 mb-2">High-Salary Skills</h3>
                    <div className="space-y-2">
                      {careerInsights.highSalary.map((skill, index) => (
                        <div key={skill.name} className="flex items-center justify-between p-3 bg-card bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-yellow-100 bg-yellow-900 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-yellow-600">${Math.round(skill.salary/1000)}k</div>
                            <div className="text-xs text-foreground">salary</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-600 mb-2">Salary Calculation</h3>
                    <ul className="text-sm space-y-1 text-foreground">
                      <li>• Base salary: $70k</li>
                      <li>• Demand bonus: Up to $50k</li>
                      <li>• Difficulty bonus: Up to $21k</li>
                      <li>• Community bonus: Up to $10k</li>
                      <li>• Range: $70k - $180k</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedCardModal === 'difficulty' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-600 mb-2">Difficulty Distribution</h3>
                    <div className="space-y-2">
                      {skillDemand.slice(0, 15).map((skill, index) => (
                        <div key={skill.name} className="flex items-center justify-between p-3 bg-card bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-purple-100 bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-purple-600">{skill.difficulty}/10</div>
                            <div className="text-xs text-foreground">difficulty</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Difficulty Factors</h3>
                    <ul className="text-sm space-y-1 text-foreground">
                      <li>• Learning curve complexity</li>
                      <li>• Community support availability</li>
                      <li>• Documentation quality</li>
                      <li>• Prerequisites required</li>
                      <li>• Market demand influence</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Community Modal */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedSkill} Communities
                </h2>
                <p className="text-sm text-foreground mt-1">
                  {(() => {
                    // Get the actual skill data from the dynamic data
                    const skillData = skillDemand.find(skill => 
                      skill.name.toLowerCase() === selectedSkill.toLowerCase()
                    );
                    
                    if (!skillData) {
                      return 'No community data available';
                    }
                    
                    return `${skillData.community} total communities`;
                  })()}
                </p>
              </div>
              <button
                onClick={() => setShowCommunityModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {(() => {
                  // Get the actual skill data from the dynamic data
                  const skillData = skillDemand.find(skill => 
                    skill.name.toLowerCase() === selectedSkill.toLowerCase()
                  );
                  
                  if (!skillData) {
                    return (
                      <div className="text-center text-foreground py-8">
                        No community data available for {selectedSkill}
                      </div>
                    );
                  }

                  // Generate realistic community links based on the actual community count
                  const communityLinks = {
                    'javascript': [
                      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/' },
                      { name: 'Stack Overflow', url: 'https://stackoverflow.com/questions/tagged/javascript' },
                      { name: 'JavaScript.info', url: 'https://javascript.info/' },
                      { name: 'Reddit r/javascript', url: 'https://www.reddit.com/r/javascript/' },
                      { name: 'Dev.to JavaScript', url: 'https://dev.to/t/javascript' },
                      { name: 'GitHub JavaScript', url: 'https://github.com/topics/javascript' },
                      { name: 'Discord JS', url: 'https://discord.gg/javascript' },
                      { name: 'Node.js Community', url: 'https://nodejs.org/en/community/' },
                      { name: 'React Community', url: 'https://reactjs.org/community/support.html' },
                      { name: 'Vue.js Community', url: 'https://vuejs.org/community/' },
                      { name: 'Angular Community', url: 'https://angular.io/community' },
                      { name: 'TypeScript Community', url: 'https://www.typescriptlang.org/community' },
                      { name: 'Webpack Community', url: 'https://webpack.js.org/contribute/' },
                      { name: 'Babel Community', url: 'https://babeljs.io/community' },
                      { name: 'ESLint Community', url: 'https://eslint.org/community/' },
                      { name: 'Jest Community', url: 'https://jestjs.io/docs/community' }
                    ],
                    'python': [
                      { name: 'Python.org', url: 'https://www.python.org/community/' },
                      { name: 'Stack Overflow Python', url: 'https://stackoverflow.com/questions/tagged/python' },
                      { name: 'Reddit r/Python', url: 'https://www.reddit.com/r/Python/' },
                      { name: 'Dev.to Python', url: 'https://dev.to/t/python' },
                      { name: 'GitHub Python', url: 'https://github.com/topics/python' },
                      { name: 'Django Community', url: 'https://www.djangoproject.com/community/' },
                      { name: 'Flask Community', url: 'https://flask.palletsprojects.com/community/' },
                      { name: 'FastAPI Community', url: 'https://fastapi.tiangolo.com/community/' },
                      { name: 'PyTorch Community', url: 'https://pytorch.org/community/' },
                      { name: 'TensorFlow Community', url: 'https://www.tensorflow.org/community' },
                      { name: 'Pandas Community', url: 'https://pandas.pydata.org/community/' },
                      { name: 'NumPy Community', url: 'https://numpy.org/community/' },
                      { name: 'SciPy Community', url: 'https://scipy.org/community/' },
                      { name: 'Jupyter Community', url: 'https://jupyter.org/community' },
                      { name: 'Anaconda Community', url: 'https://www.anaconda.com/community' }
                    ],
                    'artificial intelligence': [
                      { name: 'OpenAI Community', url: 'https://community.openai.com/' },
                      { name: 'Hugging Face Community', url: 'https://huggingface.co/community' },
                      { name: 'Kaggle Community', url: 'https://www.kaggle.com/community' },
                      { name: 'Reddit r/MachineLearning', url: 'https://www.reddit.com/r/MachineLearning/' },
                      { name: 'Dev.to AI/ML', url: 'https://dev.to/t/ai' },
                      { name: 'GitHub AI/ML', url: 'https://github.com/topics/machine-learning' },
                      { name: 'TensorFlow Community', url: 'https://www.tensorflow.org/community' },
                      { name: 'PyTorch Community', url: 'https://pytorch.org/community/' },
                      { name: 'Scikit-learn Community', url: 'https://scikit-learn.org/community.html' },
                      { name: 'Papers with Code', url: 'https://paperswithcode.com/' },
                      { name: 'AI Research', url: 'https://www.airesearch.com/community' },
                      { name: 'MLflow Community', url: 'https://mlflow.org/community/' },
                      { name: 'Weights & Biases', url: 'https://wandb.ai/community' },
                      { name: 'Neptune Community', url: 'https://neptune.ai/community' },
                      { name: 'Comet Community', url: 'https://www.comet.com/community' }
                    ]
                  };

                  const allLinks = communityLinks[selectedSkill.toLowerCase() as keyof typeof communityLinks] || [];
                  
                  // Only show the number of communities that the dynamic data indicates
                  const linksToShow = allLinks.slice(0, skillData.community);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {linksToShow.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-blue-50 bg-blue-900/20 rounded-lg hover:bg-blue-100 hover:bg-blue-900/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-blue-900 text-blue-100 truncate">{link.name}</div>
                            <div className="text-xs text-blue-600 text-blue-300 truncate">{link.url}</div>
                          </div>
                          <div className="ml-2 flex-shrink-0 text-blue-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Details Modal */}
      {showSkillDetailsModal && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedSkill} - Skill Analysis
              </h2>
              <button
                onClick={() => setShowSkillDetailsModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Find the skill data */}
              {(() => {
                const skillData = skillDemand.find(skill => skill.name.toLowerCase() === selectedSkill.toLowerCase());
                if (!skillData) {
                  return (
                    <div className="text-center py-8">
                      <Code className="h-12 w-12 text-foreground mx-auto mb-4" />
                      <p className="text-foreground">Skill data not found</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Skill Overview */}
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {skillData.name}
                      </h3>
                      <p className="text-lg text-foreground mb-6">
                        Comprehensive skill analysis including demand, salary, difficulty, and community metrics
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg text-center">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{skillData.demand.toLocaleString()}</div>
                        <div className="text-sm text-foreground">Demand Score</div>
                      </div>
                      <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg text-center">
                        <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">${skillData.salary.toLocaleString()}</div>
                        <div className="text-sm text-foreground">Avg Salary</div>
                      </div>
                      <div className="bg-purple-50 bg-purple-900/20 p-4 rounded-lg text-center">
                        <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{skillData.difficulty}/10</div>
                        <div className="text-sm text-foreground">Difficulty</div>
                      </div>
                      <div className="bg-orange-50 bg-orange-900/20 p-4 rounded-lg text-center">
                        <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-600">{skillData.community}</div>
                        <div className="text-sm text-foreground">Communities</div>
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-3">Demand Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-foreground">Total Demand:</span>
                            <span className="font-medium">{skillData.demand.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Job Posts:</span>
                            <span className="font-medium">{skillData.jobPosts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Learning Resources:</span>
                            <span className="font-medium">{skillData.learningResources}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Trend:</span>
                            <span className={`font-medium ${
                              skillData.trend === '📈 Rising' ? 'text-green-600' : 
                              skillData.trend === '📊 Stable' ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              {skillData.trend === '📈 Rising' ? '📈 Rising' : 
                               skillData.trend === '📊 Stable' ? '📊 Stable' : '📉 Declining'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-3">Career Insights</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-foreground">Salary Range:</span>
                            <span className="font-medium">${Math.round(skillData.salary * 0.8).toLocaleString()} - ${Math.round(skillData.salary * 1.2).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Learning Time:</span>
                            <span className="font-medium">
                              {skillData.difficulty <= 3 ? '1-3 months' : 
                               skillData.difficulty <= 6 ? '3-6 months' : 
                               skillData.difficulty <= 8 ? '6-12 months' : '1+ years'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Market Status:</span>
                            <span className={`font-medium ${
                              skillData.demand > 100000 ? 'text-green-600' : 
                              skillData.demand > 50000 ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              {skillData.demand > 100000 ? '🔥 Hot' : 
                               skillData.demand > 50000 ? '📈 Growing' : '⚠️ Niche'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Community Strength:</span>
                            <span className={`font-medium ${
                              skillData.community > 3 ? 'text-green-600' : 
                              skillData.community > 1 ? 'text-blue-600' : 'text-foreground'
                            }`}>
                              {skillData.community > 3 ? 'Strong' : 
                               skillData.community > 1 ? 'Moderate' : 'Limited'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skill Comparison */}
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">Skill Comparison</h4>
                      <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-foreground mb-1">Demand vs Average</div>
                            <div className="text-lg font-bold text-foreground">
                              {skillData.demand > skillDemand.reduce((sum, s) => sum + s.demand, 0) / skillDemand.length ? 'Above' : 'Below'} Average
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-foreground mb-1">Salary vs Average</div>
                            <div className="text-lg font-bold text-foreground">
                              {skillData.salary > skillDemand.reduce((sum, s) => sum + s.salary, 0) / skillDemand.length ? 'Above' : 'Below'} Average
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-foreground mb-1">Difficulty vs Average</div>
                            <div className="text-lg font-bold text-foreground">
                              {skillData.difficulty > skillDemand.reduce((sum, s) => sum + s.difficulty, 0) / skillDemand.length ? 'Above' : 'Below'} Average
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Path */}
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">Learning Path</h4>
                      <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <span className="text-foreground">Start with fundamentals and basic concepts</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <span className="text-foreground">Practice with small projects and exercises</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <span className="text-foreground">Build real-world applications and contribute to open source</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <span className="text-foreground">Join communities and network with other developers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}