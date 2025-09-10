// Keyboard Shortcuts Hook for Timey App
import { useEffect, useCallback } from 'react';
import { storage } from '@/utils/localStorage';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const metaMatch = !!shortcut.metaKey === event.metaKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      
      return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Default keyboard shortcuts
export const getDefaultShortcuts = (actions: {
  startTimer?: () => void;
  pauseTimer?: () => void;
  stopTimer?: () => void;
  newTask?: () => void;
  toggleOverlay?: () => void;
  focusMode?: () => void;
  quickCapture?: () => void;
  openSettings?: () => void;
  switchToDashboard?: () => void;
  switchToTasks?: () => void;
  switchToFocus?: () => void;
  switchToAnalytics?: () => void;
  toggleSidebar?: () => void;
  search?: () => void;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.startTimer) {
    shortcuts.push({
      key: 'Enter',
      metaKey: true,
      action: actions.startTimer,
      description: 'Start/Resume Timer',
      category: 'Timer'
    });
  }

  if (actions.pauseTimer) {
    shortcuts.push({
      key: ' ',
      action: actions.pauseTimer,
      description: 'Pause/Resume Timer',
      category: 'Timer'
    });
  }

  if (actions.stopTimer) {
    shortcuts.push({
      key: '.',
      metaKey: true,
      action: actions.stopTimer,
      description: 'Stop Timer',
      category: 'Timer'
    });
  }

  if (actions.newTask) {
    shortcuts.push({
      key: 'n',
      metaKey: true,
      action: actions.newTask,
      description: 'Create New Task',
      category: 'Tasks'
    });
  }

  if (actions.toggleOverlay) {
    shortcuts.push({
      key: 'o',
      metaKey: true,
      shiftKey: true,
      action: actions.toggleOverlay,
      description: 'Toggle Overlay Timer',
      category: 'Navigation'
    });
  }

  if (actions.focusMode) {
    shortcuts.push({
      key: 'f',
      metaKey: true,
      shiftKey: true,
      action: actions.focusMode,
      description: 'Enter Focus Mode',
      category: 'Focus'
    });
  }

  if (actions.quickCapture) {
    shortcuts.push({
      key: 'c',
      metaKey: true,
      shiftKey: true,
      action: actions.quickCapture,
      description: 'Quick Capture Task',
      category: 'Tasks'
    });
  }

  if (actions.openSettings) {
    shortcuts.push({
      key: ',',
      metaKey: true,
      action: actions.openSettings,
      description: 'Open Settings',
      category: 'Navigation'
    });
  }

  if (actions.switchToDashboard) {
    shortcuts.push({
      key: '1',
      metaKey: true,
      action: actions.switchToDashboard,
      description: 'Switch to Dashboard',
      category: 'Navigation'
    });
  }

  if (actions.switchToTasks) {
    shortcuts.push({
      key: '2',
      metaKey: true,
      action: actions.switchToTasks,
      description: 'Switch to Tasks',
      category: 'Navigation'
    });
  }

  if (actions.switchToFocus) {
    shortcuts.push({
      key: '3',
      metaKey: true,
      action: actions.switchToFocus,
      description: 'Switch to Focus Mode',
      category: 'Navigation'
    });
  }

  if (actions.switchToAnalytics) {
    shortcuts.push({
      key: '4',
      metaKey: true,
      action: actions.switchToAnalytics,
      description: 'Switch to Analytics',
      category: 'Navigation'
    });
  }

  if (actions.toggleSidebar) {
    shortcuts.push({
      key: 'b',
      metaKey: true,
      action: actions.toggleSidebar,
      description: 'Toggle Sidebar',
      category: 'Navigation'
    });
  }

  if (actions.search) {
    shortcuts.push({
      key: 'k',
      metaKey: true,
      action: actions.search,
      description: 'Search',
      category: 'Navigation'
    });
  }

  return shortcuts;
};

// Hook for managing keyboard shortcut preferences
export const useKeyboardShortcutPreferences = () => {
  const getShortcuts = useCallback(() => {
    return storage.getKeyboardShortcuts();
  }, []);

  const updateShortcut = useCallback((category: string, action: string, newShortcut: string) => {
    const shortcuts = getShortcuts();
    shortcuts[`${category}_${action}`] = newShortcut;
    storage.saveKeyboardShortcuts(shortcuts);
  }, [getShortcuts]);

  const resetToDefaults = useCallback(() => {
    const defaultShortcuts = {
      timer_start: 'Cmd+Enter',
      timer_pause: 'Space',
      timer_stop: 'Cmd+.',
      tasks_new: 'Cmd+N',
      navigation_overlay: 'Cmd+Shift+O',
      focus_mode: 'Cmd+Shift+F',
      tasks_quick_capture: 'Cmd+Shift+C',
      navigation_settings: 'Cmd+,',
      navigation_dashboard: 'Cmd+1',
      navigation_tasks: 'Cmd+2',
      navigation_focus: 'Cmd+3',
      navigation_analytics: 'Cmd+4',
      navigation_sidebar: 'Cmd+B',
      navigation_search: 'Cmd+K'
    };
    storage.saveKeyboardShortcuts(defaultShortcuts);
  }, []);

  return {
    getShortcuts,
    updateShortcut,
    resetToDefaults
  };
};

// Utility function to format shortcut display
export const formatShortcut = (shortcut: string): string => {
  return shortcut
    .replace('Cmd', '⌘')
    .replace('Ctrl', '⌃')
    .replace('Alt', '⌥')
    .replace('Shift', '⇧')
    .replace('Enter', '↵')
    .replace('Space', '␣');
};

// Hook for global app shortcuts
export const useGlobalShortcuts = (setActiveView: (view: string) => void) => {
  const shortcuts = getDefaultShortcuts({
    switchToDashboard: () => setActiveView('dashboard'),
    switchToTasks: () => setActiveView('tasks'),
    switchToFocus: () => setActiveView('focus'),
    switchToAnalytics: () => setActiveView('analytics'),
    openSettings: () => setActiveView('settings'),
    toggleOverlay: () => {
      if (window.appAPI?.showOverlay) {
        window.appAPI.showOverlay();
      }
    },
    focusMode: () => setActiveView('focus'),
    newTask: () => {
      // Trigger new task modal or quick add
      const event = new CustomEvent('timey:new-task');
      document.dispatchEvent(event);
    },
    quickCapture: () => {
      // Trigger quick capture modal
      const event = new CustomEvent('timey:quick-capture');
      document.dispatchEvent(event);
    },
    search: () => {
      // Trigger search modal
      const event = new CustomEvent('timey:search');
      document.dispatchEvent(event);
    }
  });

  useKeyboardShortcuts(shortcuts);
};
