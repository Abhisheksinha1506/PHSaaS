"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Filter, X } from "lucide-react";

interface EnhancedFilterProps {
  timeFilter: '24h' | '7d' | '30d';
  setTimeFilter: (filter: '24h' | '7d' | '30d') => void;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  projectType: string;
  setProjectType: (type: string) => void;
}

const categories = [
  'AI & Machine Learning',
  'Developer Tools',
  'SaaS',
  'Productivity',
  'Design',
  'Marketing',
  'Analytics',
  'Communication',
  'Open Source',
  'Mobile'
];

const topics = [
  'AI',
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'TypeScript',
  'API',
  'Cloud',
  'Security',
  'Automation'
];

const projectTypes = [
  'All Types',
  'Open Source',
  'Commercial',
  'SaaS',
  'Mobile App',
  'Web App',
  'API/Service'
];

export function EnhancedFilter({
  timeFilter,
  setTimeFilter,
  selectedCategories,
  setSelectedCategories,
  selectedTopics,
  setSelectedTopics,
  projectType,
  setProjectType
}: EnhancedFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCategories = localStorage.getItem('dashboardCategories');
      const savedTopics = localStorage.getItem('dashboardTopics');
      const savedProjectType = localStorage.getItem('dashboardProjectType');
      
      if (savedCategories) {
        try {
          setSelectedCategories(JSON.parse(savedCategories));
        } catch (e) {
          console.error('Failed to load saved categories:', e);
        }
      }
      
      if (savedTopics) {
        try {
          setSelectedTopics(JSON.parse(savedTopics));
        } catch (e) {
          console.error('Failed to load saved topics:', e);
        }
      }
      
      if (savedProjectType) {
        setProjectType(savedProjectType);
      }
    }
  }, [setSelectedCategories, setSelectedTopics, setProjectType]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardCategories', JSON.stringify(selectedCategories));
      localStorage.setItem('dashboardTopics', JSON.stringify(selectedTopics));
      localStorage.setItem('dashboardProjectType', projectType);
    }
  }, [selectedCategories, selectedTopics, projectType]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev: string[]) =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTopics([]);
    setProjectType('All Types');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTopics.length > 0 || projectType !== 'All Types';

  const timeframes = [
    { id: '24h' as const, label: '24 Hours', icon: Clock },
    { id: '7d' as const, label: '7 Days', icon: Calendar },
    { id: '30d' as const, label: '30 Days', icon: Calendar }
  ];

  return (
    <div className="bg-card dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Time Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Clock className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Filters</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Time: <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">{timeframes.find(t => t.id === timeFilter)?.label}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe.id}
                variant={timeFilter === timeframe.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(timeframe.id)}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  timeFilter === timeframe.id 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <timeframe.icon className="h-4 w-4" />
                {timeframe.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategories.map(cat => (
              <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                {cat}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleCategory(cat)}
                />
              </Badge>
            ))}
            {selectedTopics.map(topic => (
              <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                {topic}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTopic(topic)}
                />
              </Badge>
            ))}
            {projectType !== 'All Types' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {projectType}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setProjectType('All Types')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Categories</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Topics / Technologies</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {topics.map(topic => (
                  <label key={topic} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic)}
                      onChange={() => toggleTopic(topic)}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">{topic}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Project Type</label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

