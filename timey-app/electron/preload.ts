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

  // You can expose other APTs you need here.
  // ...
});

// In src/preload/index.ts
contextBridge.exposeInMainWorld("electronAPI", {
  restoreMain: () => ipcRenderer.send("restore-main-window"),
  // NEW: Add resize function
  resizeOverlay: () => ipcRenderer.send("resize-overlay"),
  startTracking: () => ipcRenderer.send("start-tracking"), // <-- Add this
  stopTracking: () => ipcRenderer.send("stop-tracking"),
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
