import { ipcMain } from "electron";
import { mainWindow, overlayWindow } from "..";

export class TimerManager {
  private timerState = {
    timeLeft: null as number | null,
    isActive: false,
    sessionName: "",
    progress: 0,
    totalTime: 0,
  };

  private timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    // Start a new timer
    ipcMain.handle(
      "start-timer",
      (
        event,
        { duration, sessionName }: { duration: number; sessionName: string }
      ) => {
        this.startTimer(duration, sessionName);
        return this.timerState;
      }
    );

    // Pause the timer
    ipcMain.handle("pause-timer", () => {
      this.pauseTimer();
      return this.timerState;
    });

    // Resume the timer
    ipcMain.handle("resume-timer", () => {
      this.resumeTimer();
      return this.timerState;
    });

    // Stop the timer
    ipcMain.handle("stop-timer", () => {
      this.stopTimer();
      return this.timerState;
    });

    // Get current timer state
    ipcMain.handle("get-timer-state", () => {
      return this.timerState;
    });

    // Update session name
    ipcMain.handle("update-session-name", (event, sessionName: string) => {
      this.timerState.sessionName = sessionName;
      this.broadcastUpdate();
      return this.timerState;
    });
  }

  private startTimer(duration: number, sessionName: string) {
    // Clear existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerState = {
      timeLeft: duration,
      totalTime: duration,
      isActive: true,
      sessionName: sessionName,
      progress: 0,
    };

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);

    this.broadcastUpdate();
  }

  private pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerState.isActive = false;
    this.broadcastUpdate();
  }

  private resumeTimer() {
    if (this.timerState.timeLeft && this.timerState.timeLeft > 0) {
      this.timerState.isActive = true;
      this.timerInterval = setInterval(() => {
        this.tick();
      }, 1000);
      this.broadcastUpdate();
    }
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerState = {
      timeLeft: null,
      isActive: false,
      sessionName: "",
      progress: 0,
      totalTime: 0,
    };
    this.broadcastUpdate();
  }

  private tick() {
    if (this.timerState.timeLeft !== null && this.timerState.timeLeft > 0) {
      this.timerState.timeLeft -= 1;

      // Calculate progress
      if (this.timerState.totalTime > 0) {
        this.timerState.progress =
          ((this.timerState.totalTime - this.timerState.timeLeft) /
            this.timerState.totalTime) *
          100;
      }

      this.broadcastUpdate();

      // Timer finished
      if (this.timerState.timeLeft === 0) {
        this.onTimerComplete();
      }
    }
  }

  private onTimerComplete() {
    this.timerState.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Notify both windows that timer completed
    this.broadcastUpdate();
    this.broadcastTimerComplete();
  }

  private broadcastUpdate() {
    // Send to main window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("timer-update", this.timerState);
    }

    // Send to overlay window
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send("timer-update", this.timerState);
    }
  }

  private broadcastTimerComplete() {
    // Send timer complete event to both windows
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("timer-complete", this.timerState);
    }

    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send("timer-complete", this.timerState);
    }
  }

  // Public method to get current state
  public getCurrentState() {
    return { ...this.timerState };
  }
}
