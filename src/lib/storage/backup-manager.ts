import { BackupData } from "../types";
import { FileSystemStorage } from "./file-system-storage";
import { SettingsStorage } from "./settings-storage";

export class BackupManager {
  private static readonly VERSION = "1.0.0";

  static async createBackup(): Promise<BackupData> {
    let entries: Record<string, any> = {};

    if (FileSystemStorage.isSupported()) {
      try {
        entries = await FileSystemStorage.getAllEntries();
      } catch (error) {
        console.error("Failed to load entries from file system", error);
      }
    }

    const backup: BackupData = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      entries,
      settings: SettingsStorage.getSettings(),
    };

    return backup;
  }

  static downloadBackup(backup: BackupData): void {
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `journal-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  static async restoreBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string) as BackupData;

          if (!backup.version || !backup.entries) {
            throw new Error("Invalid backup file");
          }

          if (FileSystemStorage.isSupported()) {
            // Restore entries to file system
            for (const [key, entry] of Object.entries(backup.entries)) {
              await FileSystemStorage.saveEntry(key, entry);
            }
          }

          // Restore settings (always in localStorage)
          if (backup.settings) {
            SettingsStorage.saveSettings(backup.settings);
          }

          resolve(backup);
        } catch (error) {
          reject(new Error("Failed to parse backup file"));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
}
