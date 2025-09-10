declare global {
  interface Window {
    appAPI: {
      restoreMain: () => void;
      resizeOverlay: () => void;
      showTasksPopup?: () => void;
      showMetricsPopup?: () => void;
      closePopups?: () => void;
      startTracking: () => void;
      stopTracking: () => void;
      openPath: (filePath: string) => Promise<{ success: boolean }>;
      getAISuggestion: () => Promise<string>;
      showOverlay: () => void;
      hideOverlay: () => void;
    };
    timerAPI: {
      startTimer: (sessionName: string, duration: number) => void;
      pauseTimer: () => void;
      resumeTimer: () => void;
      resetTimer: () => void;
      getTimerState: () => Promise<any>;
      onTimerUpdate: (callback: (event: any, state: any) => void) => void;
      removeAllListeners: (channel: string) => void;
      removeTimerUpdateListener?: (callback: any) => void;
    };
    databaseAPI: {
      saveTask: (task: any) => Promise<any>;
      getTasks: () => Promise<any[]>;
      updateTask: (id: string, updates: any) => Promise<any>;
      deleteTask: (id: string) => Promise<boolean>;
    };
  }
}

export {};
