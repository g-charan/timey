import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trophy,
  Flame,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Rocket,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Gift,
  Sparkles,
  Medal
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { Achievement, AchievementCategory } from '@/types';
import { cn } from '@/lib/utils';

interface Streak {
  id: string;
  name: string;
  description: string;
  currentCount: number;
  bestCount: number;
  icon: React.ReactNode;
  color: string;
  target: number;
  unit: string;
}

interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  perks: string[];
}

interface XPGain {
  id: string;
  action: string;
  amount: number;
  timestamp: Date;
  multiplier?: number;
}

const levels: Level[] = [
  { level: 1, name: 'Novice', minXP: 0, maxXP: 100, color: '#6B7280', perks: ['Basic task management'] },
  { level: 2, name: 'Apprentice', minXP: 100, maxXP: 300, color: '#10B981', perks: ['Pomodoro timer', 'Basic analytics'] },
  { level: 3, name: 'Practitioner', minXP: 300, maxXP: 600, color: '#3B82F6', perks: ['Focus mode', 'Advanced analytics'] },
  { level: 4, name: 'Expert', minXP: 600, maxXP: 1000, color: '#8B5CF6', perks: ['Custom themes', 'Integrations'] },
  { level: 5, name: 'Master', minXP: 1000, maxXP: 1500, color: '#F59E0B', perks: ['AI insights', 'Team features'] },
  { level: 6, name: 'Grandmaster', minXP: 1500, maxXP: 2500, color: '#EF4444', perks: ['Priority support', 'Beta features'] },
  { level: 7, name: 'Legend', minXP: 2500, maxXP: 99999, color: '#EC4899', perks: ['Exclusive content', 'Lifetime access'] }
];

const achievements: Achievement[] = [
  {
    id: 'first-task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    unlockedAt: new Date(),
    category: 'milestone',
    points: 10
  },
  {
    id: 'streak-3',
    title: 'On Fire',
    description: 'Complete tasks for 3 days in a row',
    icon: '🔥',
    unlockedAt: new Date(),
    category: 'consistency',
    points: 25
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 10 focus sessions',
    icon: '🧠',
    unlockedAt: new Date(),
    category: 'focus',
    points: 50
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a task before 8 AM',
    icon: '🌅',
    unlockedAt: new Date(),
    category: 'special',
    points: 15
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    unlockedAt: new Date(),
    category: 'special',
    points: 15
  },
  {
    id: 'productive-100',
    title: 'Century Club',
    description: 'Reach 100% productivity score',
    icon: '💯',
    unlockedAt: new Date(),
    category: 'productivity',
    points: 100
  }
];

const AchievementCard: React.FC<{
  achievement: Achievement;
  isNew?: boolean;
}> = ({ achievement, isNew }) => {
  const getCategoryColor = (category: AchievementCategory) => {
    switch (category) {
      case 'focus': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'productivity': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'consistency': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'special': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
    }
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      isNew && 'ring-2 ring-yellow-400 shadow-lg animate-pulse'
    )}>
      {isNew && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-yellow-500 text-yellow-50 animate-bounce">
            NEW!
          </Badge>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{achievement.icon}</div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
            <p className="text-xs text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn('text-xs', getCategoryColor(achievement.category))}
              >
                {achievement.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3" />
                <span>{achievement.points} XP</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StreakCard: React.FC<{
  streak: Streak;
}> = ({ streak }) => {
  const progress = (streak.currentCount / streak.target) * 100;
  const isCompleted = streak.currentCount >= streak.target;

  return (
    <Card className={cn(
      'transition-all duration-300',
      isCompleted && 'ring-2 ring-green-400 bg-green-50/50 dark:bg-green-950/20'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', `bg-${streak.color}-100 dark:bg-${streak.color}-900/20`)}>
            {streak.icon}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{streak.name}</h4>
            <p className="text-xs text-muted-foreground">{streak.description}</p>
          </div>
          
          {isCompleted && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Current: {streak.currentCount} {streak.unit}</span>
            <span className="text-muted-foreground">
              Best: {streak.bestCount} {streak.unit}
            </span>
          </div>
          
          <Progress 
            value={Math.min(progress, 100)} 
            className={cn(
              'h-2',
              isCompleted && '[&>div]:bg-green-500'
            )}
          />
          
          <div className="text-xs text-muted-foreground text-center">
            {streak.currentCount}/{streak.target} {streak.unit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LevelProgress: React.FC<{
  currentXP: number;
  currentLevel: Level;
  nextLevel?: Level;
}> = ({ currentXP, currentLevel, nextLevel }) => {
  const progressInLevel = currentXP - currentLevel.minXP;
  const levelRange = currentLevel.maxXP - currentLevel.minXP;
  const progress = (progressInLevel / levelRange) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Crown className="w-4 h-4" style={{ color: currentLevel.color }} />
          Level {currentLevel.level}: {currentLevel.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: currentLevel.color }}>
            {currentXP}
          </div>
          <div className="text-xs text-muted-foreground">Total XP</div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to {nextLevel?.name || 'Max Level'}</span>
            <span>{nextLevel ? `${currentLevel.maxXP - currentXP} XP to go` : 'Max Level!'}</span>
          </div>
          
          <Progress 
            value={nextLevel ? progress : 100} 
            className="h-3"
            style={{ 
              '--progress-background': currentLevel.color 
            } as React.CSSProperties}
          />
        </div>
        
        <div className="space-y-1">
          <h5 className="text-xs font-medium text-muted-foreground">Level Perks:</h5>
          {currentLevel.perks.map((perk, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const XPFeed: React.FC<{
  recentXP: XPGain[];
}> = ({ recentXP }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Recent XP Gains
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {recentXP.length > 0 ? (
          recentXP.slice(0, 5).map((xp) => (
            <div key={xp.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-sm">{xp.action}</span>
                {xp.multiplier && xp.multiplier > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {xp.multiplier}x
                  </Badge>
                )}
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                +{xp.amount} XP
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Complete tasks to earn XP!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MomentumBuilder: React.FC = () => {
  const { 
    getTasksCompletedToday,
    getTasksCompletedThisWeek,
    getTotalFocusTimeToday,
    getStreakDays
  } = useTaskStore();

  const [currentXP, setCurrentXP] = useState(750);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [recentXP, setRecentXP] = useState<XPGain[]>([
    {
      id: '1',
      action: 'Completed "Review quarterly goals"',
      amount: 25,
      timestamp: new Date(),
      multiplier: 1
    },
    {
      id: '2',
      action: 'Finished 25-minute focus session',
      amount: 15,
      timestamp: new Date(),
      multiplier: 2
    },
    {
      id: '3',
      action: 'Maintained 3-day streak',
      amount: 50,
      timestamp: new Date()
    }
  ]);

  const currentLevel = levels.find(level => 
    currentXP >= level.minXP && currentXP < level.maxXP
  ) || levels[0];
  
  const nextLevel = levels.find(level => level.level === currentLevel.level + 1);

  const streaks: Streak[] = [
    {
      id: 'daily-tasks',
      name: 'Daily Momentum',
      description: 'Complete tasks every day',
      currentCount: getStreakDays(),
      bestCount: Math.max(getStreakDays(), 12),
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      color: 'orange',
      target: 7,
      unit: 'days'
    },
    {
      id: 'focus-sessions',
      name: 'Focus Streak',
      description: 'Complete focus sessions consistently',
      currentCount: 5,
      bestCount: 15,
      icon: <Target className="w-4 h-4 text-blue-500" />,
      color: 'blue',
      target: 10,
      unit: 'sessions'
    },
    {
      id: 'early-completion',
      name: 'Early Bird',
      description: 'Complete tasks before noon',
      currentCount: 3,
      bestCount: 8,
      icon: <Clock className="w-4 h-4 text-green-500" />,
      color: 'green',
      target: 5,
      unit: 'days'
    }
  ];

  // Simulate XP gain when tasks are completed
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random XP gains for demo
      if (Math.random() > 0.8) {
        const actions = [
          'Completed a task',
          'Finished focus session',
          'Reached daily goal',
          'Maintained streak'
        ];
        
        const newXP: XPGain = {
          id: Date.now().toString(),
          action: actions[Math.floor(Math.random() * actions.length)],
          amount: Math.floor(Math.random() * 30) + 10,
          timestamp: new Date(),
          multiplier: Math.random() > 0.7 ? 2 : 1
        };
        
        setRecentXP(prev => [newXP, ...prev].slice(0, 10));
        setCurrentXP(prev => prev + newXP.amount * (newXP.multiplier || 1));
        
        // Check for level up
        const newLevel = levels.find(level => 
          (prev + newXP.amount) >= level.minXP && (prev + newXP.amount) < level.maxXP
        );
        
        if (newLevel && newLevel.level > currentLevel.level) {
          // Show level up celebration
          console.log('Level up!', newLevel);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentLevel]);

  const todayStats = {
    tasksCompleted: getTasksCompletedToday(),
    focusTime: getTotalFocusTimeToday(),
    streak: getStreakDays()
  };

  return (
    <div className="space-y-6">
      {/* Achievement Unlock Dialog */}
      <Dialog open={!!showAchievement} onOpenChange={() => setShowAchievement(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🏆</div>
              <DialogTitle className="text-xl">Achievement Unlocked!</DialogTitle>
              {showAchievement && (
                <>
                  <div className="text-4xl">{showAchievement.icon}</div>
                  <h3 className="text-lg font-semibold">{showAchievement.title}</h3>
                  <DialogDescription className="text-center">
                    {showAchievement.description}
                  </DialogDescription>
                  <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">+{showAchievement.points} XP</span>
                  </div>
                </>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Momentum & Achievements</h2>
          <p className="text-muted-foreground">
            Track your progress, build streaks, and unlock achievements
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAchievement(achievements[0])}
          className="flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          View All Achievements
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {todayStats.tasksCompleted}
                  </div>
                  <div className="text-xs text-muted-foreground">Tasks Completed</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {todayStats.focusTime}m
                  </div>
                  <div className="text-xs text-muted-foreground">Focus Time</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-6 h-6" />
                    {todayStats.streak}
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Streaks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {streaks.map(streak => (
                <StreakCard key={streak.id} streak={streak} />
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Achievements</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.slice(0, 4).map((achievement, index) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement}
                  isNew={index === 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Level Progress */}
          <LevelProgress 
            currentXP={currentXP}
            currentLevel={currentLevel}
            nextLevel={nextLevel}
          />

          {/* XP Feed */}
          <XPFeed recentXP={recentXP} />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Achievements</span>
                <span className="font-semibold">{achievements.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Longest Streak</span>
                <span className="font-semibold">
                  {Math.max(...streaks.map(s => s.bestCount))} days
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Level</span>
                <Badge style={{ backgroundColor: currentLevel.color, color: 'white' }}>
                  {currentLevel.name}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="font-semibold">{currentXP}</span>
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-4 text-center">
              <Rocket className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-sm mb-1">Keep Going!</h4>
              <p className="text-xs text-muted-foreground mb-3">
                You're {nextLevel ? `${currentLevel.maxXP - currentXP} XP away` : 'at max level!'} 
                {nextLevel && ` from reaching ${nextLevel.name}`}
              </p>
              <Button size="sm" className="w-full">
                <Target className="w-3 h-3 mr-1" />
                Start Focus Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
