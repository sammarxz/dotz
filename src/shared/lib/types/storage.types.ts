import { JournalEntry } from "../types";

/**
 * Storage mode types
 */
export type StorageMode = "localStorage" | "fileSystem";

/**
 * Result of a storage operation
 */
export interface StorageOperationResult {
  success: boolean;
  cancelled?: boolean;
}

/**
 * Interface for storage adapters
 * This allows different storage implementations to be used interchangeably
 */
export interface StorageAdapter {
  /**
   * Check if this storage adapter is supported in the current environment
   */
  isSupported(): boolean;

  /**
   * Save a journal entry
   */
  saveEntry(key: string, entry: JournalEntry): Promise<void>;

  /**
   * Get a journal entry by key
   */
  getEntry(key: string): Promise<JournalEntry | null>;

  /**
   * Get all journal entries
   */
  getAllEntries(): Promise<Record<string, JournalEntry>>;

  /**
   * Delete a journal entry
   */
  deleteEntry(key: string): Promise<void>;

  /**
   * Get all entries for migration purposes
   */
  getAllEntriesForMigration(): Promise<Record<string, JournalEntry>>;

  /**
   * Clear all entries
   */
  clearAll(): Promise<void>;
}

/**
 * Journal data structure
 */
export interface JournalData {
  entries: Record<string, JournalEntry>;
}
