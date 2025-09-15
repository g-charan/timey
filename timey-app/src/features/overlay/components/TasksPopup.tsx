import { useState, useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

export function TasksPopup() {
  const { tasks, toggleTask } = useTaskStore();
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);

  useEffect(() => {
    const todayTasks = tasks
      .filter((t) => {
        const today = new Date().toDateString();
        const taskDate = new Date(t.createdAt || Date.now()).toDateString();
        return (
          !t.completed &&
          (t.priority === "high" ||
            t.priority === "urgent" ||
            today === taskDate)
        );
      })
      .slice(0, 8);
    setActiveTasks(todayTasks);
  }, [tasks]);

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="w-80 border border-gray-200 shadow-xl bg-white text-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">Tasks</span>
          {activeTasks.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
              {activeTasks.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2 text-green-500">✓</div>
            <div className="text-sm text-gray-700 mb-1">Complete</div>
            <div className="text-xs text-gray-500">No priority tasks</div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 group">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  className="mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm ${
                      task.completed
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </div>
                  <Badge
                    variant={getPriorityVariant(task.priority)}
                    className="mt-1 text-xs h-5"
                  >
                    {task.priority}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.appAPI?.restoreMain()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                >
                  →
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <Button
          variant="ghost"
          onClick={() => window.appAPI?.restoreMain()}
          className="w-full h-8 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 justify-center"
        >
          View all
        </Button>
      </div>
    </Card>
  );
}
