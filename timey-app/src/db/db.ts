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
  daily_shutdowns: Array<{
    id: string;
    date: number; // midnight timestamp
    wins?: string;
    open_loops?: string;
    tomorrow_intentions?: string;
    created_at: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    notes?: string;
    links?: string[];
    project_id?: string;
    estimate_minutes?: number;
    actual_seconds?: number;
    status: "todo" | "in_progress" | "done";
    scheduled_for?: number; // start of day ts
    created_at: number;
    updated_at: number;
    started_at?: number;
  }>;
};

let db: DBShape = {
  projects: [],
  milestones: [],
  sessions: [],
  daily_shutdowns: [],
  tasks: [],
};

// Load database from file
export function loadDB() {
  if (fs.existsSync(dbPath)) {
    const loaded = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    // Merge with defaults to handle older files missing new fields
    db = {
      projects: Array.isArray(loaded.projects) ? loaded.projects : [],
      milestones: Array.isArray(loaded.milestones) ? loaded.milestones : [],
      sessions: Array.isArray(loaded.sessions) ? loaded.sessions : [],
      daily_shutdowns: Array.isArray(loaded.daily_shutdowns)
        ? loaded.daily_shutdowns
        : [],
      tasks: Array.isArray(loaded.tasks) ? loaded.tasks : [],
    };
  } else {
    seedIfEmpty();
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
    streak: computeStreak(),
    todayTasks: getTodayTasks(),
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

// ---------- Shutdowns & Streak ----------
export function saveDailyShutdown(data: {
  wins?: string;
  open_loops?: string;
  tomorrow_intentions?: string;
}) {
  const day = startOfDayTs(Date.now());
  const existing = db.daily_shutdowns.find((d) => d.date === day);
  if (existing) {
    existing.wins = data.wins;
    existing.open_loops = data.open_loops;
    existing.tomorrow_intentions = data.tomorrow_intentions;
  } else {
    db.daily_shutdowns.push({
      id: `shutdown-${day}`,
      date: day,
      created_at: Date.now(),
      ...data,
    });
  }
  saveDB();
}

export function getDailyShutdown(date: number) {
  const day = startOfDayTs(date);
  return db.daily_shutdowns.find((d) => d.date === day) || null;
}

function computeStreak(): number {
  // Streak counts consecutive days with either a shutdown record or >= 30 min actual seconds
  let streak = 0;
  let dayCursor = startOfDayTs(Date.now());
  // cap lookback for perf
  for (let i = 0; i < 365; i++) {
    const hasShutdown = !!db.daily_shutdowns.find((d) => d.date === dayCursor);
    const daySessions = db.sessions.filter((s) =>
      inSameDay(s.start_at, dayCursor)
    );
    const totalSecs = daySessions.reduce(
      (sum, s) => sum + (s.actual_seconds || 0),
      0
    );
    if (hasShutdown || totalSecs >= 30 * 60) {
      streak += 1;
      dayCursor -= 24 * 3600 * 1000;
    } else {
      break;
    }
  }
  return streak;
}

function startOfDayTs(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function inSameDay(ts: number, dayStart: number): boolean {
  const start = dayStart;
  const end = start + 24 * 3600 * 1000 - 1;
  return ts >= start && ts <= end;
}

// ---------- Tasks (Task Engine) ----------
export function getTodayTasks() {
  const today = startOfDayTs(Date.now());
  return db.tasks.filter((t) => (t.scheduled_for ?? today) === today);
}

export function createTask(task: {
  id: string;
  title: string;
  notes?: string;
  links?: string[];
  project_id?: string;
  estimate_minutes?: number;
  scheduled_for?: number;
}) {
  const now = Date.now();
  db.tasks.push({
    id: task.id,
    title: task.title,
    notes: task.notes,
    links: task.links ?? [],
    project_id: task.project_id,
    estimate_minutes: task.estimate_minutes,
    actual_seconds: 0,
    status: "todo",
    scheduled_for: task.scheduled_for ?? startOfDayTs(now),
    created_at: now,
    updated_at: now,
  });
  saveDB();
}

export function updateTask(
  id: string,
  changes: Partial<DBShape["tasks"][number]>
) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  Object.assign(t, changes);
  t.updated_at = Date.now();
  saveDB();
}

export function startTaskTimer(id: string) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  t.status = "in_progress";
  t.started_at = Date.now();
  t.updated_at = Date.now();
  saveDB();
}

export function stopTaskTimer(id: string, complete: boolean) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  if (t.started_at) {
    const add = Math.max(0, Math.floor((Date.now() - t.started_at) / 1000));
    t.actual_seconds = (t.actual_seconds || 0) + add;
  }
  t.started_at = undefined;
  t.status = complete ? "done" : "todo";
  t.updated_at = Date.now();
  saveDB();
}

// ---------- Seed helpers (placeholder data) ----------
function seedIfEmpty() {
  if (db.projects.length === 0 && db.sessions.length === 0) {
    const now = Date.now();
    db.projects.push(
      {
        id: "proj-quick-start",
        name: "Quick Start",
        color: "#3b82f6",
        total_seconds: 0,
        avg_focus_score: 0,
        created_at: now,
        updated_at: now,
      },
      {
        id: "proj-deep-work",
        name: "Deep Work",
        color: "#10b981",
        total_seconds: 0,
        avg_focus_score: 0,
        created_at: now,
        updated_at: now,
      }
    );

    db.sessions.push({
      id: "sess-sample-1",
      project_id: "proj-quick-start",
      task: "Sample focus block",
      planned_duration: 1500,
      start_at: now - 3600_000,
      end_at: now - 3300_000,
      actual_seconds: 300,
      focus_score: 0.8,
      tags: ["demo"],
      created_at: now - 3600_000,
    });

    db.tasks.push({
      id: "task-sample-1",
      title: "Plan sprint backlog",
      notes: "Outline priorities and owner",
      links: [],
      project_id: "proj-quick-start",
      estimate_minutes: 45,
      actual_seconds: 0,
      status: "todo",
      scheduled_for: startOfDayTs(now),
      created_at: now,
      updated_at: now,
    });
  }
}
