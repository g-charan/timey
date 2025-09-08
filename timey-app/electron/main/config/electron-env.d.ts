/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}
export interface IElectronAPI {
  // Basic IPC methods
  ipcOn: (
    channel: string,
    listener: (event: any, ...args: any[]) => void
  ) => void;
  ipcOff: (
    channel: string,
    listener: (event: any, ...args: any[]) => void
  ) => void;
  ipcSend: (channel: string, ...args: any[]) => void;
  ipcInvoke: (channel: string, ...args: any[]) => Promise<any>;

  // Application methods
  restoreMain: () => void;
  resizeOverlay: () => void;
  startTracking: () => void;
  stopTracking: () => void;

  // Timer methods
  updateTimerState: (state: any) => void;
  getTimerState: () => Promise<any>;
  pauseTimer: () => void;
  resumeTimer: () => void;

  // Timer event listeners
  onTimerUpdate: (callback: (event: any, state: any) => void) => void;
  removeTimerUpdateListener: (
    callback: (event: any, state: any) => void
  ) => void;
  onPauseTimer: (callback: (event: any) => void) => void;
  removePauseTimerListener: (callback: (event: any) => void) => void;
  onResumeTimer: (callback: (event: any) => void) => void;
  removeResumeTimerListener: (callback: (event: any) => void) => void;
}

// Used in Renderer process, expose in `preload.ts`
declare global {
  interface Window {
    ipcRenderer: import("electron").IpcRenderer;
    electronAPI: IElectronAPI | any;
  }
}
