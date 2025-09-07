import { useState, useEffect } from "react";
import * as chrono from "chrono-node";
import { Play, Pause, Clock, HelpCircle, RotateCcw } from "lucide-react";
import { useTimer } from "../../../context/TimerContext";

export default function TimerScreen() {
  const [input, setInput] = useState("");
  const [parsedDuration, setParsedDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [examplesVisible, setExamplesVisible] = useState(false);

  const {
    timeLeft,
    isActive,
    sessionName,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useTimer();

  // Debug: Log timer context values
  useEffect(() => {
    console.log(
      "TimerScreen Context - timeLeft:",
      timeLeft,
      "isActive:",
      isActive,
      "progress:",
      progress,
      "sessionName:",
      sessionName
    );
  }, [timeLeft, isActive, progress, sessionName]);

  useEffect(() => {
    if (input.trim() === "") {
      setParsedDuration(null);
      setError(null);
      return;
    }

    // Parse the input text for time expressions
    const results = chrono.parse(input);

    if (results.length === 0) {
      setError("No time duration detected");
      setParsedDuration(null);
      return;
    }

    const result = results[0];

    // Handle different types of time expressions
    if (result.start && result.end) {
      // Time range (e.g., "2pm to 3pm")
      const start = result.start.date();
      const end = result.end.date();
      const durationInMs = end.getTime() - start.getTime();

      if (durationInMs <= 0) {
        setError("End time cannot be before start time");
        setParsedDuration(null);
        return;
      }

      const durationInMinutes = Math.round(durationInMs / (1000 * 60));
      setParsedDuration(durationInMinutes);
      setError(null);
    } else if (result.start && !result.end) {
      // Duration expression (e.g., "for 25 minutes")
      if (result.start.isCertain("hour") || result.start.isCertain("minute")) {
        const start = result.start.date();
        const now = new Date();
        const durationInMs = start.getTime() - now.getTime();

        if (durationInMs <= 0) {
          setError("Please specify a future time");
          setParsedDuration(null);
          return;
        }

        const durationInMinutes = Math.round(durationInMs / (1000 * 60));
        setParsedDuration(durationInMinutes);
        setError(null);
      } else {
        // Handle relative time (e.g., "25 minutes")
        const duration =
          (result.start.get("hour") || 0) * 60 +
          (result.start.get("minute") || 0);

        if (duration <= 0) {
          setError("Please enter a valid duration");
          setParsedDuration(null);
          return;
        }

        setParsedDuration(duration);
        setError(null);
      }
    }
  }, [input]);

  function handleStart() {
    if (!parsedDuration) {
      setError("Please enter a valid duration first");
      return;
    }

    // Extract session name (remove time expressions)
    const timeRegex =
      /(\d+\s*(hours?|hrs?|minutes?|mins?|h|m)|[0-9]?[0-9]:[0-9][0-9]|\d+\s*(am|pm))/gi;
    const name = input.replace(timeRegex, "").trim();

    console.log(
      "Starting timer with duration:",
      parsedDuration,
      "name:",
      name || "Focus Session"
    );

    // Start the timer using context
    startTimer(parsedDuration, name || "Focus Session");
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {timeLeft === null ? (
          // Input screen
          <>
            <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
              Focus Session
            </h1>
            <p className="text-sm text-center text-gray-500 mb-6">
              What would you like to focus on?
            </p>

            <div className="relative mb-4">
              <input
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 'Work on project for 25 minutes'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {parsedDuration && (
              <div className="flex items-center justify-center text-sm bg-blue-50 text-blue-700 p-3 rounded-lg mb-6">
                <Clock size={16} className="mr-2" />
                {parsedDuration} minute session
              </div>
            )}

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleStart}
              disabled={!parsedDuration}
            >
              <Play size={18} className="mr-2" />
              Start Focus Session
            </button>

            <div className="mt-4 text-center">
              <button
                className="text-sm text-gray-500 flex items-center justify-center mx-auto"
                onClick={() => setExamplesVisible(!examplesVisible)}
              >
                <HelpCircle size={14} className="mr-1" />
                How to specify time
              </button>

              {examplesVisible && (
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Examples:</p>
                  <p>"25 minutes"</p>
                  <p>"1 hour"</p>
                  <p>"9:00 to 9:30"</p>
                  <p>"2pm until 3:30pm"</p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Timer screen
          <>
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
              {sessionName}
            </h2>

            <div className="relative my-8 mx-auto w-64 h-64">
              {/* Circular progress background */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

              {/* Circular progress indicator */}
              <div
                className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-4 border-r-4 border-b-4 border-l-4"
                style={{
                  clipPath: `inset(0 0 0 ${100 - progress}%)`,
                  transform: "rotate(90deg)",
                  transformOrigin: "center",
                }}
              ></div>

              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-800">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {isActive ? "In progress" : "Paused"}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              {isActive ? (
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  onClick={pauseTimer}
                >
                  <Pause size={16} className="mr-2" />
                  Pause
                </button>
              ) : (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  onClick={resumeTimer}
                >
                  <Play size={16} className="mr-2" />
                  Resume
                </button>
              )}

              <button
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                onClick={resetTimer}
              >
                <RotateCcw size={16} className="mr-2" />
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
