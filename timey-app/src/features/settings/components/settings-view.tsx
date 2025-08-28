import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Save,
  RotateCcw,
  Bell,
  Palette,
  Timer,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { useState, ReactNode, useEffect } from "react";

// --- Hooks ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

// --- Settings Page: Refactored and Production Ready ---

const initialSettings = {
  theme: {
    darkMode: true,
    baseColor: "zinc" as const,
    reducedMotion: false,
  },
  notifications: {
    sessionEnd: true,
    breakReminder: true,
    sound: true,
    volume: 70,
  },
  focus: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    autoStart: false,
  },
};

type SettingsType = typeof initialSettings;

const SettingItem = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) => (
  <div className="flex items-start justify-between p-4 sm:p-6">
    <div className="flex-1 space-y-1 pr-4">
      <Label className="text-base font-medium text-foreground">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const AppearanceSettings = ({ settings, onChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Palette className="w-5 h-5" /> Appearance
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0 divide-y">
      <SettingItem label="Dark Mode" description="Embrace the darkness.">
        <Switch
          checked={settings.darkMode}
          onCheckedChange={(val) => onChange("theme", "darkMode", val)}
        />
      </SettingItem>
      <SettingItem
        label="Reduced Motion"
        description="Minimize animations for a calmer experience."
      >
        <Switch
          checked={settings.reducedMotion}
          onCheckedChange={(val) => onChange("theme", "reducedMotion", val)}
        />
      </SettingItem>
      <SettingItem
        label="Accent Color"
        description="Choose the primary interface color."
      >
        <Select
          value={settings.baseColor}
          onValueChange={(val) => onChange("theme", "baseColor", val)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zinc">Zinc</SelectItem>
            <SelectItem value="slate">Slate</SelectItem>
            <SelectItem value="stone">Stone</SelectItem>
            <SelectItem value="rose">Rose</SelectItem>
          </SelectContent>
        </Select>
      </SettingItem>
    </CardContent>
  </Card>
);

const FocusSettings = ({ settings, onChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Timer className="w-5 h-5" /> Focus Sessions
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0 divide-y">
      <div className="p-4 sm:p-6 space-y-4">
        <Label className="text-base font-medium">Durations (minutes)</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label
              htmlFor="work-duration"
              className="text-sm text-muted-foreground"
            >
              Work
            </Label>
            <Input
              id="work-duration"
              type="number"
              value={settings.workDuration}
              onChange={(e) =>
                onChange("focus", "workDuration", parseInt(e.target.value))
              }
            />
          </div>
          <div>
            <Label
              htmlFor="break-duration"
              className="text-sm text-muted-foreground"
            >
              Break
            </Label>
            <Input
              id="break-duration"
              type="number"
              value={settings.breakDuration}
              onChange={(e) =>
                onChange("focus", "breakDuration", parseInt(e.target.value))
              }
            />
          </div>
          <div>
            <Label
              htmlFor="long-break-duration"
              className="text-sm text-muted-foreground"
            >
              Long Break
            </Label>
            <Input
              id="long-break-duration"
              type="number"
              value={settings.longBreakDuration}
              onChange={(e) =>
                onChange("focus", "longBreakDuration", parseInt(e.target.value))
              }
            />
          </div>
        </div>
      </div>
      <SettingItem
        label="Auto-start Sessions"
        description="Automatically begin the next session without manual input."
      >
        <Switch
          checked={settings.autoStart}
          onCheckedChange={(val) => onChange("focus", "autoStart", val)}
        />
      </SettingItem>
    </CardContent>
  </Card>
);

const NotificationSettings = ({ settings, onChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="w-5 h-5" /> Notifications
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0 divide-y">
      <SettingItem
        label="Session End Alerts"
        description="Notify me when a focus or break session is over."
      >
        <Switch
          checked={settings.sessionEnd}
          onCheckedChange={(val) =>
            onChange("notifications", "sessionEnd", val)
          }
        />
      </SettingItem>
      <SettingItem
        label="Sound Effects"
        description="Play a sound at the end of each session."
      >
        <Switch
          checked={settings.sound}
          onCheckedChange={(val) => onChange("notifications", "sound", val)}
        />
      </SettingItem>
      {settings.sound && (
        <div className="p-4 sm:p-6 space-y-2">
          <Label className="text-base font-medium">Volume</Label>
          <Slider
            value={[settings.volume]}
            onValueChange={([val]) => onChange("notifications", "volume", val)}
          />
        </div>
      )}
    </CardContent>
  </Card>
);

const DataSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Data Management</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" className="flex-1">
        <Download className="w-4 h-4 mr-2" /> Export Data
      </Button>
      <Button variant="outline" className="flex-1">
        <Upload className="w-4 h-4 mr-2" /> Import Data
      </Button>
      <Button variant="destructive" className="flex-1">
        <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
      </Button>
    </CardContent>
  </Card>
);

export const SettingsView = () => {
  const [settings, setSettings] = useState<SettingsType>(initialSettings);

  const handleSettingChange = (
    category: keyof SettingsType,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application preferences.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setSettings(initialSettings)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      <AppearanceSettings
        settings={settings.theme}
        onChange={handleSettingChange}
      />
      <FocusSettings settings={settings.focus} onChange={handleSettingChange} />
      <NotificationSettings
        settings={settings.notifications}
        onChange={handleSettingChange}
      />
      <DataSettings />

      <div className="mt-4">
        <Button className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
