import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Clock,
  Target,
  Calendar as CalendarIcon,
  Grid,
  List,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "../hooks/use-media-query";

// Mock data for demonstration
const mockSessions = [
  {
    id: 1,
    title: "Deep Work Session",
    start: new Date(2024, 0, 15, 9, 0),
    end: new Date(2024, 0, 15, 11, 0),
    type: "focus" as const,
    category: "Development",
    efficiency: 92,
  },
  {
    id: 2,
    title: "Design Review",
    start: new Date(2024, 0, 15, 14, 0),
    end: new Date(2024, 0, 15, 15, 30),
    type: "break" as const,
    category: "Design",
    efficiency: 85,
  },
  {
    id: 3,
    title: "Research Block",
    start: new Date(2024, 0, 16, 10, 0),
    end: new Date(2024, 0, 16, 12, 0),
    type: "focus" as const,
    category: "Research",
    efficiency: 88,
  },
  {
    id: 4,
    title: "Planning Session",
    start: new Date(2024, 0, 17, 13, 0),
    end: new Date(2024, 0, 17, 14, 0),
    type: "focus" as const,
    category: "Planning",
    efficiency: 95,
  },
];

const timeSlots = Array.from({ length: 14 }, (_, i) => ({
  time: `${i + 8}:00`,
  hour: i + 8,
}));

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CalendarView = () => {
  const [date, setDate] = useState<Date>(new Date(2024, 0, 15));
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");

  // Memoized week dates calculation
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [date]);

  // Memoized session filtering
  const getSessionsForDate = useCallback((targetDate: Date) => {
    return mockSessions.filter((session) => {
      const sessionDate = session.start.toDateString();
      const targetDateStr = targetDate.toDateString();
      return sessionDate === targetDateStr;
    });
  }, []);

  // Memoized statistics
  const { totalHours, focusSessions } = useMemo(() => {
    const total = mockSessions.reduce(
      (total, session) =>
        total +
        (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60),
      0
    );
    const focusCount = mockSessions.filter((s) => s.type === "focus").length;
    return { totalHours: total, focusSessions: focusCount };
  }, []);

  const getEfficiencyColor = useCallback((score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
  }, []);

  const getTypeColor = useCallback((type: string) => {
    return type === "focus"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-muted/50 text-muted-foreground border-border";
  }, []);

  // Responsive layout handler
  const renderCalendarContent = () => {
    if (!isDesktop) {
      return renderMobileView();
    }
    return renderDesktopView();
  };

  const renderDesktopView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
      {/* Mini Calendar */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="p-0 rounded-md"
            classNames={{
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
        </CardContent>
      </Card>

      {/* Week View - Main Content */}
      <div className="lg:col-span-3">{renderWeekGridView()}</div>
    </div>
  );

  const renderMobileView = () => (
    <div className="flex flex-col gap-4 flex-1">
      {/* View Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={view === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("day")}
          className="flex-1"
        >
          <List className="w-4 h-4 mr-2" />
          Day
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("week")}
          className="flex-1"
        >
          <Grid className="w-4 h-4 mr-2" />
          Week
        </Button>
      </div>

      {/* Mobile Calendar */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg">
              {view === "week"
                ? "This Week"
                : date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setDate(
                    view === "week" ? date.getDate() - 7 : date.getDate() - 1
                  );
                  setDate(newDate);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setDate(
                    view === "week" ? date.getDate() + 7 : date.getDate() + 1
                  );
                  setDate(newDate);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "week" ? renderMobileWeekView() : renderMobileDayView()}
        </CardContent>
      </Card>
    </div>
  );

  const renderMobileWeekView = () => (
    <div className="space-y-4">
      {weekDates.map((day, index) => {
        const daySessions = getSessionsForDate(day);
        return (
          <div
            key={index}
            className={cn(
              "p-3 rounded-lg border",
              day.toDateString() === new Date().toDateString()
                ? "bg-primary/5 border-primary/20"
                : "bg-card border-border"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-foreground">
                  {daysOfWeek[day.getDay()]}
                </div>
                <div className="text-sm text-muted-foreground">
                  {day.getDate()}{" "}
                  {day.toLocaleDateString("en-US", { month: "short" })}
                </div>
              </div>
              <Badge variant={daySessions.length > 0 ? "default" : "outline"}>
                {daySessions.length} session
                {daySessions.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {daySessions.length > 0 ? (
              <div className="space-y-2">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-2 rounded-lg border text-sm",
                      getTypeColor(session.type)
                    )}
                  >
                    <div className="font-medium">{session.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {session.start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {session.end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {session.category}
                      </Badge>
                      <span
                        className={cn(
                          "text-xs",
                          getEfficiencyColor(session.efficiency)
                        )}
                      >
                        {session.efficiency}% eff.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                No sessions scheduled
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderMobileDayView = () => (
    <div className="space-y-3">
      {timeSlots.map((slot) => {
        const hourSessions = mockSessions.filter((session) => {
          const sessionHour = session.start.getHours();
          return (
            sessionHour === slot.hour &&
            session.start.toDateString() === date.toDateString()
          );
        });

        return (
          <div
            key={slot.time}
            className="flex items-start gap-4 p-3 border-b border-border last:border-b-0"
          >
            <span className="text-sm text-muted-foreground font-medium w-12 flex-shrink-0">
              {slot.time}
            </span>
            <div className="flex-1 space-y-2">
              {hourSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-2 rounded-lg border text-sm",
                    getTypeColor(session.type)
                  )}
                >
                  <div className="font-medium">{session.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Until{" "}
                    {session.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
              {hourSessions.length === 0 && (
                <div className="text-muted-foreground text-xs">No sessions</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekGridView = () => (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-xl">
            {view === "week" &&
              `Week of ${weekDates[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - ${weekDates[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalHours.toFixed(1)}h
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {focusSessions} sessions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-8 border-b border-border min-w-[800px]">
            <div className="border-r border-border p-2">
              <div className="h-12"></div>
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="h-16 border-t border-border flex items-start justify-end pr-2 pt-1"
                >
                  <span className="text-xs text-muted-foreground">
                    {slot.time}
                  </span>
                </div>
              ))}
            </div>

            {weekDates.map((day, dayIndex) => {
              const daySessions = getSessionsForDate(day);
              return (
                <div
                  key={dayIndex}
                  className="border-r border-border last:border-r-0 relative"
                >
                  <div
                    className={cn(
                      "h-12 p-2 text-center border-b border-border",
                      day.toDateString() === new Date().toDateString() &&
                        "bg-primary/10"
                    )}
                  >
                    <div className="text-sm font-medium text-foreground">
                      {daysOfWeek[day.getDay()]}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        day.toDateString() === new Date().toDateString()
                          ? "text-primary font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="relative">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className="h-16 border-t border-border"
                      ></div>
                    ))}

                    {daySessions.map((session) => {
                      const startHour =
                        session.start.getHours() +
                        session.start.getMinutes() / 60;
                      const endHour =
                        session.end.getHours() + session.end.getMinutes() / 60;
                      const durationHours = endHour - startHour;
                      const top = ((startHour - 8) * 100) / 14;
                      const height = (durationHours * 100) / 14;

                      return (
                        <div
                          key={session.id}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity border",
                            getTypeColor(session.type)
                          )}
                          style={{
                            top: `${top}%`,
                            height: `${height}%`,
                            minHeight: "32px",
                          }}
                        >
                          <div className="text-xs font-medium text-foreground truncate">
                            {session.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {session.start.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {session.end.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0"
                            >
                              {session.category}
                            </Badge>
                            <span
                              className={cn(
                                "text-[10px]",
                                getEfficiencyColor(session.efficiency)
                              )}
                            >
                              {session.efficiency}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col gap-4 md:gap-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Calendar
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Plan and review your focus sessions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isDesktop && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("month")}
              >
                Month
              </Button>
              <Button variant="outline" size="icon" className="ml-2">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button size="sm" className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {renderCalendarContent()}

      {/* Upcoming Sessions - Only show on desktop */}
      {isDesktop && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Upcoming Sessions</CardTitle>
            <CardDescription>
              Your planned focus sessions for the next few days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        session.type === "focus"
                          ? "bg-primary"
                          : "bg-muted-foreground"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.start.toLocaleDateString()} •{" "}
                        {session.start.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {session.end.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
