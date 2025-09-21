import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Task = {
  id: string;
  title: string;
  status?: "todo" | "in_progress" | "done";
  estimate_minutes?: number | null;
  actual_seconds?: number | null;
  scheduled_for: number; // timestamp in ms, -1 for inbox, 0 for someday/maybe
};

const tasksSample: Task[] = [
  {
    id: "1",
    title: "Sample Task 1",
    status: "todo",
    estimate_minutes: 30,
    actual_seconds: null,
    scheduled_for: -1,
  },
  {
    id: "2",
    title: "Sample Task 2",
    status: "in_progress",
    estimate_minutes: 45,
    actual_seconds: 1200,
    scheduled_for: 0,
  },
  {
    id: "3",
    title: "Sample Task 3",
    status: "done",
    estimate_minutes: 60,
    actual_seconds: 3600,
    scheduled_for: 1672531199000,
  },
];

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(true);
  const [schedulingTask, setSchedulingTask] = useState<Task | null>(null);
  const [schedulingDate, setSchedulingDate] = useState<string>("");

  const refresh = async () => {
    const list = await window.dbAPI.getTodayTasks();
    setTasks(list ?? []);
  };
  useEffect(() => {
    refresh();
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    const id = crypto.randomUUID();
    tasksSample.push({
      id,
      title: title.trim(),
      status: "todo",
      estimate_minutes: null,
      actual_seconds: null,
      scheduled_for: -1,
    });
    // const res = await window.dbAPI.createTask({ id, title, scheduled_for: -1 });
    setTitle("");
    refresh();
  };

  const eisenhowerLabel = (u: boolean, i: boolean) =>
    u && i ? "Urgent & Important" : u ? "Urgent" : i ? "Important" : "Other";

  const grouped = useMemo(() => {
    const g: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const t of tasks) g[t.status]?.push(t);
    return g;
  }, [tasks]);

  const toggleDone = async (t: Task) => {
    if (t.status === "done") {
      await window.dbAPI.updateTask(t.id, { status: "todo" });
    } else {
      await window.dbAPI.stopTask(t.id, true);
    }
    refresh();
  };

  const moveTaskTo = async (t: Task, target: "today" | "someday" | "scheduled") => {
    if (!t) return;
    if (target === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      tasksSample.find(task => task.id === t.id)!.scheduled_for = today.getTime();
  // await window.dbAPI.updateTask(t.id, { scheduled_for: today.getTime() });
    } else if (target === "someday") {
      // Someday/Maybe - represent as scheduled_for = 0 so it won't show in today's list
      tasksSample.find(task => task.id === t.id)!.scheduled_for = 0;
  // await window.dbAPI.updateTask(t.id, { scheduled_for: 0 });
    } else if (target === "scheduled") {
      // Open an in-app date picker modal
      const d = new Date();
      d.setHours(0, 0, 0, 0);
  setSchedulingTask(t);
  setSchedulingDate(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }
    refresh();
  };

  const saveScheduled = async () => {
    if (!schedulingTask || !schedulingDate) return;
    const parsed = new Date(schedulingDate);
    if (isNaN(parsed.getTime())) {
      window.alert("Invalid date format. Use YYYY-MM-DD.");
      return;
    }
    parsed.setHours(0, 0, 0, 0);
    tasksSample.find(task => task.id === schedulingTask.id)!.scheduled_for = parsed.getTime();
    // await window.dbAPI.updateTask(schedulingTask.id, { scheduled_for: parsed.getTime() });
    setSchedulingTask(null);
    setSchedulingDate("");
    refresh();
  };

  const cancelScheduled = () => {
    setSchedulingTask(null);
    setSchedulingDate("");
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-border lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Capture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="w-full border rounded px-2 py-1 bg-background text-foreground"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex gap-2 items-center text-sm">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
              />{" "}
              Urgent
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
              />{" "}
              Important
            </label>
          </div>
          <Button onClick={add}>Add Task</Button>
          <div className="text-xs font-firacode text-muted-foreground">
            {eisenhowerLabel(urgent, important)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(tasksSample.filter(task => task.scheduled_for === -1).map((task) => (<div
                  key={task.id}
                  className="border rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-foreground font-medium">
                        {task.title}
                      </div>
                      <div className="text-xs font-firacode text-muted-foreground">
                        {/* {t.estimate_minutes ?? 0}m est •{" "}
                        {Math.round((t.actual_seconds ?? 0) / 60)}m actual */}
                      </div>
                    </div>
                  </div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">Move to</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "today")}>Today</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "scheduled")}>Schedule...</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "someday")}>Someday</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div> 
          ))) }
        </CardContent>
      </Card>

      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Today’s Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["todo", "in_progress", "done"] as const).map((k) => (
            <div key={k} className="space-y-2">
              <div className="text-sm font-medium capitalize">
                {k.replace("_", " ")}
              </div>
              {grouped[k].map((t) => (
                <div
                  key={t.id}
                  className="border rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={t.status === "done"}
                      onChange={() => toggleDone(t)}
                    />
                    <div>
                      <div className="text-foreground font-medium">
                        {t.title}
                      </div>
                      <div className="text-xs font-firacode text-muted-foreground">
                        {t.estimate_minutes ?? 0}m est •{" "}
                        {Math.round((t.actual_seconds ?? 0) / 60)}m actual
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t.status}
                  </Badge>
                </div>
              ))}
              {grouped[k].length === 0 && (
                <div className="text-xs font-firacode text-muted-foreground">
                  No tasks
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Upcoming/Scheduled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(tasksSample.filter(task => task.scheduled_for !== -1 && task.scheduled_for !== 0 && new Date(task.scheduled_for) > new Date()).map((task) => (<div
                  key={task.id}
                  className="border rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-foreground font-medium">
                        {task.title}
                      </div>
                      <div className="text-xs font-firacode text-muted-foreground">
                        {task.estimate_minutes ?? 0}m est •{" "}
                        {Math.round((task.actual_seconds ?? 0) / 60)}m actual
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">Move to</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "today")}>Today</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "scheduled")}>Schedule...</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "someday")}>Someday</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div> 
          )))}
          {/* Simple scheduling modal */}
          {schedulingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-popover p-4 rounded shadow-md w-[320px]">
                <div className="mb-2 font-medium">Schedule "{schedulingTask.title}"</div>
                <input
                  type="date"
                  value={schedulingDate}
                  onChange={(e) => setSchedulingDate(e.target.value)}
                  className="w-full mb-3 px-2 py-1 border rounded"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={cancelScheduled}>Cancel</Button>
                  <Button size="sm" onClick={saveScheduled}>Save</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Someday/Maybe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
           {(tasksSample.filter(task => task.scheduled_for === 0).map((task) => (<div
                  key={task.id}
                  className="border rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-foreground font-medium">
                        {task.title}
                      </div>
                      <div className="text-xs font-firacode text-muted-foreground">
                        {task.estimate_minutes ?? 0}m est •{" "}
                        {Math.round((task.actual_seconds ?? 0) / 60)}m actual
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">Move to</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "today")}>Today</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "scheduled")}>Schedule...</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => moveTaskTo(task, "someday")}>Someday</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div> 
          )))}
        </CardContent>
      </Card>
    </div>
  );
}
