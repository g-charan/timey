import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Timer() {
  const FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes
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

    // Cleanup function to clear interval when component unmounts or isActive changes
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    // If the timer is starting, begin tracking. If pausing, stop tracking.
    if (newIsActive) {
      window.electronAPI.startTracking();
    } else {
      window.electronAPI.stopTracking();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(FOCUS_TIME_SECONDS);
    window.electronAPI.stopTracking(); // Also stop tracking on reset
  };
  // Format time for display
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-8xl font-bold font-mono">
        <span>{String(minutes).padStart(2, "0")}</span>:
        <span>{String(seconds).padStart(2, "0")}</span>
      </div>
      <div className="flex gap-4">
        <Button onClick={toggleTimer} className="w-24">
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button onClick={resetTimer} variant="outline" className="w-24">
          Reset
        </Button>
      </div>
    </div>
  );
}
