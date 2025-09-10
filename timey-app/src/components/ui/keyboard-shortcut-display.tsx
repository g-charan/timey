// Keyboard Shortcut Display Component
import React from 'react';
import { formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutDisplayProps {
  shortcut: string;
  className?: string;
}

export const KeyboardShortcutDisplay: React.FC<KeyboardShortcutDisplayProps> = ({ 
  shortcut, 
  className = "" 
}) => {
  const formattedShortcut = formatShortcut(shortcut);
  
  return (
    <kbd className={`inline-flex items-center px-2 py-1 text-xs font-mono bg-muted border border-border rounded ${className}`}>
      {formattedShortcut}
    </kbd>
  );
};

interface ShortcutHelpProps {
  shortcuts: Array<{
    key: string;
    description: string;
    category: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ shortcuts, isOpen, onClose }) => {
  if (!isOpen) return null;

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{shortcut.description}</span>
                    <KeyboardShortcutDisplay shortcut={shortcut.key} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          Press <KeyboardShortcutDisplay shortcut="?" className="mx-1" /> to toggle this help
        </div>
      </div>
    </div>
  );
};
