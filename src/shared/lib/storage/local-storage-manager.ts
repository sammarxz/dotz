import { JournalEntry } from "../types";
import { STORAGE_KEYS } from "../constants/storage-constants";
import { logger } from "../utils/logger";

interface JournalData {
  entries: Record<string, JournalEntry>;
}

/**
 * LocalStorage Manager implementation
 * Manages journal entries in browser's localStorage
 * Provides synchronous operations for reading and writing entries
 */
export class LocalStorageManager {
  private static readonly STORAGE_KEY = STORAGE_KEYS.JOURNAL_ENTRIES;

  static saveEntry(key: string, entry: JournalEntry): void {
    const data = this.readJournalData();
    data.entries[key] = entry;
    this.writeJournalData(data);
  }

  static getEntry(key: string): JournalEntry | null {
    const data = this.readJournalData();
    return data.entries[key] || null;
  }

  static getAllEntries(): Record<string, JournalEntry> {
    const data = this.readJournalData();
    return data.entries;
  }

  static deleteEntry(key: string): void {
    const data = this.readJournalData();
    delete data.entries[key];
    this.writeJournalData(data);
  }

  static hasEntries(): boolean {
    const data = this.readJournalData();
    return Object.keys(data.entries).length > 0;
  }

  static getAllEntriesForMigration(): Record<string, JournalEntry> {
    return this.getAllEntries();
  }

  static clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private static readJournalData(): JournalData {
    if (typeof window === "undefined") {
      return { entries: {} };
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return { entries: {} };
      }

      const data: JournalData = JSON.parse(stored);
      // Ensure entries object exists
      if (!data.entries) {
        data.entries = {};
      }

      return data;
    } catch (error) {
      logger.error("Failed to read from localStorage", error);
      return { entries: {} };
    }
  }

  private static writeJournalData(data: JournalData): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error("Failed to write to localStorage", error);
    }
  }
}
