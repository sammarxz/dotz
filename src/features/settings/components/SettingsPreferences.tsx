"use client";

import { Bell, Volume2 } from "lucide-react";
import { SwitchComponent } from "@/shared/components/ui/Switch";
import { Input } from "@/shared/components/ui/Input";
import { useToast } from "@/shared/components/ui/Toast";
import { useSettings } from "@/features/settings/hooks/useSettings";

/**
 * Preferences section of the settings page
 * Handles sound effects and notification settings
 */
export function SettingsPreferences() {
  const { settings, updateSettings, enableNotifications } = useSettings();
  const { success, error } = useToast();

  const handleSoundToggle = (checked: boolean) => {
    updateSettings("soundEffects", checked);
    success(
      checked ? "Sound effects enabled" : "Sound effects disabled",
      checked ? "You'll hear typewriter sounds while typing" : undefined
    );
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await enableNotifications();
      if (!granted) {
        error(
          "Permission denied",
          "Please enable notifications in your browser settings"
        );
        return;
      }
      success(
        "Notifications enabled",
        `Daily reminder set for ${settings.notifications.time}`
      );
    } else {
      updateSettings("notifications", {
        ...settings.notifications,
        enabled: false,
      });
      success("Notifications disabled");
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    updateSettings("notifications", {
      ...settings.notifications,
      time,
    });
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-1">
          Preferences
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500">
          Customize your writing experience
        </p>
      </div>

      {/* Sound Effects */}
      <div className="flex items-center justify-between py-3 border-b border-zinc-900 gap-4">
        <div className="flex items-start gap-3">
          <Volume2 className="w-5 h-5 mt-0.5 text-zinc-500" />
          <div>
            <label className="text-sm font-medium cursor-pointer">
              Sound Effects
            </label>
            <p className="text-xs text-zinc-500 mt-0.5">
              Typewriter sounds while typing
            </p>
          </div>
        </div>
        <SwitchComponent
          checked={settings.soundEffects}
          onCheckedChange={handleSoundToggle}
        />
      </div>

      {/* Notifications */}
      <div className="space-y-3 py-3 border-b border-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 mt-0.5 text-zinc-500" />
            <div>
              <label className="text-sm font-medium cursor-pointer">
                Daily Reminder
              </label>
              <p className="text-xs text-zinc-500 mt-0.5">
                Get notified to write in your journal
              </p>
            </div>
          </div>
          <SwitchComponent
            checked={settings.notifications.enabled}
            onCheckedChange={handleNotificationToggle}
          />
        </div>

        {settings.notifications.enabled && (
          <div className="ml-8 flex items-center gap-3">
            <label className="text-xs text-zinc-500">Time:</label>
            <Input
              type="time"
              value={settings.notifications.time}
              onChange={handleTimeChange}
              className="w-32"
            />
          </div>
        )}
      </div>
    </section>
  );
}
