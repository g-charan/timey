// src/main/ipc.ts
import { ipcMain } from "electron";
import {
  getDashboardData,
  createProject,
  startSession,
  endSession,
} from "../src/db/db";

ipcMain.handle("db:getDashboardData", async () => {
  return getDashboardData();
});

ipcMain.handle(
  "db:createProject",
  async (_event, data: { id: string; name: string; color?: string }) => {
    createProject(data.id, data.name, data.color);
    return { success: true };
  }
);

ipcMain.handle(
  "db:startSession",
  async (
    _event,
    data: {
      id: string;
      project_id?: string;
      task?: string;
      planned_duration?: number;
    }
  ) => {
    startSession(data);
    return { success: true };
  }
);

ipcMain.handle(
  "db:endSession",
  async (
    _event,
    data: { id: string; focus_score?: number; tags?: string[] }
  ) => {
    endSession(data);
    return { success: true };
  }
);
