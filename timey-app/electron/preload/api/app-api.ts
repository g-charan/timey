import { ipcRenderer, contextBridge } from "electron";

// Single responsibility: Application window and UI control
contextBridge.exposeInMainWorld("appAPI", {
  // Window management
  restoreMain: () => ipcRenderer.send("restore-main-window"),
  resizeOverlay: () => ipcRenderer.send("resize-overlay"),

  // Tracking control
  startTracking: () => ipcRenderer.send("start-tracking"),
  stopTracking: () => ipcRenderer.send("stop-tracking"),
});
