import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  FileCode2,
  Target,
  Flame,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";

export const DashboardView = () => {
  // Mock data - in production this would come from your Go backend
  const dailyGoal = 8;
  const hoursCompleted = 5.5;
  const progress = (hoursCompleted / dailyGoal) * 100;

  const productivityData = {
    currentApp: { name: "VS Code", duration: "12h 45m", icon: FileCode2 },
    streak: 12,
    weeklyAverage: 6.2,
    trend: "up" as const,
  };

  const recentSessions = [
    {
      id: 1,
      app: "VS Code",
      duration: "45 min",
      category: "Development",
      efficiency: 92,
      timestamp: "Today, 14:30",
    },
    {
      id: 2,
      app: "Figma",
      duration: "1 hr 15 min",
      category: "Design",
      efficiency: 88,
      timestamp: "Today, 13:15",
    },
    {
      id: 3,
      app: "Slack",
      duration: "25 min",
      category: "Communication",
      efficiency: 65,
      timestamp: "Today, 12:30",
    },
  ];

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
    );
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Today's summary •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Goal Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Daily Focus
              </CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs">
              {hoursCompleted} / {dailyGoal} hours completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {Math.round(progress)}%
                </span>
                {getTrendIcon(productivityData.trend)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Focus Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Current Focus
              </CardTitle>
              <productivityData.currentApp.icon className="w-4 h-4 text-primary" />
            </div>
            <CardDescription className="text-xs">
              Most used application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {productivityData.currentApp.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {productivityData.currentApp.duration} this week
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Focus Streak
              </CardTitle>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <CardDescription className="text-xs">
              Consistent days of focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground">
                {productivityData.streak}
              </span>
              <span className="text-sm text-muted-foreground pb-1">days</span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Average Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Weekly Average
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs">Hours per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground">
                {productivityData.weeklyAverage}
              </span>
              <span className="text-sm text-muted-foreground pb-1">
                hours/day
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Recent Focus Sessions
          </CardTitle>
          <CardDescription>
            Your last 3 focus sessions with efficiency scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground">Application</TableHead>
                <TableHead className="text-foreground">Duration</TableHead>
                <TableHead className="text-foreground">Category</TableHead>
                <TableHead className="text-foreground">Efficiency</TableHead>
                <TableHead className="text-right text-foreground">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.map((session) => (
                <TableRow
                  key={session.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground">
                    {session.app}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {session.duration}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border text-xs">
                      {session.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${session.efficiency}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${getEfficiencyColor(
                          session.efficiency
                        )}`}
                      >
                        {session.efficiency}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {session.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State (for when no data exists) */}
      {recentSessions.length === 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No focus sessions yet
            </h3>
            <p className="text-muted-foreground text-center text-sm max-w-sm">
              Start your first focus session to see your productivity insights
              here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
