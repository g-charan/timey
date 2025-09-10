// Task and Project Management Store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storage } from '@/utils/localStorage'
import { 
  Task, 
  TaskList, 
  Project, 
  EisenhowerMatrix, 
  QuickCapture,
  TaskPriority,
  UrgencyLevel,
  ImportanceLevel,
  FocusSession,
  AppUsageData
} from '../types';

interface TaskStore {
  // State
  projects: Project[];
  currentProjectId: string | null;
  tasks: Task[];
  taskLists: TaskList[];
  quickCaptures: QuickCapture[];
  focusSessions: FocusSession[];
  currentSession: FocusSession | null;
  
  // Task Management
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSubtask: (parentId: string, subtask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'parentTaskId'>) => void;
  
  // Project Management
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'lists' | 'analytics'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  
  // List Management
  addTaskList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
  updateTaskList: (id: string, updates: Partial<TaskList>) => void;
  deleteTaskList: (id: string) => void;
  
  // Eisenhower Matrix
  getEisenhowerMatrix: () => EisenhowerMatrix;
  moveTaskToQuadrant: (taskId: string, urgency: UrgencyLevel, importance: ImportanceLevel) => void;
  
  // Quick Capture
  addQuickCapture: (text: string) => void;
  processQuickCapture: (id: string, taskData: Partial<Task>) => void;
  deleteQuickCapture: (id: string) => void;
  
  // Focus Sessions
  startFocusSession: (taskId?: string, duration?: number, type?: 'pomodoro' | 'deep-work') => void;
  endFocusSession: (completed: boolean) => void;
  recordAppUsage: (appData: AppUsageData) => void;
  
  // Analytics
  getTasksCompletedToday: () => number;
  getTasksCompletedThisWeek: () => number;
  getTotalFocusTimeToday: () => number;
  getProductivityScore: () => number;
  getStreakDays: () => number;
  
  // Utility
  searchTasks: (query: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByList: (listId: string) => Task[];
  getOverdueTasks: () => Task[];
  getTasksDueToday: () => Task[];
  getTasksDueThisWeek: () => Task[];
}

// Generate dummy data for development
const generateDummyData = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dummyProjects: Project[] = [
    {
      id: 'project-1',
      name: 'Personal Development',
      description: 'Self-improvement and learning goals',
      color: '#3B82F6',
      icon: '🎯',
      lists: [],
      createdAt: yesterday,
      updatedAt: now,
      isArchived: false,
      settings: {
        defaultPomodoroLength: 25,
        defaultShortBreak: 5,
        defaultLongBreak: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        notificationsEnabled: true,
        theme: 'auto'
      },
      analytics: {
        totalTasksCompleted: 12,
        totalTimeSpent: 480,
        averageTaskCompletionTime: 40,
        streakDays: 5,
        longestStreak: 12,
        completionRate: 85,
        burnoutRisk: 'low',
        productivityTrend: 'up',
        weeklyGoalProgress: 75
      }
    },
    {
      id: 'project-2',
      name: 'Work Projects',
      description: 'Professional tasks and deadlines',
      color: '#10B981',
      icon: '💼',
      lists: [],
      createdAt: yesterday,
      updatedAt: now,
      isArchived: false,
      settings: {
        defaultPomodoroLength: 45,
        defaultShortBreak: 10,
        defaultLongBreak: 20,
        longBreakInterval: 3,
        autoStartBreaks: true,
        autoStartPomodoros: false,
        soundEnabled: false,
        notificationsEnabled: true,
        theme: 'light'
      },
      analytics: {
        totalTasksCompleted: 28,
        totalTimeSpent: 1200,
        averageTaskCompletionTime: 43,
        streakDays: 3,
        longestStreak: 8,
        completionRate: 92,
        burnoutRisk: 'medium',
        productivityTrend: 'stable',
        weeklyGoalProgress: 88
      }
    }
  ];

  const dummyTaskLists: TaskList[] = [
    {
      id: 'list-1',
      name: 'Today',
      description: 'Tasks to complete today',
      color: '#EF4444',
      icon: '📅',
      tasks: [],
      createdAt: now,
      updatedAt: now,
      projectId: 'project-1',
      isArchived: false,
      sortOrder: 1
    },
    {
      id: 'list-2',
      name: 'This Week',
      description: 'Weekly goals and tasks',
      color: '#F59E0B',
      icon: '📊',
      tasks: [],
      createdAt: now,
      updatedAt: now,
      projectId: 'project-1',
      isArchived: false,
      sortOrder: 2
    },
    {
      id: 'list-3',
      name: 'Backlog',
      description: 'Future tasks and ideas',
      color: '#6B7280',
      icon: '💡',
      tasks: [],
      createdAt: now,
      updatedAt: now,
      projectId: 'project-1',
      isArchived: false,
      sortOrder: 3
    }
  ];

  const dummyTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Complete quarterly review presentation',
      description: 'Prepare slides for Q4 performance review meeting',
      completed: false,
      priority: 'high',
      urgency: 'high',
      importance: 'high',
      estimatedTime: 120,
      actualTime: 0,
      dueDate: tomorrow,
      createdAt: yesterday,
      updatedAt: now,
      projectId: 'project-2',
      listId: 'list-1',
      subtasks: [],
      tags: ['work', 'presentation', 'quarterly'],
      notes: 'Include metrics from last quarter and goals for next quarter',
      contextLinks: [
        {
          id: 'link-1',
          title: 'Q3 Performance Data',
          url: 'https://docs.google.com/spreadsheets/d/example',
          type: 'document',
          autoOpen: true
        }
      ],
      streak: 0,
      momentum: 0,
      focusSessionsCompleted: 0,
      pomodoroSessionsCompleted: 0
    },
    {
      id: 'task-2',
      title: 'Read "Atomic Habits" chapter 3',
      description: 'Continue reading productivity book',
      completed: true,
      priority: 'medium',
      urgency: 'low',
      importance: 'high',
      estimatedTime: 30,
      actualTime: 35,
      dueDate: now,
      createdAt: yesterday,
      updatedAt: now,
      completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      projectId: 'project-1',
      listId: 'list-1',
      subtasks: [],
      tags: ['reading', 'self-improvement'],
      notes: 'Take notes on key concepts',
      contextLinks: [],
      streak: 3,
      momentum: 85,
      focusSessionsCompleted: 1,
      pomodoroSessionsCompleted: 2
    },
    {
      id: 'task-3',
      title: 'Plan weekend hiking trip',
      description: 'Research trails and prepare gear',
      completed: false,
      priority: 'low',
      urgency: 'medium',
      importance: 'low',
      estimatedTime: 45,
      actualTime: 0,
      dueDate: nextWeek,
      createdAt: now,
      updatedAt: now,
      projectId: 'project-1',
      listId: 'list-2',
      subtasks: [
        {
          id: 'subtask-1',
          title: 'Check weather forecast',
          description: '',
          completed: false,
          priority: 'low',
          urgency: 'low',
          importance: 'low',
          createdAt: now,
          updatedAt: now,
          parentTaskId: 'task-3',
          subtasks: [],
          tags: [],
          contextLinks: []
        },
        {
          id: 'subtask-2',
          title: 'Pack hiking gear',
          description: '',
          completed: false,
          priority: 'low',
          urgency: 'low',
          importance: 'low',
          createdAt: now,
          updatedAt: now,
          parentTaskId: 'task-3',
          subtasks: [],
          tags: [],
          contextLinks: []
        }
      ],
      tags: ['personal', 'outdoor', 'weekend'],
      contextLinks: [
        {
          id: 'link-2',
          title: 'AllTrails App',
          url: 'https://www.alltrails.com',
          type: 'website',
          autoOpen: false
        }
      ],
      streak: 0,
      momentum: 0,
      focusSessionsCompleted: 0,
      pomodoroSessionsCompleted: 0
    }
  ];

  return { dummyProjects, dummyTaskLists, dummyTasks };
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => {
      const { dummyProjects, dummyTaskLists, dummyTasks } = generateDummyData();
      
      return {
        // Initial State
        projects: dummyProjects,
        currentProjectId: 'project-1',
        tasks: dummyTasks,
        taskLists: dummyTaskLists,
        quickCaptures: [],
        focusSessions: [],
        currentSession: null,

        // Task Management
        addTask: (taskData) => {
          const newTask: Task = {
            id: Date.now().toString(),
            ...taskData,
            tags: taskData.tags || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            subtasks: []
          };
          
          set((state) => {
            const updatedTasks = [...state.tasks, newTask];
            storage.saveTasks(updatedTasks);
            return { tasks: updatedTasks };
          });
        },

        updateTask: (id, updates) => {
          set((state) => {
            const updatedTasks = state.tasks.map(task => 
              task.id === id 
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            );
            storage.saveTasks(updatedTasks);
            return { tasks: updatedTasks };
          });
        },

        deleteTask: (id) => {
          set((state) => {
            const updatedTasks = state.tasks.filter(task => task.id !== id && task.parentTaskId !== id);
            storage.saveTasks(updatedTasks);
            return { tasks: updatedTasks };
          });
        },

        toggleTask: (id) => {
          const now = new Date();
          set((state) => {
            const updatedTasks = state.tasks.map(task => 
              task.id === id 
                ? { 
                    ...task, 
                    completed: !task.completed,
                    completedAt: !task.completed ? now : undefined,
                    updatedAt: now
                  }
                : task
            );
            storage.saveTasks(updatedTasks);
            return { tasks: updatedTasks };
          });
        },

        addSubtask: (parentId, subtaskData) => {
          const newSubtask: Task = {
            ...subtaskData,
            id: `subtask-${Date.now()}`,
            parentTaskId: parentId,
            createdAt: new Date(),
            updatedAt: new Date(),
            subtasks: [],
            contextLinks: subtaskData.contextLinks || [],
            tags: subtaskData.tags || [],
            streak: 0,
            momentum: 0,
            focusSessionsCompleted: 0,
            pomodoroSessionsCompleted: 0
          };
          
          set((state) => ({
            tasks: state.tasks.map(task => 
              task.id === parentId 
                ? { ...task, subtasks: [...task.subtasks, newSubtask] }
                : task
            )
          }));
        },

        // Project Management
        addProject: (projectData) => {
          const newProject: Project = {
            ...projectData,
            id: `project-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            lists: [],
            analytics: {
              totalTasksCompleted: 0,
              totalTimeSpent: 0,
              averageTaskCompletionTime: 0,
              streakDays: 0,
              longestStreak: 0,
              completionRate: 0,
              burnoutRisk: 'low',
              productivityTrend: 'stable',
              weeklyGoalProgress: 0
            }
          };
          
          set((state) => ({
            projects: [...state.projects, newProject]
          }));
        },

        updateProject: (id, updates) => {
          set((state) => ({
            projects: state.projects.map(project => 
              project.id === id 
                ? { ...project, ...updates, updatedAt: new Date() }
                : project
            )
          }));
        },

        deleteProject: (id) => {
          set((state) => ({
            projects: state.projects.filter(project => project.id !== id),
            currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
          }));
        },

        setCurrentProject: (id) => {
          set({ currentProjectId: id });
        },

        // List Management
        addTaskList: (listData) => {
          const newList: TaskList = {
            ...listData,
            id: `list-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            tasks: []
          };
          
          set((state) => ({
            taskLists: [...state.taskLists, newList]
          }));
        },

        updateTaskList: (id, updates) => {
          set((state) => ({
            taskLists: state.taskLists.map(list => 
              list.id === id 
                ? { ...list, ...updates, updatedAt: new Date() }
                : list
            )
          }));
        },

        deleteTaskList: (id) => {
          set((state) => ({
            taskLists: state.taskLists.filter(list => list.id !== id)
          }));
        },

        // Eisenhower Matrix
        getEisenhowerMatrix: () => {
          const { tasks } = get();
          const matrix: EisenhowerMatrix = {
            do: [],
            decide: [],
            delegate: [],
            delete: []
          };

          tasks.forEach(task => {
            if (task.urgency === 'high' && task.importance === 'high') {
              matrix.do.push(task);
            } else if (task.urgency === 'low' && task.importance === 'high') {
              matrix.decide.push(task);
            } else if (task.urgency === 'high' && task.importance === 'low') {
              matrix.delegate.push(task);
            } else {
              matrix.delete.push(task);
            }
          });

          return matrix;
        },

        moveTaskToQuadrant: (taskId, urgency, importance) => {
          get().updateTask(taskId, { urgency, importance });
        },

        // Quick Capture
        addQuickCapture: (text) => {
          const newCapture: QuickCapture = {
            text,
            createdAt: new Date(),
            processed: false
          };
          
          set((state) => ({
            quickCaptures: [...state.quickCaptures, newCapture]
          }));
        },

        processQuickCapture: (id, taskData) => {
          const capture = get().quickCaptures.find(c => c.createdAt.getTime().toString() === id);
          if (capture) {
            get().addTask({
              title: capture.text,
              completed: false,
              priority: 'medium',
              urgency: 'medium',
              importance: 'medium',
              tags: [],
              contextLinks: [],
              ...taskData
            });
            
            set((state) => ({
              quickCaptures: state.quickCaptures.filter(c => c.createdAt.getTime().toString() !== id)
            }));
          }
        },

        deleteQuickCapture: (id) => {
          set((state) => ({
            quickCaptures: state.quickCaptures.filter(c => c.createdAt.getTime().toString() !== id)
          }));
        },

        // Focus Sessions
        startFocusSession: (taskId, duration = 25, type = 'pomodoro') => {
          const newSession: FocusSession = {
            id: `session-${Date.now()}`,
            taskId,
            startTime: new Date(),
            duration,
            type,
            completed: false,
            interrupted: false,
            interruptionCount: 0,
            appUsage: []
          };
          
          set({ currentSession: newSession });
        },

        endFocusSession: (completed) => {
          const { currentSession } = get();
          if (currentSession) {
            const endedSession: FocusSession = {
              ...currentSession,
              endTime: new Date(),
              completed
            };
            
            set((state) => ({
              focusSessions: [...state.focusSessions, endedSession],
              currentSession: null
            }));
          }
        },

        recordAppUsage: (appData) => {
          set((state) => ({
            currentSession: state.currentSession 
              ? {
                  ...state.currentSession,
                  appUsage: [...state.currentSession.appUsage, appData]
                }
              : null
          }));
        },

        // Analytics
        getTasksCompletedToday: () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          return get().tasks.filter(task => 
            task.completed && 
            task.completedAt && 
            task.completedAt >= today
          ).length;
        },

        getTasksCompletedThisWeek: () => {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          
          return get().tasks.filter(task => 
            task.completed && 
            task.completedAt && 
            task.completedAt >= weekStart
          ).length;
        },

        getTotalFocusTimeToday: () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          return get().focusSessions
            .filter(session => session.startTime >= today && session.completed)
            .reduce((total, session) => total + session.duration, 0);
        },

        getProductivityScore: () => {
          const tasksCompleted = get().getTasksCompletedToday();
          const focusTime = get().getTotalFocusTimeToday();
          const targetTasks = 5; // Daily target
          const targetFocusTime = 120; // 2 hours in minutes
          
          const taskScore = Math.min((tasksCompleted / targetTasks) * 50, 50);
          const focusScore = Math.min((focusTime / targetFocusTime) * 50, 50);
          
          return Math.round(taskScore + focusScore);
        },

        getStreakDays: () => {
          // Calculate consecutive days with completed tasks
          const tasks = get().tasks.filter(task => task.completed && task.completedAt);
          if (tasks.length === 0) return 0;
          
          tasks.sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
          
          let streak = 0;
          let currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          
          for (const task of tasks) {
            const taskDate = new Date(task.completedAt!);
            taskDate.setHours(0, 0, 0, 0);
            
            if (taskDate.getTime() === currentDate.getTime()) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else if (taskDate.getTime() < currentDate.getTime()) {
              break;
            }
          }
          
          return streak;
        },

        // Utility Functions
        searchTasks: (query) => {
          const lowercaseQuery = query.toLowerCase();
          return get().tasks.filter(task =>
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description?.toLowerCase().includes(lowercaseQuery) ||
            task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
          );
        },

        getTasksByProject: (projectId) => {
          return get().tasks.filter(task => task.projectId === projectId);
        },

        getTasksByList: (listId) => {
          return get().tasks.filter(task => task.listId === listId);
        },

        getOverdueTasks: () => {
          const now = new Date();
          return get().tasks.filter(task => 
            !task.completed && 
            task.dueDate && 
            task.dueDate < now
          );
        },

        getTasksDueToday: () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          return get().tasks.filter(task => 
            !task.completed && 
            task.dueDate && 
            task.dueDate >= today && 
            task.dueDate < tomorrow
          );
        },

        getTasksDueThisWeek: () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          
          return get().tasks.filter(task => 
            !task.completed && 
            task.dueDate && 
            task.dueDate >= today && 
            task.dueDate < weekEnd
          );
        }
      };
    },
    {
      name: 'timey-task-store',
      version: 1
    }
  )
);
