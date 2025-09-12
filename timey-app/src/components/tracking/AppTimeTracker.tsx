import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Monitor,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  Activity,
  Settings
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { AppUsageData, AppCategory } from '@/types';
import { cn } from '@/lib/utils';

interface AppSession {
  id: string;
  appName: string;
  appBundle?: string;
  windowTitle?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  category: AppCategory;
  isProductive: boolean;
  sessionId?: string; // linked to focus session
}

interface AppStats {
  appName: string;
  totalTime: number; // seconds
  sessions: number;
  category: AppCategory;
  isProductive: boolean;
  averageSessionLength: number;
  lastUsed: Date;
  productivityScore: number; // 0-100
}

const categoryColors: Record<AppCategory, string> = {
  productive: '#10B981',
  communication: '#3B82F6',
  entertainment: '#EF4444',
  social: '#F59E0B',
  development: '#8B5CF6',
  design: '#EC4899',
  other: '#6B7280'
};

const categoryIcons: Record<AppCategory, React.ReactNode> = {
  productive: <Target className="w-4 h-4" />,
  communication: <Activity className="w-4 h-4" />,
  entertainment: <Monitor className="w-4 h-4" />,
  social: <Activity className="w-4 h-4" />,
  development: <Zap className="w-4 h-4" />,
  design: <Target className="w-4 h-4" />,
  other: <Monitor className="w-4 h-4" />
};

const AppUsageCard: React.FC<{
  app: AppStats;
  rank: number;
  totalTime: number;
}> = ({ app, rank, totalTime }) => {
  const percentage = (app.totalTime / totalTime) * 100;
  const hours = Math.floor(app.totalTime / 3600);
  const minutes = Math.floor((app.totalTime % 3600) / 60);
  
  const formatTime = () => {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-sm font-medium">
            #{rank}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{app.appName}</h4>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: categoryColors[app.category] }}
              />
              {app.isProductive ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatTime()}</span>
              <span>{app.sessions} sessions</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
            
            <div className="mt-2">
              <Progress value={percentage} className="h-1" />
            </div>
          </div>
          
          <div className="text-right">
            <Badge 
              variant={app.isProductive ? "default" : "destructive"}
              className="text-xs"
            >
              {app.category}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              Score: {app.productivityScore}/100
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CategoryBreakdown: React.FC<{
  data: Array<{ category: string; time: number; color: string; productive: boolean }>;
}> = ({ data }) => {
  const totalTime = data.reduce((acc, cat) => acc + cat.time, 0);
  const productiveTime = data.filter(cat => cat.productive).reduce((acc, cat) => acc + cat.time, 0);
  const productivityRatio = totalTime > 0 ? (productiveTime / totalTime) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{productivityRatio.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground">Productive Time</div>
        </div>
        
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={40}
                fill="#8884d8"
                dataKey="time"
                fontSize={10}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${Math.floor(value / 60)}m`, 'Time']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-1">
          {data.map(category => (
            <div key={category.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.category}</span>
                {category.productive && <CheckCircle2 className="w-3 h-3 text-green-500" />}
              </div>
              <span className="text-muted-foreground">
                {Math.floor(category.time / 60)}m
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProductivityInsights: React.FC<{
  apps: AppStats[];
  timeRange: string;
}> = ({ apps }) => {
  const totalTime = apps.reduce((acc, app) => acc + app.totalTime, 0);
  const productiveApps = apps.filter(app => app.isProductive);
  const distractingApps = apps.filter(app => !app.isProductive);
  
  const productiveTime = productiveApps.reduce((acc, app) => acc + app.totalTime, 0);
  const distractingTime = distractingApps.reduce((acc, app) => acc + app.totalTime, 0);
  
  const insights = [
    {
      type: 'positive',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      text: `${Math.round((productiveTime / totalTime) * 100)}% of time spent productively`
    },
    {
      type: 'warning',
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      text: `Top distraction: ${distractingApps[0]?.appName || 'None'}`
    },
    {
      type: 'info',
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      text: `Most used productive app: ${productiveApps[0]?.appName || 'None'}`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            {insight.icon}
            <span className="text-muted-foreground">{insight.text}</span>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Productive Time</span>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {Math.floor(productiveTime / 60)}m
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Distraction Time</span>
              <p className="font-semibold text-red-600 dark:text-red-400">
                {Math.floor(distractingTime / 60)}m
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AppTimeTracker: React.FC = () => {
  const { currentSession } = useTaskStore();
  const [isTracking, setIsTracking] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  const [showOnlyProductive, setShowOnlyProductive] = useState(false);
  const [isActiveWindowTracking, setIsActiveWindowTracking] = useState(false);
  
  // Mock app usage data (in real implementation, this would come from system APIs)
  const [appStats, setAppStats] = useState<AppStats[]>([
    {
      appName: 'VS Code',
      totalTime: 7200, // 2 hours
      sessions: 8,
      category: 'development',
      isProductive: true,
      averageSessionLength: 900, // 15 minutes
      lastUsed: new Date(),
      productivityScore: 95
    },
    {
      appName: 'Chrome',
      totalTime: 5400, // 1.5 hours
      sessions: 12,
      category: 'other',
      isProductive: false,
      averageSessionLength: 450, // 7.5 minutes
      lastUsed: new Date(),
      productivityScore: 40
    },
    {
      appName: 'Slack',
      totalTime: 3600, // 1 hour
      sessions: 15,
      category: 'communication',
      isProductive: true,
      averageSessionLength: 240, // 4 minutes
      lastUsed: new Date(),
      productivityScore: 75
    },
    {
      appName: 'Figma',
      totalTime: 2700, // 45 minutes
      sessions: 5,
      category: 'design',
      isProductive: true,
      averageSessionLength: 540, // 9 minutes
      lastUsed: new Date(),
      productivityScore: 90
    },
    {
      appName: 'YouTube',
      totalTime: 1800, // 30 minutes
      sessions: 6,
      category: 'entertainment',
      isProductive: false,
      averageSessionLength: 300, // 5 minutes
      lastUsed: new Date(),
      productivityScore: 15
    },
    {
      appName: 'Terminal',
      totalTime: 1500, // 25 minutes
      sessions: 10,
      category: 'development',
      isProductive: true,
      averageSessionLength: 150, // 2.5 minutes
      lastUsed: new Date(),
      productivityScore: 85
    }
  ]);

  // Simulate real-time tracking
  useEffect(() => {
    if (!isTracking || !currentSession) return;

    const interval = setInterval(() => {
      // Simulate tracking current app (in real app, this would use system APIs)
      const mockCurrentApp = appStats[Math.floor(Math.random() * appStats.length)];
      
      setAppStats(prev => prev.map(app => 
        app.appName === mockCurrentApp.appName
          ? { ...app, totalTime: app.totalTime + 5, lastUsed: new Date() }
          : app
      ));
    }, 5000);

    return () => clearInterval(interval);
  }, [isTracking, currentSession, appStats]);

  const filteredApps = showOnlyProductive 
    ? appStats.filter(app => app.isProductive)
    : appStats;

  const sortedApps = [...filteredApps].sort((a, b) => b.totalTime - a.totalTime);
  const totalTime = sortedApps.reduce((acc, app) => acc + app.totalTime, 0);

  const categoryData = Object.entries(
    sortedApps.reduce((acc, app) => {
      if (!acc[app.category]) {
        acc[app.category] = { time: 0, productive: app.isProductive };
      }
      acc[app.category].time += app.totalTime;
      return acc;
    }, {} as Record<string, { time: number; productive: boolean }>)
  ).map(([category, data]) => ({
    category,
    time: data.time,
    color: categoryColors[category as AppCategory],
    productive: data.productive
  }));

  const handleToggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const handleStartActiveWindowTracking = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('start-tracking');
      setIsActiveWindowTracking(true);
    }
  };

  const handleStopActiveWindowTracking = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('stop-tracking');
      setIsActiveWindowTracking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">App Time Tracking</h2>
          <p className="text-muted-foreground">
            Monitor which applications you spend the most time on during focus sessions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="tracking"
              checked={isTracking}
              onCheckedChange={handleToggleTracking}
            />
            <Label htmlFor="tracking" className="text-sm">
              {isTracking ? (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Tracking
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Paused
                </span>
              )}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            {isActiveWindowTracking ? (
              <Button
                onClick={handleStopActiveWindowTracking}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Stop Active Window Tracking
              </Button>
            ) : (
              <Button
                onClick={handleStartActiveWindowTracking}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Start Active Window Tracking
              </Button>
            )}
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Session Tracking */}
      {(currentSession && isTracking) || isActiveWindowTracking ? (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Currently Tracking</h4>
                <p className="text-xs text-muted-foreground">
                  {isActiveWindowTracking 
                    ? "Active window tracking enabled - monitoring real-time app usage"
                    : "Focus session active - monitoring app usage"
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isActiveWindowTracking && (
                  <Badge variant="default" className="text-xs">
                    <Monitor className="w-3 h-3 mr-1" />
                    Active Window
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main App List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">App Usage ({timeRange})</h3>
            <div className="flex items-center gap-2">
              <Switch
                id="productive-only"
                checked={showOnlyProductive}
                onCheckedChange={setShowOnlyProductive}
              />
              <Label htmlFor="productive-only" className="text-sm">
                Productive only
              </Label>
            </div>
          </div>
          
          <div className="space-y-3">
            {sortedApps.slice(0, 10).map((app, index) => (
              <AppUsageCard
                key={app.appName}
                app={app}
                rank={index + 1}
                totalTime={totalTime}
              />
            ))}
            
            {sortedApps.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-medium mb-2">No app usage data</h4>
                  <p className="text-sm text-muted-foreground">
                    {isTracking 
                      ? "Start a focus session to begin tracking app usage"
                      : "Enable tracking to monitor your app usage"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CategoryBreakdown data={categoryData} />
          <ProductivityInsights apps={sortedApps} timeRange={timeRange} />
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Time</span>
                <span className="font-semibold">
                  {Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Apps Used</span>
                <span className="font-semibold">{sortedApps.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Most Used</span>
                <span className="font-semibold text-xs truncate max-w-20">
                  {sortedApps[0]?.appName || 'None'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productivity</span>
                <span className="font-semibold">
                  {Math.round((categoryData.filter(c => c.productive).reduce((acc, c) => acc + c.time, 0) / totalTime) * 100) || 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Tracking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-categorize" className="text-sm">
                  Auto-categorize apps
                </Label>
                <Switch id="auto-categorize" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="track-idle" className="text-sm">
                  Track idle time
                </Label>
                <Switch id="track-idle" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="privacy-mode" className="text-sm">
                  Privacy mode
                </Label>
                <Switch id="privacy-mode" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
