"use client";

import { useState, useEffect, useMemo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { useStartSession, useEndSession } from "@/hooks/use-database";

// ---------------- Helper Components ---------------- //

const CircularProgress = ({
  progress,
  children,
}: {
  progress: number;
  children?: ReactNode;
}) => {
  const strokeDasharray = 264;
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  return (
    <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="42"
          cx="50"
          cy="50"
        />
        <circle
          className="text-primary"
          strokeWidth="10"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="42"
          cx="50"
          cy="50"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>
      <div className="absolute">{children}</div>
    </div>
  );
};

const TimerDisplay = ({ timeRemaining }: { timeRemaining: number }) => {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const seconds = String(timeRemaining % 60).padStart(2, "0");
  return (
    <div className="text-5xl sm:text-6xl font-bold font-mono text-foreground">
      {minutes}:{seconds}
    </div>
  );
};

// ---------------- Main Timer Component ---------------- //

const initialTags = [
  { value: "deep-work", label: "Deep Work" },
  { value: "coding", label: "Coding" },
  { value: "design", label: "Design" },
  { value: "research", label: "Research" },
];

export function Timer() {
  // Setup state
  const [tags, setTags] = useState(initialTags);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [magicInput, setMagicInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);

  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();

  // Reset timer when duration changes (but only if not active)
  useEffect(() => {
    if (!isActive && !isSetupComplete) {
      setTimeRemaining(focusDuration * 60);
    }
  }, [focusDuration, isActive, isSetupComplete]);

  const startSession = () => {
    if (!selectedTag) {
      alert("Please select or create a tag for your session.");
      return;
    }
    setTimeRemaining(focusDuration * 60);
    setIsActive(true);
    setIsSetupComplete(true);
    window.appAPI?.startTracking?.(); // safe call

    const id = crypto.randomUUID();
    setSessionId(id);
    startSessionMutation.mutate({
      id,
      project_id: undefined,
      task: selectedTag,
      planned_duration: focusDuration * 60,
    });
  };

  const stopSession = () => {
    setIsActive(false);
    window.appAPI?.stopTracking?.();

    if (sessionId) {
      endSessionMutation.mutate({ id: sessionId, focus_score: undefined, tags: [selectedTag] });
      setSessionId(null);
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setIsSetupComplete(false);
    setTimeRemaining(focusDuration * 60);
    window.appAPI?.stopTracking?.();
    if (sessionId) {
      endSessionMutation.mutate({ id: sessionId, focus_score: undefined, tags: [selectedTag] });
      setSessionId(null);
    }
  };

  // Countdown logic
  useEffect(() => {
    if (!isActive) return;
    if (timeRemaining <= 0) {
      setIsActive(false);
      window.appAPI?.stopTracking?.();
      if (sessionId) {
        endSessionMutation.mutate({ id: sessionId, focus_score: undefined, tags: [selectedTag] });
        setSessionId(null);
      }
      return;
    }
    const interval = setInterval(
      () => setTimeRemaining((time) => time - 1),
      1000
    );
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    return (timeRemaining / (focusDuration * 60)) * 100;
  }, [timeRemaining, focusDuration]);

  // ---------------- Setup UI ---------------- //
  if (!isSetupComplete) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-8 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Setup Your Focus Session</h2>
          <p className="text-muted-foreground">
            Choose a task and duration to begin focusing.
          </p>
        </div>

        <div className="w-full space-y-6">
          {/* MagicInput */}
          <div className="space-y-2">
            <Label>Describe your focus (e.g., "Write spec for 45m")</Label>
            <input
              className="border rounded w-full p-2 bg-background text-foreground"
              placeholder="What will you focus on?"
              value={magicInput}
              onChange={(e) => {
                const val = e.target.value;
                setMagicInput(val);
                // lightweight duration parse: e.g., 45m, 30 min, 2h
                const m = val.match(/(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)/i);
                if (m) {
                  const n = parseInt(m[1], 10);
                  const unit = m[2].toLowerCase();
                  const minutes = /(h|hr|hrs|hour|hours)/.test(unit) ? n * 60 : n;
                  const clamped = Math.max(5, Math.min(90, minutes));
                  setFocusDuration(clamped);
                }
              }}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>What is your main focus?</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger className="w-full">
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedTag
                    ? tags.find((tag) => tag.value === selectedTag)?.label
                    : "Select or create a tag..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              {/* ✅ FIXED HERE */}
              <PopoverContent className="w-[--radix-popper-anchor-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search or create tag..."
                    value={inputValue}
                    onValueChange={setInputValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          if (!inputValue.trim()) return;
                          const newTag = {
                            value: inputValue
                              .toLowerCase()
                              .replace(/\s+/g, "-"),
                            label: inputValue,
                          };
                          setTags((prev) => [...prev, newTag]);
                          setSelectedTag(newTag.value);
                          setInputValue("");
                          setOpen(false);
                        }}
                      >
                        Create “{inputValue}”
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag) => (
                        <CommandItem
                          key={tag.value}
                          value={tag.value}
                          onSelect={() => {
                            setSelectedTag(tag.value);
                            setInputValue("");
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTag === tag.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {tag.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Focus Duration</Label>
              <span className="font-medium text-muted-foreground">
                {focusDuration} minutes
              </span>
            </div>
            <Slider
              value={[focusDuration]}
              min={5}
              max={90}
              step={5}
              onValueChange={([val]) => setFocusDuration(val)}
            />
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={startSession}>
          <Play className="mr-2 h-5 w-5" /> Start Focusing
        </Button>
      </div>
    );
  }

  // ---------------- Active Session UI ---------------- //
  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      <CircularProgress progress={progress}>
        <TimerDisplay timeRemaining={timeRemaining} />
      </CircularProgress>

      <div className="text-center">
        <p className="text-xl font-semibold">
          {tags.find((t) => t.value === selectedTag)?.label}
        </p>
        <p className="text-sm text-muted-foreground">Focus Session</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={resetSession}
          variant="ghost"
          size="icon"
          className="h-16 w-16"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
        <Button
          onClick={stopSession}
          className="h-24 w-24 rounded-full text-2xl font-bold shadow-lg"
        >
          <Pause className="w-10 h-10" />
        </Button>
      </div>
    </div>
  );
}
