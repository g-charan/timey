import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AppUsage {
  name: string;
  timeSpent: number;
  category: string;
  isActive: boolean;
}

export function MetricsPopup() {
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);

  useEffect(() => {
    const trackApps = () => {
      const mockApps: AppUsage[] = [
        {
          name: "VS Code",
          timeSpent: Math.floor(Math.random() * 120) + 180,
          category: "Development",
          isActive: Math.random() > 0.7,
        },
        {
          name: "Chrome",
          timeSpent: Math.floor(Math.random() * 90) + 120,
          category: "Browser",
          isActive: Math.random() > 0.8,
        },
        {
          name: "Slack",
          timeSpent: Math.floor(Math.random() * 45) + 30,
          category: "Communication",
          isActive: Math.random() > 0.9,
        },
        {
          name: "Figma",
          timeSpent: Math.floor(Math.random() * 60) + 45,
          category: "Design",
          isActive: Math.random() > 0.85,
        },
        {
          name: "Terminal",
          timeSpent: Math.floor(Math.random() * 30) + 20,
          category: "Development",
          isActive: Math.random() > 0.75,
        },
        {
          name: "Notion",
          timeSpent: Math.floor(Math.random() * 40) + 25,
          category: "Productivity",
          isActive: Math.random() > 0.8,
        },
      ].sort((a, b) => b.timeSpent - a.timeSpent);

      setAppUsage(mockApps);
    };

    trackApps();
    const interval = setInterval(trackApps, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const getTotalTime = () => {
    return appUsage.reduce((total, app) => total + app.timeSpent, 0);
  };

  const getProductivityScore = () => {
    const productiveTime = appUsage
      .filter(
        (app) =>
          app.category === "Development" || app.category === "Productivity"
      )
      .reduce((sum, app) => sum + app.timeSpent, 0);
    return Math.round((productiveTime / getTotalTime()) * 100);
  };

  return (
    <div className="w-80 bg-gray-900 text-white border border-gray-800 rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Usage</span>
          <span className="text-xs text-gray-400">
            {formatTime(getTotalTime())}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          {appUsage.map((app, index) => (
            <div
              key={app.name}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xs text-gray-500 w-4">#{index + 1}</span>
                <div className="flex items-center gap-2 min-w-0">
                  {app.isActive && (
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  )}
                  <span className="text-sm truncate">{app.name}</span>
                </div>
                <span className="text-xs text-gray-500">{app.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-gray-800 rounded">
                  <div
                    className="h-full bg-gray-400 rounded transition-all"
                    style={{
                      width: `${
                        (app.timeSpent /
                          Math.max(...appUsage.map((a) => a.timeSpent))) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-300 w-12 text-right">
                  {formatTime(app.timeSpent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Productivity</span>
          <span className="text-sm">{getProductivityScore()}%</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => window.appAPI?.restoreMain()}
          className="w-full text-xs text-gray-400 hover:text-white h-8"
        >
          View all
        </Button>
      </div>
    </div>
  );
}
