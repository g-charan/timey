var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, ipcMain, shell, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import path from "path";
import fs from "fs";
const dbPath = path.join(app.getPath("userData"), "focus.json");
let db = {
  projects: [],
  milestones: [],
  sessions: [],
  daily_shutdowns: [],
  tasks: []
};
function loadDB() {
  if (fs.existsSync(dbPath)) {
    const loaded = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    db = {
      projects: Array.isArray(loaded.projects) ? loaded.projects : [],
      milestones: Array.isArray(loaded.milestones) ? loaded.milestones : [],
      sessions: Array.isArray(loaded.sessions) ? loaded.sessions : [],
      daily_shutdowns: Array.isArray(loaded.daily_shutdowns) ? loaded.daily_shutdowns : [],
      tasks: Array.isArray(loaded.tasks) ? loaded.tasks : []
    };
  } else {
    seedIfEmpty();
    saveDB();
  }
}
function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}
function getDashboardData() {
  return {
    projects: db.projects,
    recentSessions: db.sessions.slice(-50).reverse(),
    streak: computeStreak(),
    todayTasks: getTodayTasks()
  };
}
function createProject(id, name, color) {
  db.projects.push({
    id,
    name,
    color,
    total_seconds: 0,
    avg_focus_score: 0,
    created_at: Date.now(),
    updated_at: Date.now()
  });
  saveDB();
}
function startSession(data) {
  db.sessions.push({
    ...data,
    start_at: Date.now(),
    created_at: Date.now()
  });
  saveDB();
}
function endSession(data) {
  const s = db.sessions.find((x) => x.id === data.id);
  if (!s) return;
  s.end_at = Date.now();
  s.actual_seconds = Math.floor((s.end_at - s.start_at) / 1e3);
  s.focus_score = data.focus_score ?? null;
  s.tags = data.tags ?? [];
  saveDB();
}
function saveDailyShutdown(data) {
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
      ...data
    });
  }
  saveDB();
}
function getDailyShutdown(date) {
  const day = startOfDayTs(date);
  return db.daily_shutdowns.find((d) => d.date === day) || null;
}
function computeStreak() {
  let streak = 0;
  let dayCursor = startOfDayTs(Date.now());
  for (let i = 0; i < 365; i++) {
    const hasShutdown = !!db.daily_shutdowns.find((d) => d.date === dayCursor);
    const daySessions = db.sessions.filter(
      (s) => inSameDay(s.start_at, dayCursor)
    );
    const totalSecs = daySessions.reduce(
      (sum, s) => sum + (s.actual_seconds || 0),
      0
    );
    if (hasShutdown || totalSecs >= 30 * 60) {
      streak += 1;
      dayCursor -= 24 * 3600 * 1e3;
    } else {
      break;
    }
  }
  return streak;
}
function startOfDayTs(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function inSameDay(ts, dayStart) {
  const start = dayStart;
  const end = start + 24 * 3600 * 1e3 - 1;
  return ts >= start && ts <= end;
}
function getTodayTasks() {
  const today = startOfDayTs(Date.now());
  return db.tasks.filter((t) => (t.scheduled_for ?? today) === today);
}
function createTask(task) {
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
    updated_at: now
  });
  saveDB();
}
function updateTask(id, changes) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  Object.assign(t, changes);
  t.updated_at = Date.now();
  saveDB();
}
function startTaskTimer(id) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  t.status = "in_progress";
  t.started_at = Date.now();
  t.updated_at = Date.now();
  saveDB();
}
function stopTaskTimer(id, complete) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  if (t.started_at) {
    const add = Math.max(0, Math.floor((Date.now() - t.started_at) / 1e3));
    t.actual_seconds = (t.actual_seconds || 0) + add;
  }
  t.started_at = void 0;
  t.status = complete ? "done" : "todo";
  t.updated_at = Date.now();
  saveDB();
}
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
        updated_at: now
      },
      {
        id: "proj-deep-work",
        name: "Deep Work",
        color: "#10b981",
        total_seconds: 0,
        avg_focus_score: 0,
        created_at: now,
        updated_at: now
      }
    );
    db.sessions.push({
      id: "sess-sample-1",
      project_id: "proj-quick-start",
      task: "Sample focus block",
      planned_duration: 1500,
      start_at: now - 36e5,
      end_at: now - 33e5,
      actual_seconds: 300,
      focus_score: 0.8,
      tags: ["demo"],
      created_at: now - 36e5
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
      updated_at: now
    });
  }
}
ipcMain.handle("db:getDashboardData", async () => {
  return getDashboardData();
});
ipcMain.handle(
  "db:createProject",
  async (_event, data) => {
    createProject(data.id, data.name, data.color);
    return { success: true };
  }
);
ipcMain.handle(
  "db:startSession",
  async (_event, data) => {
    startSession(data);
    return { success: true };
  }
);
ipcMain.handle(
  "db:endSession",
  async (_event, data) => {
    endSession(data);
    return { success: true };
  }
);
ipcMain.handle(
  "db:saveDailyShutdown",
  async (_event, data) => {
    saveDailyShutdown(data);
    return { success: true };
  }
);
ipcMain.handle("db:getDailyShutdown", async (_event, date) => {
  return getDailyShutdown(date);
});
ipcMain.handle("db:generateReport", async () => {
  const data = getDashboardData();
  const reportHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Timey Report</title>
    <style>body{font-family:ui-sans-serif,system-ui;padding:24px;color:#111} h1{margin-bottom:4px} table{width:100%;border-collapse:collapse;margin-top:16px} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f8f8f8}</style>
  </head><body>
  <h1>Timey Report</h1>
  <p>Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
  <h2>Recent Sessions</h2>
  <table><thead><tr><th>Task</th><th>Planned (min)</th><th>Actual (min)</th><th>Start</th></tr></thead><tbody>
  ${data.recentSessions.slice(0, 20).map(
    (s) => `<tr><td>${s.task ?? "Session"}</td><td>${Math.round(
      (s.planned_duration || 0) / 60
    )}</td><td>${Math.round(
      (s.actual_seconds || 0) / 60
    )}</td><td>${new Date(s.start_at).toLocaleString()}</td></tr>`
  ).join("")}
  </tbody></table>
  </body></html>`;
  const outDir = path.join(app.getPath("userData"), "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-${Date.now()}.html`);
  fs.writeFileSync(outPath, reportHtml);
  return { path: outPath };
});
ipcMain.handle("app:openPath", async (_e, filePath) => {
  await shell.openPath(filePath);
  return { success: true };
});
ipcMain.handle("ai:getSuggestion", async () => {
  const data = getDashboardData();
  const sessions = data.recentSessions;
  const last = sessions[0];
  const avgMins = Math.round(
    sessions.slice(0, 10).reduce((sum, s) => sum + (s.actual_seconds || 0), 0) / Math.max(1, Math.min(10, sessions.length)) / 60
  );
  const duration = Math.max(25, Math.min(60, avgMins || 30));
  const task = (last == null ? void 0 : last.task) || "Deep Work";
  const rationale = [
    `Recent sessions average about ${duration} minutes; keeping it consistent aids momentum.`,
    (last == null ? void 0 : last.task) ? `You last worked on “${last.task}”; continuity reduces context switching.` : `Defaulting to deep work since no prior task found.`,
    `Consider a short break after to prevent fatigue.`
  ];
  return {
    suggestion: { task, duration, confidence: 0.7 },
    rationale
  };
});
ipcMain.handle("tasks:getToday", async () => getTodayTasks());
ipcMain.handle(
  "tasks:create",
  async (_e, payload) => {
    createTask(payload);
    return { success: true };
  }
);
ipcMain.handle("tasks:update", async (_e, id, changes) => {
  updateTask(id, changes);
  return { success: true };
});
ipcMain.handle("tasks:start", async (_e, id) => {
  startTaskTimer(id);
  return { success: true };
});
ipcMain.handle("tasks:stop", async (_e, id, complete) => {
  stopTaskTimer(id, complete);
  return { success: true };
});
class TimerManager {
  constructor() {
    __publicField(this, "timerState", {
      timeLeft: null,
      isActive: false,
      sessionName: "",
      progress: 0,
      totalTime: 0
    });
    __publicField(this, "timerInterval", null);
    this.setupIpcHandlers();
  }
  setupIpcHandlers() {
    ipcMain.handle(
      "start-timer",
      (event, { duration, sessionName }) => {
        this.startTimer(duration, sessionName);
        return this.timerState;
      }
    );
    ipcMain.handle("pause-timer", () => {
      this.pauseTimer();
      return this.timerState;
    });
    ipcMain.handle("resume-timer", () => {
      this.resumeTimer();
      return this.timerState;
    });
    ipcMain.handle("stop-timer", () => {
      this.stopTimer();
      return this.timerState;
    });
    ipcMain.handle("get-timer-state", () => {
      return this.timerState;
    });
    ipcMain.handle("update-session-name", (event, sessionName) => {
      this.timerState.sessionName = sessionName;
      this.broadcastUpdate();
      return this.timerState;
    });
  }
  startTimer(duration, sessionName) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerState = {
      timeLeft: duration,
      totalTime: duration,
      isActive: true,
      sessionName,
      progress: 0
    };
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1e3);
    this.broadcastUpdate();
  }
  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerState.isActive = false;
    this.broadcastUpdate();
  }
  resumeTimer() {
    if (this.timerState.timeLeft && this.timerState.timeLeft > 0) {
      this.timerState.isActive = true;
      this.timerInterval = setInterval(() => {
        this.tick();
      }, 1e3);
      this.broadcastUpdate();
    }
  }
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerState = {
      timeLeft: null,
      isActive: false,
      sessionName: "",
      progress: 0,
      totalTime: 0
    };
    this.broadcastUpdate();
  }
  tick() {
    if (this.timerState.timeLeft !== null && this.timerState.timeLeft > 0) {
      this.timerState.timeLeft -= 1;
      if (this.timerState.totalTime > 0) {
        this.timerState.progress = (this.timerState.totalTime - this.timerState.timeLeft) / this.timerState.totalTime * 100;
      }
      this.broadcastUpdate();
      if (this.timerState.timeLeft === 0) {
        this.onTimerComplete();
      }
    }
  }
  onTimerComplete() {
    this.timerState.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.broadcastUpdate();
    this.broadcastTimerComplete();
  }
  broadcastUpdate() {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("timer-update", this.timerState);
    }
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send("timer-update", this.timerState);
    }
  }
  broadcastTimerComplete() {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("timer-complete", this.timerState);
    }
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send("timer-complete", this.timerState);
    }
  }
  // Public method to get current state
  getCurrentState() {
    return { ...this.timerState };
  }
}
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
new TimerManager();
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("ignore-gpu-blocklist");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let mainWindow;
let overlayWindow;
let tasksPopupWindow;
let metricsPopupWindow;
function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const minWidth = 200;
  const minHeight = 44;
  overlayWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    maxWidth: 600,
    // Set reasonable max width
    maxHeight: 200,
    // Set reasonable max height
    x: width - minWidth - 20,
    // Will be adjusted after resize
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    // Disable manual resizing
    webPreferences: {
      preload: path$1.join(__dirname, "index.mjs")
    }
  });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setFullScreenable(false);
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.webContents.on("did-finish-load", () => {
    setTimeout(() => {
      resizeOverlayToContent();
    }, 100);
  });
  if (VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/overlay`);
  } else {
    overlayWindow.loadFile(path$1.join(RENDERER_DIST, "index.html"), {
      hash: "overlay"
    });
  }
  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
}
async function resizeOverlayToContent() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    console.log("Overlay window not available for resize");
    return;
  }
  try {
    const dimensions = await overlayWindow.webContents.executeJavaScript(`
      (() => {
        const container = document.querySelector('.overlay-container-horizontal');
        const dropdown = document.querySelector('.overlay-dropdown');
        
        if (container) {
          // Force a reflow to get accurate measurements
          container.offsetHeight;
          
          const containerRect = container.getBoundingClientRect();
          let totalWidth = Math.ceil(containerRect.width);
          let totalHeight = Math.ceil(containerRect.height);
          
          // If dropdown is visible, include its dimensions
          if (dropdown && dropdown.offsetParent !== null) {
            const dropdownRect = dropdown.getBoundingClientRect();
            
            // Calculate total height including dropdown
            const dropdownBottom = dropdownRect.bottom;
            const containerBottom = containerRect.bottom;
            
            // If dropdown extends below container, add the extra height
            if (dropdownBottom > containerBottom) {
              totalHeight += Math.ceil(dropdownBottom - containerBottom) + 16; // 16px padding
            }
            
            // If dropdown is wider than container, use dropdown width
            const dropdownWidth = Math.ceil(dropdownRect.width);
            if (dropdownWidth > totalWidth) {
              totalWidth = dropdownWidth;
            }
          }
          
          return {
            width: Math.max(totalWidth, 280), // Minimum width
            height: Math.max(totalHeight, 44), // Minimum height
            hasDropdown: dropdown && dropdown.offsetParent !== null
          };
        }
        return { width: 320, height: 44, hasDropdown: false }; // fallback
      })()
    `);
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.workAreaSize;
    const currentBounds = overlayWindow.getBounds();
    if (currentBounds.width !== dimensions.width || currentBounds.height !== dimensions.height) {
      overlayWindow.setSize(dimensions.width, dimensions.height, false);
      overlayWindow.setPosition(
        Math.max(0, screenWidth - dimensions.width - 20),
        20
      );
      console.log(
        "Overlay resized to:",
        dimensions,
        "Dropdown visible:",
        dimensions.hasDropdown
      );
    }
  } catch (error) {
    console.error("Failed to resize overlay:", error);
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "index.mjs")
    }
  });
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
  mainWindow.on("minimize", () => {
    if (!overlayWindow) {
      createOverlayWindow();
    }
  });
  mainWindow.on("restore", () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });
  mainWindow.on("focus", () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });
  mainWindow.on("closed", () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
    if (tasksPopupWindow && !tasksPopupWindow.isDestroyed()) {
      tasksPopupWindow.close();
      tasksPopupWindow = null;
    }
    if (metricsPopupWindow && !metricsPopupWindow.isDestroyed()) {
      metricsPopupWindow.close();
      metricsPopupWindow = null;
    }
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
    mainWindow = null;
    app.quit();
  });
}
app.on("window-all-closed", () => {
  app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("restore-main-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.restore();
    mainWindow.focus();
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  }
});
let trackingInterval = null;
let activeWindow = null;
const appUsage = /* @__PURE__ */ new Map();
const CHECK_INTERVAL = 5;
async function initializeActiveWindow() {
  try {
    const { exec } = await import("child_process");
    activeWindow = async () => {
      try {
        return new Promise((resolve) => {
          exec("active-window", { timeout: 5e3 }, (error, stdout) => {
            if (error) {
              console.error("[TRACKING] windows-cli error:", error);
              resolve(null);
              return;
            }
            const output = stdout == null ? void 0 : stdout.trim();
            if (!output) {
              console.log("[TRACKING] No active window detected");
              resolve(null);
              return;
            }
            const lines = output.split("\n").map((line) => line.trim());
            console.log(`[TRACKING] Raw output lines:`, lines);
            if (lines.length >= 2) {
              const [title, id, app2, pid] = lines;
              let appName = app2 && app2 !== "undefined" ? app2 : "Unknown App";
              if (appName === "Unknown App" && title) {
                const titleParts = title.split(" - ");
                if (titleParts.length > 1) {
                  appName = titleParts[1] || titleParts[0];
                }
              }
              const processId = pid && pid !== "undefined" ? parseInt(pid) : 0;
              console.log(
                `[TRACKING] Successfully detected: ${appName} - ${title}`
              );
              resolve({
                title: title || "Unknown Window",
                owner: {
                  name: appName,
                  processId,
                  path: ""
                },
                id: id || "unknown"
              });
            } else {
              console.log(
                "[TRACKING] Invalid active-window output format - not enough lines"
              );
              resolve(null);
            }
          });
        });
      } catch (error) {
        console.error(
          "[TRACKING] Error executing active-window command:",
          error
        );
        return null;
      }
    };
    console.log("[TRACKING] Successfully initialized windows-cli");
  } catch (error) {
    console.error("[TRACKING] Failed to load windows-cli:", error);
    activeWindow = async () => null;
  }
}
ipcMain.on("start-tracking", async () => {
  console.log("START tracking activity...");
  if (!activeWindow) {
    await initializeActiveWindow();
  }
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }
  trackingInterval = setInterval(async () => {
    try {
      const win = await activeWindow();
      if (win && win.owner && win.owner.name) {
        const appName = win.owner.name;
        const windowTitle = win.title || "Unknown Window";
        const currentTime = appUsage.get(appName) || 0;
        appUsage.set(appName, currentTime + CHECK_INTERVAL);
        console.log(
          `[TRACKING] Active App: ${appName} | Window: ${windowTitle} | Session Time: ${appUsage.get(
            appName
          )}s | Total Apps Tracked: ${appUsage.size}`
        );
      } else {
        console.log(
          "[TRACKING] No active window detected or window data unavailable"
        );
      }
    } catch (error) {
      console.error("[TRACKING ERROR] Could not get active window:", error);
    }
  }, CHECK_INTERVAL * 1e3);
  console.log(
    `[TRACKING] Started monitoring active windows every ${CHECK_INTERVAL} seconds`
  );
});
ipcMain.on("stop-tracking", () => {
  console.log("[TRACKING] STOP tracking activity.");
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  console.log("[TRACKING] === SESSION REPORT ===");
  if (appUsage.size > 0) {
    appUsage.forEach((time, app2) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      console.log(
        `[TRACKING] ${app2}: ${minutes}m ${seconds}s (${time} total seconds)`
      );
    });
    console.log(`[TRACKING] Total apps tracked: ${appUsage.size}`);
    console.log(
      `[TRACKING] Total session time: ${Array.from(appUsage.values()).reduce(
        (a, b) => a + b,
        0
      )} seconds`
    );
  } else {
    console.log("[TRACKING] No app usage data recorded in this session");
  }
  console.log("[TRACKING] === END REPORT ===");
  appUsage.clear();
});
function createTasksPopupWindow() {
  if (tasksPopupWindow && !tasksPopupWindow.isDestroyed()) {
    tasksPopupWindow.focus();
    return;
  }
  const overlayBounds = overlayWindow == null ? void 0 : overlayWindow.getBounds();
  if (!overlayBounds) return;
  tasksPopupWindow = new BrowserWindow({
    width: 320,
    height: 400,
    x: overlayBounds.x,
    y: overlayBounds.y + overlayBounds.height + 8,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path$1.join(__dirname, "index.mjs")
    }
  });
  tasksPopupWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  });
  tasksPopupWindow.setAlwaysOnTop(true, "screen-saver");
  if (VITE_DEV_SERVER_URL) {
    tasksPopupWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/tasks-popup`);
  } else {
    tasksPopupWindow.loadFile(path$1.join(RENDERER_DIST, "index.html"), {
      hash: "tasks-popup"
    });
  }
  tasksPopupWindow.on("blur", () => {
    if (tasksPopupWindow && !tasksPopupWindow.isDestroyed()) {
      tasksPopupWindow.close();
      tasksPopupWindow = null;
    }
  });
  tasksPopupWindow.on("closed", () => {
    tasksPopupWindow = null;
  });
}
function createMetricsPopupWindow() {
  if (metricsPopupWindow && !metricsPopupWindow.isDestroyed()) {
    metricsPopupWindow.focus();
    return;
  }
  const overlayBounds = overlayWindow == null ? void 0 : overlayWindow.getBounds();
  if (!overlayBounds) return;
  metricsPopupWindow = new BrowserWindow({
    width: 320,
    height: 350,
    x: overlayBounds.x,
    y: overlayBounds.y + overlayBounds.height + 8,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path$1.join(__dirname, "index.mjs")
    }
  });
  metricsPopupWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  });
  metricsPopupWindow.setAlwaysOnTop(true, "screen-saver");
  if (VITE_DEV_SERVER_URL) {
    metricsPopupWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/metrics-popup`);
  } else {
    metricsPopupWindow.loadFile(path$1.join(RENDERER_DIST, "index.html"), {
      hash: "metrics-popup"
    });
  }
  metricsPopupWindow.on("blur", () => {
    if (metricsPopupWindow && !metricsPopupWindow.isDestroyed()) {
      metricsPopupWindow.close();
      metricsPopupWindow = null;
    }
  });
  metricsPopupWindow.on("closed", () => {
    metricsPopupWindow = null;
  });
}
ipcMain.on("resize-overlay", () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    resizeOverlayToContent();
  }
});
ipcMain.on("show-tasks-popup", () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    createTasksPopupWindow();
  }
});
ipcMain.on("show-metrics-popup", () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    createMetricsPopupWindow();
  }
});
ipcMain.on("close-popups", () => {
  if (tasksPopupWindow && !tasksPopupWindow.isDestroyed()) {
    tasksPopupWindow.close();
    tasksPopupWindow = null;
  }
  if (metricsPopupWindow && !metricsPopupWindow.isDestroyed()) {
    metricsPopupWindow.close();
    metricsPopupWindow = null;
  }
});
ipcMain.on("overlay:show", () => {
  if (!overlayWindow) {
    createOverlayWindow();
  } else {
    overlayWindow.showInactive();
  }
});
ipcMain.on("overlay:hide", () => {
  if (overlayWindow) overlayWindow.close();
});
app.whenReady().then(async () => {
  try {
    loadDB();
  } catch (e) {
    console.error("Failed to load local DB:", e);
  }
  await initializeActiveWindow();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  mainWindow,
  metricsPopupWindow,
  overlayWindow,
  tasksPopupWindow
};
