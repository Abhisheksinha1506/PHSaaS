"use client"

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

interface SearchFilters {
  platforms: string[];
  categories: string[];
  minScore: number;
  timeFilter: string;
}

export function SearchBar({ onSearch, onClear, loading = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    platforms: ['producthunt', 'hackernews', 'github'],
    categories: [],
    minScore: 0,
    timeFilter: '7d'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string, searchFilters: SearchFilters) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (searchQuery.trim()) {
            onSearch(searchQuery, searchFilters);
          }
        }, 300);
      };
    })(),
    [onSearch]
  );

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query, filters);
    }
  }, [query, filters, debouncedSearch]);

  const handleSearch = () => {
    if (query.trim()) {
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        if (typeof window !== 'undefined') {
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }
        return newHistory;
      });
      onSearch(query, filters);
    }
  };

  const handleClear = () => {
    setQuery("");
    setFilters({
      platforms: ['producthunt', 'hackernews', 'github'],
      categories: [],
      minScore: 0,
      timeFilter: '7d'
    });
    onClear();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  // Load search history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Failed to load search history:', error);
        }
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Main search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products, discussions, repositories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {/* Search history */}
      {searchHistory.length > 0 && !query && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">Recent searches:</div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setQuery(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Advanced filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Platforms */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Platforms</label>
            <div className="space-y-1">
              {[
                { value: 'producthunt', label: 'Product Hunt' },
                { value: 'hackernews', label: 'Hacker News' },
                { value: 'github', label: 'GitHub' }
              ].map(platform => (
                <label key={platform.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.platforms.includes(platform.value)}
                    onChange={() => handlePlatformToggle(platform.value)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{platform.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
            <Select
              value={filters.categories[0] || ""}
              onValueChange={(value) => handleFilterChange('categories', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="ai">AI & Machine Learning</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="mobile">Mobile Development</SelectItem>
                <SelectItem value="devtools">Developer Tools</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Minimum Score */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Score</label>
            <Input
              type="number"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Time Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range</label>
            <Select
              value={filters.timeFilter}
              onValueChange={(value) => handleFilterChange('timeFilter', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(filters.platforms.length < 3 || filters.categories.length > 0 || filters.minScore > 0) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Active filters:</span>
          {filters.platforms.length < 3 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Platforms: {filters.platforms.join(', ')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('platforms', ['producthunt', 'hackernews', 'github'])}
              />
            </Badge>
          )}
          {filters.categories.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.categories[0]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('categories', [])}
              />
            </Badge>
          )}
          {filters.minScore > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Min Score: {filters.minScore}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('minScore', 0)}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
