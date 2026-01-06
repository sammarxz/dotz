import { useState, useEffect, useCallback } from "react";

import { SettingsStorage } from "@/shared/lib/storage/settings-storage";
import { TypewriterSound } from "@/shared/lib/audio/typewriter-sound";
import { ReminderManager } from "@/shared/lib/notifications/reminder-manager";
import { AppSettings } from "@/shared/lib/types";
import { logger } from "@/shared/lib/utils/logger";

/**
 * Hook for managing application settings
 * Handles sound effects, notifications, and persistence of settings
 * 
 * @returns {Object} Settings state and operations
 * @returns {AppSettings} settings - Current application settings
 * @returns {Function} updateSettings - Update a specific setting
 * @returns {Function} enableNotifications - Request notification permission and enable
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(
    SettingsStorage.getSettings()
  );

  useEffect(() => {
    if (settings.soundEffects) {
      TypewriterSound.enable();
    } else {
      TypewriterSound.disable();
    }

    if (settings.notifications.enabled) {
      ReminderManager.scheduleDaily(settings.notifications.time).catch((error) => {
        logger.error("Failed to schedule notifications", error);
      });
    } else {
      ReminderManager.cancel().catch((error) => {
        logger.error("Failed to cancel notifications", error);
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
