"use client"

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, RefreshCw, Clock, TrendingUp } from "lucide-react";

interface RealtimeUpdatesProps {
  onUpdate: (updates: any) => void;
}

export function RealtimeUpdates({ onUpdate }: RealtimeUpdatesProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [updates, setUpdates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for updates
  const checkUpdates = useCallback(async () => {
    if (!lastUpdate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/realtime?lastUpdate=${lastUpdate}&platforms=producthunt,hackernews,github`);
      const data = await response.json();
      
      if (data.totalUpdates > 0) {
        setUpdates(data);
        onUpdate(data);
        setLastUpdate(data.timestamp);
      }
    } catch (error) {
      console.error('Failed to check updates:', error);
      setError('Failed to check for updates');
    } finally {
      setIsLoading(false);
    }
  }, [lastUpdate, onUpdate]);

  // Enable/disable real-time updates
  const toggleUpdates = useCallback(() => {
    if (isEnabled) {
      setIsEnabled(false);
      setLastUpdate(null);
      setUpdates(null);
    } else {
      setIsEnabled(true);
      setLastUpdate(new Date().toISOString());
    }
  }, [isEnabled]);

  // Set up polling when enabled
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(checkUpdates, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [isEnabled, checkUpdates]);

  // Initial check when enabled
  useEffect(() => {
    if (isEnabled && lastUpdate) {
      checkUpdates();
    }
  }, [isEnabled, lastUpdate, checkUpdates]);

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-500" />
            Real-time Updates
          </div>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleUpdates}
            className="flex items-center gap-2"
          >
            {isEnabled ? (
              <>
                <BellOff className="h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Enable
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                {isLoading ? 'Checking for updates...' : 'Monitoring for updates'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkUpdates}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                Check Now
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            {updates && updates.totalUpdates > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-600">
                    {updates.totalUpdates} new updates found!
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(updates.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  {updates.updates.productHunt.new.length > 0 && (
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="font-medium text-blue-600">
                        {updates.updates.productHunt.new.length}
                      </div>
                      <div className="text-xs text-blue-500">Product Hunt</div>
                    </div>
                  )}
                  
                  {updates.updates.hackerNews.new.length > 0 && (
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <div className="font-medium text-orange-600">
                        {updates.updates.hackerNews.new.length}
                      </div>
                      <div className="text-xs text-orange-500">Hacker News</div>
                    </div>
                  )}
                  
                  {updates.updates.github.new.length > 0 && (
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="font-medium text-purple-600">
                        {updates.updates.github.new.length}
                      </div>
                      <div className="text-xs text-purple-500">GitHub</div>
                    </div>
                  )}
                </div>

                {/* Show recent updates */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {updates.updates.productHunt.new.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500">{item.votes} votes</div>
                    </div>
                  ))}
                  
                  {updates.updates.hackerNews.new.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium line-clamp-1">{item.title}</div>
                      <div className="text-gray-500">{item.score} points</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {updates && updates.totalUpdates === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                No new updates since last check
              </div>
            )}

            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Next check in 30 seconds
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <BellOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Real-time updates are disabled. Enable to get live notifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
