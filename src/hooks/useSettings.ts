import { useState, useEffect, useCallback } from "react";

import { SettingsStorage } from "@/lib/storage/settings-storage";
import { TypewriterSound } from "@/lib/audio/typewriter-sound";
import { ReminderManager } from "@/lib/notifications/reminder-manager";
import { AppSettings } from "@/lib/types";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(
    SettingsStorage.getSettings()
  );

  useEffect(() => {
    // Sincroniza som
    if (settings.soundEffects) {
      TypewriterSound.enable();
    } else {
      TypewriterSound.disable();
    }

    // Sincroniza notificações
    if (settings.notifications.enabled) {
      ReminderManager.scheduleDaily(settings.notifications.time).catch((error) => {
        console.error("Failed to schedule notifications:", error);
      });
    } else {
      ReminderManager.cancel().catch((error) => {
        console.error("Failed to cancel notifications:", error);
      });
    }
  }, [settings]);

  const updateSettings = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      SettingsStorage.saveSettings(newSettings);
    },
    [settings]
  );

  const enableNotifications = useCallback(async () => {
    const granted = await ReminderManager.requestPermission();
    if (granted) {
      updateSettings("notifications", {
        ...settings.notifications,
        enabled: true,
      });
    }
    return granted;
  }, [settings.notifications, updateSettings]);

  return {
    settings,
    updateSettings,
    enableNotifications,
  };
}
