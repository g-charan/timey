// File: src/renderer/src/components/MainApp.tsx (Fully Implemented)
// NOTE: You'll need these libraries:
// npm install lucide-react recharts react-day-picker date-fns class-variance-authority clsx tailwind-merge

import {
  useState,
  forwardRef,
  HTMLAttributes,
  createContext,
  useContext,
} from "react";
import { Timer } from "@/components/timer/Timer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Timer as TimerIcon,
  BarChart3,
  CalendarDays,
  Settings,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardView } from "./components/dashboard";
import { StatsView } from "../stats/components/stats-view";
import { CalendarView } from "../calendar/components/calendar-view";
import { SettingsView } from "../settings/components/settings-view";
import ProjectsHub from "../projecthub/components/projectshub-view";

// --- Page Components (Production Ready) ---

const TimerView = () => (
  <div className="flex items-center justify-center w-full h-full">
    <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Focus Session</CardTitle>
        <CardDescription className="text-center">
          Select a task and start the timer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timer />
      </CardContent>
    </Card>
  </div>
);

// --- AppSidebar Component ---

export const sidebarNavItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "timer", title: "Timer", icon: TimerIcon },
  { id: "calendar", title: "Calendar", icon: CalendarDays },
  { id: "stats", title: "Stats", icon: BarChart3 },
  { id: "settings", title: "Settings", icon: Settings },
  { id: "projectshub", title: "Projecthub", icon: Settings },
];

// --- Main Application Component ---

function MainApp() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "stats":
        return <StatsView />;
      case "calendar":
        return <CalendarView />;
      case "settings":
        return <SettingsView />;
      case "projectshub":
        return <ProjectsHub />;
      case "timer":
      default:
        return <TimerView />;
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
