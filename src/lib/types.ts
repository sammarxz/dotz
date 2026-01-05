export interface JournalEntry {
  date: string;
  memory: string;
}

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
