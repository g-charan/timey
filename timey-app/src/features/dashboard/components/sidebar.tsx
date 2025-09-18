// --- AppSidebar Component ---
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
  Coffee,
} from "lucide-react";

export const sidebarNavGroups = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
      { id: "calendar", title: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Task Management",
    items: [
      { id: "tasks", title: "Tasks", icon: FileCode2 },
      { id: "eisenhower", title: "Priority Matrix", icon: Grid3X3 },
      { id: "projectshub", title: "Projects", icon: Zap },
    ],
  },
  {
    label: "Focus & Productivity",
    items: [
      { id: "focus", title: "Focus Mode", icon: Target },
      { id: "pomodoro", title: "Pomodoro", icon: Coffee },
      { id: "timer", title: "Timer", icon: TimerIcon },
    ],
  },
  {
    label: "Analytics & Insights",
    items: [
      { id: "analytics", title: "Analytics", icon: BarChart3 },
      { id: "tracking", title: "App Tracking", icon: Monitor },
      { id: "momentum", title: "Achievements", icon: Trophy },
    ],
  },
  {
    label: "Settings",
    items: [{ id: "settings", title: "Settings", icon: Settings }],
  },
];
