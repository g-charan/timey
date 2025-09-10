// File: src/renderer/src/components/OverlayTimer.tsx
import "@/styles/overlay.css";
import { Button } from "../../components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { useTaskStore } from "../../stores/taskStore";

interface TimerState {
  timeLeft: number | null;
  isActive: boolean;
  sessionName: string;
  progress: number;
}

interface AppUsage {
  appName: string;
  timeSpent: number;
  category: string;
  isActive: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function OverlayTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: null,
    isActive: false,
    sessionName: "",
    progress: 0,
  });
  const [showTasks, setShowTasks] = useState(false);
  const [activeTasks, setActiveTasks] = useState<TaskItem[]>([]);
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [showAppTracker, setShowAppTracker] = useState(false);
  const renderCountRef = useRef(0);
  const { toggleTask, tasks } = useTaskStore();

  // Listen for timer updates from main process
  useEffect(() => {
    const handleTimerUpdate = (event: any, state: TimerState) => {
      setTimerState(state);
    };

    if (window.timerAPI) {
      window.timerAPI.onTimerUpdate(handleTimerUpdate);

      // Request current timer state on mount
      window.timerAPI.getTimerState().then((state: TimerState) => {
        if (state) setTimerState(state);
      });
    }

    return () => {
      if (window.timerAPI) {
        window.timerAPI.removeTimerUpdateListener(handleTimerUpdate);
      }
    };
  }, []);

  // Trigger resize when timer values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.appAPI?.resizeOverlay) {
        window.appAPI.resizeOverlay();
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
    window.appAPI?.restoreMain();
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.timerAPI) {
      if (timerState.isActive) {
        window.timerAPI.pauseTimer();
      } else if (timerState.timeLeft !== null && timerState.timeLeft > 0) {
        window.timerAPI.resumeTimer();
      }
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.appAPI?.restoreMain();
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

          {/* Tasks toggle button (same style as pause) */}
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const list = await window.dbAPI?.getTodayTasks?.();
                const inProgress = (list || []).filter(
                  (t: any) => t.status === "in_progress"
                );
                setActiveTasks(
                  inProgress.map((t: any) => ({ id: t.id, title: t.title }))
                );
              } catch {}
              setShowTasks((v) => !v);
            }}
            className="control-button-horizontal"
            size="sm"
            variant="ghost"
            title="Show tasks"
          >
            ▾
          </Button>

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

      {showTasks && (
        <div
          className="no-drag"
          style={{
            position: "absolute",
            bottom: -6,
            right: 6,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            borderRadius: 6,
            padding: 8,
            minWidth: 200,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>
            In Progress
          </div>
          {activeTasks.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.8 }}>No active tasks</div>
          ) : (
            <ul style={{ display: "grid", gap: 6 }}>
              {activeTasks.map((t) => (
                <li
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 160,
                    }}
                  >
                    {t.title}
                  </span>
                  <button
                    className="text-xs px-2 py-0.5 rounded bg-white text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.appAPI?.restoreMain?.();
                    }}
                  >
                    Focus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
