"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  content: React.ReactNode;
}

interface OnboardingGuideProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingGuide({ onComplete, onSkip }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setIsVisible(true);
      }
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to PHSaaS Dashboard!',
      description: 'Get targeted intelligence for VCs, indie hackers, and developers',
      target: 'dashboard-header',
      position: 'bottom',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This dashboard aggregates data from Product Hunt, Hacker News, and GitHub to provide actionable insights.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>No signup required</strong> - just explore and discover what&apos;s trending in tech!
          </p>
        </div>
      )
    },
    {
      id: 'filters',
      title: 'Customize Your View',
      description: 'Use filters to focus on what matters to you',
      target: 'filter-section',
      position: 'bottom',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <strong>Time Filter:</strong> View data from the last 24 hours, 7 days, or 30 days
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Advanced Filters:</strong> Filter by categories (AI, Developer Tools, SaaS), topics (JavaScript, Python, React), and project types (Open Source, Commercial)
          </p>
          <p className="text-sm text-muted-foreground">
            Your filter preferences are saved automatically!
          </p>
        </div>
      )
    },
    {
      id: 'vc-tab',
      title: 'VC Intelligence Dashboard',
      description: 'Investment signals and market opportunities',
      target: 'vc-tab',
      position: 'bottom',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <strong>For VCs and Investors:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Investment signals with scoring</li>
            <li>Cross-platform correlations</li>
            <li>Market category insights</li>
            <li>Click on investment signals to see detailed analysis</li>
            <li>Click platform badges to view source data</li>
          </ul>
        </div>
      )
    },
    {
      id: 'indie-tab',
      title: 'Indie Hacker Research',
      description: 'Market gaps and competitor analysis',
      target: 'indie-tab',
      position: 'bottom',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <strong>For Solo Founders and Entrepreneurs:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Market gap opportunities</li>
            <li>Competitor analysis</li>
            <li>Launch timing intelligence</li>
            <li>Use &quot;Research&quot; and &quot;Analyze&quot; buttons for detailed insights</li>
          </ul>
        </div>
      )
    },
    {
      id: 'developer-tab',
      title: 'Developer Inspiration',
      description: 'Trending problems and project ideas',
      target: 'developer-tab',
      position: 'bottom',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <strong>For Developers and Engineers:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Trending problems to solve</li>
            <li>Project ideas with difficulty ratings</li>
            <li>Skill demand tracking</li>
            <li>Use &quot;Get Started&quot; for project guides and &quot;Learn More&quot; for resources</li>
          </ul>
        </div>
      )
    },
    {
      id: 'category-tab',
      title: 'Trending by Category',
      description: 'Spot rising projects in specific categories',
      target: 'category-tab',
      position: 'bottom',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <strong>Category Trends:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>See which categories are trending</li>
            <li>View top items per category</li>
            <li>Track growth metrics</li>
            <li>Identify emerging opportunities</li>
          </ul>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    setIsVisible(false);
    if (onSkip) {
      onSkip();
    }
  };

  if (!isVisible) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{currentStepData.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStepData.content}
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>
              
              <Button
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-sm"
            >
              Skip tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

