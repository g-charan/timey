// src/preload/api/database-api.ts
import { ipcRenderer, contextBridge } from "electron";

// Single responsibility: Database operations
contextBridge.exposeInMainWorld("dbAPI", {
  // Dashboard data
  getDashboardData: () => ipcRenderer.invoke("db:getDashboardData"),

  // Project management
  createProject: (data: { id: string; name: string; color?: string }) =>
    ipcRenderer.invoke("db:createProject", data),

  // Session management
  startSession: (data: {
    id: string;
    project_id?: string;
    task?: string;
    planned_duration?: number;
  }) => ipcRenderer.invoke("db:startSession", data),

  endSession: (data: { id: string; focus_score?: number; tags?: string[] }) =>
    ipcRenderer.invoke("db:endSession", data),
});
