import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Task = any;

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(true);

  const refresh = async () => {
    const list = await window.dbAPI.getTodayTasks();
    setTasks(list ?? []);
  };
  useEffect(() => {
    refresh();
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    await window.dbAPI.createTask({ id: crypto.randomUUID(), title });
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
          <div className="text-xs text-muted-foreground">
            {eisenhowerLabel(urgent, important)}
          </div>
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
                      <div className="text-xs text-muted-foreground">
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
                <div className="text-xs text-muted-foreground">No tasks</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
