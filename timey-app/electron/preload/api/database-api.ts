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

  // Shutdown ritual
  saveDailyShutdown: (data: {
    wins?: string;
    open_loops?: string;
    tomorrow_intentions?: string;
  }) => ipcRenderer.invoke("db:saveDailyShutdown", data),
  getDailyShutdown: (date: number) =>
    ipcRenderer.invoke("db:getDailyShutdown", date),

  // Reports
  generateReport: () => ipcRenderer.invoke("db:generateReport"),

  // Tasks
  getTodayTasks: () => ipcRenderer.invoke("tasks:getToday"),
  createTask: (payload: {
    id: string;
    title: string;
    notes?: string;
    links?: string[];
    project_id?: string;
    estimate_minutes?: number;
    scheduled_for?: number;
  }) => ipcRenderer.invoke("tasks:create", payload),
  updateTask: (id: string, changes: any) =>
    ipcRenderer.invoke("tasks:update", id, changes),
  startTask: (id: string) => ipcRenderer.invoke("tasks:start", id),
  stopTask: (id: string, complete: boolean) =>
    ipcRenderer.invoke("tasks:stop", id, complete),
});
