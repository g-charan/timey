import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { screen, ipcMain } from "electron";
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import "./ipc";

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
let mainWindow: BrowserWindow | null;
let overlayWindow: BrowserWindow | null;

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
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // overlayWindow.webContents.openDevTools({ mode: "detach" });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setFullScreenable(false);
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setIgnoreMouseEvents(false);

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

// Function to resize overlay based on content
async function resizeOverlayToContent() {
  if (!overlayWindow) return;

  try {
    // Execute script in renderer to get content dimensions
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

      console.log("Overlay resized to:", dimensions);
    }
  } catch (error) {
    console.error("Failed to resize overlay:", error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

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
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });

  mainWindow.on("blur", () => {
    // If the overlay doesn't already exist, create it
    if (mainWindow && !mainWindow.isFullScreen()) {
      // If the overlay doesn't already exist, create it
      if (!overlayWindow) {
        createOverlayWindow();
      }
    }
  });

  // Listen for when the main window gains focus
  mainWindow.on("focus", () => {
    // If the overlay exists, close it
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null; // Reset the variable
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    mainWindow = null;
  }
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
  if (mainWindow) {
    mainWindow.restore();
    if (overlayWindow) {
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

// NEW: Handle dynamic resize requests from renderer
ipcMain.on("resize-overlay", () => {
  resizeOverlayToContent();
});

app.whenReady().then(createWindow);
