"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  ipcOn: (channel, listener) => electron.ipcRenderer.on(channel, listener),
  ipcOff: (channel, listener) => electron.ipcRenderer.off(channel, listener),
  ipcSend: (channel, ...args) => electron.ipcRenderer.send(channel, ...args),
  ipcInvoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args)
});
electron.contextBridge.exposeInMainWorld("appAPI", {
  // Window management
  restoreMain: () => electron.ipcRenderer.send("restore-main-window"),
  resizeOverlay: () => electron.ipcRenderer.send("resize-overlay"),
  // Popup windows
  showTasksPopup: () => electron.ipcRenderer.send("show-tasks-popup"),
  showMetricsPopup: () => electron.ipcRenderer.send("show-metrics-popup"),
  closePopups: () => electron.ipcRenderer.send("close-popups"),
  // Tracking control
  startTracking: () => electron.ipcRenderer.send("start-tracking"),
  stopTracking: () => electron.ipcRenderer.send("stop-tracking"),
  // Open path
  openPath: (filePath) => electron.ipcRenderer.invoke("app:openPath", filePath),
  getAISuggestion: () => electron.ipcRenderer.invoke("ai:getSuggestion"),
  // Blitz mode
  showOverlay: () => electron.ipcRenderer.send("overlay:show"),
  hideOverlay: () => electron.ipcRenderer.send("overlay:hide")
});
electron.contextBridge.exposeInMainWorld("timerAPI", {
  // Timer control methods
  startTimer: (duration, sessionName) => electron.ipcRenderer.invoke("start-timer", { duration, sessionName }),
  pauseTimer: () => electron.ipcRenderer.invoke("pause-timer"),
  resumeTimer: () => electron.ipcRenderer.invoke("resume-timer"),
  stopTimer: () => electron.ipcRenderer.invoke("stop-timer"),
  getTimerState: () => electron.ipcRenderer.invoke("get-timer-state"),
  updateSessionName: (sessionName) => electron.ipcRenderer.invoke("update-session-name", sessionName),
  // Timer event listeners
  onTimerUpdate: (callback) => electron.ipcRenderer.on("timer-update", callback),
  removeTimerUpdateListener: (callback) => electron.ipcRenderer.removeListener("timer-update", callback),
  onTimerComplete: (callback) => electron.ipcRenderer.on("timer-complete", callback),
  removeTimerCompleteListener: (callback) => electron.ipcRenderer.removeListener("timer-complete", callback),
  // Timer control event listeners
  onPauseTimer: (callback) => electron.ipcRenderer.on("pause-timer", callback),
  removePauseTimerListener: (callback) => electron.ipcRenderer.removeListener("pause-timer", callback),
  onResumeTimer: (callback) => electron.ipcRenderer.on("resume-timer", callback),
  removeResumeTimerListener: (callback) => electron.ipcRenderer.removeListener("resume-timer", callback),
  // Legacy methods (consider deprecating)
  updateTimerState: (state) => electron.ipcRenderer.send("update-timer-state", state)
});
electron.contextBridge.exposeInMainWorld("dbAPI", {
  // Dashboard data
  getDashboardData: () => electron.ipcRenderer.invoke("db:getDashboardData"),
  // Project management
  createProject: (data) => electron.ipcRenderer.invoke("db:createProject", data),
  // Session management
  startSession: (data) => electron.ipcRenderer.invoke("db:startSession", data),
  endSession: (data) => electron.ipcRenderer.invoke("db:endSession", data),
  // Shutdown ritual
  saveDailyShutdown: (data) => electron.ipcRenderer.invoke("db:saveDailyShutdown", data),
  getDailyShutdown: (date) => electron.ipcRenderer.invoke("db:getDailyShutdown", date),
  // Reports
  generateReport: () => electron.ipcRenderer.invoke("db:generateReport"),
  // Tasks
  getTodayTasks: () => electron.ipcRenderer.invoke("tasks:getToday"),
  createTask: (payload) => electron.ipcRenderer.invoke("tasks:create", payload),
  updateTask: (id, changes) => electron.ipcRenderer.invoke("tasks:update", id, changes),
  startTask: (id) => electron.ipcRenderer.invoke("tasks:start", id),
  stopTask: (id, complete) => electron.ipcRenderer.invoke("tasks:stop", id, complete)
});
