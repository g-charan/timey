import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  title: string;
  notes?: string;
  estimate_minutes?: number;
  actual_seconds?: number;
  status: "todo" | "in_progress" | "done";
};

export default function TodayList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  const refresh = async () => {
    const list = await window.dbAPI.getTodayTasks();
    setTasks(list ?? []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async () => {
    if (!newTitle.trim()) return;
    await window.dbAPI.createTask({ id: crypto.randomUUID(), title: newTitle });
    setNewTitle("");
    refresh();
  };

  const toggleStart = async (task: Task) => {
    if (task.status === "in_progress") {
      await window.dbAPI.stopTask(task.id, false);
    } else {
      await window.dbAPI.startTask(task.id);
    }
    refresh();
  };

  const complete = async (task: Task) => {
    await window.dbAPI.stopTask(task.id, true);
    refresh();
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1 bg-background text-foreground"
            placeholder="New task"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button variant="outline" onClick={create}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-2 rounded border flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-foreground">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  {t.status === "in_progress" ? "Tracking…" : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleStart(t)}
                >
                  {t.status === "in_progress" ? "Pause" : "Start"}
                </Button>
                <Button size="sm" onClick={() => complete(t)}>
                  Done
                </Button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No tasks for today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

