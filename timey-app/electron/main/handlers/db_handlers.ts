// src/main/ipc.ts
import { ipcMain, app, shell } from "electron";
import {
  getDashboardData,
  createProject,
  startSession,
  endSession,
  saveDailyShutdown,
  getDailyShutdown,
  getTodayTasks,
  createTask,
  updateTask,
  startTaskTimer,
  stopTaskTimer,
} from "../../../src/db/db";
import fs from "fs";
import path from "path";

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

ipcMain.handle(
  "db:saveDailyShutdown",
  async (
    _event,
    data: { wins?: string; open_loops?: string; tomorrow_intentions?: string }
  ) => {
    saveDailyShutdown(data);
    return { success: true };
  }
);

ipcMain.handle("db:getDailyShutdown", async (_event, date: number) => {
  return getDailyShutdown(date);
});

// Generate a simple HTML report from recent sessions
ipcMain.handle("db:generateReport", async () => {
  const data = getDashboardData();
  const reportHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Timey Report</title>
    <style>body{font-family:ui-sans-serif,system-ui;padding:24px;color:#111} h1{margin-bottom:4px} table{width:100%;border-collapse:collapse;margin-top:16px} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f8f8f8}</style>
  </head><body>
  <h1>Timey Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <h2>Recent Sessions</h2>
  <table><thead><tr><th>Task</th><th>Planned (min)</th><th>Actual (min)</th><th>Start</th></tr></thead><tbody>
  ${data.recentSessions
    .slice(0, 20)
    .map(
      (s: any) =>
        `<tr><td>${s.task ?? "Session"}</td><td>${Math.round(
          (s.planned_duration || 0) / 60
        )}</td><td>${Math.round(
          (s.actual_seconds || 0) / 60
        )}</td><td>${new Date(s.start_at).toLocaleString()}</td></tr>`
    )
    .join("")}
  </tbody></table>
  </body></html>`;

  const outDir = path.join(app.getPath("userData"), "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-${Date.now()}.html`);
  fs.writeFileSync(outPath, reportHtml);
  return { path: outPath };
});

ipcMain.handle("app:openPath", async (_e, filePath: string) => {
  await shell.openPath(filePath);
  return { success: true };
});

// Local AI heuristic: suggest next focus block from recent sessions
ipcMain.handle("ai:getSuggestion", async () => {
  const data = getDashboardData();
  const sessions = data.recentSessions as any[];
  const last = sessions[0];
  const avgMins = Math.round(
    sessions.slice(0, 10).reduce((sum, s) => sum + (s.actual_seconds || 0), 0) /
      Math.max(1, Math.min(10, sessions.length)) /
      60
  );
  const duration = Math.max(25, Math.min(60, avgMins || 30));
  const task = last?.task || "Deep Work";
  const rationale = [
    `Recent sessions average about ${duration} minutes; keeping it consistent aids momentum.`,
    last?.task
      ? `You last worked on “${last.task}”; continuity reduces context switching.`
      : `Defaulting to deep work since no prior task found.`,
    `Consider a short break after to prevent fatigue.`,
  ];
  return {
    suggestion: { task, duration, confidence: 0.7 },
    rationale,
  };
});

// Task Engine IPC
ipcMain.handle("tasks:getToday", async () => getTodayTasks());
ipcMain.handle(
  "tasks:create",
  async (
    _e,
    payload: {
      id: string;
      title: string;
      notes?: string;
      links?: string[];
      project_id?: string;
      estimate_minutes?: number;
      scheduled_for?: number;
    }
  ) => {
    createTask(payload);
    return { success: true };
  }
);
ipcMain.handle("tasks:update", async (_e, id: string, changes: any) => {
  updateTask(id, changes);
  return { success: true };
});
ipcMain.handle("tasks:start", async (_e, id: string) => {
  startTaskTimer(id);
  return { success: true };
});
ipcMain.handle("tasks:stop", async (_e, id: string, complete: boolean) => {
  stopTaskTimer(id, complete);
  return { success: true };
});
