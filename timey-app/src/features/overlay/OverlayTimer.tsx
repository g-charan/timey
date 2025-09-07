// File: src/renderer/src/components/OverlayTimer.tsx
import "@/styles/overlay.css";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";

interface TimerState {
  timeLeft: number | null;
  isActive: boolean;
  sessionName: string;
  progress: number;
}

export function OverlayTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: null,
    isActive: false,
    sessionName: "",
    progress: 0,
  });

  // Listen for timer updates from main process
  useEffect(() => {
    const handleTimerUpdate = (event: any, state: TimerState) => {
      setTimerState(state);
    };

    if (window.electronAPI) {
      window.electronAPI.onTimerUpdate(handleTimerUpdate);

      // Request current timer state on mount
      window.electronAPI.getTimerState().then((state: TimerState) => {
        if (state) setTimerState(state);
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeTimerUpdateListener(handleTimerUpdate);
      }
    };
  }, []);

  // Trigger resize when timer values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.electronAPI?.resizeOverlay) {
        window.electronAPI.resizeOverlay();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [
    timerState.timeLeft,
    timerState.sessionName,
    timerState.progress,
    timerState.isActive,
  ]);

  const handleDoubleClick = () => {
    console.log("Double clicked overlay");
    window.electronAPI?.restoreMain();
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI) {
      if (timerState.isActive) {
        window.electronAPI.pauseTimer();
      } else if (timerState.timeLeft !== null && timerState.timeLeft > 0) {
        window.electronAPI.resumeTimer();
      }
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electronAPI?.restoreMain();
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className="overlay-container-horizontal"
      onDoubleClick={handleDoubleClick}
    >
      {/* Dedicated draggable handle - visible and intuitive */}
      <div className="drag-handle">
        <div className="drag-dots">
          <span>⋮⋮</span>
        </div>
      </div>

      {/* Compact horizontal layout */}
      <div className="horizontal-content no-drag">
        {/* Left: Time and task in compact format */}
        <div className="info-section">
          <div className="time-compact">
            {timerState.timeLeft !== null
              ? formatTime(timerState.timeLeft)
              : "00:00"}
          </div>
          <div className="task-compact">
            {timerState.sessionName || "No active session"}
          </div>
        </div>

        {/* Center: Progress bar */}
        <div className="progress-section">
          <div className="progress-container-horizontal">
            <div
              className="progress-bar-horizontal"
              style={{
                width: `${
                  timerState.timeLeft !== null ? timerState.progress : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Right: Minimal controls */}
        <div className="controls-horizontal">
          {timerState.timeLeft !== null && timerState.timeLeft > 0 && (
            <Button
              onClick={handlePlayPause}
              className="control-button-horizontal"
              size="sm"
              variant="ghost"
            >
              {timerState.isActive ? "⏸" : "▶"}
            </Button>
          )}

          <Button
            onClick={handleClose}
            className="control-button-horizontal"
            size="sm"
            variant="ghost"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
