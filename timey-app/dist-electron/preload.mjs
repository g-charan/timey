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
  ipcInvoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
  // Application specific methods
  restoreMain: () => electron.ipcRenderer.send("restore-main-window"),
  resizeOverlay: () => electron.ipcRenderer.send("resize-overlay"),
  startTracking: () => electron.ipcRenderer.send("start-tracking"),
  stopTracking: () => electron.ipcRenderer.send("stop-tracking"),
  // Updated Timer-related methods (centralized timer)
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
  // Legacy methods for backward compatibility (if needed)
  updateTimerState: (state) => electron.ipcRenderer.send("update-timer-state", state),
  // Timer control event listeners (for main window) - these might not be needed with centralized timer
  onPauseTimer: (callback) => electron.ipcRenderer.on("pause-timer", callback),
  removePauseTimerListener: (callback) => electron.ipcRenderer.removeListener("pause-timer", callback),
  onResumeTimer: (callback) => electron.ipcRenderer.on("resume-timer", callback),
  removeResumeTimerListener: (callback) => electron.ipcRenderer.removeListener("resume-timer", callback)
});
electron.contextBridge.exposeInMainWorld("db", {
  getDashboardData: () => electron.ipcRenderer.invoke("db:getDashboardData"),
  createProject: (data) => electron.ipcRenderer.invoke("db:createProject", data),
  startSession: (data) => electron.ipcRenderer.invoke("db:startSession", data),
  endSession: (data) => electron.ipcRenderer.invoke("db:endSession", data)
});
