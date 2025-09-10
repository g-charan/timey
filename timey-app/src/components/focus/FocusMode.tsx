import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Play,
  Pause,
  Square,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Target,
  Zap,
  Clock,
  Flame,
  Shield,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useTimer } from '@/context/TimerContext';
import { Task, FocusSession } from '@/types';
import { cn } from '@/lib/utils';

interface FocusModeSettings {
  blockDistractions: boolean;
  blockedApps: string[];
  blockedWebsites: string[];
  allowBreakApps: string[];
  showFloatingTimer: boolean;
  timerPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  timerOpacity: number;
  soundEnabled: boolean;
  volume: number;
  autoStartBreaks: boolean;
  strictMode: boolean;
}

const FloatingTimer: React.FC<{
  timeLeft: number;
  totalTime: number;
  sessionName: string;
  isActive: boolean;
  position: string;
  opacity: number;
  onToggle: () => void;
  onStop: () => void;
}> = ({ timeLeft, totalTime, sessionName, isActive, position, opacity, onToggle, onStop }) => {
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div 
      className={cn(
        'fixed z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 min-w-[200px]',
        positionClasses[position as keyof typeof positionClasses]
      )}
      style={{ opacity: opacity / 100 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-muted-foreground truncate flex-1">
          {sessionName || 'Focus Session'}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="h-6 w-6 p-0"
          >
            <Square className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="text-2xl font-mono font-bold text-center mb-2">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <Progress value={progress} className="h-1" />
      
      <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
        <Flame className="w-3 h-3 mr-1" />
        <span>Stay focused!</span>
      </div>
    </div>
  );
};

const DistractionBlocker: React.FC<{
  isActive: boolean;
  blockedApps: string[];
  blockedWebsites: string[];
  strictMode: boolean;
}> = ({ isActive, blockedApps, blockedWebsites, strictMode }) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-96 mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">Focus Mode Active</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distractions are blocked to help you stay focused
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockedApps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4" />
                <span className="text-sm font-medium">Blocked Apps</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {blockedApps.slice(0, 5).map(app => (
                  <Badge key={app} variant="secondary" className="text-xs">
                    {app}
                  </Badge>
                ))}
                {blockedApps.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{blockedApps.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {blockedWebsites.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Blocked Websites</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {blockedWebsites.slice(0, 5).map(site => (
                  <Badge key={site} variant="secondary" className="text-xs">
                    {site}
                  </Badge>
                ))}
                {blockedWebsites.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{blockedWebsites.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              {strictMode 
                ? "Strict mode: No exceptions allowed during focus time"
                : "Take a break if you really need to access blocked content"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AppUsageTracker: React.FC<{
  currentSession: FocusSession | null;
}> = ({ currentSession }) => {
  const [topApps, setTopApps] = useState<Array<{name: string, time: number, category: string}>>([]);

  // Simulate app usage tracking (in real implementation, this would come from system APIs)
  useEffect(() => {
    if (!currentSession) return;

    const interval = setInterval(() => {
      // Simulate tracking current app usage
      const mockApps = [
        { name: 'VS Code', time: Math.random() * 300, category: 'productive' },
        { name: 'Chrome', time: Math.random() * 200, category: 'mixed' },
        { name: 'Slack', time: Math.random() * 100, category: 'communication' },
        { name: 'Spotify', time: Math.random() * 50, category: 'entertainment' },
        { name: 'Terminal', time: Math.random() * 150, category: 'productive' }
      ];
      
      setTopApps(mockApps.sort((a, b) => b.time - a.time).slice(0, 5));
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSession]);

  if (!currentSession || topApps.length === 0) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productive': return 'text-green-600 dark:text-green-400';
      case 'communication': return 'text-blue-600 dark:text-blue-400';
      case 'entertainment': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          App Usage This Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topApps.map((app, index) => (
            <div key={app.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium">{app.name}</span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getCategoryColor(app.category))}
                >
                  {app.category}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(app.time)}s
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const FocusMode: React.FC = () => {
  const { 
    tasks, 
    currentSession, 
    startFocusSession, 
    endFocusSession,
    getTasksCompletedToday,
    getTotalFocusTimeToday,
    getProductivityScore,
    getStreakDays
  } = useTaskStore();
  
  const { 
    timeLeft, 
    isActive, 
    sessionName, 
    progress, 
    totalTime,
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer 
  } = useTimer();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessionType, setSessionType] = useState<'pomodoro' | 'deep-work'>('pomodoro');
  const [settings, setSettings] = useState<FocusModeSettings>({
    blockDistractions: false,
    blockedApps: ['Twitter', 'Instagram', 'TikTok', 'YouTube', 'Reddit'],
    blockedWebsites: ['twitter.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'reddit.com'],
    allowBreakApps: ['Music', 'Calendar', 'Notes'],
    showFloatingTimer: true,
    timerPosition: 'top-right',
    timerOpacity: 90,
    soundEnabled: true,
    volume: 70,
    autoStartBreaks: false,
    strictMode: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isInFocusMode, setIsInFocusMode] = useState(false);

  const availableTasks = tasks.filter(task => !task.completed);
  const todayStats = {
    tasksCompleted: getTasksCompletedToday(),
    focusTime: getTotalFocusTimeToday(),
    productivityScore: getProductivityScore(),
    streak: getStreakDays()
  };

  const handleStartFocus = () => {
    if (selectedTask) {
      startFocusSession(selectedTask.id, sessionDuration, sessionType);
      startTimer(sessionDuration, selectedTask.title);
    } else {
      startFocusSession(undefined, sessionDuration, sessionType);
      startTimer(sessionDuration, `${sessionType === 'pomodoro' ? 'Pomodoro' : 'Deep Work'} Session`);
    }
    setIsInFocusMode(true);
  };

  const handlePauseResume = () => {
    if (isActive) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  const handleStop = () => {
    resetTimer();
    endFocusSession(false);
    setIsInFocusMode(false);
  };

  const handleComplete = () => {
    resetTimer();
    endFocusSession(true);
    setIsInFocusMode(false);
    
    // Mark task as completed if one was selected
    if (selectedTask) {
      // This would be handled by the task store
    }
  };

  // Auto-complete session when timer reaches zero
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      handleComplete();
    }
  }, [timeLeft, isActive]);

  return (
    <div className="space-y-6">
      {/* Floating Timer */}
      {settings.showFloatingTimer && isActive && timeLeft !== null && (
        <FloatingTimer
          timeLeft={timeLeft}
          totalTime={totalTime || sessionDuration * 60}
          sessionName={sessionName}
          isActive={isActive}
          position={settings.timerPosition}
          opacity={settings.timerOpacity}
          onToggle={handlePauseResume}
          onStop={handleStop}
        />
      )}

      {/* Distraction Blocker */}
      <DistractionBlocker
        isActive={isInFocusMode && settings.blockDistractions}
        blockedApps={settings.blockedApps}
        blockedWebsites={settings.blockedWebsites}
        strictMode={settings.strictMode}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Focus Mode</h2>
          <p className="text-muted-foreground">
            Enter deep work state with distraction blocking and progress tracking
          </p>
        </div>
        
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Focus Mode Settings</DialogTitle>
              <DialogDescription>
                Customize your focus experience for maximum productivity
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Distraction Blocking */}
              <div className="space-y-4">
                <h4 className="font-medium">Distraction Blocking</h4>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="block-distractions"
                    checked={settings.blockDistractions}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, blockDistractions: checked }))
                    }
                  />
                  <Label htmlFor="block-distractions">Enable distraction blocking</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="strict-mode"
                    checked={settings.strictMode}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, strictMode: checked }))
                    }
                  />
                  <Label htmlFor="strict-mode">Strict mode (no exceptions)</Label>
                </div>
              </div>

              {/* Timer Display */}
              <div className="space-y-4">
                <h4 className="font-medium">Timer Display</h4>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="floating-timer"
                    checked={settings.showFloatingTimer}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showFloatingTimer: checked }))
                    }
                  />
                  <Label htmlFor="floating-timer">Show floating timer</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Timer Position</Label>
                  <Select
                    value={settings.timerPosition}
                    onValueChange={(value: any) => 
                      setSettings(prev => ({ ...prev, timerPosition: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timer Opacity: {settings.timerOpacity}%</Label>
                  <Slider
                    value={[settings.timerOpacity]}
                    onValueChange={([value]) => 
                      setSettings(prev => ({ ...prev, timerOpacity: value }))
                    }
                    max={100}
                    min={20}
                    step={10}
                  />
                </div>
              </div>

              {/* Audio Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Audio</h4>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                  <Label htmlFor="sound-enabled">Enable sounds</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Volume: {settings.volume}%</Label>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([value]) => 
                      setSettings(prev => ({ ...prev, volume: value }))
                    }
                    max={100}
                    min={0}
                    step={10}
                    disabled={!settings.soundEnabled}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Session Setup */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Start Focus Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task Selection */}
              <div className="space-y-2">
                <Label>Select Task (Optional)</Label>
                <Select
                  value={selectedTask?.id || 'none'}
                  onValueChange={(value) => {
                    const task = availableTasks.find(t => t.id === value);
                    setSelectedTask(task || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task to focus on" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific task</SelectItem>
                    {availableTasks.slice(0, 10).map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            task.priority === 'urgent' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          )} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Type */}
              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select
                  value={sessionType}
                  onValueChange={(value: 'pomodoro' | 'deep-work') => setSessionType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pomodoro">Pomodoro (25 min)</SelectItem>
                    <SelectItem value="deep-work">Deep Work (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration: {sessionDuration} minutes</Label>
                <Slider
                  value={[sessionDuration]}
                  onValueChange={([value]) => setSessionDuration(value)}
                  max={120}
                  min={5}
                  step={5}
                  disabled={sessionType === 'pomodoro'}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2 pt-4">
                {!isActive ? (
                  <Button onClick={handleStartFocus} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Focus Session
                  </Button>
                ) : (
                  <>
                    <Button onClick={handlePauseResume} variant="outline" className="flex-1">
                      {isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button onClick={handleStop} variant="destructive">
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Session Info */}
          {isActive && timeLeft !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <div className="text-sm text-muted-foreground">
                    {sessionName || 'Focus Session'}
                  </div>
                  
                  {selectedTask && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Target className="w-4 h-4" />
                      <span>Working on: {selectedTask.title}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* App Usage Tracker */}
          <AppUsageTracker currentSession={currentSession} />
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <span className="font-semibold">{todayStats.tasksCompleted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="font-semibold">{todayStats.focusTime}m</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productivity Score</span>
                <span className="font-semibold">{todayStats.productivityScore}/100</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Streak
                </span>
                <span className="font-semibold">{todayStats.streak} days</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Zap className="w-4 h-4 mr-2" />
                Quick 5-min focus
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                {settings.blockDistractions ? 'Disable' : 'Enable'} blocking
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Volume2 className="w-4 h-4 mr-2" />
                {settings.soundEnabled ? 'Mute' : 'Unmute'} sounds
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
