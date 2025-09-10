// Core types for the Timey productivity application
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  urgency: UrgencyLevel;
  importance: ImportanceLevel;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  projectId?: string;
  listId?: string;
  parentTaskId?: string; // for subtasks
  subtasks: Task[];
  tags: string[];
  notes?: string;
  contextLinks: ContextLink[];
  streak?: number;
  momentum?: number;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  focusSessionsCompleted?: number;
  pomodoroSessionsCompleted?: number;
}

export interface TaskList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  isArchived: boolean;
  sortOrder: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  lists: TaskList[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  settings: ProjectSettings;
  analytics: ProjectAnalytics;
}

export interface ContextLink {
  id: string;
  title: string;
  url: string;
  type: 'website' | 'file' | 'app' | 'document';
  autoOpen?: boolean;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endDate?: Date;
  maxOccurrences?: number;
}

export interface ProjectSettings {
  defaultPomodoroLength: number; // minutes
  defaultShortBreak: number; // minutes
  defaultLongBreak: number; // minutes
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface ProjectAnalytics {
  totalTasksCompleted: number;
  totalTimeSpent: number; // minutes
  averageTaskCompletionTime: number; // minutes
  streakDays: number;
  longestStreak: number;
  completionRate: number; // percentage
  burnoutRisk: BurnoutLevel;
  productivityTrend: 'up' | 'down' | 'stable';
  weeklyGoalProgress: number; // percentage
}

export interface FocusSession {
  id: string;
  taskId?: string;
  projectId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  type: 'pomodoro' | 'deep-work' | 'break';
  completed: boolean;
  interrupted: boolean;
  interruptionCount: number;
  notes?: string;
  appUsage: AppUsageData[];
}

export interface AppUsageData {
  appName: string;
  appBundle?: string;
  timeSpent: number; // seconds
  windowTitle?: string;
  category: AppCategory;
  isProductive: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  keyboardShortcuts: KeyboardShortcuts;
  focusMode: FocusSettings;
  analytics: AnalyticsSettings;
  integrations: IntegrationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  pomodoroComplete: boolean;
  breakReminder: boolean;
  taskDue: boolean;
  dailyGoal: boolean;
  weeklyReport: boolean;
  soundEnabled: boolean;
  volume: number; // 0-100
}

export interface KeyboardShortcuts {
  startTimer: string;
  pauseTimer: string;
  stopTimer: string;
  quickAddTask: string;
  focusMode: string;
  switchProject: string;
  openSettings: string;
}

export interface FocusSettings {
  enabled: boolean;
  blockDistractions: boolean;
  blockedApps: string[];
  blockedWebsites: string[];
  allowBreakApps: string[];
  showFloatingTimer: boolean;
  timerPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  timerOpacity: number; // 0-100
}

export interface AnalyticsSettings {
  trackAppUsage: boolean;
  trackWebsiteUsage: boolean;
  trackKeystrokes: boolean;
  trackMouseClicks: boolean;
  dataRetentionDays: number;
  shareAnonymousData: boolean;
}

export interface IntegrationSettings {
  notion: NotionIntegration;
  googleCalendar: GoogleCalendarIntegration;
  trello: TrelloIntegration;
  asana: AsanaIntegration;
  figma: FigmaIntegration;
  appleWatch: AppleWatchIntegration;
}

export interface NotionIntegration {
  enabled: boolean;
  apiKey?: string;
  databaseId?: string;
  syncTasks: boolean;
  syncProjects: boolean;
  lastSync?: Date;
}

export interface GoogleCalendarIntegration {
  enabled: boolean;
  accessToken?: string;
  calendarId?: string;
  syncEvents: boolean;
  createTasksFromEvents: boolean;
  lastSync?: Date;
}

export interface TrelloIntegration {
  enabled: boolean;
  apiKey?: string;
  token?: string;
  boardId?: string;
  syncCards: boolean;
  lastSync?: Date;
}

export interface AsanaIntegration {
  enabled: boolean;
  accessToken?: string;
  workspaceId?: string;
  projectId?: string;
  syncTasks: boolean;
  lastSync?: Date;
}

export interface FigmaIntegration {
  enabled: boolean;
  accessToken?: string;
  teamId?: string;
  syncComments: boolean;
  lastSync?: Date;
}

export interface AppleWatchIntegration {
  enabled: boolean;
  syncTimers: boolean;
  showNotifications: boolean;
  hapticFeedback: boolean;
}

export interface DailyStats {
  date: Date;
  tasksCompleted: number;
  totalFocusTime: number; // minutes
  pomodoroSessionsCompleted: number;
  averageFocusSessionLength: number; // minutes
  distractionCount: number;
  productivityScore: number; // 0-100
  mood?: MoodLevel;
  energyLevel?: EnergyLevel;
  appUsage: AppUsageData[];
  topProductiveApps: string[];
  topDistractingApps: string[];
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalTasksCompleted: number;
  totalFocusTime: number; // minutes
  averageDailyProductivity: number; // 0-100
  streakDays: number;
  goalsAchieved: number;
  burnoutRisk: BurnoutLevel;
  recommendations: string[];
  topAchievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: AchievementCategory;
  points: number;
}

// Enums and Union Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type ImportanceLevel = 'low' | 'medium' | 'high';
export type BurnoutLevel = 'low' | 'medium' | 'high' | 'critical';
export type MoodLevel = 'terrible' | 'bad' | 'okay' | 'good' | 'excellent';
export type EnergyLevel = 'exhausted' | 'tired' | 'normal' | 'energetic' | 'peak';
export type AppCategory = 'productive' | 'communication' | 'entertainment' | 'social' | 'development' | 'design' | 'other';
export type AchievementCategory = 'focus' | 'productivity' | 'consistency' | 'milestone' | 'special';

// Eisenhower Matrix Quadrants
export interface EisenhowerQuadrant {
  id: 'do' | 'decide' | 'delegate' | 'delete';
  name: string;
  description: string;
  color: string;
  tasks: Task[];
}

export type EisenhowerMatrix = {
  do: Task[];      // Urgent + Important
  decide: Task[];  // Not Urgent + Important  
  delegate: Task[]; // Urgent + Not Important
  delete: Task[];   // Not Urgent + Not Important
};

// Timer States
export interface TimerState {
  timeLeft: number | null;
  isActive: boolean;
  sessionName: string;
  progress: number;
  totalTime?: number;
  currentTask?: Task;
  sessionType: 'pomodoro' | 'short-break' | 'long-break' | 'deep-work';
  cycleCount: number;
  isInFocusMode: boolean;
}

// Quick Capture
export interface QuickCapture {
  text: string;
  createdAt: Date;
  processed: boolean;
  suggestedProject?: string;
  suggestedPriority?: TaskPriority;
  suggestedDueDate?: Date;
}
