// File: src/renderer/src/components/MainApp.tsx (Fully Implemented)
// NOTE: You'll need these libraries:
// npm install lucide-react recharts react-day-picker date-fns class-variance-authority clsx tailwind-merge

import { useState, useEffect } from "react";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Timer as TimerIcon,
  BarChart3,
  CalendarDays,
  Settings,
  FileCode2,
  Target,
  Zap,
  Trophy,
  Monitor,
  Grid3X3,
  Coffee
} from "lucide-react";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardView } from "./components/dashboard";
import { StatsView } from "../stats/components/stats-view";
import { CalendarView } from "../calendar/components/calendar-view";
import ProjectsHub from "../projecthub/components/projectshub-view";
import TimerScreen from "../timer/components/timer-view";
import TodayList from "./components/today-list";
import TasksTab from "./components/tasks-tab";

// Import new advanced components
import { EisenhowerMatrix } from "@/components/eisenhower/EisenhowerMatrix";
import { FocusMode } from "@/components/focus/FocusMode";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import { ProductivityAnalytics } from "@/components/analytics/ProductivityAnalytics";
import { AppTimeTracker } from "@/components/tracking/AppTimeTracker";
import { MomentumBuilder } from "@/components/gamification/MomentumBuilder";
import { PersonalizationSettings } from "@/components/settings/PersonalizationSettings";

// --- AppSidebar Component ---

export const sidebarNavGroups = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
      { id: "calendar", title: "Calendar", icon: CalendarDays },
    ]
  },
  {
    label: "Task Management",
    items: [
      { id: "tasks", title: "Tasks", icon: FileCode2 },
      { id: "eisenhower", title: "Priority Matrix", icon: Grid3X3 },
      { id: "projectshub", title: "Projects", icon: Zap },
    ]
  },
  {
    label: "Focus & Productivity",
    items: [
      { id: "focus", title: "Focus Mode", icon: Target },
      { id: "pomodoro", title: "Pomodoro", icon: Coffee },
      { id: "timer", title: "Timer", icon: TimerIcon },
    ]
  },
  {
    label: "Analytics & Insights",
    items: [
      { id: "analytics", title: "Analytics", icon: BarChart3 },
      { id: "tracking", title: "App Tracking", icon: Monitor },
      { id: "momentum", title: "Achievements", icon: Trophy },
    ]
  },
  {
    label: "Settings",
    items: [
      { id: "settings", title: "Settings", icon: Settings },
    ]
  }
];

// --- Main Application Component ---

function MainApp() {
  const [activeView, setActiveView] = useState("dashboard");
  
  // Initialize global keyboard shortcuts
  useGlobalShortcuts(setActiveView);

  // Handle navigation from overlay
  useEffect(() => {
    const handleNavigation = () => {
      const navigateTo = localStorage.getItem('timey-navigate-to');
      if (navigateTo) {
        setActiveView(navigateTo);
        localStorage.removeItem('timey-navigate-to');
      }
    };

    // Check for navigation intent when window gains focus
    window.addEventListener('focus', handleNavigation);
    
    // Also check periodically in case the event doesn't fire
    const interval = setInterval(handleNavigation, 1000);

    return () => {
      window.removeEventListener('focus', handleNavigation);
      clearInterval(interval);
    };
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <DashboardView />
            </div>
            <div>
              <TodayList />
            </div>
          </div>
        );
      case "tasks":
        return <TasksTab />;
      case "eisenhower":
        return <EisenhowerMatrix />;
      case "focus":
        return <FocusMode />;
      case "pomodoro":
        return <PomodoroTimer />;
      case "timer":
        return <TimerScreen />;
      case "analytics":
        return <ProductivityAnalytics />;
      case "tracking":
        return <AppTimeTracker />;
      case "momentum":
        return <MomentumBuilder />;
      case "calendar":
        return <CalendarView />;
      case "settings":
        return <PersonalizationSettings />;
      case "projectshub":
        return <ProjectsHub />;
      case "stats":
      default:
        return <StatsView />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex h-screen">
      <SidebarProvider>
        <AppSidebar setActiveView={setActiveView} />
        <div className="flex-grow flex flex-col overflow-hidden">
          <header className="p-4 border-b flex justify-end items-center flex-shrink-0">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-grow p-6 bg-muted/40 overflow-y-auto">
            {renderView()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default MainApp;
