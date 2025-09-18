import { ProductivityAnalytics } from "@/components/analytics/ProductivityAnalytics";
import { EisenhowerMatrix } from "@/components/eisenhower/EisenhowerMatrix";
import { FocusMode } from "@/components/focus/FocusMode";
import { MomentumBuilder } from "@/components/gamification/MomentumBuilder";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import { PersonalizationSettings } from "@/components/settings/PersonalizationSettings";
import { AppTimeTracker } from "@/components/tracking/AppTimeTracker";
import { CalendarView } from "@/features/calendar/components/calendar-view";
import { DashboardView } from "@/features/dashboard/components/dashboard";
import TasksTab from "@/features/dashboard/components/tasks-tab";
import TodayList from "@/features/dashboard/components/today-list";
import ProjectsHub from "@/features/projecthub/components/projectshub-view";
import { StatsView } from "@/features/stats/components/stats-view";
import TimerScreen from "@/features/timer/components/timer-view";

export const renderView = (activeView) => {
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
