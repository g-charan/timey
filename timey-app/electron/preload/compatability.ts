import { contextBridge } from "electron";

// Re-expose dbAPI as 'db' for backward compatibility
contextBridge.exposeInMainWorld("db", {
  getDashboardData: () => window.dbAPI.getDashboardData(),
  createProject: (data: { id: string; name: string; color?: string }) =>
    window.dbAPI.createProject(data),
  startSession: (data: {
    id: string;
    project_id?: string;
    task?: string;
    planned_duration?: number;
  }) => window.dbAPI.startSession(data),
  endSession: (data: { id: string; focus_score?: number; tags?: string[] }) =>
    window.dbAPI.endSession(data),
});

// Extend electronAPI with timer and app methods for backward compatibility
const originalElectronAPI = window.electronAPI;
contextBridge.exposeInMainWorld("electronAPI", {
  ...originalElectronAPI,

  // Timer methods from timerAPI
  startTimer: window.timerAPI.startTimer,
  pauseTimer: window.timerAPI.pauseTimer,
  resumeTimer: window.timerAPI.resumeTimer,
  stopTimer: window.timerAPI.stopTimer,
  getTimerState: window.timerAPI.getTimerState,
  updateSessionName: window.timerAPI.updateSessionName,
  onTimerUpdate: window.timerAPI.onTimerUpdate,
  removeTimerUpdateListener: window.timerAPI.removeTimerUpdateListener,
  onTimerComplete: window.timerAPI.onTimerComplete,
  removeTimerCompleteListener: window.timerAPI.removeTimerCompleteListener,
  updateTimerState: window.timerAPI.updateTimerState,
  onPauseTimer: window.timerAPI.onPauseTimer,
  removePauseTimerListener: window.timerAPI.removePauseTimerListener,
  onResumeTimer: window.timerAPI.onResumeTimer,
  removeResumeTimerListener: window.timerAPI.removeResumeTimerListener,

  // App methods from appAPI
  restoreMain: window.appAPI.restoreMain,
  resizeOverlay: window.appAPI.resizeOverlay,
  startTracking: window.appAPI.startTracking,
  stopTracking: window.appAPI.stopTracking,
});
