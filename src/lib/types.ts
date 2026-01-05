export interface JournalEntry {
  date: string;
  memory: string;
}

export type StorageKey = `journal-entries` | `journal-template`;

export interface ShortcutDefinition {
  key: string;
  description: string;
  category: "navigation" | "actions" | "settings";
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}

export interface AppSettings {
  soundEffects: boolean;
  notifications: {
    enabled: boolean;
    time: string; // HH:MM
  };
}

export interface BackupData {
  version: string;
  exportDate: string;
  entries: Record<string, JournalEntry>;
  template: string;
  settings: AppSettings;
}
