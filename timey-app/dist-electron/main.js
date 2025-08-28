import { app, BrowserWindow, ipcMain, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require2 = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
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
      preload: path.join(__dirname, "preload.mjs")
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
    overlayWindow.loadFile(path.join(RENDERER_DIST, "index.html"), {
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
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
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
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
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
    if (!overlayWindow) {
      createOverlayWindow();
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
