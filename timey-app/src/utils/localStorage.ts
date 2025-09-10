// Local Storage Utilities for Timey App
export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  // Generic storage methods
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
    }
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  }

  // App-specific storage keys
  static readonly KEYS = {
    TASKS: 'timey_tasks',
    TIMER_STATE: 'timey_timer_state',
    USER_SETTINGS: 'timey_user_settings',
    APP_USAGE: 'timey_app_usage',
    PRODUCTIVITY_STATS: 'timey_productivity_stats',
    FOCUS_SESSIONS: 'timey_focus_sessions',
    ACHIEVEMENTS: 'timey_achievements',
    KEYBOARD_SHORTCUTS: 'timey_keyboard_shortcuts',
    THEME_PREFERENCE: 'timey_theme_preference',
    NOTIFICATION_SETTINGS: 'timey_notification_settings',
    EISENHOWER_MATRIX: 'timey_eisenhower_matrix',
    NOTES: 'timey_notes',
    POMODORO_SETTINGS: 'timey_pomodoro_settings',
    ANALYTICS_DATA: 'timey_analytics_data'
  } as const;

  // Task management
  saveTasks(tasks: any[]): void {
    this.set(LocalStorageManager.KEYS.TASKS, tasks);
  }

  getTasks(): any[] {
    return this.get(LocalStorageManager.KEYS.TASKS, []);
  }

  // Timer state
  saveTimerState(state: any): void {
    this.set(LocalStorageManager.KEYS.TIMER_STATE, state);
  }

  getTimerState(): any {
    return this.get(LocalStorageManager.KEYS.TIMER_STATE, {
      timeLeft: null,
      isActive: false,
      sessionName: '',
      progress: 0,
      totalTime: 0
    });
  }

  // User settings
  saveUserSettings(settings: any): void {
    this.set(LocalStorageManager.KEYS.USER_SETTINGS, settings);
  }

  getUserSettings(): any {
    return this.get(LocalStorageManager.KEYS.USER_SETTINGS, {
      theme: 'system',
      notifications: true,
      soundEnabled: true,
      autoStartBreaks: false,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4
    });
  }

  // App usage tracking
  saveAppUsage(usage: any[]): void {
    this.set(LocalStorageManager.KEYS.APP_USAGE, usage);
  }

  getAppUsage(): any[] {
    return this.get(LocalStorageManager.KEYS.APP_USAGE, []);
  }

  // Productivity statistics
  saveProductivityStats(stats: any): void {
    this.set(LocalStorageManager.KEYS.PRODUCTIVITY_STATS, stats);
  }

  getProductivityStats(): any {
    return this.get(LocalStorageManager.KEYS.PRODUCTIVITY_STATS, {
      totalFocusTime: 0,
      completedTasks: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      averageSessionLength: 0,
      productivityScore: 0,
      weeklyGoal: 0,
      weeklyProgress: 0
    });
  }

  // Focus sessions
  saveFocusSession(session: any): void {
    const sessions = this.getFocusSessions();
    sessions.push({
      ...session,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    this.set(LocalStorageManager.KEYS.FOCUS_SESSIONS, sessions);
  }

  getFocusSessions(): any[] {
    return this.get(LocalStorageManager.KEYS.FOCUS_SESSIONS, []);
  }

  // Achievements
  saveAchievements(achievements: any[]): void {
    this.set(LocalStorageManager.KEYS.ACHIEVEMENTS, achievements);
  }

  getAchievements(): any[] {
    return this.get(LocalStorageManager.KEYS.ACHIEVEMENTS, []);
  }

  // Keyboard shortcuts
  saveKeyboardShortcuts(shortcuts: any): void {
    this.set(LocalStorageManager.KEYS.KEYBOARD_SHORTCUTS, shortcuts);
  }

  getKeyboardShortcuts(): any {
    return this.get(LocalStorageManager.KEYS.KEYBOARD_SHORTCUTS, {
      startTimer: 'Cmd+Enter',
      pauseTimer: 'Space',
      stopTimer: 'Cmd+.',
      newTask: 'Cmd+N',
      toggleOverlay: 'Cmd+Shift+O',
      focusMode: 'Cmd+Shift+F',
      quickCapture: 'Cmd+Shift+C'
    });
  }

  // Theme preference
  saveThemePreference(theme: 'light' | 'dark' | 'system'): void {
    this.set(LocalStorageManager.KEYS.THEME_PREFERENCE, theme);
  }

  getThemePreference(): 'light' | 'dark' | 'system' {
    return this.get(LocalStorageManager.KEYS.THEME_PREFERENCE, 'system');
  }

  // Notification settings
  saveNotificationSettings(settings: any): void {
    this.set(LocalStorageManager.KEYS.NOTIFICATION_SETTINGS, settings);
  }

  getNotificationSettings(): any {
    return this.get(LocalStorageManager.KEYS.NOTIFICATION_SETTINGS, {
      enabled: true,
      soundEnabled: true,
      breakReminders: true,
      taskDeadlines: true,
      achievementAlerts: true,
      focusModeAlerts: true
    });
  }

  // Eisenhower Matrix
  saveEisenhowerMatrix(matrix: any): void {
    this.set(LocalStorageManager.KEYS.EISENHOWER_MATRIX, matrix);
  }

  getEisenhowerMatrix(): any {
    return this.get(LocalStorageManager.KEYS.EISENHOWER_MATRIX, {
      urgent_important: [],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    });
  }

  // Notes
  saveNotes(notes: any[]): void {
    this.set(LocalStorageManager.KEYS.NOTES, notes);
  }

  getNotes(): any[] {
    return this.get(LocalStorageManager.KEYS.NOTES, []);
  }

  // Pomodoro settings
  savePomodoroSettings(settings: any): void {
    this.set(LocalStorageManager.KEYS.POMODORO_SETTINGS, settings);
  }

  getPomodoroSettings(): any {
    return this.get(LocalStorageManager.KEYS.POMODORO_SETTINGS, {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartWork: false,
      soundEnabled: true,
      notificationsEnabled: true
    });
  }

  // Analytics data
  saveAnalyticsData(data: any): void {
    this.set(LocalStorageManager.KEYS.ANALYTICS_DATA, data);
  }

  getAnalyticsData(): any {
    return this.get(LocalStorageManager.KEYS.ANALYTICS_DATA, {
      dailyStats: {},
      weeklyStats: {},
      monthlyStats: {},
      trends: [],
      insights: []
    });
  }

  // Bulk operations
  exportAllData(): any {
    const data: any = {};
    Object.values(LocalStorageManager.KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    return data;
  }

  importAllData(data: any): void {
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(LocalStorageManager.KEYS).includes(key as any)) {
        this.set(key, value);
      }
    });
  }

  // Data migration and versioning
  migrateData(): void {
    const currentVersion = this.get('timey_data_version', '1.0.0');
    
    // Add migration logic here as the app evolves
    if (currentVersion === '1.0.0') {
      // Perform any necessary data migrations
      this.set('timey_data_version', '1.1.0');
    }
  }
}

// Export singleton instance
export const storage = LocalStorageManager.getInstance();
