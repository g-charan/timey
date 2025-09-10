import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  Palette,
  Keyboard,
  Bell,
  Shield,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { UserSettings, KeyboardShortcuts, NotificationSettings } from '@/types';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'light', name: 'Light', icon: Sun, preview: 'bg-white border-gray-200' },
  { id: 'dark', name: 'Dark', icon: Moon, preview: 'bg-gray-900 border-gray-700' },
  { id: 'auto', name: 'System', icon: Laptop, preview: 'bg-gradient-to-r from-white to-gray-900' }
];

const accentColors = [
  { id: 'blue', name: 'Blue', color: '#3B82F6' },
  { id: 'green', name: 'Green', color: '#10B981' },
  { id: 'purple', name: 'Purple', color: '#8B5CF6' },
  { id: 'pink', name: 'Pink', color: '#EC4899' },
  { id: 'orange', name: 'Orange', color: '#F59E0B' },
  { id: 'red', name: 'Red', color: '#EF4444' }
];

const defaultShortcuts: KeyboardShortcuts = {
  startTimer: 'Cmd+Enter',
  pauseTimer: 'Cmd+Space',
  stopTimer: 'Cmd+Shift+Space',
  quickAddTask: 'Cmd+N',
  focusMode: 'Cmd+F',
  switchProject: 'Cmd+P',
  openSettings: 'Cmd+,'
};

const ThemeSelector: React.FC<{
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Theme</Label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const IconComponent = theme.icon;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                currentTheme === theme.id
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/50'
              )}
            >
              <div className={cn('w-12 h-8 rounded border-2', theme.preview)} />
              <IconComponent className="w-4 h-4" />
              <span className="text-xs font-medium">{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AccentColorSelector: React.FC<{
  currentColor: string;
  onColorChange: (color: string) => void;
}> = ({ currentColor, onColorChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Accent Color</Label>
      <div className="flex gap-2">
        {accentColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorChange(color.id)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-all',
              currentColor === color.id
                ? 'border-foreground scale-110'
                : 'border-muted hover:scale-105'
            )}
            style={{ backgroundColor: color.color }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

const ShortcutEditor: React.FC<{
  shortcuts: KeyboardShortcuts;
  onShortcutChange: (key: keyof KeyboardShortcuts, value: string) => void;
  onReset: () => void;
}> = ({ shortcuts, onShortcutChange, onReset }) => {
  const [editingKey, setEditingKey] = useState<keyof KeyboardShortcuts | null>(null);

  const shortcutLabels: Record<keyof KeyboardShortcuts, string> = {
    startTimer: 'Start Timer',
    pauseTimer: 'Pause Timer',
    stopTimer: 'Stop Timer',
    quickAddTask: 'Quick Add Task',
    focusMode: 'Toggle Focus Mode',
    switchProject: 'Switch Project',
    openSettings: 'Open Settings'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        {Object.entries(shortcuts).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-2 rounded-lg border">
            <span className="text-sm">{shortcutLabels[key as keyof KeyboardShortcuts]}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingKey(key as keyof KeyboardShortcuts)}
              className="font-mono text-xs"
            >
              {value}
            </Button>
          </div>
        ))}
      </div>
      
      {editingKey && (
        <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Shortcut</DialogTitle>
              <DialogDescription>
                Press the key combination you want to use for "{shortcutLabels[editingKey]}"
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Press keys..."
                value={shortcuts[editingKey]}
                onChange={(e) => onShortcutChange(editingKey, e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditingKey(null)} className="flex-1">
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingKey(null)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const NotificationSettingsComponent: React.FC<{
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Enable Notifications</Label>
          <p className="text-xs text-muted-foreground">
            Receive notifications for important events
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => updateSetting('enabled', checked)}
        />
      </div>

      {settings.enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-muted">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Pomodoro Complete</Label>
            <Switch
              checked={settings.pomodoroComplete}
              onCheckedChange={(checked) => updateSetting('pomodoroComplete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Break Reminder</Label>
            <Switch
              checked={settings.breakReminder}
              onCheckedChange={(checked) => updateSetting('breakReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Task Due</Label>
            <Switch
              checked={settings.taskDue}
              onCheckedChange={(checked) => updateSetting('taskDue', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Daily Goal</Label>
            <Switch
              checked={settings.dailyGoal}
              onCheckedChange={(checked) => updateSetting('dailyGoal', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Weekly Report</Label>
            <Switch
              checked={settings.weeklyReport}
              onCheckedChange={(checked) => updateSetting('weeklyReport', checked)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Sound Notifications</Label>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Volume: {settings.volume}%
                </Label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => updateSetting('volume', value)}
                  max={100}
                  min={0}
                  step={10}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DataManagement: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In real app, this would trigger a download
      console.log('Exporting settings...');
    }, 2000);
  };

  const handleImport = async () => {
    setIsImporting(true);
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      console.log('Importing settings...');
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Data Management</Label>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Settings'}
        </Button>

        <Button
          variant="outline"
          onClick={handleImport}
          disabled={isImporting}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isImporting ? 'Importing...' : 'Import Settings'}
        </Button>
      </div>

      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Reset All Settings
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          This will reset all settings to their default values
        </p>
      </div>
    </div>
  );
};

export const PersonalizationSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'auto',
    notifications: {
      enabled: true,
      pomodoroComplete: true,
      breakReminder: true,
      taskDue: true,
      dailyGoal: false,
      weeklyReport: true,
      soundEnabled: true,
      volume: 70
    },
    keyboardShortcuts: defaultShortcuts,
    focusMode: {
      enabled: true,
      blockDistractions: false,
      blockedApps: [],
      blockedWebsites: [],
      allowBreakApps: [],
      showFloatingTimer: true,
      timerPosition: 'top-right',
      timerOpacity: 90
    },
    analytics: {
      trackAppUsage: true,
      trackWebsiteUsage: true,
      trackKeystrokes: false,
      trackMouseClicks: false,
      dataRetentionDays: 90,
      shareAnonymousData: false
    },
    integrations: {
      notion: { enabled: false, syncTasks: false, syncProjects: false },
      googleCalendar: { enabled: false, syncEvents: false, createTasksFromEvents: false },
      trello: { enabled: false, syncCards: false },
      asana: { enabled: false, syncTasks: false },
      figma: { enabled: false, syncComments: false },
      appleWatch: { enabled: false, syncTimers: false, showNotifications: false, hapticFeedback: false }
    }
  });

  const [accentColor, setAccentColor] = useState('blue');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // In real app, this would save to storage/backend
    console.log('Saving settings:', settings);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setSettings({
      theme: 'auto',
      notifications: {
        enabled: true,
        pomodoroComplete: true,
        breakReminder: true,
        taskDue: true,
        dailyGoal: false,
        weeklyReport: true,
        soundEnabled: true,
        volume: 70
      },
      keyboardShortcuts: defaultShortcuts,
      focusMode: {
        enabled: true,
        blockDistractions: false,
        blockedApps: [],
        blockedWebsites: [],
        allowBreakApps: [],
        showFloatingTimer: true,
        timerPosition: 'top-right',
        timerOpacity: 90
      },
      analytics: {
        trackAppUsage: true,
        trackWebsiteUsage: true,
        trackKeystrokes: false,
        trackMouseClicks: false,
        dataRetentionDays: 90,
        shareAnonymousData: false
      },
      integrations: {
        notion: { enabled: false, syncTasks: false, syncProjects: false },
        googleCalendar: { enabled: false, syncEvents: false, createTasksFromEvents: false },
        trello: { enabled: false, syncCards: false },
        asana: { enabled: false, syncTasks: false },
        figma: { enabled: false, syncComments: false },
        appleWatch: { enabled: false, syncTimers: false, showNotifications: false, hapticFeedback: false }
      }
    });
    setAccentColor('blue');
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Customize your Timey experience
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Unsaved changes</Badge>
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="flex items-center gap-1">
            <Keyboard className="w-3 h-3" />
            Shortcuts
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemeSelector
                currentTheme={settings.theme}
                onThemeChange={(theme) => updateSettings({ theme: theme as any })}
              />
              
              <AccentColorSelector
                currentColor={accentColor}
                onColorChange={setAccentColor}
              />
              
              <div className="space-y-4">
                <Label className="text-sm font-medium">Interface</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Reduce spacing and padding for more content
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Show Animations</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <ShortcutEditor
                shortcuts={settings.keyboardShortcuts}
                onShortcutChange={(key, value) => 
                  updateSettings({
                    keyboardShortcuts: { ...settings.keyboardShortcuts, [key]: value }
                  })
                }
                onReset={() => 
                  updateSettings({ keyboardShortcuts: defaultShortcuts })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettingsComponent
                settings={settings.notifications}
                onSettingsChange={(notifications: NotificationSettings) => updateSettings({ notifications })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Privacy & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Track App Usage</Label>
                  <p className="text-xs text-muted-foreground">
                    Monitor which applications you use during focus sessions
                  </p>
                </div>
                <Switch
                  checked={settings.analytics.trackAppUsage}
                  onCheckedChange={(checked) => 
                    updateSettings({
                      analytics: { ...settings.analytics, trackAppUsage: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Track Website Usage</Label>
                  <p className="text-xs text-muted-foreground">
                    Monitor website visits during work sessions
                  </p>
                </div>
                <Switch
                  checked={settings.analytics.trackWebsiteUsage}
                  onCheckedChange={(checked) => 
                    updateSettings({
                      analytics: { ...settings.analytics, trackWebsiteUsage: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Share Anonymous Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve Timey by sharing anonymous usage statistics
                  </p>
                </div>
                <Switch
                  checked={settings.analytics.shareAnonymousData}
                  onCheckedChange={(checked) => 
                    updateSettings({
                      analytics: { ...settings.analytics, shareAnonymousData: checked }
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Data Retention</Label>
                <Select
                  value={settings.analytics.dataRetentionDays.toString()}
                  onValueChange={(value) => 
                    updateSettings({
                      analytics: { ...settings.analytics, dataRetentionDays: parseInt(value) }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <DataManagement />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Settings
              </Button>
              
              <Button
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
