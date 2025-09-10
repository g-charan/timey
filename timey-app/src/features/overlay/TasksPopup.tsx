import { useState, useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types";
import "@/styles/overlay.css";

export function TasksPopup() {
  const { tasks, toggleTask } = useTaskStore();
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Get today's active tasks with high priority
    const todayTasks = tasks.filter(t => {
      const today = new Date().toDateString();
      const taskDate = new Date(t.createdAt || Date.now()).toDateString();
      return !t.completed && (t.priority === 'high' || t.priority === 'urgent' || today === taskDate);
    }).slice(0, 8); // Limit to 8 tasks for popup

    setActiveTasks(todayTasks);
  }, [tasks]);

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffa502';
      case 'low': return '#7bed9f';
      default: return '#70a1ff';
    }
  };

  return (
    <div className="popup-window">
      <div className="popup-header">
        <div className="popup-title">
          <span>📋 Active Tasks</span>
          <span className="task-count">{activeTasks.length}</span>
        </div>
      </div>
      
      <div className="popup-content">
        {activeTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-text">All caught up!</div>
            <div className="empty-subtext">No high-priority tasks for today</div>
          </div>
        ) : (
          <div className="task-list">
            {activeTasks.map((task) => (
              <div key={task.id} className="task-item-popup">
                <div className="task-checkbox">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
                </div>
                <div className="task-content">
                  <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                  </span>
                  <div className="task-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
                <button 
                  className="focus-button"
                  onClick={() => {
                    // Focus on this task - restore main window
                    window.appAPI?.restoreMain();
                  }}
                  title="Focus on this task"
                >
                  🎯
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="popup-footer">
        <button
          className="view-all-button"
          onClick={() => {
            window.appAPI?.restoreMain();
          }}
        >
          View All Tasks
        </button>
      </div>
    </div>
  );
}
