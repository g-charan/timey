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
} from '@/components/ui/dialog';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Coffee,
  Target,
  Flame,
  Trophy,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  SkipForward
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useTimer } from '@/context/TimerContext';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // after how many work sessions
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  volume: number;
  adaptiveBreaks: boolean; // adjust break length based on work intensity
  strictMode: boolean; // prevent skipping breaks
}

interface PomodoroSession {
  id: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number;
  completed: boolean;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
}

interface PomodoroStats {
  todayPomodoros: number;
  weekPomodoros: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number; // today in minutes
  averageSessionLength: number;
  completionRate: number; // percentage
}

const PomodoroTimer: React.FC = () => {
  const { 
    tasks, 
    currentSession, 
    startFocusSession, 
    endFocusSession,
    getTasksCompletedToday,
    getTotalFocusTimeToday,
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

  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    volume: 70,
    adaptiveBreaks: true,
    strictMode: false
  });

  const [currentCycle, setCurrentCycle] = useState(1);
  const [sessionType, setSessionType] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const availableTasks = tasks.filter(task => !task.completed);

  // Calculate adaptive break duration based on work intensity
  const getAdaptiveBreakDuration = (workIntensity: number): number => {
    if (!settings.adaptiveBreaks) {
      return currentCycle % settings.longBreakInterval === 0 
        ? settings.longBreakDuration 
        : settings.shortBreakDuration;
    }

    const baseBreak = currentCycle % settings.longBreakInterval === 0 
      ? settings.longBreakDuration 
      : settings.shortBreakDuration;
    
    // Adjust break time based on intensity (0-100)
    const intensityMultiplier = 1 + (workIntensity / 100) * 0.5; // Up to 50% longer breaks
    return Math.round(baseBreak * intensityMultiplier);
  };

  // Calculate Pomodoro statistics
  const calculateStats = (): PomodoroStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(s => 
      s.startTime >= today && s.type === 'work' && s.completed
    );
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekSessions = sessions.filter(s => 
      s.startTime >= weekStart && s.type === 'work' && s.completed
    );

    return {
      todayPomodoros: todaySessions.length,
      weekPomodoros: weekSessions.length,
      currentStreak: getStreakDays(),
      longestStreak: Math.max(getStreakDays(), 0),
      totalFocusTime: getTotalFocusTimeToday(),
      averageSessionLength: todaySessions.length > 0 
        ? todaySessions.reduce((acc, s) => acc + s.duration, 0) / todaySessions.length 
        : 0,
      completionRate: sessions.length > 0 
        ? (sessions.filter(s => s.completed).length / sessions.length) * 100 
        : 0
    };
  };

  const stats = calculateStats();

  const startPomodoroSession = () => {
    const duration = sessionType === 'work' 
      ? settings.workDuration 
      : getAdaptiveBreakDuration(75); // Mock work intensity

    const newSession: PomodoroSession = {
      id: `session-${Date.now()}`,
      type: sessionType,
      duration,
      completed: false,
      taskId: selectedTask?.id,
      startTime: new Date()
    };

    setSessions(prev => [...prev, newSession]);
    
    if (sessionType === 'work') {
      startFocusSession(selectedTask?.id, duration, 'pomodoro');
      startTimer(duration, selectedTask?.title || 'Pomodoro Session');
    } else {
      startTimer(duration, `${sessionType === 'short-break' ? 'Short' : 'Long'} Break`);
    }
  };

  const completeSession = () => {
    const currentSessionData = sessions[sessions.length - 1];
    if (currentSessionData) {
      setSessions(prev => 
        prev.map(s => 
          s.id === currentSessionData.id 
            ? { ...s, completed: true, endTime: new Date() }
            : s
        )
      );
    }

    if (sessionType === 'work') {
      endFocusSession(true);
      setShowBreakDialog(true);
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => {
          setSessionType(currentCycle % settings.longBreakInterval === 0 ? 'long-break' : 'short-break');
          setShowBreakDialog(false);
          startPomodoroSession();
        }, 2000);
      } else {
        setSessionType(currentCycle % settings.longBreakInterval === 0 ? 'long-break' : 'short-break');
      }
    } else {
      setShowCompletionDialog(true);
      setCurrentCycle(prev => prev + 1);
      
      // Auto-start work if enabled
      if (settings.autoStartWork) {
        setTimeout(() => {
          setSessionType('work');
          setShowCompletionDialog(false);
          startPomodoroSession();
        }, 2000);
      } else {
        setSessionType('work');
      }
    }

    resetTimer();
  };

  const skipSession = () => {
    if (settings.strictMode && sessionType !== 'work') {
      return; // Can't skip breaks in strict mode
    }
    
    resetTimer();
    completeSession();
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
    if (sessionType === 'work') {
      endFocusSession(false);
    }
  };

  const handleReset = () => {
    resetTimer();
    setCurrentCycle(1);
    setSessionType('work');
    setSessions([]);
    if (sessionType === 'work') {
      endFocusSession(false);
    }
  };

  // Auto-complete session when timer reaches zero
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      completeSession();
    }
  }, [timeLeft, isActive]);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-red-500';
      case 'short-break': return 'bg-green-500';
      case 'long-break': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'work': return <Target className="w-4 h-4" />;
      case 'short-break': return <Coffee className="w-4 h-4" />;
      case 'long-break': return <Coffee className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Break Start Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Pomodoro Complete!
            </DialogTitle>
            <DialogDescription>
              Great work! Time for a {currentCycle % settings.longBreakInterval === 0 ? 'long' : 'short'} break.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => {
              setShowBreakDialog(false);
              startPomodoroSession();
            }} className="flex-1">
              <Coffee className="w-4 h-4 mr-2" />
              Start Break
            </Button>
            <Button variant="outline" onClick={() => {
              setShowBreakDialog(false);
              setSessionType('work');
            }}>
              Skip Break
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Break Complete Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Break Complete!
            </DialogTitle>
            <DialogDescription>
              Ready to start your next Pomodoro session?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => {
              setShowCompletionDialog(false);
              startPomodoroSession();
            }} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Work
            </Button>
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
              Not Yet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pomodoro Settings</DialogTitle>
            <DialogDescription>
              Customize your Pomodoro technique for optimal productivity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Timer Durations */}
            <div className="space-y-4">
              <h4 className="font-medium">Timer Durations</h4>
              
              <div className="space-y-2">
                <Label>Work Duration: {settings.workDuration} minutes</Label>
                <Slider
                  value={[settings.workDuration]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, workDuration: value }))
                  }
                  max={60}
                  min={15}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Short Break: {settings.shortBreakDuration} minutes</Label>
                <Slider
                  value={[settings.shortBreakDuration]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, shortBreakDuration: value }))
                  }
                  max={15}
                  min={3}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Long Break: {settings.longBreakDuration} minutes</Label>
                <Slider
                  value={[settings.longBreakDuration]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, longBreakDuration: value }))
                  }
                  max={30}
                  min={10}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Long Break Interval: Every {settings.longBreakInterval} pomodoros</Label>
                <Slider
                  value={[settings.longBreakInterval]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, longBreakInterval: value }))
                  }
                  max={8}
                  min={2}
                  step={1}
                />
              </div>
            </div>

            {/* Automation */}
            <div className="space-y-4">
              <h4 className="font-medium">Automation</h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-breaks"
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoStartBreaks: checked }))
                  }
                />
                <Label htmlFor="auto-breaks">Auto-start breaks</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-work"
                  checked={settings.autoStartWork}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoStartWork: checked }))
                  }
                />
                <Label htmlFor="auto-work">Auto-start work sessions</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="adaptive-breaks"
                  checked={settings.adaptiveBreaks}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, adaptiveBreaks: checked }))
                  }
                />
                <Label htmlFor="adaptive-breaks">Adaptive break lengths</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="strict-mode"
                  checked={settings.strictMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, strictMode: checked }))
                  }
                />
                <Label htmlFor="strict-mode">Strict mode (no skipping breaks)</Label>
              </div>
            </div>

            {/* Audio */}
            <div className="space-y-4">
              <h4 className="font-medium">Audio</h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
                <Label htmlFor="sound">Enable sounds</Label>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pomodoro Timer</h2>
          <p className="text-muted-foreground">
            Work in focused intervals with strategic breaks for maximum productivity
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getSessionTypeIcon(sessionType)}
                  {sessionType === 'work' ? 'Work Session' : 
                   sessionType === 'short-break' ? 'Short Break' : 'Long Break'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className={cn('w-2 h-2 rounded-full', getSessionTypeColor(sessionType))} />
                    Cycle {currentCycle}
                  </Badge>
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Task Selection for Work Sessions */}
              {sessionType === 'work' && !isActive && (
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
              )}

              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-mono font-bold">
                  {timeLeft !== null ? (
                    <>
                      {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                      {(timeLeft % 60).toString().padStart(2, '0')}
                    </>
                  ) : (
                    <>
                      {Math.floor((sessionType === 'work' ? settings.workDuration : getAdaptiveBreakDuration(75)) * 60 / 60).toString().padStart(2, '0')}:00
                    </>
                  )}
                </div>
                
                {timeLeft !== null && totalTime && (
                  <Progress value={progress} className="h-2" />
                )}
                
                {selectedTask && sessionType === 'work' && (
                  <div className="text-sm text-muted-foreground">
                    Working on: {selectedTask.title}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                {!isActive ? (
                  <Button onClick={startPomodoroSession} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start {sessionType === 'work' ? 'Pomodoro' : 'Break'}
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
                
                {!settings.strictMode || sessionType === 'work' ? (
                  <Button onClick={skipSession} variant="outline" disabled={!isActive}>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                ) : null}
                
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.filter(s => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return s.startTime >= today;
                }).slice(-8).map((session, index) => (
                  <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', getSessionTypeColor(session.type))} />
                      <span className="text-sm font-medium capitalize">
                        {session.type.replace('-', ' ')}
                      </span>
                      {session.completed ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.duration}m
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No sessions today. Start your first Pomodoro!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pomodoro Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today</span>
                <span className="font-semibold">{stats.todayPomodoros} 🍅</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-semibold">{stats.weekPomodoros} 🍅</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="font-semibold">{stats.totalFocusTime}m</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Streak
                </span>
                <span className="font-semibold">{stats.currentStreak} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">{Math.round(stats.completionRate)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Cycle Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cycle Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: settings.longBreakInterval }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2',
                      i < currentCycle - 1 ? 'bg-green-500 border-green-500' :
                      i === currentCycle - 1 && sessionType === 'work' && isActive ? 'bg-yellow-500 border-yellow-500' :
                      i === currentCycle - 1 ? 'bg-blue-500 border-blue-500' :
                      'border-muted-foreground'
                    )} />
                    <span className="text-sm text-muted-foreground">
                      Pomodoro {i + 1}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-4">
                  <Coffee className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    Long Break after cycle {settings.longBreakInterval}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setSessionType('work');
                  setSettings(prev => ({ ...prev, workDuration: 15 }));
                }}
              >
                <Target className="w-4 h-4 mr-2" />
                Quick 15-min focus
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setSettings(prev => ({ 
                    ...prev, 
                    autoStartBreaks: !prev.autoStartBreaks 
                  }));
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                {settings.autoStartBreaks ? 'Disable' : 'Enable'} auto-breaks
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setSettings(prev => ({ 
                    ...prev, 
                    soundEnabled: !prev.soundEnabled 
                  }));
                }}
              >
                {settings.soundEnabled ? (
                  <VolumeX className="w-4 h-4 mr-2" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-2" />
                )}
                {settings.soundEnabled ? 'Mute' : 'Unmute'} sounds
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
