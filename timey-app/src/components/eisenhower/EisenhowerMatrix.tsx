import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2,
  Plus,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskStore } from '@/stores/taskStore';
import { Task, EisenhowerQuadrant } from '@/types';
import { cn } from '@/lib/utils';

const quadrantConfig: Record<string, EisenhowerQuadrant> = {
  do: {
    id: 'do',
    name: 'Do First',
    description: 'Urgent & Important',
    color: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
    tasks: []
  },
  decide: {
    id: 'decide',
    name: 'Schedule',
    description: 'Important, Not Urgent',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    tasks: []
  },
  delegate: {
    id: 'delegate',
    name: 'Delegate',
    description: 'Urgent, Not Important',
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800',
    tasks: []
  },
  delete: {
    id: 'delete',
    name: 'Eliminate',
    description: 'Neither Urgent nor Important',
    color: 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800',
    tasks: []
  }
};

const TaskCard: React.FC<{
  task: Task;
  quadrant: string;
  onToggle: (id: string) => void;
  onMove: (taskId: string, quadrant: string) => void;
  onDelete: (id: string) => void;
}> = ({ task, quadrant, onToggle, onMove, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDueDate = (date: Date | string | undefined) => {
    if (!date) return null;
    
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if it's a valid date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDueDate:', date);
      return null;
    }
    
    const now = new Date();
    const diffTime = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <div className={cn(
      'group p-3 rounded-lg border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200',
      task.completed && 'opacity-60'
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-0.5"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              'font-medium text-sm leading-tight',
              task.completed && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h4>
            <div className={cn('w-2 h-2 rounded-full', getPriorityColor(task.priority))} />
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedTime}m</span>
              </div>
            )}
            
            {task.dueDate && formatDueDate(task.dueDate) && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span className={cn(
                  formatDueDate(task.dueDate) === 'Overdue' && 'text-red-500 font-medium'
                )}>
                  {formatDueDate(task.dueDate)}
                </span>
              </div>
            )}
            
            {task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
          
          {task.subtasks.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
            </div>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(quadrantConfig).map(([key, config]) => (
              key !== quadrant && (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => onMove(task.id, key)}
                  className="text-xs"
                >
                  <ArrowRight className="w-3 h-3 mr-2" />
                  Move to {config.name}
                </DropdownMenuItem>
              )
            ))}
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-xs text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const QuadrantCard: React.FC<{
  quadrant: EisenhowerQuadrant;
  tasks: Task[];
  onAddTask: (quadrant: string) => void;
  onToggleTask: (id: string) => void;
  onMoveTask: (taskId: string, quadrant: string) => void;
  onDeleteTask: (id: string) => void;
}> = ({ quadrant, tasks, onAddTask, onToggleTask, onMoveTask, onDeleteTask }) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className={cn('h-full', quadrant.color)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{quadrant.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{quadrant.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(quadrant.id)}
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        {totalTasks > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{completedTasks}/{totalTasks} completed</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-current rounded-full h-1 transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-xs">No tasks in this quadrant</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(quadrant.id)}
                className="mt-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Task
              </Button>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                quadrant={quadrant.id}
                onToggle={onToggleTask}
                onMove={onMoveTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const EisenhowerMatrix: React.FC = () => {
  const { 
    getEisenhowerMatrix, 
    moveTaskToQuadrant, 
    toggleTask, 
    deleteTask,
    addTask,
    tasks 
  } = useTaskStore();
  
  const [matrix, setMatrix] = useState(getEisenhowerMatrix());

  // Update matrix when tasks change
  useEffect(() => {
    const newMatrix = getEisenhowerMatrix();
    setMatrix(newMatrix);
    console.log('Matrix updated:', newMatrix);
  }, [tasks, getEisenhowerMatrix]);

  const handleMoveTask = (taskId: string, targetQuadrant: string) => {
    const urgencyMap = {
      do: 'high',
      decide: 'low',
      delegate: 'high',
      delete: 'low'
    };
    
    const importanceMap = {
      do: 'high',
      decide: 'high',
      delegate: 'low',
      delete: 'low'
    };

    moveTaskToQuadrant(
      taskId, 
      urgencyMap[targetQuadrant as keyof typeof urgencyMap] as any,
      importanceMap[targetQuadrant as keyof typeof importanceMap] as any
    );
  };

  const handleAddTask = (quadrant: string) => {
    // For now, we'll just show a simple prompt
    // In a full implementation, this would open a task creation dialog
    const title = prompt(`Add a new task to ${quadrantConfig[quadrant].name}:`);
    if (title) {
      const urgencyMap = {
        do: 'high',
        decide: 'low', 
        delegate: 'high',
        delete: 'low'
      };
      
      const importanceMap = {
        do: 'high',
        decide: 'high',
        delegate: 'low', 
        delete: 'low'
      };

      addTask({
        title,
        completed: false,
        priority: 'medium',
        urgency: urgencyMap[quadrant as keyof typeof urgencyMap] as any,
        importance: importanceMap[quadrant as keyof typeof importanceMap] as any,
        tags: [],
        contextLinks: []
      });
    }
  };

  // Debug logging
  console.log('EisenhowerMatrix rendering with matrix:', matrix);
  console.log('Tasks available:', tasks?.length || 0);

  // Add error boundary
  if (!matrix) {
    console.error('Matrix is null or undefined');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading Priority Matrix...</h3>
          <p className="text-muted-foreground">Please wait while we load your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Eisenhower Matrix</h2>
          <p className="text-muted-foreground">
            Prioritize tasks by urgency and importance to maximize productivity
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Urgent & Important</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Important Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Urgent Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Neither</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        <QuadrantCard
          quadrant={quadrantConfig.do}
          tasks={matrix.do}
          onAddTask={handleAddTask}
          onToggleTask={toggleTask}
          onMoveTask={handleMoveTask}
          onDeleteTask={deleteTask}
        />
        
        <QuadrantCard
          quadrant={quadrantConfig.decide}
          tasks={matrix.decide}
          onAddTask={handleAddTask}
          onToggleTask={toggleTask}
          onMoveTask={handleMoveTask}
          onDeleteTask={deleteTask}
        />
        
        <QuadrantCard
          quadrant={quadrantConfig.delegate}
          tasks={matrix.delegate}
          onAddTask={handleAddTask}
          onToggleTask={toggleTask}
          onMoveTask={handleMoveTask}
          onDeleteTask={deleteTask}
        />
        
        <QuadrantCard
          quadrant={quadrantConfig.delete}
          tasks={matrix.delete}
          onAddTask={handleAddTask}
          onToggleTask={toggleTask}
          onMoveTask={handleMoveTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </div>
  );
};
