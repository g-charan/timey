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
import { Target, Flame, Calendar, Clock, TrendingUp } from "lucide-react";
import { useDashboardData } from "@/hooks/use-database";

export const DashboardView = () => {
  const { data } = useDashboardData();
  const projects = data?.projects ?? [];
  const sessions = data?.recentSessions ?? [];
  const streak = data?.streak ?? 0;

  const dailyGoalHours = 4;
  const todayStr = new Date().toDateString();
  const todayTotalSecs = sessions
    .filter((s: any) => new Date(s.start_at).toDateString() === todayStr)
    .reduce((sum: number, s: any) => sum + (s.actual_seconds || 0), 0);
  const hoursCompleted = Math.round((todayTotalSecs / 3600) * 10) / 10;
  const progress = Math.min(100, (hoursCompleted / dailyGoalHours) * 100);

  const getTrendIcon = () => (
    <TrendingUp className="w-4 h-4 text-muted-foreground" />
  );

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-inconsolata font-bold text-foreground">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1 font-firacode">
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
          <span className="text-sm text-muted-foreground font-inconsolata">
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
        {/* AI Suggestion */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground font-inconsolata">
                Your Next Focus Block
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-firacode">
              Privacy-first local heuristic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                className="px-3 py-2 border rounded text-sm font-inconsolata"
                onClick={async () => {
                  const res = await window.appAPI.getAISuggestion();
                  if (res?.suggestion) {
                    alert(
                      `${res.suggestion.task} • ${
                        res.suggestion.duration
                      }m\n\nWhy:\n- ${res.rationale.join("\n- ")}`
                    );
                  }
                }}
              >
                Get Suggestion
              </button>
            </div>
          </CardContent>
        </Card>
        {/* Daily Goal Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-inconsolata font-medium text-foreground">
                Daily Focus
              </CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs font-firacode">
              {hoursCompleted} / {dailyGoalHours} hours completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground font-inconsolata">
                  {Math.round(progress)}%
                </span>
                {getTrendIcon()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm  font-inconsolata font-medium text-foreground">
                Projects
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-firacode">
              Your active projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground font-inconsolata ">
                {projects[0]?.name ?? "No projects"}
              </p>
              <p className="text-sm text-muted-foreground font-firacode">
                {projects.length} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-inconsolata font-medium text-foreground">
                Focus Streak
              </CardTitle>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <CardDescription className="text-xs font-firacode">
              Consistent days of focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground font-inconsolata">
                {streak}
              </span>
              <span className="text-sm font-firacode text-muted-foreground pb-1">
                days
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Today Hours Card */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-inconsolata font-medium text-foreground">
                Today
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs">Hours today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground font-inconsolata">
                {(hoursCompleted || 0).toFixed(1)}
              </span>
              <span className="text-sm font-firacode text-muted-foreground pb-1">
                hours
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground font-inconsolata">
            Recent Focus Sessions
          </CardTitle>
          <CardDescription className="text-xs font-firacode">
            Your last 3 focus sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-2">
            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={async () => {
                const result = await window.dbAPI.generateReport();
                if (result?.path) {
                  await window.appAPI.openPath(result.path);
                }
              }}
            >
              Export Report
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground">Task</TableHead>
                <TableHead className="text-foreground">Duration</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Progress</TableHead>
                <TableHead className="text-right text-foreground">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 3).map((session: any) => (
                <TableRow
                  key={session.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground">
                    {session.task ?? "Session"}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {Math.round((session.actual_seconds ?? 0) / 60)} min
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-border text-xs font-firacode"
                    >
                      {session.project_id ? "Project" : "Ad-hoc"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((session.actual_seconds ?? 0) /
                                (session.planned_duration || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {Math.round(
                          Math.min(
                            100,
                            ((session.actual_seconds ?? 0) /
                              (session.planned_duration || 1)) *
                              100
                          )
                        )}
                        %
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {new Date(session.start_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {sessions.length === 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground font-inconsolata mb-2">
              No focus sessions yet
            </h3>
            <p className="text-muted-foreground text-center text-sm  font-firacode max-w-sm">
              Start your first focus session to see your productivity insights
              here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Simple Shutdown Ritual (inline) */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className=" font-inconsolata text-foreground">
            Shutdown Ritual
          </CardTitle>
          <CardDescription className="text-xs font-firacode">
            Capture wins, open loops, and tomorrow’s intentions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Wins</label>
            <textarea
              className="w-full mt-1 p-2 border rounded bg-background text-foreground"
              rows={3}
              onChange={(e) => ((window as any).__wins = e.target.value)}
              placeholder="What went well today?"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Open Loops</label>
            <textarea
              className="w-full mt-1 p-2 border rounded bg-background text-foreground"
              rows={3}
              onChange={(e) => ((window as any).__openLoops = e.target.value)}
              placeholder="What’s still on your mind?"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">
              Tomorrow’s Intentions
            </label>
            <textarea
              className="w-full mt-1 p-2 border rounded bg-background text-foreground"
              rows={3}
              onChange={(e) => ((window as any).__tomorrow = e.target.value)}
              placeholder="What will you do first?"
            />
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
              onClick={async () => {
                await window.dbAPI.saveDailyShutdown({
                  wins: (window as any).__wins || "",
                  open_loops: (window as any).__openLoops || "",
                  tomorrow_intentions: (window as any).__tomorrow || "",
                });
                alert("Saved");
              }}
            >
              Save
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
