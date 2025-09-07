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
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  restoreMain: () => electron.ipcRenderer.send("restore-main-window"),
  // NEW: Add resize function
  resizeOverlay: () => electron.ipcRenderer.send("resize-overlay"),
  startTracking: () => electron.ipcRenderer.send("start-tracking"),
  // <-- Add this
  stopTracking: () => electron.ipcRenderer.send("stop-tracking")
});
electron.contextBridge.exposeInMainWorld("db", {
  getDashboardData: () => electron.ipcRenderer.invoke("db:getDashboardData"),
  createProject: (data) => electron.ipcRenderer.invoke("db:createProject", data),
  startSession: (data) => electron.ipcRenderer.invoke("db:startSession", data),
  endSession: (data) => electron.ipcRenderer.invoke("db:endSession", data)
});
