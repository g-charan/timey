import { ipcRenderer, contextBridge } from "electron";

// Single responsibility: Timer operations and events
contextBridge.exposeInMainWorld("timerAPI", {
  // Timer control methods
  startTimer: (duration: number, sessionName: string) =>
    ipcRenderer.invoke("start-timer", { duration, sessionName }),
  pauseTimer: () => ipcRenderer.invoke("pause-timer"),
  resumeTimer: () => ipcRenderer.invoke("resume-timer"),
  stopTimer: () => ipcRenderer.invoke("stop-timer"),
  getTimerState: () => ipcRenderer.invoke("get-timer-state"),
  updateSessionName: (sessionName: string) =>
    ipcRenderer.invoke("update-session-name", sessionName),

  // Timer event listeners
  onTimerUpdate: (callback: (event: any, state: any) => void) =>
    ipcRenderer.on("timer-update", callback),
  removeTimerUpdateListener: (callback: (event: any, state: any) => void) =>
    ipcRenderer.removeListener("timer-update", callback),

  onTimerComplete: (callback: (event: any, state: any) => void) =>
    ipcRenderer.on("timer-complete", callback),
  removeTimerCompleteListener: (callback: (event: any, state: any) => void) =>
    ipcRenderer.removeListener("timer-complete", callback),

  // Timer control event listeners
  onPauseTimer: (callback: (event: any) => void) =>
    ipcRenderer.on("pause-timer", callback),
  removePauseTimerListener: (callback: (event: any) => void) =>
    ipcRenderer.removeListener("pause-timer", callback),
  onResumeTimer: (callback: (event: any) => void) =>
    ipcRenderer.on("resume-timer", callback),
  removeResumeTimerListener: (callback: (event: any) => void) =>
    ipcRenderer.removeListener("resume-timer", callback),

  // Legacy methods (consider deprecating)
  updateTimerState: (state: any) =>
    ipcRenderer.send("update-timer-state", state),
});
