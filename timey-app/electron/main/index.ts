import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { screen, ipcMain } from "electron";
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import "./handlers/db_handlers";
import { loadDB } from "../../src/db/db";
import { TimerManager } from "./handlers/timer_handlers";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

let currentTimerState = {
  timeLeft: null,
  isActive: false,
  sessionName: "",
  progress: 0,
};

// Create global timer manager instance
const timerManager = new TimerManager();

// Remove the old timer-related IPC handlers and replace with:
// (Remove these old handlers from your existing code)
/*
ipcMain.on("update-timer-state", (event, state) => {
  broadcastTimerUpdate(state);
});

ipcMain.handle("get-timer-state", () => {
  return currentTimerState;
});

ipcMain.on("pause-timer", () => {
  if (mainWindow) {
    mainWindow.webContents.send("pause-timer");
  }
});

ipcMain.on("resume-timer", () => {
  if (mainWindow) {
    mainWindow.webContents.send("resume-timer");
  }
});
*/

// Function to broadcast timer updates to all windows

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("ignore-gpu-blocklist");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// NEW: Renamed 'win' to 'mainWindow' for clarity and added 'overlayWindow'
export let mainWindow: BrowserWindow | null;
export let overlayWindow: BrowserWindow | null;
export let tasksPopupWindow: BrowserWindow | null;
export let metricsPopupWindow: BrowserWindow | null;

// NEW: Function to create the overlay window
function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Start with minimum size - will be adjusted by content
  const minWidth = 200;
  const minHeight = 44;

  overlayWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    maxWidth: 600, // Set reasonable max width
    maxHeight: 200, // Set reasonable max height
    x: width - minWidth - 20, // Will be adjusted after resize
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false, // Disable manual resizing
    webPreferences: {
      preload: path.join(__dirname, "index.mjs"),
    },
  });

  // overlayWindow.webContents.openDevTools({ mode: "detach" });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setFullScreenable(false);
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setIgnoreMouseEvents(false);

  // NOTE: use this for Debugging
  // overlayWindow.webContents.openDevTools({ mode: "detach" });
  // mainWindow?.webContents.openDevTools({ mode: "detach" });
  overlayWindow.webContents.openDevTools({ mode: "detach" });

  // Wait for content to load, then resize
  overlayWindow.webContents.on("did-finish-load", () => {
    // Give a small delay for content to render
    setTimeout(() => {
      resizeOverlayToContent();
    }, 100);
  });

  // Load the overlay route
  if (VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/overlay`);
  } else {
    overlayWindow.loadFile(path.join(RENDERER_DIST, "index.html"), {
      hash: "overlay",
    });
  }

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
}

// Function to resize overlay based on content including dropdowns
async function resizeOverlayToContent() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    console.log('Overlay window not available for resize');
    return;
  }

  try {
    // Execute script in renderer to get content dimensions including dropdowns
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

    // Only resize if dimensions actually changed (prevent unnecessary resizing)
    if (
      currentBounds.width !== dimensions.width ||
      currentBounds.height !== dimensions.height
    ) {
      // Resize the window
      overlayWindow.setSize(dimensions.width, dimensions.height, false); // false = don't animate

      // Reposition to keep it in the same relative position (top-right)
      overlayWindow.setPosition(
        Math.max(0, screenWidth - dimensions.width - 20),
        20
      );

      console.log("Overlay resized to:", dimensions, "Dropdown visible:", dimensions.hasDropdown);
    }
  } catch (error) {
    console.error("Failed to resize overlay:", error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "index.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // Open DevTools for the main window to debug blank screen
  mainWindow.webContents.openDevTools({ mode: "detach" });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // NEW: Add event listeners for minimize and restore
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

  // Listen for when the main window gains focus
  mainWindow.on("focus", () => {
    // If the overlay exists, close it
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });

  // Close all windows and quit app when main window is closed
  mainWindow.on("closed", () => {
    // Close overlay window if it exists
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
    
    // Close popup windows if they exist
    if (tasksPopupWindow && !tasksPopupWindow.isDestroyed()) {
      tasksPopupWindow.close();
      tasksPopupWindow = null;
    }
    
    if (metricsPopupWindow && !metricsPopupWindow.isDestroyed()) {
      metricsPopupWindow.close();
      metricsPopupWindow = null;
    }
    
    // Clear tracking interval if running
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
    
    // Set main window to null
    mainWindow = null;
    
    // Quit the application completely
    app.quit();
  });
}

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // Always quit the app when all windows are closed, even on macOS
  app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
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

let trackingInterval: NodeJS.Timeout | null = null;
let activeWindow: any;

if (process.platform === "win32") {
  activeWindow = require("get-windows").activeWindow;
} else {
  activeWindow = async () => null; // fallback for macOS/Linux
}
const appUsage = new Map<string, number>(); // To store time spent on each app (in seconds)
const CHECK_INTERVAL = 5; // Check every 5 seconds

ipcMain.on("start-tracking", () => {
  console.log("START tracking activity...");
  if (trackingInterval) {
    clearInterval(trackingInterval); // Clear any existing interval
  }

  trackingInterval = setInterval(async () => {
    // Use a standard function for 'this' context if needed, but arrow is fine here
    try {
      // 2. USE the new function to get the window
      const win = await activeWindow();

      if (win) {
        // 3. GET the app name from the 'path' property
        // We split by '/' on Mac/Linux or '\' on Windows and get the last part

        const appName = win.owner.name; // Get the executable name

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
  }, CHECK_INTERVAL * 1000);
});

ipcMain.on("stop-tracking", () => {
  console.log("STOP tracking activity.");
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  // Here you can see the final results for the session
  console.log("--- Session Report ---");
  appUsage.forEach((time, app) => {
    console.log(`${app}: ${time} seconds`);
  });
  console.log("--------------------");

  // Later, you'll send this data to your Go backend
  appUsage.clear(); // Clear the map for the next session
});

// Function to create tasks popup window
function createTasksPopupWindow() {
  if (tasksPopupWindow && !tasksPopupWindow.isDestroyed()) {
    tasksPopupWindow.focus();
    return;
  }

  const overlayBounds = overlayWindow?.getBounds();
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
      preload: path.join(__dirname, "index.mjs"),
    },
  });

  tasksPopupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  tasksPopupWindow.setAlwaysOnTop(true, "screen-saver");

  if (VITE_DEV_SERVER_URL) {
    tasksPopupWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/tasks-popup`);
  } else {
    tasksPopupWindow.loadFile(path.join(RENDERER_DIST, "index.html"), {
      hash: "tasks-popup",
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

// Function to create metrics popup window
function createMetricsPopupWindow() {
  if (metricsPopupWindow && !metricsPopupWindow.isDestroyed()) {
    metricsPopupWindow.focus();
    return;
  }

  const overlayBounds = overlayWindow?.getBounds();
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
      preload: path.join(__dirname, "index.mjs"),
    },
  });

  metricsPopupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  metricsPopupWindow.setAlwaysOnTop(true, "screen-saver");

  if (VITE_DEV_SERVER_URL) {
    metricsPopupWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/metrics-popup`);
  } else {
    metricsPopupWindow.loadFile(path.join(RENDERER_DIST, "index.html"), {
      hash: "metrics-popup",
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

// NEW: Handle dynamic resize requests from renderer
ipcMain.on("resize-overlay", () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    resizeOverlayToContent();
  }
});

// Handle popup window requests
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

// Show/Hide overlay programmatically (Blitz Mode)
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

app.whenReady().then(() => {
  try {
    loadDB();
  } catch (e) {
    console.error("Failed to load local DB:", e);
  }
  createWindow();
});
