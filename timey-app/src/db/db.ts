// src/main/db.ts
import { app } from "electron";
import path from "path";
import fs from "fs";

const dbPath = path.join(app.getPath("userData"), "focus.json");

type DBShape = {
  projects: Array<{
    id: string;
    name: string;
    color?: string;
    total_seconds: number;
    avg_focus_score: number;
    created_at: number;
    updated_at: number;
  }>;
  milestones: Array<{
    id: string;
    project_id: string;
    title: string;
    target_seconds?: number;
    is_complete: boolean;
    completed_at?: number;
    created_at: number;
  }>;
  sessions: Array<{
    id: string;
    project_id?: string;
    task?: string;
    start_at: number;
    end_at?: number;
    planned_duration?: number;
    actual_seconds?: number;
    focus_score?: number;
    tags?: string[];
    created_at: number;
  }>;
};

let db: DBShape = { projects: [], milestones: [], sessions: [] };

// Load database from file
export function loadDB() {
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  } else {
    saveDB();
  }
}

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ---------- CRUD ----------
export function getDashboardData() {
  return {
    projects: db.projects,
    recentSessions: db.sessions.slice(-50).reverse(),
  };
}

export function createProject(id: string, name: string, color?: string) {
  db.projects.push({
    id,
    name,
    color,
    total_seconds: 0,
    avg_focus_score: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
  });
  saveDB();
}

export function startSession(data: {
  id: string;
  project_id?: string;
  task?: string;
  planned_duration?: number;
}) {
  db.sessions.push({
    ...data,
    start_at: Date.now(),
    created_at: Date.now(),
  });
  saveDB();
}

export function endSession(data: {
  id: string;
  focus_score?: number;
  tags?: string[];
}) {
  const s = db.sessions.find((x) => x.id === data.id);
  if (!s) return;
  s.end_at = Date.now();
  s.actual_seconds = Math.floor((s.end_at - s.start_at) / 1000);
  s.focus_score = data.focus_score ?? null;
  s.tags = data.tags ?? [];
  saveDB();
}
