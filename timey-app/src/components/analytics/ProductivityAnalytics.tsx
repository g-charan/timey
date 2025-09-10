import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Brain,
  Heart,
  Zap,
  Calendar,
  BarChart3,
  Activity,
  Award
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    tasksCompleted: number;
    focusTime: number;
    productivityScore: number;
    mood?: number;
    energy?: number;
  }>;
  weeklyTrends: {
    completionRate: number;
    averageFocusTime: number;
    streakDays: number;
    burnoutRisk: 'low' | 'medium' | 'high' | 'critical';
  };
  categoryBreakdown: Array<{
    category: string;
    timeSpent: number;
    tasksCompleted: number;
    color: string;
  }>;
  timeDistribution: Array<{
    hour: number;
    productivity: number;
    focusTime: number;
  }>;
}

const BurnoutIndicator: React.FC<{
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
}> = ({ level, score }) => {
  const getColor = () => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
    }
  };

  const getIcon = () => {
    switch (level) {
      case 'low': return <CheckCircle2 className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <Heart className="w-5 h-5" />;
    }
  };

  const getRecommendations = () => {
    switch (level) {
      case 'low': return ['Great work-life balance!', 'Keep maintaining your current pace'];
      case 'medium': return ['Consider taking more breaks', 'Try shorter work sessions'];
      case 'high': return ['Take a longer break today', 'Reduce your daily task load', 'Focus on high-priority items only'];
      case 'critical': return ['Take a full day off', 'Speak with someone about your workload', 'Consider professional help if stress persists'];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn('text-sm flex items-center gap-2', getColor())}>
          {getIcon()}
          Burnout Risk: {level.charAt(0).toUpperCase() + level.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Stress Level</span>
            <span>{score}/100</span>
          </div>
          <Progress 
            value={score} 
            className={cn(
              'h-2',
              level === 'critical' ? '[&>div]:bg-red-500' :
              level === 'high' ? '[&>div]:bg-orange-500' :
              level === 'medium' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
            )}
          />
        </div>
        
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground">Recommendations:</h4>
          {getRecommendations().map((rec, index) => (
            <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProductivityTrend: React.FC<{
  data: AnalyticsData['dailyStats'];
  timeRange: string;
}> = ({ data, timeRange }) => {
  const trendData = data.slice(-parseInt(timeRange));
  
  const averageScore = trendData.reduce((acc, day) => acc + day.productivityScore, 0) / trendData.length;
  const trend = trendData.length > 1 
    ? trendData[trendData.length - 1].productivityScore - trendData[0].productivityScore
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Productivity Trend</CardTitle>
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={cn(
              'text-sm font-medium',
              trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value}%`, 'Productivity Score']}
              />
              <Area 
                type="monotone" 
                dataKey="productivityScore" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Average Score</span>
            <p className="font-semibold">{averageScore.toFixed(1)}%</p>
          </div>
          <div>
            <span className="text-muted-foreground">Best Day</span>
            <p className="font-semibold">
              {Math.max(...trendData.map(d => d.productivityScore)).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FocusTimeAnalysis: React.FC<{
  data: AnalyticsData['timeDistribution'];
}> = ({ data }) => {
  const peakHours = data
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Focus Time Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                fontSize={12}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => `${value}:00`}
                formatter={(value: number, name: string) => [
                  name === 'productivity' ? `${value}%` : `${value}m`,
                  name === 'productivity' ? 'Productivity' : 'Focus Time'
                ]}
              />
              <Bar dataKey="focusTime" fill="#10B981" />
              <Bar dataKey="productivity" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Peak Productivity Hours:</h4>
          <div className="flex gap-2">
            {peakHours.map((hour, index) => (
              <Badge key={hour.hour} variant="secondary" className="text-xs">
                #{index + 1} {hour.hour}:00 ({hour.productivity}%)
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TaskCategoryBreakdown: React.FC<{
  data: AnalyticsData['categoryBreakdown'];
}> = ({ data }) => {
  const totalTime = data.reduce((acc, cat) => acc + cat.timeSpent, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          Task Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="timeSpent"
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                fontSize={12}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}m`, 'Time Spent']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          {data.map(category => (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.category}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {category.timeSpent}m ({((category.timeSpent / totalTime) * 100).toFixed(0)}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductivityAnalytics: React.FC = () => {
  const { 
    tasks,
    focusSessions,
    getTasksCompletedToday,
    getTasksCompletedThisWeek,
    getTotalFocusTimeToday,
    getProductivityScore,
    getStreakDays
  } = useTaskStore();

  const [timeRange, setTimeRange] = useState('7');
  const [selectedMetric, setSelectedMetric] = useState('productivity');

  // Generate mock analytics data (in real app, this would come from stored data)
  const analyticsData: AnalyticsData = useMemo(() => {
    const days = parseInt(timeRange);
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      return {
        date: date.toISOString(),
        tasksCompleted: Math.floor(Math.random() * 8) + 2,
        focusTime: Math.floor(Math.random() * 180) + 60,
        productivityScore: Math.floor(Math.random() * 40) + 60,
        mood: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1
      };
    });

    const weeklyTrends = {
      completionRate: 85,
      averageFocusTime: 120,
      streakDays: getStreakDays(),
      burnoutRisk: 'medium' as const
    };

    const categoryBreakdown = [
      { category: 'Development', timeSpent: 180, tasksCompleted: 12, color: '#3B82F6' },
      { category: 'Meetings', timeSpent: 90, tasksCompleted: 6, color: '#10B981' },
      { category: 'Learning', timeSpent: 60, tasksCompleted: 4, color: '#F59E0B' },
      { category: 'Admin', timeSpent: 45, tasksCompleted: 8, color: '#EF4444' },
      { category: 'Personal', timeSpent: 30, tasksCompleted: 3, color: '#8B5CF6' }
    ];

    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      productivity: hour >= 9 && hour <= 17 
        ? Math.floor(Math.random() * 40) + 60 
        : Math.floor(Math.random() * 30) + 20,
      focusTime: hour >= 9 && hour <= 17 
        ? Math.floor(Math.random() * 60) + 30 
        : Math.floor(Math.random() * 20)
    }));

    return {
      dailyStats,
      weeklyTrends,
      categoryBreakdown,
      timeDistribution
    };
  }, [timeRange, getStreakDays]);

  const currentStats = {
    todayTasks: getTasksCompletedToday(),
    weekTasks: getTasksCompletedThisWeek(),
    todayFocus: getTotalFocusTimeToday(),
    productivityScore: getProductivityScore(),
    streak: getStreakDays()
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productivity Analytics</h2>
          <p className="text-muted-foreground">
            Insights into your work patterns and productivity trends
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-semibold">{currentStats.todayTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-lg font-semibold">{currentStats.weekTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Focus Time</p>
                <p className="text-lg font-semibold">{currentStats.todayFocus}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-semibold">{currentStats.productivityScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-lg font-semibold">{currentStats.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          <ProductivityTrend data={analyticsData.dailyStats} timeRange={timeRange} />
          <FocusTimeAnalysis data={analyticsData.timeDistribution} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <BurnoutIndicator 
            level={analyticsData.weeklyTrends.burnoutRisk} 
            score={65} 
          />
          <TaskCategoryBreakdown data={analyticsData.categoryBreakdown} />
          
          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">{analyticsData.weeklyTrends.completionRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Focus Time</span>
                <span className="font-semibold">{analyticsData.weeklyTrends.averageFocusTime}m</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Days</span>
                <span className="font-semibold">{Math.min(analyticsData.weeklyTrends.streakDays, 7)}/7</span>
              </div>
              
              <Progress 
                value={analyticsData.weeklyTrends.completionRate} 
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                <p className="text-green-600 dark:text-green-400">
                  ✓ Your productivity peaks at 10-11 AM
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  → Consider scheduling important tasks in the morning
                </p>
                <p className="text-yellow-600 dark:text-yellow-400">
                  ⚠ Focus time drops after 3 PM
                </p>
                <p className="text-purple-600 dark:text-purple-400">
                  💡 Try taking a short break around 2 PM
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
