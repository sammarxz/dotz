/**
 * Journal entry structure
 */
export interface JournalEntry {
  date: string;
  memory: string;
}

/**
 * Keyboard shortcut definition
 */
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

/**
 * Application settings
 */
export interface AppSettings {
  soundEffects: boolean;
  notifications: {
    enabled: boolean;
    time: string; // HH:MM format
  };
}

// Re-export storage types
export type { StorageMode, StorageOperationResult, StorageAdapter, JournalData } from "./types/storage.types";

// Re-export modal types
export type { ModalType, ModalState, ModalActions } from "./types/modal.types";
