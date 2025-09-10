import { ipcRenderer, contextBridge } from "electron";

// Single responsibility: Application window and UI control
contextBridge.exposeInMainWorld("appAPI", {
  // Window management
  restoreMain: () => ipcRenderer.send("restore-main-window"),
  resizeOverlay: () => ipcRenderer.send("resize-overlay"),

  // Popup windows
  showTasksPopup: () => ipcRenderer.send("show-tasks-popup"),
  showMetricsPopup: () => ipcRenderer.send("show-metrics-popup"),
  closePopups: () => ipcRenderer.send("close-popups"),

  // Tracking control
  startTracking: () => ipcRenderer.send("start-tracking"),
  stopTracking: () => ipcRenderer.send("stop-tracking"),

  // Open path
  openPath: (filePath: string) => ipcRenderer.invoke("app:openPath", filePath),
  getAISuggestion: () => ipcRenderer.invoke("ai:getSuggestion"),

  // Blitz mode
  showOverlay: () => ipcRenderer.send("overlay:show"),
  hideOverlay: () => ipcRenderer.send("overlay:hide"),
});
