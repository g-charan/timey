import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

// In src/preload/index.ts
contextBridge.exposeInMainWorld("electronAPI", {
  ipcOn: (channel: string, listener: (event: any, ...args: any[]) => void) =>
    ipcRenderer.on(channel, listener),
  ipcOff: (channel: string, listener: (event: any, ...args: any[]) => void) =>
    ipcRenderer.off(channel, listener),
  ipcSend: (channel: string, ...args: any[]) =>
    ipcRenderer.send(channel, ...args),
  ipcInvoke: (channel: string, ...args: any[]) =>
    ipcRenderer.invoke(channel, ...args),

  // Application specific methods
  restoreMain: () => ipcRenderer.send("restore-main-window"),
  resizeOverlay: () => ipcRenderer.send("resize-overlay"),
  startTracking: () => ipcRenderer.send("start-tracking"),
  stopTracking: () => ipcRenderer.send("stop-tracking"),

  // Updated Timer-related methods (centralized timer)
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

  // Legacy methods for backward compatibility (if needed)
  updateTimerState: (state: any) =>
    ipcRenderer.send("update-timer-state", state),

  // Timer control event listeners (for main window) - these might not be needed with centralized timer
  onPauseTimer: (callback: (event: any) => void) =>
    ipcRenderer.on("pause-timer", callback),
  removePauseTimerListener: (callback: (event: any) => void) =>
    ipcRenderer.removeListener("pause-timer", callback),
  onResumeTimer: (callback: (event: any) => void) =>
    ipcRenderer.on("resume-timer", callback),
  removeResumeTimerListener: (callback: (event: any) => void) =>
    ipcRenderer.removeListener("resume-timer", callback),
});

contextBridge.exposeInMainWorld("db", {
  getDashboardData: () => ipcRenderer.invoke("db:getDashboardData"),
  createProject: (data: { id: string; name: string; color?: string }) =>
    ipcRenderer.invoke("db:createProject", data),
  startSession: (data: {
    id: string;
    project_id?: string;
    task?: string;
    planned_duration?: number;
  }) => ipcRenderer.invoke("db:startSession", data),
  endSession: (data: { id: string; focus_score?: number; tags?: string[] }) =>
    ipcRenderer.invoke("db:endSession", data),
});

declare global {
  interface Window {
    electronAPI: {
      ipcOn: (
        channel: string,
        listener: (event: any, ...args: any[]) => void
      ) => void;
      ipcOff: (
        channel: string,
        listener: (event: any, ...args: any[]) => void
      ) => void;
      ipcSend: (channel: string, ...args: any[]) => void;
      ipcInvoke: (channel: string, ...args: any[]) => Promise<any>;

      // App methods
      restoreMain: () => void;
      resizeOverlay: () => void;
      startTracking: () => void;
      stopTracking: () => void;

      // Centralized Timer methods
      startTimer: (duration: number, sessionName: string) => Promise<any>;
      pauseTimer: () => Promise<any>;
      resumeTimer: () => Promise<any>;
      stopTimer: () => Promise<any>;
      getTimerState: () => Promise<any>;
      updateSessionName: (sessionName: string) => Promise<any>;

      // Timer event listeners
      onTimerUpdate: (callback: (event: any, state: any) => void) => void;
      removeTimerUpdateListener: (
        callback: (event: any, state: any) => void
      ) => void;
      onTimerComplete: (callback: (event: any, state: any) => void) => void;
      removeTimerCompleteListener: (
        callback: (event: any, state: any) => void
      ) => void;

      // Legacy methods
      updateTimerState: (state: any) => void;
      onPauseTimer: (callback: (event: any) => void) => void;
      removePauseTimerListener: (callback: (event: any) => void) => void;
      onResumeTimer: (callback: (event: any) => void) => void;
      removeResumeTimerListener: (callback: (event: any) => void) => void;
    };

    db: {
      getDashboardData: () => Promise<any>;
      createProject: (data: {
        id: string;
        name: string;
        color?: string;
      }) => Promise<{ success: boolean }>;
      startSession: (data: {
        id: string;
        project_id?: string;
        task?: string;
        planned_duration?: number;
      }) => Promise<{ success: boolean }>;
      endSession: (data: {
        id: string;
        focus_score?: number;
        tags?: string[];
      }) => Promise<{ success: boolean }>;
    };
  }
}
