"use client"

import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

interface TimeFilterProps {
  timeFilter: '24h' | '7d' | '30d';
  setTimeFilter: (filter: '24h' | '7d' | '30d') => void;
}

export function TimeFilter({ timeFilter, setTimeFilter }: TimeFilterProps) {
  const timeframes = [
    { id: '24h', label: '24 Hours', icon: Clock },
    { id: '7d', label: '7 Days', icon: Calendar },
    { id: '30d', label: '30 Days', icon: Calendar }
  ] as const;

  return (
    <div className="bg-card dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <Clock className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Time Filter</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Currently viewing: <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">{timeframes.find(t => t.id === timeFilter)?.label}</span>
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
    </div>
  );
}
