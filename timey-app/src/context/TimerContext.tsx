// File: context/TimerContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface TimerState {
  timeLeft: number | null;
  isActive: boolean;
  sessionName: string;
  progress: number;
  totalTime?: number;
}

interface TimerContextType extends TimerState {
  startTimer: (duration: number, sessionName: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  updateSessionName: (sessionName: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: null,
    isActive: false,
    sessionName: "",
    progress: 0,
    totalTime: 0,
  });

  useEffect(() => {
    const handleTimerUpdate = (event: any, state: TimerState) => {
      console.log("Timer context received update:", state);
      setTimerState(state);
    };

    const handleTimerComplete = (event: any, state: TimerState) => {
      console.log("Timer completed:", state);
      setTimerState(state);
      // You can add completion notifications here
    };

    if (window.timerAPI) {
      // Listen for timer updates from main process
      window.timerAPI.onTimerUpdate(handleTimerUpdate);
      window.timerAPI.onTimerComplete(handleTimerComplete);

      // Get initial timer state
      window.timerAPI.getTimerState().then((state: TimerState) => {
        if (state) {
          console.log("Initial timer state:", state);
          setTimerState(state);
        }
      });
    }

    return () => {
      if (window.timerAPI) {
        window.timerAPI.removeTimerUpdateListener(handleTimerUpdate);
        window.timerAPI.removeTimerCompleteListener(handleTimerComplete);
      }
    };
  }, []);

  const startTimer = async (duration: number, sessionName: string) => {
    console.log("TimerContext: Starting timer", { duration, sessionName });
    if (window.timerAPI) {
      // Convert minutes to seconds
      const durationInSeconds = duration * 60;
      try {
        const result = await window.timerAPI.startTimer(
          durationInSeconds,
          sessionName
        );
        console.log("Timer started:", result);
      } catch (error) {
        console.error("Failed to start timer:", error);
      }
    }
  };

  const pauseTimer = async () => {
    console.log("TimerContext: Pausing timer");
    if (window.timerAPI) {
      try {
        const result = await window.timerAPI.pauseTimer();
        console.log("Timer paused:", result);
      } catch (error) {
        console.error("Failed to pause timer:", error);
      }
    }
  };

  const resumeTimer = async () => {
    console.log("TimerContext: Resuming timer");
    if (window.timerAPI) {
      try {
        const result = await window.timerAPI.resumeTimer();
        console.log("Timer resumed:", result);
      } catch (error) {
        console.error("Failed to resume timer:", error);
      }
    }
  };

  const resetTimer = async () => {
    console.log("TimerContext: Resetting timer");
    if (window.timerAPI) {
      try {
        const result = await window.timerAPI.stopTimer();
        console.log("Timer stopped/reset:", result);
      } catch (error) {
        console.error("Failed to stop timer:", error);
      }
    }
  };

  const updateSessionName = async (sessionName: string) => {
    console.log("TimerContext: Updating session name", sessionName);
    if (window.timerAPI) {
      try {
        const result = await window.timerAPI.updateSessionName(sessionName);
        console.log("Session name updated:", result);
      } catch (error) {
        console.error("Failed to update session name:", error);
      }
    }
  };

  const contextValue: TimerContextType = {
    ...timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateSessionName,
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};
