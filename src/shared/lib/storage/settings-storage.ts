import { AppSettings } from "../types";

export class SettingsStorage {
  private static readonly SETTINGS_KEY = "app-settings";

  private static readonly DEFAULT_SETTINGS: AppSettings = {
    soundEffects: false,
    notifications: {
      enabled: false,
      time: "20:00",
    },
  };

  static getSettings(): AppSettings {
    if (typeof window === "undefined") return this.DEFAULT_SETTINGS;

    const stored = localStorage.getItem(this.SETTINGS_KEY);
    if (!stored) return this.DEFAULT_SETTINGS;

    try {
      return { ...this.DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return this.DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  static updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }
}
