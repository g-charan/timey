import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { screen, ipcMain } from "electron";
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
    console.log("Overlay window not available for resize");
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
let activeWindow: any = null;
const appUsage = new Map<string, number>(); // To store time spent on each app (in seconds)
const CHECK_INTERVAL = 5; // Check every 5 seconds

// Initialize the activeWindow function using windows-cli package
async function initializeActiveWindow() {
  try {
    const { exec } = await import('child_process');
    
    activeWindow = async () => {
      try {
        return new Promise((resolve) => {
          // Use active-window CLI command to get active window info
          exec('active-window', { timeout: 5000 }, (error, stdout) => {
            if (error) {
              console.error("[TRACKING] windows-cli error:", error);
              resolve(null);
              return;
            }
            
            const output = stdout?.trim();
            if (!output) {
              console.log("[TRACKING] No active window detected");
              resolve(null);
              return;
            }
            
            // Parse the output - active-window returns lines: title, id, app, pid
            const lines = output.split('\n').map(line => line.trim());
            console.log(`[TRACKING] Raw output lines:`, lines);
            
            if (lines.length >= 2) {
              const [title, id, app, pid] = lines;
              
              // Extract app name from title if app is undefined
              let appName = app && app !== 'undefined' ? app : 'Unknown App';
              if (appName === 'Unknown App' && title) {
                // Try to extract app name from title (e.g., "timey - Windsurf - ..." -> "Windsurf")
                const titleParts = title.split(' - ');
                if (titleParts.length > 1) {
                  appName = titleParts[1] || titleParts[0];
                }
              }
              
              const processId = pid && pid !== 'undefined' ? parseInt(pid) : 0;
              
              console.log(`[TRACKING] Successfully detected: ${appName} - ${title}`);
              resolve({
                title: title || "Unknown Window",
                owner: {
                  name: appName,
                  processId: processId,
                  path: ""
                },
                id: id || "unknown"
              });
            } else {
              console.log("[TRACKING] Invalid active-window output format - not enough lines");
              resolve(null);
            }
          });
        });
      } catch (error) {
        console.error("[TRACKING] Error executing active-window command:", error);
        return null;
      }
    };
    console.log("[TRACKING] Successfully initialized windows-cli");
  } catch (error) {
    console.error("[TRACKING] Failed to load windows-cli:", error);
    // Fallback to null function
    activeWindow = async () => null;
  }
}

ipcMain.on("start-tracking", async () => {
  console.log("START tracking activity...");

  // Initialize activeWindow if not already done
  if (!activeWindow) {
    await initializeActiveWindow();
  }

  if (trackingInterval) {
    clearInterval(trackingInterval); // Clear any existing interval
  }

  trackingInterval = setInterval(async () => {
    try {
      // Use the initialized activeWindow function
      const win = await activeWindow();

      if (win && win.owner && win.owner.name) {
        const appName = win.owner.name; // Get the executable name
        const windowTitle = win.title || "Unknown Window";
        const currentTime = appUsage.get(appName) || 0;
        appUsage.set(appName, currentTime + CHECK_INTERVAL);

        console.log(
          `[TRACKING] Active App: ${appName} | Window: ${windowTitle} | Session Time: ${appUsage.get(appName)}s | Total Apps Tracked: ${appUsage.size}`
        );
      } else {
        console.log("[TRACKING] No active window detected or window data unavailable");
      }
    } catch (error) {
      console.error("[TRACKING ERROR] Could not get active window:", error);
    }
  }, CHECK_INTERVAL * 1000);

  console.log(`[TRACKING] Started monitoring active windows every ${CHECK_INTERVAL} seconds`);
});

ipcMain.on("stop-tracking", () => {
  console.log("[TRACKING] STOP tracking activity.");
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  // Here you can see the final results for the session
  console.log("[TRACKING] === SESSION REPORT ===");
  if (appUsage.size > 0) {
    appUsage.forEach((time, app) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      console.log(`[TRACKING] ${app}: ${minutes}m ${seconds}s (${time} total seconds)`);
    });
    console.log(`[TRACKING] Total apps tracked: ${appUsage.size}`);
    console.log(`[TRACKING] Total session time: ${Array.from(appUsage.values()).reduce((a, b) => a + b, 0)} seconds`);
  } else {
    console.log("[TRACKING] No app usage data recorded in this session");
  }
  console.log("[TRACKING] === END REPORT ===");

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

  tasksPopupWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });
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

  metricsPopupWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });
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

app.whenReady().then(async () => {
  try {
    loadDB();
  } catch (e) {
    console.error("Failed to load local DB:", e);
  }

  // Initialize the activeWindow function
  await initializeActiveWindow();

  createWindow();
});
