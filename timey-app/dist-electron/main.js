var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, ipcMain, BrowserWindow, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import path from "path";
import fs from "fs";
const dbPath = path.join(app.getPath("userData"), "focus.json");
let db = { projects: [], milestones: [], sessions: [] };
function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}
function getDashboardData() {
  return {
    projects: db.projects,
    recentSessions: db.sessions.slice(-50).reverse()
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
const require2 = createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
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
new TimerManager();
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("ignore-gpu-blocklist");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let mainWindow;
let overlayWindow;
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
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setFullScreenable(false);
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.webContents.openDevTools({ mode: "detach" });
  mainWindow == null ? void 0 : mainWindow.webContents.openDevTools({ mode: "detach" });
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
  if (!overlayWindow) return;
  try {
    const dimensions = await overlayWindow.webContents.executeJavaScript(`
      (() => {
        const element = document.querySelector('.overlay-container-horizontal');
        if (element) {
          // Force a reflow to get accurate measurements
          element.offsetHeight;
          
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          
          // Get exact dimensions without adding extra padding
          const width = Math.ceil(rect.width);
          const height = Math.ceil(rect.height);
          
          return {
            width: Math.max(width, 280), // Minimum width
            height: Math.max(height, 44)  // Minimum height
          };
        }
        return { width: 320, height: 44 }; // fallback
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
      console.log("Overlay resized to:", dimensions);
    }
  } catch (error) {
    console.error("Failed to resize overlay:", error);
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
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
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });
  mainWindow.on("blur", () => {
    if (mainWindow && !mainWindow.isFullScreen()) {
      if (!overlayWindow) {
        createOverlayWindow();
      }
    }
  });
  mainWindow.on("focus", () => {
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    mainWindow = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("restore-main-window", () => {
  if (mainWindow) {
    mainWindow.restore();
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  }
});
let trackingInterval = null;
let activeWindow;
if (process.platform === "win32") {
  activeWindow = require2("get-windows").activeWindow;
} else {
  activeWindow = async () => null;
}
const appUsage = /* @__PURE__ */ new Map();
const CHECK_INTERVAL = 5;
ipcMain.on("start-tracking", () => {
  console.log("START tracking activity...");
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }
  trackingInterval = setInterval(async () => {
    try {
      const win = await activeWindow();
      if (win) {
        const appName = win.owner.name;
        const currentTime = appUsage.get(appName) || 0;
        appUsage.set(appName, currentTime + CHECK_INTERVAL);
        console.log(
          "Active App:",
          appName,
          "| Total Time:",
          appUsage.get(appName),
          "seconds"
        );
      }
    } catch (error) {
      console.error("Could not get active window:", error);
    }
  }, CHECK_INTERVAL * 1e3);
});
ipcMain.on("stop-tracking", () => {
  console.log("STOP tracking activity.");
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  console.log("--- Session Report ---");
  appUsage.forEach((time, app2) => {
    console.log(`${app2}: ${time} seconds`);
  });
  console.log("--------------------");
  appUsage.clear();
});
ipcMain.on("resize-overlay", () => {
  resizeOverlayToContent();
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
