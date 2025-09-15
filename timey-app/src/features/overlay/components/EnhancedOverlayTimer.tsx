// Enhanced Overlay Timer with Popup Windows
import "@/styles/overlay.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface TimerState {
  timeLeft: number | null;
  isActive: boolean;
  sessionName: string;
  progress: number;
}


export function EnhancedOverlayTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: null,
    isActive: false,
    sessionName: "",
    progress: 0,
  });
  
  const isInitialized = useRef(false);

  // Prevent double rendering by ensuring single initialization
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const handleTimerUpdate = (_: any, state: TimerState) => {
      setTimerState(state);
    };

    if (window.timerAPI) {
      window.timerAPI.onTimerUpdate(handleTimerUpdate);
      window.timerAPI.getTimerState().then((state: TimerState) => {
        if (state) setTimerState(state);
      });
    }

    return () => {
      // Cleanup timer listeners
    };
  }, []);

  // Resize overlay when content changes
  const resizeOverlay = useCallback(() => {
    if (window.appAPI?.resizeOverlay) {
      setTimeout(() => {
        window.appAPI.resizeOverlay();
      }, 50);
    }
  }, []);

  // Debug logging for testing
  const debugLog = (action: string, data?: any) => {
    console.log(`[Overlay Debug] ${action}:`, data || '');
  };

  // Timer functionality
  const handleTimerToggle = () => {
    debugLog('Timer toggle clicked', { isActive: timerState.isActive });
    if (timerState.isActive) {
      debugLog('Pausing timer');
      window.timerAPI?.pauseTimer();
    } else {
      debugLog('Starting/resuming timer');
      if (timerState.timeLeft === null) {
        window.timerAPI?.startTimer(25 * 60, 'Test Session'); // 25 minutes
      } else {
        window.timerAPI?.resumeTimer();
      }
    }
  };

  useEffect(() => {
    resizeOverlay();
  }, [
    timerState.timeLeft,
    timerState.sessionName,
    timerState.progress,
    timerState.isActive,
    resizeOverlay
  ]);

  const handleDoubleClick = () => {
    window.appAPI?.restoreMain();
  };


  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.appAPI?.restoreMain();
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  return (
    <div className="overlay-container-horizontal" onDoubleClick={handleDoubleClick}>
      {/* Drag handle */}
      <div className="drag-handle">
        <div className="drag-dots">
          <span>⋮⋮</span>
        </div>
      </div>

      {/* Main content */}
      <div className="horizontal-content no-drag">
        {/* Timer info */}
        <div className="info-section">
          <div className="time-compact">
            {formatTime(timerState.timeLeft)}
          </div>
          <div className="task-compact">
            {timerState.sessionName || "No active session"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-container-horizontal">
            <div
              className="progress-bar-horizontal"
              style={{
                width: `${timerState.timeLeft !== null ? timerState.progress : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="controls-horizontal">
          {timerState.timeLeft !== null && (
            <Button
              onClick={handleTimerToggle}
              className="control-button-horizontal"
              size="sm"
              variant="ghost"
            >
              {timerState.isActive ? "⏸" : "▶"}
            </Button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              debugLog('Task button clicked');
              // Show tasks popup window
              if (window.appAPI?.showTasksPopup) {
                window.appAPI.showTasksPopup();
                debugLog('showTasksPopup called');
              } else {
                debugLog('showTasksPopup not available, using fallback');
                window.appAPI?.restoreMain();
                localStorage.setItem('timey-navigate-to', 'tasks');
              }
            }}
            className="overlay-button"
            title="View Tasks"
          >
            📋
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              debugLog('Metrics button clicked');
              // Show metrics popup window
              if (window.appAPI?.showMetricsPopup) {
                window.appAPI.showMetricsPopup();
                debugLog('showMetricsPopup called');
              } else {
                debugLog('showMetricsPopup not available, using fallback');
                window.appAPI?.restoreMain();
                localStorage.setItem('timey-navigate-to', 'analytics');
              }
            }}
            className="overlay-button"
            title="App Usage"
          >
            📊
          </button>

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
