// File: src/renderer/src/components/OverlayTimer.tsx (Dieter Rams Inspired)
import "@/styles/overlay.css";
import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";

export function OverlayTimer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(65); // 65% complete

  const FOCUS_TIME_SECONDS = 1 * 60; // 25 minutes
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined | any = undefined;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (!isActive || timeRemaining === 0) {
      clearInterval(interval);
    }
    setProgress(
      ((FOCUS_TIME_SECONDS - timeRemaining) / FOCUS_TIME_SECONDS) * 100
    );
    if (timeRemaining === 0) {
      setIsActive(false);
      setIsPlaying(false);
      resetTimer();
    }

    // Cleanup function to clear interval when component unmounts or isActive changes
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(FOCUS_TIME_SECONDS);
  };

  // Format time for display
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Only trigger resize on mount, not on state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.electronAPI?.resizeOverlay) {
        window.electronAPI.resizeOverlay();
      }
    }, 100); // Slightly longer delay for initial render

    return () => clearTimeout(timer);
  }, []); // Remove dependencies to only run on mount

  const handleDoubleClick = () => {
    console.log("Double clicked overlay");
    window.electronAPI.restoreMain();
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electronAPI.restoreMain();
  };

  const currentTime = "24:52";
  const currentTask = "Focus Session";

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
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="task-compact">{currentTask}</div>
        </div>

        {/* Center: Progress bar */}
        <div className="progress-section">
          <div className="progress-container-horizontal">
            <div
              className="progress-bar-horizontal"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Right: Minimal controls */}
        <div className="controls-horizontal">
          <Button
            onClick={toggleTimer}
            className="control-button-horizontal"
            size="sm"
            variant="ghost"
          >
            {isActive ? "⏸" : "▶"}
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
    </div>
  );
}
