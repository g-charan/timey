declare global {
  interface Window {
    // Core IPC
    electronAPI: {
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
    };

    // App control
    appAPI: {
      restoreMain: () => void;
      resizeOverlay: () => void;
      startTracking: () => void;
      stopTracking: () => void;
    };

    // Timer functionality
    timerAPI: {
      startTimer: (duration: number, sessionName: string) => Promise<any>;
      pauseTimer: () => Promise<any>;
      resumeTimer: () => Promise<any>;
      stopTimer: () => Promise<any>;
      getTimerState: () => Promise<any>;
      updateSessionName: (sessionName: string) => Promise<any>;

      onTimerUpdate: (callback: (event: any, state: any) => void) => void;
      removeTimerUpdateListener: (
        callback: (event: any, state: any) => void
      ) => void;
      onTimerComplete: (callback: (event: any, state: any) => void) => void;
      removeTimerCompleteListener: (
        callback: (event: any, state: any) => void
      ) => void;

      onPauseTimer: (callback: (event: any) => void) => void;
      removePauseTimerListener: (callback: (event: any) => void) => void;
      onResumeTimer: (callback: (event: any) => void) => void;
      removeResumeTimerListener: (callback: (event: any) => void) => void;

      updateTimerState: (state: any) => void; // Legacy
    };

    // Database operations
    dbAPI: {
      getDashboardData: () => Promise<any>;
      createProject: (data: {
        id: string;
        name: string;
        color?: string;
      }) => Promise<{ success: boolean }>;
      startSession: (data: {
        id: string;
        project_id?: string;
        task?: string;
        planned_duration?: number;
      }) => Promise<{ success: boolean }>;
      endSession: (data: {
        id: string;
        focus_score?: number;
        tags?: string[];
      }) => Promise<{ success: boolean }>;
    };

    // Keep the old 'db' for backward compatibility (optional)
    db: {
      getDashboardData: () => Promise<any>;
      createProject: (data: {
        id: string;
        name: string;
        color?: string;
      }) => Promise<{ success: boolean }>;
      startSession: (data: {
        id: string;
        project_id?: string;
        task?: string;
        planned_duration?: number;
      }) => Promise<{ success: boolean }>;
      endSession: (data: {
        id: string;
        focus_score?: number;
        tags?: string[];
      }) => Promise<{ success: boolean }>;
    };
  }
}

export {};
