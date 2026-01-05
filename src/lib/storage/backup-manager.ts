import { BackupData } from "../types";
import { JournalStorage } from "./journal-storage";
import { SettingsStorage } from "./settings-storage";

export class BackupManager {
  private static readonly VERSION = "1.0.0";

  static async createBackup(): Promise<BackupData> {
    const backup: BackupData = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      entries: JournalStorage.getEntries(),
      template: JournalStorage.getTemplate(),
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

      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string) as BackupData;

          if (!backup.version || !backup.entries) {
            throw new Error("Invalid backup file");
          }

          JournalStorage.saveEntries(backup.entries);
          if (backup.template) {
            JournalStorage.saveTemplate(backup.template);
          }
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
